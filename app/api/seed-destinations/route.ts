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
    const results = []
    
    for (const dest of DESTINATIONS) {
      // Check if destination already exists
      const { data: existing } = await supabase
        .from('destinations')
        .select('slug')
        .eq('slug', dest.slug)
        .single()
      
      if (existing) {
        results.push({ slug: dest.slug, status: 'skipped', reason: 'already exists' })
        continue
      }
      
      // Insert destination
      const { data, error } = await supabase
        .from('destinations')
        .insert(dest)
        .select('slug')
        .single()
      
      if (error) {
        results.push({ slug: dest.slug, status: 'error', error: error.message })
      } else {
        results.push({ slug: dest.slug, status: 'inserted', id: (data as any).id })
      }
    }
    
    // Get total count
    const { count } = await supabase
      .from('destinations')
      .select('*', { count: 'exact', head: true })
    
    return NextResponse.json({
      success: true,
      seeded: results.filter(r => r.status === 'inserted').length,
      skipped: results.filter(r => r.status === 'skipped').length,
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