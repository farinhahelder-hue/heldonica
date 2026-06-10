import { NextResponse } from 'next/server'
import { supabase } from '@/lib/blog-supabase'

export async function POST() {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  try {
    // Check if Podgorica article already exists
    const { data: existing } = await supabase
      .from('cms_blog_posts')
      .select('id, slug')
      .eq('slug', 'podgorica-capitale-montenegro-guide')
      .single()

    if (existing) {
      // Update to published if it exists but not published
      const { error } = await supabase
        .from('cms_blog_posts')
        .update({ 
          published: true,
          status: 'published'
        })
        .eq('id', existing.id)
      
      return NextResponse.json({
        success: true,
        action: 'updated',
        slug: 'podgorica-capitale-montenegro-guide',
        error: error?.message
      })
    }

    // Insert new Podgorica article
    const { error } = await supabase
      .from('cms_blog_posts')
      .insert({
        title: 'Podgorica : ce que personne ne te dit sur la capitale du Monténégro',
        slug: 'podgorica-capitale-montenegro-guide',
        excerpt: 'Podgorica n\'est ni belle ni laide — elle est honnête. On y a passé 4 jours et on a trouvé des pépites que les guides ignorent encore.',
        category: 'Carnets de voyage',
        destination: 'Monténégro',
        status: 'published',
        published: true,
        published_at: new Date().toISOString(),
        featured_image: 'https://images.unsplash.com/photo-1555990793-da11153b6e8d?w=1200&q=80',
        author: 'Heldonica',
        content: `<p>Podgorica. La capitale du Monténégro qu'on traverse en coup de vent, en route vers Kotor ou le parc du Lovćen. Celle qu'on zappe. Celle dont personne ne parle.</p>

<p>On a passé 4 jours ici. Pas en transit. En immersion. Et on a trouvé des trucs que même les gens du coin ne mettent pas sur TripAdvisor.</p>

<h2>Ce qu'on a découvert</h2>

<p>Le vieux bazar, le matin, à 7h. Les femmes qui vendent des herbes dans des sacs en plastique, le parfum de café qui sort des fenêtres. Le pont sur la Morača à l'heure où les joggeurs passent et où les pêcheurs installent leur ligne.</p>

<p>La colline de Gorica, accessible à pied depuis le centre. Une colline boisée en plein ville, avec une église orthodoxe au sommet et une vue sur toute la vallée. L'endroit où les gens du coin vont vraiment, pas les touristes.</p>

<h2>Le verdict</h2>

<p>Podgorica mérite qu'on s'y arrête. Pas pour ses monuments, mais pour son absence de tourisme. Pour cette sensation rare de découvrir une capitale européenne qui n'a pas encore été transformée en décor.</p>

<p>Si tu passes par le Monténégro, prends 2-3 jours à Podgorica. Tu verras un pays autrement.</p>`
      })

    return NextResponse.json({
      success: !error,
      action: 'inserted',
      slug: 'podgorica-capitale-montenegro-guide',
      error: error?.message
    })
  } catch (err) {
    console.error('Publish Podgorica error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// Fix SEO issues for articles without images or excerpts
export async function PUT() {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  try {
    // Images by category
    const defaultImages: Record<string, string> = {
      'Carnets de voyage': 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
      'Découvertes locales': 'https://images.unsplash.com/photo-1533676802871-eca1ae998cd5?w=800&q=80',
      'Expert hôtelier': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
      'Coulisses de marque': 'https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=800&q=80',
    }

    // Get articles without featured_image
    const { data: noImageArticles } = await supabase
      .from('cms_blog_posts')
      .select('id, category, content')
      .or('featured_image.is.null,featured_image.eq.')

    let updated = 0

    if (noImageArticles) {
      await Promise.all(
        noImageArticles.map(async (article) => {
          const image = defaultImages[article.category || ''] || Object.values(defaultImages)[0]

          const { error } = await supabase!
            .from('cms_blog_posts')
            .update({ featured_image: image })
            .eq('id', article.id)

          if (!error) updated++
        })
      )
    }

    // Get articles without excerpt and generate from content
    const { data: noExcerptArticles } = await supabase
      .from('cms_blog_posts')
      .select('id, content')
      .or('excerpt.is.null,excerpt.eq.')

    if (noExcerptArticles) {
      await Promise.all(
        noExcerptArticles.map(async (article) => {
          if (article.content) {
            // Extract first 155 chars of content, strip HTML
            const plainText = article.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
            const excerpt = plainText.slice(0, 155)

            const { error } = await supabase!
              .from('cms_blog_posts')
              .update({ excerpt })
              .eq('id', article.id)

            if (!error) updated++
          }
        })
      )
    }

    return NextResponse.json({
      success: true,
      articles_updated: updated
    })
  } catch (err) {
    console.error('SEO fix error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}