import { useMemo } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Menu as MenuIcon, User, Settings, LogOut, Shield } from "lucide-react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { Button } from "@/components/ui/button"
import { useWebSocket } from "@/providers/WebSocketProvider"
import { WsStatusDot } from "@/components/ui/WsStatusDot"
import { useAuthStore } from "@/features/auth/store/authStore"

function toTitleCase(segment: string) {
  return segment
    .split("-")
    .map((s) => (s ? s[0]!.toUpperCase() + s.slice(1) : s))
    .join(" ")
}

export function Header({ onOpenMobileSidebar }: { onOpenMobileSidebar?: () => void }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { orderStatus } = useWebSocket()
  const { username, role, logout } = useAuthStore()

  const breadcrumbs = useMemo(() => {
    if (pathname === "/") return ["Dashboard"]
    const segments = pathname.split("/").filter(Boolean)
    return segments.map(toTitleCase)
  }, [pathname])

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const userInitial = username ? username[0]?.toUpperCase() : "U"

  return (
    <header className="h-16 sticky top-0 z-20 glass border-b border-white/5 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 min-w-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden text-muted-foreground hover:text-white"
          onClick={onOpenMobileSidebar}
          aria-label="Open navigation"
        >
          <MenuIcon className="h-5 w-5" />
        </Button>

        <nav aria-label="Breadcrumb" className="min-w-0">
          <ol className="flex items-center gap-2 min-w-0">
            {breadcrumbs.map((label, idx) => (
              <li
                key={`${label}-${idx}`}
                className="flex items-center gap-2 min-w-0"
              >
                <span className={cn(
                  "truncate text-[10px] uppercase tracking-[0.2em] font-black transition-colors",
                  idx === breadcrumbs.length - 1 ? "text-white" : "text-muted-foreground"
                )}>
                  {label}
                </span>
                {idx < breadcrumbs.length - 1 && (
                  <span className="text-muted-foreground/30 font-light">/</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <WsStatusDot status={orderStatus} className="hidden sm:flex" />

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end mr-1">
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">{username}</span>
            <span className="text-[8px] font-medium text-primary uppercase tracking-widest flex items-center gap-1">
              <Shield className="w-2 h-2" />
              {role?.replace("_", " ")}
            </span>
          </div>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className="flex items-center gap-3 p-1 rounded-full hover:bg-white/5 transition-colors group"
                aria-label="User menu"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary/80 to-primary border border-white/10 flex items-center justify-center text-xs font-bold text-white group-hover:border-primary transition-colors shadow-lg shadow-primary/10">
                  {userInitial}
                </div>
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content
              sideOffset={8}
              align="end"
              className="w-56 bg-card/95 backdrop-blur-xl border border-white/10 text-foreground rounded-2xl p-1.5 shadow-2xl animate-in fade-in zoom-in duration-200"
            >
              <div className="px-3 py-2 border-b border-white/5 mb-1.5 sm:hidden">
                <p className="text-[10px] font-bold text-white uppercase tracking-wider truncate">{username}</p>
                <p className="text-[8px] font-medium text-primary uppercase tracking-widest">{role}</p>
              </div>

              <DropdownMenu.Item className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl outline-none cursor-pointer hover:bg-white/5 text-muted-foreground hover:text-white transition-colors">
                <User className="h-4 w-4" />
                Profile Details
              </DropdownMenu.Item>
              <DropdownMenu.Item className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl outline-none cursor-pointer hover:bg-white/5 text-muted-foreground hover:text-white transition-colors">
                <Settings className="h-4 w-4" />
                Account Settings
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="h-px bg-white/5 my-1.5" />
              <DropdownMenu.Item
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl outline-none cursor-pointer hover:bg-red-400/10 text-red-400 hover:text-red-400 transition-colors"
                onSelect={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      </div>
    </header>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ")
}

