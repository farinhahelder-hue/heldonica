/**
 * PhotoEvidenceBlock — bloc photo avec contexte réel vécu.
 *
 * Affiche une photo accompagnée de métadonnées attestées :
 * lieu exact, date de prise de vue, anecdote des fondateurs
 * et lien optionnel vers l'album Google Photos source.
 *
 * Charte Heldonica : le composant ne génère aucune donnée,
 * il présente uniquement ce qui est stocké dans le CMS.
 *
 * @param imageUrl - URL HTTPS publique de la photo
 * @param location - Nom du lieu vécu, texte brut (ex. "Madère, Ponta do Sol")
 * @param date - Date de prise de vue ISO 8601 (ex. "2024-09-15")
 * @param anecdote - Courte phrase vécue, max 200 caractères
 * @param albumLink - URL vers l'album Google Photos (optionnel)
 */
import React from 'react';
import styles from './PhotoEvidenceBlock.module.css';

export interface PhotoEvidenceBlockProps {
  /** URL de la photo (HTTPS) */
  imageUrl: string;
  /** Nom du lieu, texte brut */
  location: string;
  /** ISO 8601 (ex. 2024-09-15) */
  date: string;
  /** Courte phrase, max 200 caractères */
  anecdote: string;
  /** URL vers l'album Google Photos (optionnel) */
  albumLink?: string;
}

export function PhotoEvidenceBlock({
  imageUrl,
  location,
  date,
  anecdote,
  albumLink,
}: PhotoEvidenceBlockProps) {
  if (!imageUrl) {
    return (
      <div className={styles.container}>
        <p className={styles.meta}>Photo non renseignée</p>
      </div>
    );
  }

  const alt = anecdote ? anecdote.slice(0, 200) : `Photo de ${location}`;

  return (
    <figure className={styles.container} data-testid="photo-evidence-block">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt={alt} className={styles.image} loading="lazy" />
      <div className={styles.meta}>
        <span>📍 {location}</span>
        <span aria-hidden="true"> – </span>
        <time dateTime={date}>📅 {date}</time>
      </div>
      {anecdote && <figcaption className={styles.anecdote}>{anecdote}</figcaption>}
      {albumLink && (
        <a
          href={albumLink}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.button}
          aria-label={`Voir l'album photo de ${location}`}
        >
          Voir l’album
        </a>
      )}
    </figure>
  );
}

export default PhotoEvidenceBlock;
