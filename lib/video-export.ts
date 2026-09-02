/**
 * Rendu vidéo réel pour l'éditeur timeline.
 *
 * L'éditeur affichait « Export terminé ! » sans rien produire — le commentaire
 * du code renvoyait à « une vraie implémentation » qui n'existait pas. Ce module
 * la fournit.
 *
 * Choix technique : composition sur <canvas> puis MediaRecorder, plutôt que
 * ffmpeg.wasm. Ce dernier exige SharedArrayBuffer, donc les en-têtes COOP/COEP
 * sur tout le site — ce qui casserait les iframes tierces (Instagram, cartes)
 * pour une seule page d'administration. Ici, aucune dépendance et aucun
 * changement d'infrastructure.
 *
 * Contrepartie assumée : le rendu se fait en temps réel (une minute de vidéo
 * prend une minute) parce que MediaRecorder enregistre un flux, il ne transcode
 * pas. Acceptable pour des reels et stories ; à revoir pour du montage long.
 */

export type EffetsClip = { brightness: number; contrast: number; saturation: number };

export type ClipRendu = {
  id: string;
  type: 'video' | 'image' | 'audio';
  url: string;
  startTime: number;
  duration: number;
  trimStart: number;
  volume: number;
  fadeIn: number;
  fadeOut: number;
  effects: EffetsClip;
  texte?: {
    text: string;
    fontSize: number;
    fontFamily: string;
    color: string;
    backgroundColor: string;
    position: { x: number; y: number };
    animation: 'none' | 'fade' | 'slide-up' | 'typewriter';
  };
};

export type OptionsRendu = {
  largeur: number;
  hauteur: number;
  fps?: number;
  duree: number;
  clips: ClipRendu[];
  surProgression?: (ratio: number) => void;
};

/** Formats par ordre de préférence : mp4 d'abord, seul format qu'Instagram accepte. */
const FORMATS = [
  'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
  'video/mp4',
  'video/webm;codecs=vp9,opus',
  'video/webm',
];

export function formatSupporte(): string | null {
  if (typeof MediaRecorder === 'undefined') return null;
  return FORMATS.find(f => MediaRecorder.isTypeSupported(f)) ?? null;
}

function chargerImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Sans cet attribut, dessiner une image d'un autre domaine « souille » le
    // canvas et captureStream() échoue silencieusement.
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Image illisible : ${url}`));
    img.src = url;
  });
}

function chargerVideo(url: string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const v = document.createElement('video');
    v.crossOrigin = 'anonymous';
    v.preload = 'auto';
    v.muted = false;
    v.playsInline = true;
    v.onloadeddata = () => resolve(v);
    v.onerror = () => reject(new Error(`Vidéo illisible : ${url}`));
    v.src = url;
  });
}

/** Remplit le cadre en conservant les proportions, comme un `object-fit: cover`. */
function dessinerCouvrant(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  sw: number, sh: number,
  largeur: number, hauteur: number
) {
  if (!sw || !sh) return;
  const echelle = Math.max(largeur / sw, hauteur / sh);
  const w = sw * echelle;
  const h = sh * echelle;
  ctx.drawImage(source, (largeur - w) / 2, (hauteur - h) / 2, w, h);
}

function opaciteFondu(clip: ClipRendu, tempsLocal: number): number {
  let o = 1;
  if (clip.fadeIn > 0 && tempsLocal < clip.fadeIn) o *= tempsLocal / clip.fadeIn;
  const restant = clip.duration - tempsLocal;
  if (clip.fadeOut > 0 && restant < clip.fadeOut) o *= Math.max(0, restant / clip.fadeOut);
  return Math.max(0, Math.min(1, o));
}

function dessinerTexte(
  ctx: CanvasRenderingContext2D,
  clip: ClipRendu,
  tempsLocal: number,
  largeur: number,
  hauteur: number
) {
  const t = clip.texte;
  if (!t?.text) return;

  ctx.save();

  let opacite = 1;
  let decalageY = 0;
  let contenu = t.text;

  if (t.animation === 'fade') {
    opacite = Math.min(1, tempsLocal / 0.5);
  } else if (t.animation === 'slide-up') {
    const p = Math.min(1, tempsLocal / 0.5);
    decalageY = (1 - p) * hauteur * 0.05;
    opacite = p;
  } else if (t.animation === 'typewriter') {
    // Une lettre toutes les 40 ms, cadence lisible à l'écran.
    contenu = t.text.slice(0, Math.floor(tempsLocal / 0.04));
  }

  ctx.globalAlpha = opacite;
  ctx.font = `${t.fontSize}px ${t.fontFamily || 'sans-serif'}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const x = (t.position.x / 100) * largeur;
  const y = (t.position.y / 100) * hauteur + decalageY;

  if (t.backgroundColor && t.backgroundColor !== 'transparent') {
    const m = ctx.measureText(contenu);
    const padX = t.fontSize * 0.4;
    const padY = t.fontSize * 0.25;
    ctx.fillStyle = t.backgroundColor;
    ctx.fillRect(
      x - m.width / 2 - padX,
      y - t.fontSize / 2 - padY,
      m.width + padX * 2,
      t.fontSize + padY * 2
    );
  }

  ctx.fillStyle = t.color || '#ffffff';
  ctx.fillText(contenu, x, y);
  ctx.restore();
}

