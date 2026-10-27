import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface MusicTrack {
  id: string;
  titre: string;
  ambiance: string;
  genre: 'slow_travel' | 'boutique_hotel' | 'history' | 'ambient';
  duree: string;
  bpm: number;
  fichier: string;
  description: string;
  promptGoogleFlow: string;
}

const CATALOGUE_MUSIQUES: MusicTrack[] = [
  {
    id: 'atrium_lin_brut',
    titre: 'Atrium Lin Brut',
    ambiance: 'Lumière matinale, lin froissé, réveil calme',
    genre: 'slow_travel',
    duree: '1:14',
    bpm: 85,
    fichier: '/music_studio/boutique_hotel_lobby/track_01_atrium_lin_brut.mp3',
    description: 'Guitare acoustique délicate et nappe feutrée, idéal pour les reels et paysages slow travel.',
    promptGoogleFlow: 'Musique acoustique intimiste de 30 secondes, guitare classique et résonance de bois, 85 BPM, nappe ambient feutrée, sans voix, contemplation slow travel.'
  },
  {
    id: 'golden_hour_marbre',
    titre: 'Golden Hour Marbre',
    ambiance: 'Fin d\'après-midi dorée, salon feutré, élégance intemporelle',
    genre: 'boutique_hotel',
    duree: '1:10',
    bpm: 88,
    fichier: '/music_studio/boutique_hotel_lobby/track_03_golden_hour_marbre.mp3',
    description: 'Piano feutré et textures acoustiques riches, idéal pour les hôtels de charme et cafés.',
    promptGoogleFlow: 'Piano solo feutré de 30 secondes, jazz lounge minimaliste et chaleureux, 88 BPM, réverbération intime, sans voix, ambiance hôtel de charme et fin de journée.'
  },
  {
    id: 'echappee_slow_luxury',
    titre: 'Échappée Slow Luxury',
    ambiance: 'Terrasse d\'altitude, contemplation, horizon infini',
    genre: 'ambient',
    duree: '1:18',
    bpm: 80,
    fichier: '/music_studio/boutique_hotel_lobby/track_05_echappee_slow_luxury.mp3',
    description: 'Nappes aériennes et textures nobles sans percussion agressive.',
    promptGoogleFlow: 'Nappes ambiantes organiques de 30 secondes, fréquence 432 Hz, cordes frottées très douces, 80 BPM, sans voix, sérénité et calme absolu slow travel.'
  },
  {
    id: 'velours_noyer_fonce',
    titre: 'Velours Noyer Foncé',
    ambiance: 'Atmosphère feutrée, bibliothèque ancienne, feu de cheminée',
    genre: 'boutique_hotel',
    duree: '1:16',
    bpm: 82,
    fichier: '/music_studio/boutique_hotel_lobby/track_02_velours_noyer_fonce.mp3',
    description: 'Accords chaleureux de guitare et bois de noyer.',
    promptGoogleFlow: 'Guitare acoustique folk chaleureuse, notes lentes et espacées, 82 BPM, atmosphère boisée et intimiste, sans percussion, sans voix.'
  },
  {
    id: 'flamme_cire_nocturne',
    titre: 'Flamme de Cire Nocturne',
    ambiance: 'Soirée tamisée, brise nocturne, intimité',
    genre: 'ambient',
    duree: '1:22',
    bpm: 76,
    fichier: '/music_studio/boutique_hotel_lobby/track_04_flamme_de_cire_nocturne.mp3',
    description: 'Immersion nocturne douce et apaisante.',
    promptGoogleFlow: 'Ambiance nocturne très douce, piano lointain et nappes de violoncelle discret, 76 BPM, ton réconfortant et intime, sans voix.'
  }
];

export async function GET() {
  return NextResponse.json({
    success: true,
    total: CATALOGUE_MUSIQUES.length,
    tracks: CATALOGUE_MUSIQUES
  });
}
