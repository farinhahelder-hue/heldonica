import Script from 'next/script'

interface ArticleJsonLdProps {
  title: string
  description: string
  slug: string
  featuredImage: string | null
  publishedAt: string | null
  updatedAt: string | null
  author: string
  tags: string[]
  category: string | null
  readTime: number
}

const SITE_URL = 'https://www.heldonica.fr'
const DEFAULT_OG = `${SITE_URL}/og-default-heldonica.jpg`

/**
 * Composant JSON-LD pour les articles de blog (BlogPosting Schema)
 * Respecte les conventions Heldonica: colonnes sans underscore
 */
export function ArticleJsonLd({
  title,
  description,
  slug,
  featuredImage,
  publishedAt,
  updatedAt,
  author,
  tags,
  category,
  readTime,
}: ArticleJsonLdProps) {
  const url = `${SITE_URL}/blog/${slug}`
  
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: description,
    image: featuredImage ? [featuredImage] : [DEFAULT_OG],
    datePublished: publishedAt ?? '',
    dateModified: updatedAt ?? publishedAt ?? '',
    author: {
      '@type': 'Person',
      name: author || 'Heldonica',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Heldonica',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    keywords: tags.join(', '),
    articleSection: category ?? '',
    timeRequired: readTime > 0 ? `PT${readTime}M` : undefined,
    inLanguage: 'fr-FR',
  }

  return (
    <Script
      id="article-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
    />
  )
}

interface BreadcrumbJsonLdProps {
  items: Array<{
    label: string
    href: string
  }>
}

/**
 * Composant JSON-LD pour le fil d'Ariane (BreadcrumbList Schema)
 */
export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${SITE_URL}${item.href}`,
    })),
  }

  return (
    <Script
      id="breadcrumb-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
    />
  )
}

interface FAQJsonLdProps {
  questions: Array<{
    question: string
    answer: string
  }>
}

/**
 * Composant JSON-LD pour les FAQ (FAQPage Schema)
 */
export function FAQJsonLd({ questions }: FAQJsonLdProps) {
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  }

  return (
    <Script
      id="faq-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
    />
  )
}

/**
 * Construire les items du breadcrumb pour un article de blog
 */
export function buildBlogBreadcrumbItems(
  category: string | null,
  title: string
): Array<{ label: string; href: string }> {
  const items = [
    { label: 'Accueil', href: '/' },
    { label: 'Blog', href: '/blog' },
  ]

  if (category) {
    items.push({
      label: category,
      href: `/blog?categorie=${encodeURIComponent(category)}`,
    })
  }

  items.push({ label: title, href: '' }) // L'article actuel n'a pas de href

  return items
}