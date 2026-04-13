import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
}

export default function CmsAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}