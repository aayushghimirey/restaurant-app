import { Outlet, useLocation } from "react-router-dom"
import { useAuthStore } from "../../features/auth/store/authStore"
import { useBusinessDetail } from "@/api/businessDetailQueries"
import { useEffect, useMemo } from "react"
import { Loader2 } from "lucide-react"
import { useBusinessStore } from "@/features/business-details/store/businessStore"

export function BusinessDetailGuard() {
  const { role } = useAuthStore()
  const setBusinessDetailsMissing = useBusinessStore((s) => s.setBusinessDetailsMissing)

  const { data, isLoading, error } = useBusinessDetail()

  // SUPER_ADMIN doesn't need to fill out Tenant business details for themselves
  useEffect(() => {
    if (role === "SUPER_ADMIN") {
      setBusinessDetailsMissing(false)
      return
    }

    if (!isLoading) {
      const hasBusinessDetails = !!data && !error
      setBusinessDetailsMissing(!hasBusinessDetails)
    }
  }, [role, data, error, isLoading, setBusinessDetailsMissing])

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
            Verifying Business Profile...
          </p>
        </div>
      </div>
    )
  }

  return <Outlet />
}
