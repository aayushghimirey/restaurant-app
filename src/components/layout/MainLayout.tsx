import { useState } from "react"
import { Outlet } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { Header } from "./Header"
import { Sidebar } from "./Sidebar"

export function MainLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="h-screen overflow-hidden bg-background text-foreground flex">
      <Sidebar isMobileOpen={isMobileOpen} onMobileOpenChange={setIsMobileOpen} />

      <div className="flex-1 flex flex-col min-h-0 relative">
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        
        <Header onOpenMobileSidebar={() => setIsMobileOpen(true)} />

        <main className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
          <Outlet />
        </main>
      </div>

      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
            fontSize: '12px',
            borderRadius: '12px',
          },
        }}
      />
    </div>
  )
}

