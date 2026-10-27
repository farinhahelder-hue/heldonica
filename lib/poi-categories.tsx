'use client';

import { renderToStaticMarkup } from 'react-dom/server';
import {
  Circle, Flag, AlertTriangle, Info, SquareParking, UtensilsCrossed,
  Waves, Backpack, Eye, Bus, Home, Target,
  type LucideIcon,
} from 'lucide-react';

/**
 * Reference unique des categories de point d'interet (POI) d'une carte.
 *
 * Les cartes Leaflet attendent du balisage HTML : elles ne peuvent pas recevoir
 * de JSX. `iconSvg` rend donc l'icone lucide en chaine statique, ce qui evite de
 * recopier les traces a la main. Trois composants s'appuyaient jusqu'ici sur trois
 * tables d'emojis differentes ; ils partagent desormais celle-ci.
 */

export const POI_CATEGORY_ICON: Record<string, LucideIcon> = {
  depart: Circle, arrivee: Flag, danger: AlertTriangle, info: Info,
  parking: SquareParking, restaurant: UtensilsCrossed, baignade: Waves, portage: Backpack,
  point_vue: Eye, transport: Bus, logement: Home, activite: Target,
};

export const POI_CATEGORY_COLOR: Record<string, string> = {
  depart: '#4CAF50', arrivee: '#f44336', danger: '#f44336', info: '#1976d2',
  parking: '#1976d2', restaurant: '#FF9800', baignade: '#0288d1', portage: '#7B1FA2',
  point_vue: '#01696f', transport: '#1976d2', logement: '#4CAF50', activite: '#FF9800',
};

export const POI_CATEGORY_LABEL: Record<string, string> = {
  depart: 'Départ', arrivee: 'Arrivée', danger: 'Danger', info: 'Info',
  parking: 'Parking', restaurant: 'Restaurant', baignade: 'Baignade',
  portage: 'Portage', point_vue: 'Point de vue', transport: 'Transport',
  logement: 'Logement', activite: 'Activité',
};

export const POI_DIFFICULTY_LABEL: Record<string, string> = {
  famille: 'Famille', debutant: 'Débutant', intermediaire: 'Intermédiaire',
  sportif: 'Sportif', libre: 'Libre',
};

export const POI_DIFFICULTY_COLOR: Record<string, string> = {
  famille: '#4CAF50', debutant: '#1976d2', intermediaire: '#FF9800',
  sportif: '#f44336', libre: '#7B1FA2',
};

export const POI_CATEGORY_FALLBACK = 'info';

export function poiCategoryIcon(category: string): LucideIcon {
  return POI_CATEGORY_ICON[category] ?? Info;
}

export function poiCategoryColor(category: string): string {
  return POI_CATEGORY_COLOR[category] ?? '#1976d2';
}

export function poiCategoryLabel(category: string): string {
  return POI_CATEGORY_LABEL[category] ?? category;
}

export function iconSvg(Icon: LucideIcon, size: number, color: string): string {
  return renderToStaticMarkup(
    <Icon size={size} color={color} strokeWidth={1.25} style={{ verticalAlign: '-0.15em' }} />
  );
}

export function poiCategoryIconSvg(category: string, size: number): string {
  return iconSvg(poiCategoryIcon(category), size, poiCategoryColor(category));
}
