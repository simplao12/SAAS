import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/AdminSidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  // Verificar se é admin
  if (session.user?.role !== "ADMIN") {
    redirect("/dashboard")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <AdminSidebar
        userName={session.user?.name}
        userEmail={session.user?.email || ""}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
