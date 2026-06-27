import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://smxnruefmrmfyfhuxygq.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNteG5ydWVmbXJtZnlmaHV4eWdxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDgzMTQwMSwiZXhwIjoyMDkwNDA3NDAxfQ.fqGX7XAomTEGwLgAHD32voj2iJE7C5cSY3vI99vwyHk';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

// Helper: log with timestamp
function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function logResult(label, data, error) {
  if (error) {
    console.error(`  ❌ ERROR in ${label}:`, error.message || error);
  } else {
    console.log(`  ✅ ${label}: ${JSON.stringify(data)}`);
  }
}

// ─────────────────────────────────────────────
// Fix A: Normalize author name
// ─────────────────────────────────────────────
async function fixA() {
  log('=== Fix A: Normalize author name ===');

  const { data: d1, error: e1 } = await supabase
    .from('cms_blog_posts')
    .update({ author: 'Heldonica' })
    .eq('author', 'Le couple Heldonica')
    .select('id, slug, author');
  logResult('cms_blog_posts author fix', d1, e1);

  const { data: d2, error: e2 } = await supabase
    .from('articles')
    .update({ author: 'Heldonica' })
    .eq('author', 'Le couple Heldonica')
    .select('id, slug, author');
  logResult('articles author fix', d2, e2);
}

// ─────────────────────────────────────────────
// Fix B: Fix Maramures article image
// ─────────────────────────────────────────────
async function fixB() {
  log('=== Fix B: Fix Maramures article image ===');

  const MARAMURES_IMAGE = 'https://images.unsplash.com/photo-1586500036706-41963de24d8b?w=1200&q=80';

  // Find by slug or title
  const { data: posts, error: fetchErr } = await supabase
    .from('cms_blog_posts')
    .select('id, slug, title, featured_image')
    .or('slug.ilike.%maramures%,title.ilike.%Maramure%');

  if (fetchErr) {
    console.error('  ❌ ERROR fetching Maramures post:', fetchErr.message);
  } else if (!posts || posts.length === 0) {
    console.log('  ℹ️  No Maramures post found in cms_blog_posts');
  } else {
    for (const post of posts) {
      console.log(`  Found: [cms_blog_posts] id=${post.id} slug="${post.slug}" current_image="${post.featured_image}"`);
      const { data, error } = await supabase
        .from('cms_blog_posts')
        .update({ featured_image: MARAMURES_IMAGE })
        .eq('id', post.id)
        .select('id, slug, featured_image');
      logResult('cms_blog_posts Maramures image fix', data, error);
    }
  }

  // Same for articles table
  const { data: arts, error: fetchErr2 } = await supabase
    .from('articles')
    .select('id, slug, title, featured_image')
    .or('slug.ilike.%maramures%,title.ilike.%Maramure%');

  if (fetchErr2) {
    console.error('  ❌ ERROR fetching Maramures article:', fetchErr2.message);
  } else if (!arts || arts.length === 0) {
    console.log('  ℹ️  No Maramures article found in articles');
  } else {
    for (const art of arts) {
      console.log(`  Found: [articles] id=${art.id} slug="${art.slug}" current_image="${art.featured_image}"`);
      const { data, error } = await supabase
        .from('articles')
        .update({ featured_image: MARAMURES_IMAGE })
        .eq('id', art.id)
        .select('id, slug, featured_image');
      logResult('articles Maramures image fix', data, error);
    }
  }
}

