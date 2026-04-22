import { useState } from "react"
import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { AlertTriangle, ArrowRight } from "lucide-react"
import { Header } from "./Header"
import { Sidebar } from "./Sidebar"
import { useBusinessStore } from "@/features/business-details/store/businessStore"
import { Button } from "@/components/ui/button"
import { useOrderWebSocket } from "@/features/orders/api/websockets/useOrderWebSocket"
import { useInvoiceWebSocket } from "@/features/invoices/api/websockets/useInvoiceWebSocket"

export function MainLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const isBusinessDetailsMissing = useBusinessStore((s) => s.isBusinessDetailsMissing)
  const navigate = useNavigate()
  const location = useLocation()

  // Initialize Global WebSockets
  useOrderWebSocket()
  useInvoiceWebSocket()

  return (
    <div className="h-screen overflow-hidden bg-background text-foreground flex">
      <Sidebar isMobileOpen={isMobileOpen} onMobileOpenChange={setIsMobileOpen} />

      <div className="flex-1 flex flex-col min-h-0 relative">
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        
        <Header onOpenMobileSidebar={() => setIsMobileOpen(true)} />

        {isBusinessDetailsMissing && location.pathname !== "/business-details" && (
          <div className="bg-primary/20 border-b border-primary/30 px-6 py-3 flex items-center justify-between shadow-[inset_0_-1px_0_rgba(255,255,255,0.05)] backdrop-blur-sm z-20">
            <div className="flex items-center gap-3 text-primary">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider">Action Required</h3>
                <p className="text-[11px] font-medium opacity-90 mt-0.5">Please set up your Business Details before performing any operations.</p>
              </div>
            </div>
            <Button
              onClick={() => navigate("/business-details")}
              className="rounded-xl h-9 px-4 text-[10px] uppercase tracking-widest font-black shadow-lg shadow-primary/20 shrink-0 ml-4"
            >
              Setup Profile
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

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

