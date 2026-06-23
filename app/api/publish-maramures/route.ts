import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'

export async function POST() {
  try {
    // Check if Maramureș article exists (as draft)
    const { data: existing } = await supabase
      .from('cms_blog_posts')
      .select('id, title, slug, status')
      .ilike('title', '%maramure%')
      .maybeSingle()

    let result: any

    if (existing && existing.status === 'draft') {
      // Publish existing draft
      const { error } = await supabase
        .from('cms_blog_posts')
        .update({ 
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', existing.id)
      
      result = {
        action: 'published_existing',
        slug: existing.slug,
        error: error?.message
      }
    } else if (existing && existing.status === 'published') {
      // Already published
      result = {
        action: 'already_published',
        slug: existing.slug,
        error: null
      }
    } else {
      // Insert new Maramureș article
      const { error } = await supabase
        .from('cms_blog_posts')
        .insert({
          title: "Maramureș : la Roumanie authentique que personne ne te montre",
          slug: "maramures-roumanie-authentique",
          excerpt: "Des villages en bois, des traditions vivantes et des paysages qui semblent sortis d’un autre siècle. On t’emmène dans le Maramureș, la région roumaine la plus préservée qu’on ait jamais traversée.",
          category: "Carnets de voyage",
          destination: "Roumanie",
          status: "published",
          published_at: new Date().toISOString(),
          featured_image: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=1200&q=80",
          author: "Heldonica",
          content: `<p>Le Maramureș est une région du nord de la Roumanie, coincée entre les Carpates et la frontière ukrainienne. C’est l’une des zones les plus préservées d’Europe — pas à cause du manque d’intérêt, mais parce que les gens qui y vivent ont choisi de le garder ainsi.</p>

<p>On y est allés en avril 2026, en partant de Cluj vers le nord, direction Sighetu Marmației. Le trajet prend 4 heures en voiture — ou une éternité si tu t’arrêtes à chaque village. On recommande la seconde option.</p>

<h2>Ce qu’on a trouvé</h2>

<p>Des villages où le temps s’est arrêté. Des fermes en bois qui n’ont pas changé en 50 ans. Des marchés le dimanche où les gens viennent de 30 km à la ronde, vendre ce qu’ils produisent, acheter ce dont ils ont besoin.</p>

<p>La Mocănița — le train à vapeur narrow-gauge — circule toujours entre Vișeu de Sus et le nord des montagnes. C’est un train de bois, de fumée et de soleil qui traverse des vallées où il n’y a pas de route.</p>

<h2>Le verdict</h2>

<p>Le Maramureș n’est pas une destination pour ceux qui cherchent du confort. C’est une destination pour ceux qui cherchent de la vérité. Si tu reviens de là sans avoir appris quelque chose sur comment les gens choisissent de vivre, c’est que tu n’as pas bien regardé.</p>`
        })

      result = {
        action: 'inserted_new',
        slug: 'maramures-roumanie-authentique',
        error: error?.message
      }
    }

    // Count total published
    const { count } = await supabase
      .from('cms_blog_posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')

    return NextResponse.json({
      success: true,
      total_published: count,
      ...result
    })
  } catch (err) {
    console.error('Publish Maramureș error:', err)
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    )
  }
}