// ─────────────────────────────────────────────
// Fix C: Fix Podgorica read_time if 0 or null
// ─────────────────────────────────────────────
async function fixC() {
  log('=== Fix C: Fix Podgorica read_time ===');

  // cms_blog_posts
  const { data: posts, error: fetchErr } = await supabase
    .from('cms_blog_posts')
    .select('id, slug, read_time, content')
    .ilike('slug', '%podgorica%');

  if (fetchErr) {
    console.error('  ❌ ERROR fetching Podgorica post:', fetchErr.message);
  } else if (!posts || posts.length === 0) {
    console.log('  ℹ️  No Podgorica post found in cms_blog_posts');
  } else {
    for (const post of posts) {
      console.log(`  Found: [cms_blog_posts] id=${post.id} slug="${post.slug}" read_time=${post.read_time}`);
      if (!post.read_time || post.read_time === 0) {
        const wordCount = (post.content || '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
        const calculatedTime = Math.max(1, Math.ceil(wordCount / 200));
        console.log(`  Calculated read_time: ${calculatedTime} min (${wordCount} words)`);
        const { data, error } = await supabase
          .from('cms_blog_posts')
          .update({ read_time: calculatedTime })
          .eq('id', post.id)
          .select('id, slug, read_time');
        logResult('cms_blog_posts Podgorica read_time fix', data, error);
      } else {
        console.log(`  ℹ️  read_time already set (${post.read_time}), skipping`);
      }
    }
  }

  // articles table
  const { data: arts, error: fetchErr2 } = await supabase
    .from('articles')
    .select('id, slug, read_time, content')
    .ilike('slug', '%podgorica%');

  if (fetchErr2) {
    console.error('  ❌ ERROR fetching Podgorica article:', fetchErr2.message);
  } else if (!arts || arts.length === 0) {
    console.log('  ℹ️  No Podgorica article found in articles');
  } else {
    for (const art of arts) {
      console.log(`  Found: [articles] id=${art.id} slug="${art.slug}" read_time=${art.read_time}`);
      if (!art.read_time || art.read_time === 0) {
        const wordCount = (art.content || '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
        const calculatedTime = Math.max(1, Math.ceil(wordCount / 200));
        console.log(`  Calculated read_time: ${calculatedTime} min (${wordCount} words)`);
        const { data, error } = await supabase
          .from('articles')
          .update({ read_time: calculatedTime })
          .eq('id', art.id)
          .select('id, slug, read_time');
        logResult('articles Podgorica read_time fix', data, error);
      } else {
        console.log(`  ℹ️  read_time already set (${art.read_time}), skipping`);
      }
    }
  }
}

// ─────────────────────────────────────────────
// Fix D: Fix Madere article image
// ─────────────────────────────────────────────
async function fixD() {
  log('=== Fix D: Fix Madere article image ===');

  const MADERE_IMAGE = 'https://images.unsplash.com/photo-1569959220744-ff553533f492?w=1200&q=80';

  const { data: posts, error: fetchErr } = await supabase
    .from('cms_blog_posts')
    .select('id, slug, destination, featured_image')
    .or('slug.ilike.%madere%,destination.ilike.%Madere%');

  if (fetchErr) {
    console.error('  ❌ ERROR fetching Madere post:', fetchErr.message);
  } else if (!posts || posts.length === 0) {
    console.log('  ℹ️  No Madere post found in cms_blog_posts');
  } else {
    for (const post of posts) {
      console.log(`  Found: [cms_blog_posts] id=${post.id} slug="${post.slug}" current_image="${post.featured_image}"`);
      const { data, error } = await supabase
        .from('cms_blog_posts')
        .update({ featured_image: MADERE_IMAGE })
        .eq('id', post.id)
        .select('id, slug, featured_image');
      logResult('cms_blog_posts Madere image fix', data, error);
    }
  }
}

// ─────────────────────────────────────────────
// Fix E: Fix apostrophes in excerpts
// ─────────────────────────────────────────────
async function fixE() {
  log("=== Fix E: Fix apostrophes in excerpts ===");

  // --- Pattern 1: 's est ' → "s'est"  ---
  // cms_blog_posts
  const { data: posts1, error: e1 } = await supabase
    .from('cms_blog_posts')
    .select('id, slug, excerpt')
    .ilike('excerpt', "%s est %");

  if (e1) {
    console.error("  ❌ ERROR fetching posts with 's est':", e1.message);
  } else if (!posts1 || posts1.length === 0) {
    console.log("  ℹ️  No cms_blog_posts with 's est' found");
  } else {
    for (const post of posts1) {
      const fixed = post.excerpt.replaceAll('s est', "s'est");
      const { data, error } = await supabase
        .from('cms_blog_posts')
        .update({ excerpt: fixed })
        .eq('id', post.id)
        .select('id, slug, excerpt');
      logResult("cms_blog_posts apostrophe fix (s est→s'est)", data, error);
    }
  }

  // articles
  const { data: arts1, error: e2 } = await supabase
    .from('articles')
    .select('id, slug, excerpt')
    .ilike('excerpt', "%s est %");

  if (e2) {
    console.error("  ❌ ERROR fetching articles with 's est':", e2.message);
  } else if (!arts1 || arts1.length === 0) {
    console.log("  ℹ️  No articles with 's est' found");
  } else {
    for (const art of arts1) {
      const fixed = art.excerpt.replaceAll('s est', "s'est");
      const { data, error } = await supabase
        .from('articles')
        .update({ excerpt: fixed })
        .eq('id', art.id)
        .select('id, slug, excerpt');
      logResult("articles apostrophe fix (s est→s'est)", data, error);
    }
  }

  // --- Pattern 2: 'avant dy' → "avant d'y"  ---
  // cms_blog_posts
  const { data: posts2, error: e3 } = await supabase
    .from('cms_blog_posts')
    .select('id, slug, excerpt')
    .ilike('excerpt', "%avant dy%");

  if (e3) {
    console.error("  ❌ ERROR fetching posts with 'avant dy':", e3.message);
  } else if (!posts2 || posts2.length === 0) {
    console.log("  ℹ️  No cms_blog_posts with 'avant dy' found");
  } else {
    for (const post of posts2) {
      const fixed = post.excerpt.replaceAll('avant dy', "avant d'y");
      const { data, error } = await supabase
        .from('cms_blog_posts')
        .update({ excerpt: fixed })
        .eq('id', post.id)
        .select('id, slug, excerpt');
      logResult("cms_blog_posts apostrophe fix (avant dy→avant d'y)", data, error);
    }
  }

  // articles
  const { data: arts2, error: e4 } = await supabase
    .from('articles')
    .select('id, slug, excerpt')
    .ilike('excerpt', "%avant dy%");

  if (e4) {
    console.error("  ❌ ERROR fetching articles with 'avant dy':", e4.message);
  } else if (!arts2 || arts2.length === 0) {
    console.log("  ℹ️  No articles with 'avant dy' found");
  } else {
    for (const art of arts2) {
      const fixed = art.excerpt.replaceAll('avant dy', "avant d'y");
      const { data, error } = await supabase
        .from('articles')
        .update({ excerpt: fixed })
        .eq('id', art.id)
        .select('id, slug, excerpt');
      logResult("articles apostrophe fix (avant dy→avant d'y)", data, error);
    }
  }
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────
async function main() {
  console.log('\n🚀 Starting Heldonica data fixes...\n');
  try {
    await fixA();
    console.log('');
    await fixB();
    console.log('');
    await fixC();
    console.log('');
    await fixD();
    console.log('');
    await fixE();
    console.log('\n✅ All fixes completed.\n');
  } catch (err) {
    console.error('\n💥 Unexpected error:', err);
    process.exit(1);
  }
}

main();
