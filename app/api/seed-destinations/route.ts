import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'

const DESTINATIONS = [
  {
    slug: 'roumanie-transylvanie',
    title: 'Transylvanie secrète | Guide Heldonica',
    excerpt: 'Villages saxons oubliés, forêts de hêtres, châteaux sans touristes. Notre itinéraire Transylvanie slow travel en couple, avril 2026.',
    country: 'Roumanie',
    region: 'Europe de l\'Est',
    category: 'culture',
    link: '/destinations/roumanie',
  },
  {
    slug: 'montenegro-podgorica',
    title: 'Monténégro & Podgorica | Guide Heldonica',
    excerpt: 'Podgorica comme base méconnue, Kotor sans foule, fjord de Boka. Notre itinéraire couple hors sentiers battus, mai 2026.',
    country: 'Monténégro',
    region: 'Balkans',
    category: 'nature',
    link: '/destinations/montenegro',
  },
  {
    slug: 'sicile-interieure',
    title: 'Sicile intérieure | Guide Heldonica',
    excerpt: 'Agrigente, Raguse, Modica, Caltagirone. La vraie Sicile à l\'intérieur des terres, testée en couple 9 jours.',
    country: 'Italie',
    region: 'Méditerranée',
    category: 'culture',
    link: '/destinations/sicile',
  },
  {
    slug: 'lisbonne-hors-sentiers',
    title: 'Lisbonne en 72h sans les touristes | Guide Heldonica',
    excerpt: 'Alfama secret, LX Factory le matin, ferries locaux. Lisbonne comme les Lisboètes la vivent, testée 4 fois.',
    country: 'Portugal',
    region: 'Europe du Sud',
    category: 'city',
    link: '/destinations/lisbonne',
  },
  {
    slug: 'paris-canal-marais',
    title: 'Paris slow travel : Canal Saint-Martin & Le Marais',
    excerpt: 'La Petite Ceinture, la rue du Temple, les cafés de la Villette. Paris sans les files d\'attente.',
    country: 'France',
    region: 'Europe de l\'Ouest',
    category: 'city',
    link: '/destinations/paris',
  },
  {
    slug: 'suisse-stoos',
    title: 'Suisse slow travel : Stoos Ridge & lacs de montagne',
    excerpt: 'Le funiculaire le plus raide du monde, les crêtes du Stoos, les bains du Lötschental. Testé 6 jours.',
    country: 'Suisse',
    region: 'Alpes',
    category: 'nature',
    link: '/destinations/suisse',
  },
]

export async function GET() {
  try {
    const results = [];
    
    // Batch upsert to optimize performance (O(1) query instead of O(N) queries)
    const { data, error } = await supabase
      .from('destinations')
      .upsert(DESTINATIONS, { onConflict: 'slug', ignoreDuplicates: true })
      .select('slug, id');
      
    if (error) {
      console.error('Batch insert error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Map the inserted data for easy lookup
    const insertedMap = new Map();
    if (data) {
      for (const item of data) {
        insertedMap.set(item.slug, item.id);
      }
    }

    // Build results array matching the old format (reporting both inserted and skipped items)
    for (const dest of DESTINATIONS) {
      if (insertedMap.has(dest.slug)) {
        results.push({ slug: dest.slug, status: 'inserted', id: insertedMap.get(dest.slug) });
      } else {
        results.push({ slug: dest.slug, status: 'skipped', reason: 'already exists' });
      }
    }
    
    const seededCount = insertedMap.size;
    const skippedCount = DESTINATIONS.length - seededCount;

    // Get total count
    const { count } = await supabase
      .from('destinations')
      .select('*', { count: 'exact', head: true });
    
    return NextResponse.json({
      success: true,
      seeded: seededCount,
      skipped: skippedCount,
      total_destinations: count,
      details: results,
    })
  } catch (err) {
    console.error('Seed destinations error:', err)
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    )
  }
}