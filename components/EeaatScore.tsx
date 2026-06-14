'use client';

import { useMemo } from 'react';

interface EeaatScoreProps {
  seoTitle?: string;
  seoDescription?: string;
  author?: string;
  excerpt?: string;
  featuredImage?: string;
  tags?: string[];
  publishedAt?: string;
  content?: string;
  category?: string;
}

type CheckResult = {
  label: string;
  ok: boolean;
  detail: string;
};

const EEAT_WEIGHTS: Record<string, number> = {
  seo_title: 10,
  seo_description: 10,
  author: 10,
  excerpt: 10,
  featured_image: 10,
  tags: 15,
  published_at: 15,
  content_length: 15,
  category: 5,
};

const MAX_SCORE = Object.values(EEAT_WEIGHTS).reduce((a, b) => a + b, 0);

export default function EeaatScore({
  seoTitle,
  seoDescription,
  author,
  excerpt,
  featuredImage,
  tags,
  publishedAt,
  content,
  category,
}: EeaatScoreProps) {
  const { checks, score, grade } = useMemo(() => {
    const results: CheckResult[] = [];
    let total = 0;

    const add = (key: string, ok: boolean, detail: string) => {
      results.push({ label: key, ok, detail });
      if (ok) total += EEAT_WEIGHTS[key] ?? 0;
    };

    const titleOk = !!seoTitle && seoTitle.length >= 30 && seoTitle.length <= 70;
    add('seo_title', titleOk, titleOk
      ? `${seoTitle!.length} caracteres (30-70: OK)`
      : seoTitle
        ? `${seoTitle.length} caracteres (30-70 requis)`
        : 'Non defini'
    );

    const descOk = !!seoDescription && seoDescription.length >= 70 && seoDescription.length <= 160;
    add('seo_description', descOk, descOk
      ? `${seoDescription!.length} caracteres (70-160: OK)`
      : seoDescription
        ? `${seoDescription.length} caracteres (70-160 requis)`
        : 'Non defini'
    );

    if (author) {
      add('author', author.length >= 2 && author !== 'Heldonica', author === 'Heldonica' ? 'Auteur generique' : author);
    } else {
      add('author', false, 'Non defini');
    }

    const excerptOk = !!excerpt && excerpt.length >= 50;
    add('excerpt', excerptOk, excerptOk
      ? `${excerpt!.length} caracteres (>= 50: OK)`
      : excerpt
        ? `${excerpt.length} caracteres (50 requis)`
        : 'Non defini'
    );

    add('featured_image', !!featuredImage, featuredImage ? 'Image presente' : 'Absente');

    const tagsOk = !!tags && tags.length >= 2;
    add('tags', tagsOk, tagsOk
      ? `${tags!.length} tags (>= 2: OK)`
      : tags
        ? `${tags.length} tag(s) (2 requis)`
        : 'Aucun tag'
    );

    const dateOk = !!publishedAt && !isNaN(new Date(publishedAt).getTime());
    add('published_at', dateOk, dateOk
      ? `Date: ${new Date(publishedAt!).toLocaleDateString('fr-FR')}`
      : 'Non definie'
    );

    if (content) {
      const text = content.replace(/<[^>]*>/g, '').trim();
      const wordCount = text ? text.split(/\s+/).length : 0;
      const contentOk = wordCount >= 800;
      add('content_length', contentOk,
        wordCount >= 300
          ? `${wordCount} mots (>= 800: ideal, >= 300: minimum)`
          : `${wordCount} mots (300 minimum requis)`
      );
    } else {
      add('content_length', false, 'Contenu vide');
    }

    add('category', !!category && category.length >= 2, !!category ? category : 'Non definie');

    const pct = Math.round((total / MAX_SCORE) * 100);
    let g: string;
    if (pct >= 90) g = 'A';
    else if (pct >= 75) g = 'B';
    else if (pct >= 60) g = 'C';
    else if (pct >= 40) g = 'D';
    else g = 'E';

    return { checks: results, score: pct, grade: g };
  }, [seoTitle, seoDescription, author, excerpt, featuredImage, tags, publishedAt, content, category]);

  const colorMap: Record<string, string> = {
    A: 'bg-emerald-500', B: 'bg-green-500', C: 'bg-yellow-500',
    D: 'bg-orange-500', E: 'bg-red-500',
  };
  const textColorMap: Record<string, string> = {
    A: 'text-emerald-600', B: 'text-green-600', C: 'text-yellow-600',
    D: 'text-orange-600', E: 'text-red-600',
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">Score E-E-A-T</h4>
          <p className="text-xs text-gray-400">Experience, Expertise, Authoritativeness, Trustworthiness</p>
        </div>
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white ${colorMap[grade] ?? 'bg-gray-400'}`}>
          {grade}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${colorMap[grade] ?? 'bg-gray-400'}`}
            style={{ width: `${score}%` }}
          />
        </div>
        <span className={`text-xs font-semibold ${textColorMap[grade] ?? 'text-gray-500'}`}>
          {score}%
        </span>
      </div>

      <p className="text-xs text-gray-400 leading-relaxed">
        {score >= 90 ? 'Excellent : contenu optimise pour les moteurs de recherche et l\'IA.'
        : score >= 75 ? 'Bon : quelques ajustements possibles.'
        : score >= 60 ? 'Correct : plusieurs axes d\'amelioration.'
        : score >= 40 ? 'Faible : des elements importants manquent.'
        : 'Critique : la plupart des signaux de qualite sont absents.'}
      </p>

      <ul className="space-y-1">
        {checks.map((c) => (
          <li key={c.label} className="flex items-center gap-2 text-xs">
            <span className={c.ok ? 'text-emerald-500' : 'text-red-400'}>{c.ok ? '✓' : '✗'}</span>
            <span className="text-gray-600 font-medium min-w-[90px]">{c.label.replace(/_/g, ' ')}</span>
            <span className={`text-gray-400 ${c.ok ? '' : 'text-red-300'}`}>{c.detail}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
