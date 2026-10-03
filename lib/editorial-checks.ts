export type WarningPriority = 'high' | 'medium' | 'low';

export interface EditorialWarning {
  id: string;
  priority: WarningPriority;
  message: string;
  context?: string;
}

const FORBIDDEN_WORDS = [
  'bons plans', 'bon plan', 'organisation de séjour', 'compagnie', 'voyage organisé',
  'circuit', 'package', 'destinations populaires', 'tips', 'astuces', 'conseil voyage',
  'lieu incontournable', 'incontournable', 'aventure inoubliable', 'inoubliable',
  'paradis', 'paradisiaque', 'coup de cœur', 'must-have', 'must see', 'must-see',
  'les voyageurs', 'les touristes', 'solution miracle', 'solution magique',
  'magnifique', 'splendide', 'incroyable', 'spot', 'optimiser'
];

export function checkEditorialRules(title: string, excerpt: string, content: string, category: string): EditorialWarning[] {
  const warnings: EditorialWarning[] = [];

  // Clean HTML to get plain text
  const plainContent = (content || '').replace(/<[^>]*>/g, ' ');
  const fullText = `${title || ''} ${excerpt || ''} ${plainContent}`.trim();
  const lowerText = fullText.toLowerCase();

  // 1. Check for empty or very short content
  if (plainContent.trim().length < 300) {
    warnings.push({
      id: 'short_content',
      priority: 'high',
      message: 'Le contenu est vide ou très court (< 300 caractères). Vérifiez s\'il s\'agit d\'une ébauche.'
    });
  }

  // 2. Check for temporary markers
  const tempMarkers = ['lorem ipsum', 'à venir', 'todo', 'xx'];
  for (const marker of tempMarkers) {
    if (lowerText.includes(marker)) {
      warnings.push({
        id: `temp_marker_${marker}`,
        priority: 'high',
        message: `Marqueur provisoire détecté : "${marker}".`
      });
    }
  }

  // 3. Check for forbidden words (using word boundaries or non-letter boundaries for accented characters)
  for (const word of FORBIDDEN_WORDS) {
    const regex = new RegExp(`(.{0,30})(?:^|[^a-zA-ZÀ-ÿ])(${word})(?:[^a-zA-ZÀ-ÿ]|$)((.{0,30}))`, 'gi');
    let match;
    while ((match = regex.exec(fullText)) !== null) {
      // match[1] is left context, match[2] is the word, match[3] is right context
      const context = `"...${match[1].trim()} ${match[2]} ${match[3].trim()}..."`.replace(/\s+/g, ' ');
      warnings.push({
        id: `forbidden_word_${word}_${match.index}`,
        priority: 'medium',
        message: `Expression générique/interdite détectée : "${word}". (L'outil ne prétend pas détecter avec certitude l'IA)`,
        context: context
      });
    }
  }

  // 4. Check for mixed pronouns (tutoiement/vouvoiement)
  const isB2B = (category || '').toLowerCase().includes('b2b');
  const hasTu = /\b(tu|te|toi|ton|ta|tes)\b/i.test(lowerText);
  const hasVous = /\b(vous|votre|vos)\b/i.test(lowerText);

  if (hasTu && hasVous) {
    warnings.push({
      id: 'mixed_pronouns',
      priority: 'low',
      message: 'Mélange possible de tutoiement ("tu") et de vouvoiement ("vous"). Vérifiez la cohérence selon la cible (B2C/B2B). Chaque occurrence n\'est pas forcément une erreur.'
    });
  }

  // 5. Check for expected elements based on category/type
  // Assuming 'Guides Pratiques' or similar requires practical info
  if ((category || '').toLowerCase().includes('guide') || (category || '').toLowerCase().includes('pratique')) {
    const hasPracticalInfo = lowerText.includes('prix') || lowerText.includes('horaire') || lowerText.includes('comment y aller') || lowerText.includes('tarif');
    if (!hasPracticalInfo) {
      warnings.push({
        id: 'missing_practical_info',
        priority: 'low',
        message: 'Il semble manquer des informations pratiques (prix, horaires, accès) pour ce type d\'article. Point à examiner.'
      });
    }
  }

  // Check for lived experience
  const hasExperience = lowerText.includes('j\'ai') || lowerText.includes('nous avons') || lowerText.includes('on a testé') || lowerText.includes('notre');
  if (!hasExperience) {
    warnings.push({
      id: 'missing_experience',
      priority: 'low',
      message: 'Le vécu terrain (ex: "on a testé", "notre avis") n\'est pas clairement identifié. Point à examiner.'
    });
  }

  // Check for honesty/limits
  const hasHonesty = lowerText.includes('moins aimé') || lowerText.includes('attention') || lowerText.includes('bémol') || lowerText.includes('inconvénient');
  if (!hasHonesty && plainContent.trim().length > 300) {
      warnings.push({
          id: 'missing_limits',
          priority: 'low',
          message: 'L\'article ne semble pas mentionner de limites, réserves ou points de vigilance. Point à examiner.'
      });
  }

  return warnings.sort((a, b) => {
    const priorities = { high: 1, medium: 2, low: 3 };
    return priorities[a.priority] - priorities[b.priority];
  });
}
