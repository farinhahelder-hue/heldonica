import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getCmsAuthStatus, CMS_SESSION_COOKIE } from '@/lib/cms-auth'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(CMS_SESSION_COOKIE)
  
  const mockRequest = new Request('http://localhost', {
    headers: {
      cookie: sessionCookie 
        ? `${CMS_SESSION_COOKIE}=${sessionCookie.value}` 
        : ''
    }
  })
  
  const authStatus = await getCmsAuthStatus(mockRequest)
  
  if (authStatus !== 'ok') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <header className="mb-8 pb-6 border-b border-stone-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif font-semibold text-mahogany">
                🛠️ Admin Heldonica
              </h1>
              <p className="text-charcoal/60 text-sm mt-1">
                Gestion des paramètres du site
              </p>
            </div>
            <nav className="flex items-center gap-4 text-sm">
              <Link
                href="/admin/categories"
                className="text-charcoal/60 hover:text-charcoal"
              >
                Catégories
              </Link>
              <Link
                href="/cms-admin"
                className="text-eucalyptus hover:underline"
              >
                ← Retour au CMS
              </Link>
              <Link
                href="/"
                className="text-charcoal/60 hover:text-charcoal"
              >
                Voir le site →
              </Link>
            </nav>
          </div>
        </header>
        {children}
      </div>
    </div>
  )
}