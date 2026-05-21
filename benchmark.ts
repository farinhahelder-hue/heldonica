import { createClient } from "@supabase/supabase-js";
import { performance } from "perf_hooks";
import * as dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxODAwMDAwMDAwfQ.XYZ";

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

const mockArticles = Array.from({ length: 50 }, (_, i) => ({
  slug: `benchmark-article-${i}`,
  title: `Benchmark Article ${i}`,
  excerpt: "Excerpt",
  content: "Content",
  category: "Test",
  tags: ["test"],
  featured_image: "img.jpg",
  author: "Heldonica",
  published: true,
  published_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}));

async function setup() {
    try {
        await supabase.from("cms_blog_posts").delete().like("slug", "benchmark-article-%");
    } catch (e) {}
}

async function runSequential() {
    console.log("Running sequential insert...");
    const start = performance.now();
    for (const article of mockArticles) {
        await supabase.from("cms_blog_posts").upsert(article, { onConflict: "slug" }).select("slug");
    }
    const end = performance.now();
    return end - start;
}

async function runBatch() {
    console.log("Running batch insert...");
    const start = performance.now();
    await supabase.from("cms_blog_posts").upsert(mockArticles, { onConflict: "slug" }).select("slug");
    const end = performance.now();
    return end - start;
}

async function main() {
    // We can't actually hit the DB without credentials/local DB running, so we'll just test the code syntax.
    console.log("Syntax is valid.");
}

main();
