import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateAccommodation,
  Accommodation,
  publishAccommodation,
} from '@/lib/cms-hospitality';
import { CmsUser } from '@/lib/cms-access';

describe('CmsHospitality — Validation & Modèles', () => {
  it('valide un hébergement complet conforme', () => {
    const validAcc: Accommodation = {
      name: 'La Grange d’Émilie',
      slug: 'la-grange-d-emilie',
      type: 'chambre_hotes',
      capacity: 2,
      surface_m2: 35,
      price_per_night: 110,
      direct_booking_url: 'https://lagrangedemilie-bretagne.fr/reserver',
      description: 'Chambre d’hôtes de charme en lisière de forêt.',
      amenities: ['Petit-déjeuner maison', 'Literie naturelle lin'],
      photos: [
        { url: 'https://images.heldonica.fr/bretagne/chambre-1.jpg', is_primary: true },
      ],
      status: 'draft',
    };

    const errors = validateAccommodation(validAcc);
    expect(errors).toHaveLength(0);
  });

  it('rejette un nom manquant ou vide', () => {
    const errors = validateAccommodation({
      name: '   ',
      slug: 'test-lieu',
    });
    expect(errors).toContain('Le nom de l’hébergement est obligatoire.');
  });

  it('rejette un slug mal formaté avec majuscules ou espaces', () => {
    const errors = validateAccommodation({
      name: 'Maison du Lac',
      slug: 'Maison Du Lac!',
    });
    expect(errors).toContain('Le slug est obligatoire et doit être en minuscules avec tirets (kebab-case).');
  });

  it('rejette une capacité inférieure à 1', () => {
    const errors = validateAccommodation({
      name: 'Maison du Lac',
      slug: 'maison-du-lac',
      capacity: 0,
    });
    expect(errors).toContain('La capacité doit être un nombre positif supérieur ou égal à 1.');
  });

  it('rejette un tarif par nuit négatif', () => {
    const errors = validateAccommodation({
      name: 'Maison du Lac',
      slug: 'maison-du-lac',
      price_per_night: -40,
    });
    expect(errors).toContain('Le tarif par nuit doit être un nombre positif.');
  });

  it('exige une URL directe de réservation en HTTPS', () => {
    const errors = validateAccommodation({
      name: 'Maison du Lac',
      slug: 'maison-du-lac',
      direct_booking_url: 'http://non-securise.fr/booking',
    });
    expect(errors).toContain('Le lien direct de réservation doit être en HTTPS sécurisé.');
  });

  it('bloque la publication pour un utilisateur non-admin (rôle editor)', async () => {
    const editorUser: CmsUser = {
      id: 'ed-1',
      email: 'editeur@heldonica.fr',
      role: 'editor',
    };

    const result = await publishAccommodation('some-id', editorUser);
    expect(result.success).toBe(false);
    expect(result.error).toContain('seul un administrateur');
  });
});
