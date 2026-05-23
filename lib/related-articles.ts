import { BlogPost as SupabaseBlogPost } from './blog-supabase'
import { BlogPost as WpBlogPost } from './wordpress-data'

type AnyBlogPost = SupabaseBlogPost | WpBlogPost;

function getTags(article: AnyBlogPost): string[] {
  return article.tags || [];
}

function getDestination(article: AnyBlogPost): string | undefined {
  if ('destination' in article) {
    return article.destination || undefined;
  }
  // For WpBlogPost, try to guess from categories/tags or return undefined
  return undefined;
}

function getCategory(article: AnyBlogPost): string | undefined {
  if ('category' in article && typeof article.category === 'string') {
    return article.category;
  }
  return undefined;
}

function getPublishedAt(article: AnyBlogPost): number {
  if ('published_at' in article && article.published_at) {
    return new Date(article.published_at).getTime();
  }
  if ('date' in article && article.date) {
    return new Date(article.date).getTime();
  }
  return 0;
}

export function getRelatedArticles<T extends AnyBlogPost>(currentArticle: T, allArticles: T[], limit = 3): T[] {
  // Filter out the current article
  const otherArticles = allArticles.filter(article => article.slug !== currentArticle.slug);

  const currentTags = getTags(currentArticle);
  const currentDest = getDestination(currentArticle);
  const currentCat = getCategory(currentArticle);

  // Calculate score for each article
  const scoredArticles = otherArticles.map(article => {
    let score = 0;

    // Shared destination +3
    const articleDest = getDestination(article);
    if (currentDest && articleDest === currentDest) {
      score += 3;
    }

    // Shared tags +1 for each
    const articleTags = getTags(article);
    if (currentTags.length > 0 && articleTags.length > 0) {
      const sharedTags = articleTags.filter(tag => currentTags.includes(tag));
      score += sharedTags.length;
    }

    // Shared category +2
    const articleCat = getCategory(article);
    if (currentCat && articleCat === currentCat) {
      score += 2;
    }

    return { article, score };
  });

  // Sort by score descending
  scoredArticles.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    // If scores are equal, sort by newest published_at
    return getPublishedAt(b.article) - getPublishedAt(a.article);
  });

  // Return top N articles
  return scoredArticles.slice(0, limit).map(item => item.article);
}
