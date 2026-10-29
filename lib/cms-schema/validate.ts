/**
 * Heldonica CMS — validateur de blocs, sans dependance.
 *
 * Le modele de blocs vivait jusqu'ici dans un seul fichier de types : `tsc`
 * verifiait le code qui *fabrique* un bloc, jamais les donnees qui arrivent
 * par une route API, un import JSON ou une reponse d'agent. Un bloc
 * `{ type: 'image' }` sans `url` passait donc le typage (il venait d'un
 * `any`) et cassait le rendu.
 *
 * Ce module decrit ce qu'un bloc doit contenir, type par type, et rend la
 * liste des champs fautifs — pas un throw : l'appelant decide s'il refuse en
 * 422, s'il repare ou s'il se contente de journaliser.
 *
 * Aucune dependance : `zod` n'est pas installe dans ce depot, et ajouter une
 * dependance pour valider douze objets serait payer un arbre entier pour une
 * fonction de trente lignes.
 */

export type FieldKind =
  | 'string'
  | 'url'
  | 'date'
  | 'number'
  | 'boolean'
  | 'enum'
  | 'array'
  | 'object';

export interface FieldSpec {
  name: string;
  kind: FieldKind;
  /** Le champ doit exister (une chaine vide reste acceptee sauf minLength). */
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  /** Valeurs admises pour `enum` (chaines ou nombres, ex. niveau de titre). */
  values?: ReadonlyArray<string | number>;
  /** Specification de chaque element pour `array`. */
  item?: FieldSpec;
  /** Champs attendus pour `object` (un objet absent est ignore si non requis). */
  fields?: ReadonlyArray<FieldSpec>;
}

export interface BlockSchema {
  type: string;
  title: string;
  fields: ReadonlyArray<FieldSpec>;
}

export interface BlockIssue {
  /** Chemin lisible depuis la racine du bloc, ex. `images[0].url`. */
  path: string;
  message: string;
}

const URL_HTTP = /^https?:\/\/\S+$/i;
const DATE_ISO = /^\d{4}-\d{2}-\d{2}$/;

function estObjet(valeur: unknown): valeur is Record<string, unknown> {
  return typeof valeur === 'object' && valeur !== null && !Array.isArray(valeur);
}

function verifierChamp(
  valeur: unknown,
  spec: FieldSpec,
  chemin: string,
  issues: BlockIssue[]
): void {
  const absent = valeur === undefined || valeur === null;

  if (absent) {
    if (spec.required) {
      issues.push({ path: chemin, message: 'champ obligatoire manquant' });
    }
    return;
  }

  switch (spec.kind) {
    case 'string': {
      if (typeof valeur !== 'string') {
        issues.push({ path: chemin, message: 'chaine de caracteres attendue' });
        return;
      }
      const longueur = valeur.trim().length;
      if (spec.minLength !== undefined && longueur < spec.minLength) {
        issues.push({ path: chemin, message: `${spec.minLength} caracteres minimum` });
      }
      if (spec.maxLength !== undefined && valeur.length > spec.maxLength) {
        issues.push({
          path: chemin,
          message: `${valeur.length} caracteres, ${spec.maxLength} maximum`,
        });
      }
      return;
    }

    case 'url': {
      if (typeof valeur !== 'string') {
        issues.push({ path: chemin, message: 'URL attendue (chaine)' });
        return;
      }
      // Trois formes sont legitimes dans ce CMS : une URL absolue http(s),
      // un chemin interne (`/contact`) et une ancre (`#section`). Une URL
      // vide reste un etat d'edition (le bouton par defaut a `url: '#'`).
      const brute = valeur.trim();
      const relative = brute.startsWith('/') || brute.startsWith('#');
      if (brute !== '' && !relative && !URL_HTTP.test(brute)) {
        issues.push({ path: chemin, message: 'URL http(s), chemin interne ou ancre attendue' });
      }
      return;
    }

    case 'date': {
      // Une date vide est un brouillon : `createDefaultBlock('photo_evidence')`
      // en produit une. La validation d'ecriture refuse un champ absent, pas un
      // champ « pas encore rempli » — c'est le role de la future verification
      // de publication, pas de la sauvegarde d'un brouillon.
      if (typeof valeur !== 'string') {
        issues.push({ path: chemin, message: 'date ISO attendue (AAAA-MM-JJ)' });
        return;
      }
      if (valeur.trim() !== '' && !DATE_ISO.test(valeur)) {
        issues.push({ path: chemin, message: 'date ISO attendue (AAAA-MM-JJ)' });
      }
      return;
    }

    case 'number': {
      if (typeof valeur !== 'number' || !Number.isFinite(valeur)) {
        issues.push({ path: chemin, message: 'nombre attendu' });
        return;
      }
      if (spec.min !== undefined && valeur < spec.min) {
        issues.push({ path: chemin, message: `${spec.min} minimum` });
      }
      if (spec.max !== undefined && valeur > spec.max) {
        issues.push({ path: chemin, message: `${spec.max} maximum` });
      }
      return;
    }

    case 'boolean': {
      if (typeof valeur !== 'boolean') {
        issues.push({ path: chemin, message: 'booleen attendu' });
      }
      return;
    }

    case 'enum': {
      const admises = spec.values ?? [];
      if (!admises.includes(valeur as string | number)) {
        issues.push({
          path: chemin,
          message: `valeur hors liste : ${admises.map((v) => String(v)).join(' | ')}`,
        });
      }
      return;
    }

    case 'array': {
      if (!Array.isArray(valeur)) {
        issues.push({ path: chemin, message: 'tableau attendu' });
        return;
      }
      if (!spec.item) return;
      valeur.forEach((element, index) => {
        verifierChamp(element, spec.item as FieldSpec, `${chemin}[${index}]`, issues);
      });
      return;
    }

    case 'object': {
      if (!estObjet(valeur)) {
        issues.push({ path: chemin, message: 'objet attendu' });
        return;
      }
      for (const enfant of spec.fields ?? []) {
        verifierChamp(valeur[enfant.name], enfant, `${chemin}.${enfant.name}`, issues);
      }
      return;
    }
  }
}

/** Verifie un bloc contre son schema. Rend [] si le bloc est conforme. */
export function validateBlock(valeur: unknown, schema: BlockSchema): BlockIssue[] {
  if (!estObjet(valeur)) {
    return [{ path: '', message: 'bloc attendu : objet JSON' }];
  }

  const issues: BlockIssue[] = [];

  if (typeof valeur.id !== 'string' || valeur.id.trim() === '') {
    issues.push({ path: 'id', message: 'identifiant obligatoire' });
  }
  if (valeur.type !== schema.type) {
    issues.push({ path: 'type', message: `type « ${schema.type} » attendu` });
  }

  for (const champ of schema.fields) {
    verifierChamp(valeur[champ.name], champ, champ.name, issues);
  }

  return issues;
}

/** Formate les issues en une phrase courte, pour un message de refus. */
export function formatIssues(issues: ReadonlyArray<BlockIssue>): string {
  return issues
    .slice(0, 5)
    .map((issue) => (issue.path ? `${issue.path} : ${issue.message}` : issue.message))
    .join(' ; ');
}
