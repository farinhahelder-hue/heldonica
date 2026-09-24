'use client';

import { useState, useEffect } from 'react';

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
}

const FALLBACK_CATEGORIES = [
  'Carnets Voyage',
  'Guides Pratiques',
  'Découvertes Locales',
  'Nourriture',
];

export default function CategorySelect({ value, onChange }: CategorySelectProps) {
  const [categories, setCategories] = useState<string[]>(FALLBACK_CATEGORIES);

  useEffect(() => {
    fetch('/api/cms/blog-categories')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.categories?.length) {
          setCategories(data.categories.map((c: any) => c.db_value || c.label));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2D8B7A]"
    >
      <option value="">Sélectionner une catégorie</option>
      {categories.map(c => (
        <option key={c} value={c}>{c}</option>
      ))}
    </select>
  );
}