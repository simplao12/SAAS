"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  Package,
  DollarSign,
  Settings,
  LogOut,
  Shield,
  FileText,
  LifeBuoy,
  Wrench,
  Activity,
  ChevronDown,
} from "lucide-react"
import { useState } from "react"

interface AdminSidebarProps {
  userName?: string | null
  userEmail?: string | null
}

export function AdminSidebar({ userName, userEmail }: AdminSidebarProps) {
  const pathname = usePathname()
  const [openSections, setOpenSections] = useState<string[]>([])

  const toggleSection = (section: string) => {
    if (openSections.includes(section)) {
      setOpenSections(openSections.filter((s) => s !== section))
    } else {
      setOpenSections([...openSections, section])
    }
  }

  const menuSections = [
    {
      title: "Principal",
      items: [
        {
          title: "Dashboard",
          href: "/admin",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Gestão",
      items: [
        {
          title: "Clientes",
          href: "/admin/clients",
          icon: Users,
        },
        {
          title: "Planos",
          href: "/admin/plans",
          icon: Package,
        },
        {
          title: "Financeiro",
          href: "/admin/finance",
          icon: DollarSign,
        },
      ],
    },
    {
      title: "Sistema",
      items: [
        {
          title: "Permissões",
          href: "/admin/permissions",
          icon: Shield,
        },
        {
          title: "Logs",
          href: "/admin/logs",
          icon: FileText,
        },
        {
          title: "Monitoramento",
          href: "/admin/monitoring",
          icon: Activity,
        },
      ],
    },
    {
      title: "Suporte",
      items: [
        {
          title: "Tickets",
          href: "/admin/tickets",
          icon: LifeBuoy,
        },
      ],
    },
    {
      title: "Ferramentas",
      items: [
        {
          title: "Utilitários",
          href: "/admin/tools",
          icon: Wrench,
        },
        {
          title: "Configurações",
          href: "/admin/settings",
          icon: Settings,
        },
      ],
    },
  ]

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-gray-800 px-6">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-red-600 flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg">Admin Panel</span>
            <span className="block text-xs text-gray-400">Master</span>
          </div>
        </Link>
      </div>

      {/* User Info */}
      <div className="border-b border-gray-800 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center">
            <Shield className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {userName || "Admin"}
            </p>
            <p className="text-xs text-gray-400 truncate">{userEmail}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
        {menuSections.map((section) => (
          <div key={section.title}>
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {section.title}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-red-600 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.title}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-800 p-4">
        <form action="/api/auth/signout" method="POST">
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sair
          </Button>
        </form>
      </div>
    </div>
  )
}