/**
 * Rend la timeline et renvoie le fichier produit.
 * Le rendu se déroule en temps réel : la promesse se résout à la fin de la durée.
 */
export async function rendreTimeline(o: OptionsRendu): Promise<Blob> {
  const mimeType = formatSupporte();
  if (!mimeType) {
    throw new Error("Ce navigateur ne sait pas enregistrer de vidéo (MediaRecorder indisponible).");
  }

  const fps = o.fps ?? 30;
  const canvas = document.createElement('canvas');
  canvas.width = o.largeur;
  canvas.height = o.hauteur;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Contexte canvas indisponible.');

  // Préchargement : dessiner une vidéo non chargée produirait des trous noirs.
  const visuels = o.clips.filter(c => c.type !== 'audio');
  const sources = new Map<string, HTMLVideoElement | HTMLImageElement>();
  for (const clip of o.clips) {
    if (sources.has(clip.id)) continue;
    sources.set(
      clip.id,
      clip.type === 'image' ? await chargerImage(clip.url) : await chargerVideo(clip.url)
    );
  }

  // Le son des clips vidéo et audio est mixé dans une piste unique ajoutée au
  // flux : sans cela, MediaRecorder n'enregistrerait que l'image.
  // captureStream(0) : aucune capture automatique. Le mode cadencé dépend du
  // compositeur du navigateur, qui ne tourne pas quand l'onglet passe en
  // arrière-plan — l'enregistrement produit alors un fichier vide. En poussant
  // chaque image via requestFrame(), le rendu ne dépend plus que de notre boucle.
  const flux = canvas.captureStream(0);
  const pisteVideo = flux.getVideoTracks()[0] as CanvasCaptureMediaStreamTrack;
  let audioCtx: AudioContext | null = null;

  const avecSon = o.clips.filter(c => c.type !== 'image' && c.volume > 0);
  if (avecSon.length > 0) {
    audioCtx = new AudioContext();
    const destination = audioCtx.createMediaStreamDestination();
    for (const clip of avecSon) {
      const el = sources.get(clip.id);
      if (!(el instanceof HTMLVideoElement)) continue;
      const gain = audioCtx.createGain();
      gain.gain.value = clip.volume;
      audioCtx.createMediaElementSource(el).connect(gain).connect(destination);
    }
    destination.stream.getAudioTracks().forEach(t => flux.addTrack(t));
  }

  const recorder = new MediaRecorder(flux, { mimeType, videoBitsPerSecond: 8_000_000 });
  const morceaux: BlobPart[] = [];
  recorder.ondataavailable = e => { if (e.data.size > 0) morceaux.push(e.data); };

  const fini = new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => resolve(new Blob(morceaux, { type: mimeType }));
    recorder.onerror = () => reject(new Error("L'enregistrement a échoué."));
  });

  recorder.start(250);
  const depart = performance.now();

  await new Promise<void>((resolve) => {
    let arret = false;
    let minuteur: ReturnType<typeof setInterval>;

    // Boucle temporisée plutôt que requestAnimationFrame : rAF est suspendu dans
    // un onglet en arrière-plan, ce qui figerait le rendu sans jamais le
    // terminer. setInterval y est seulement ralenti — la vidéo perd en fluidité
    // si l'onglet passe derrière, mais l'export aboutit.
    const frame = () => {
      const t = (performance.now() - depart) / 1000;

      if (t >= o.duree) {
        if (!arret) { arret = true; clearInterval(minuteur); resolve(); }
        return;
      }

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, o.largeur, o.hauteur);

      for (const clip of visuels) {
        const local = t - clip.startTime;
        if (local < 0 || local > clip.duration) continue;

        const el = sources.get(clip.id);
        if (!el) continue;

        ctx.save();
        ctx.globalAlpha = opaciteFondu(clip, local);
        const { brightness, contrast, saturation } = clip.effects;
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

        if (el instanceof HTMLVideoElement) {
          const cible = clip.trimStart + local;
          // On ne repositionne que si la dérive dépasse deux images : un seek à
          // chaque frame saccaderait la lecture et couperait le son.
          if (Math.abs(el.currentTime - cible) > 2 / fps) el.currentTime = cible;
          if (el.paused) el.play().catch(() => {});
          dessinerCouvrant(ctx, el, el.videoWidth, el.videoHeight, o.largeur, o.hauteur);
        } else {
          dessinerCouvrant(ctx, el, el.naturalWidth, el.naturalHeight, o.largeur, o.hauteur);
        }

        ctx.restore();
        dessinerTexte(ctx, clip, local, o.largeur, o.hauteur);
      }

      pisteVideo.requestFrame?.();
      o.surProgression?.(Math.min(1, t / o.duree));
    };

    minuteur = setInterval(frame, 1000 / fps);
  });

  for (const el of sources.values()) {
    if (el instanceof HTMLVideoElement) { el.pause(); el.src = ''; }
  }
  recorder.stop();
  await audioCtx?.close();

  return fini;
}

export function extensionPour(mimeType: string): string {
  return mimeType.startsWith('video/mp4') ? 'mp4' : 'webm';
}

export function telecharger(blob: Blob, nom: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nom;
  a.click();
  // Révocation différée : révoquer immédiatement annulerait le téléchargement
  // dans certains navigateurs.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
