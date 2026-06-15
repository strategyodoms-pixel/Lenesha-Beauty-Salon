import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminNav from '@/components/AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="flex min-h-screen bg-background">
      <AdminNav />
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  )
}
