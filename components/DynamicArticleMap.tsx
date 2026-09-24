'use client'
import dynamic from 'next/dynamic'

const ArticleMap = dynamic(() => import('@/components/ArticleMap'), { ssr: false })

export default function DynamicArticleMap({ slug }: { slug: string }) {
  return <ArticleMap slug={slug} />
}
