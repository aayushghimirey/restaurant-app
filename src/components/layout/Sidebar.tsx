import { useState, useMemo } from "react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import {
  ChevronRight,
  Package,
  Receipt,
  ReceiptText,
  Users,
  Menu as MenuIcon,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Wallet,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ComponentType } from "react"
import { useAuthStore } from "@/features/auth/store/authStore"

type NavNode = {
  label: string
  href: string
  icon: ComponentType<{ className?: string }>
  roles?: string[]
  children?: Array<{
    label: string
    href: string
    icon: ComponentType<{ className?: string }>
    roles?: string[]
  }>
}

const navTree: NavNode[] = [
  { label: "Vendors", href: "/vendors", icon: Users },
  {
    label: "Inventory",
    href: "/inventory",
    icon: Package,
    children: [
      { label: "Stock", href: "/inventory", icon: Package },
      { label: "Transactions", href: "/inventory/transactions", icon: Receipt },
    ],
  },
  { label: "Menus", href: "/menus", icon: MenuIcon },
  { label: "Orders", href: "/orders", icon: ReceiptText },
  { label: "Reservations", href: "/reservations", icon: CalendarDays },
  { label: "Invoices", href: "/invoices", icon: Receipt },
  { label: "Purchases", href: "/purchases", icon: ReceiptText },
  { label: "Finances", href: "/finances", icon: Wallet },
  { label: "Tenants", href: "/tenants", icon: ShieldCheck, roles: ["SUPER_ADMIN"] },
  { label: "Administration", href: "/administration", icon: Users },
]

function isChildActive(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`))
}

export function Sidebar({
  isMobileOpen,
  onMobileOpenChange,
}: {
  isMobileOpen: boolean
  onMobileOpenChange: (next: boolean) => void
}) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { role, logout } = useAuthStore()

  const filteredNavTree = useMemo(() => {
    return navTree.filter(node => {
      // If user is SUPER_ADMIN, they ONLY see items explicitly marked for SUPER_ADMIN
      if (role === "SUPER_ADMIN") {
        return node.roles?.includes("SUPER_ADMIN")
      }
      
      // For other roles, hide items marked for SUPER_ADMIN
      if (node.roles?.includes("SUPER_ADMIN")) {
        return false
      }

      return true
    }).map(node => {
      if (node.children) {
        return {
          ...node,
          children: node.children.filter(child => {
            if (role === "SUPER_ADMIN") return child.roles?.includes("SUPER_ADMIN")
            return !child.roles?.includes("SUPER_ADMIN")
          })
        }
      }
      return node
    })
  }, [role])

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const sections: Record<string, boolean> = {}
    filteredNavTree.forEach(node => {
      if (node.children?.some(c => isChildActive(pathname, c.href))) {
        sections[node.href] = true
      }
    })
    return sections
  })

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const renderNavItems = (items: NavNode[], onSelect?: () => void) => (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1 custom-scrollbar">
      {items.map((node) => (
        <NavItem
          key={node.href}
          node={node}
          pathname={pathname}
          isOpen={!!openSections[node.href]}
          onToggle={() => setOpenSections(prev => ({ ...prev, [node.href]: !prev[node.href] }))}
          onSelect={onSelect}
        />
      ))}
    </div>
  )

  const logoutButton = (
    <div className="p-4 border-t border-white/5">
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-all duration-200 group"
      >
        <LogOut className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
        <span className="text-xs font-bold uppercase tracking-widest leading-none">Logout</span>
      </button>
    </div>
  )

  return (
    <>
      <aside className="hidden md:flex h-screen w-64 flex-col border-r border-border/50 bg-card/30 backdrop-blur-xl">
        <div className="h-16 px-6 flex items-center border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
              <LayoutDashboard className="h-4 w-4 text-white" />
            </div>
            <div className="text-xs uppercase tracking-[0.2em] font-black text-white">
              ResManager
            </div>
          </div>
        </div>

        {renderNavItems(filteredNavTree)}

        {logoutButton}
      </aside>

      {/* Mobile Drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden transition-all duration-300",
          isMobileOpen ? "visible" : "invisible pointer-events-none"
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300",
            isMobileOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => onMobileOpenChange(false)}
        />

        <aside
          className={cn(
            "absolute left-0 top-0 h-full w-72 bg-card border-r border-white/5 flex flex-col transition-transform duration-300 ease-out",
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="h-16 px-6 flex items-center border-b border-white/5">
             <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center">
                <LayoutDashboard className="h-4 w-4 text-white" />
              </div>
              <div className="text-xs uppercase tracking-[0.2em] font-black text-white">
                ResManager
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {renderNavItems(filteredNavTree, () => onMobileOpenChange(false))}
          </div>

          {logoutButton}
        </aside>
      </div>
    </>
  )
}

function NavItem({
  node,
  pathname,
  isOpen,
  onToggle,
  onSelect
}: {
  node: NavNode
  pathname: string
  isOpen: boolean
  onToggle: () => void
  onSelect?: () => void
}) {
  const Icon = node.icon
  const hasChildren = !!node.children?.length
  const isActive = isChildActive(pathname, node.href)

  if (!hasChildren) {
    return (
      <NavLink
        to={node.href}
        onClick={onSelect}
        className={({ isActive }) => cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
          isActive
            ? "bg-primary/10 text-primary shadow-[inset_0_0_20px_rgba(139,92,246,0.1)]"
            : "text-muted-foreground hover:bg-white/5 hover:text-white"
        )}
      >
        <Icon className={cn("h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110", isActive && "text-primary")} />
        <span className="text-xs font-bold uppercase tracking-widest leading-none">{node.label}</span>
        {isActive && (
          <div className="absolute left-[-1rem] top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-full shadow-[0_0_15px_rgba(139,92,246,0.6)]" />
        )}
      </NavLink>
    )
  }

  return (
    <div className="space-y-0.5">
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group",
          isActive
            ? "text-primary"
            : "text-muted-foreground hover:bg-white/5 hover:text-white"
        )}
      >
        <div className="flex items-center gap-3">
          <Icon className={cn("h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110", isActive && "text-primary")} />
          <span className="text-xs font-bold uppercase tracking-widest leading-none">{node.label}</span>
        </div>
        <ChevronRight className={cn("h-3.5 w-3.5 transition-transform duration-300", isOpen && "rotate-90")} />
      </button>

      {isOpen && (
        <div className="ml-5 pl-3 border-l border-white/5 mt-0.5 space-y-0.5">
          {node.children!.map((child) => {
            const childActive = isChildActive(pathname, child.href)
            return (
              <NavLink
                key={child.href}
                to={child.href}
                onClick={onSelect}
                className={cn(
                  "block px-3 py-2 rounded-md text-[10px] uppercase tracking-wider font-bold transition-all duration-200",
                  childActive
                    ? "text-white bg-white/5"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                )}
              >
                {child.label}
              </NavLink>
            )
          })}
        </div>
      )}
    </div>
  )
}

