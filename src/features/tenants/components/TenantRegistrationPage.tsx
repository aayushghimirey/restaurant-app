import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Building2, Mail, User, Lock, Phone, CheckCircle2 } from "lucide-react"
import { toast } from "react-hot-toast"
import { tenantApi } from "../api/tenantApi"

const tenantSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  adminPhone: z.string().min(10, "Invalid phone number"),
})

type TenantForm = z.infer<typeof tenantSchema>

export default function TenantRegistrationPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TenantForm>({
    resolver: zodResolver(tenantSchema),
  })

  const onSubmit = async (data: TenantForm) => {
    setIsLoading(true)
    try {
      await tenantApi.registerTenant(data)
      setIsSuccess(true)
      toast.success("Tenant registered successfully!")
      reset()
      setTimeout(() => setIsSuccess(false), 5000)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to register tenant")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Tenant Management</h1>
        <p className="text-muted-foreground">Register and onboard new business tenants to the platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      {...register("companyName")}
                      className="w-full bg-background border border-border rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="Acme Corp"
                    />
                  </div>
                  {errors.companyName && <p className="text-xs text-red-500">{errors.companyName.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Business Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      {...register("email")}
                      type="email"
                      className="w-full bg-background border border-border rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="admin@acme.com"
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Admin Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      {...register("username")}
                      className="w-full bg-background border border-border rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="admin_acme"
                    />
                  </div>
                  {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Admin Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      {...register("password")}
                      type="password"
                      className="w-full bg-background border border-border rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium">Admin Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      {...register("adminPhone")}
                      className="w-full bg-background border border-border rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  {errors.adminPhone && <p className="text-xs text-red-500">{errors.adminPhone.message}</p>}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isSuccess ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Tenant Registered
                    </>
                  ) : (
                    "Register Tenant"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6">
            <h3 className="font-semibold text-primary mb-2">Super Admin Tool</h3>
            <p className="text-sm text-muted-foreground">
              As a Super Admin, you can provision new tenant environments. Each tenant will have their own isolated data and admin account.
            </p>
          </div>

          <div className="bg-muted/50 rounded-2xl p-6 border border-border">
            <h4 className="text-sm font-medium mb-4 uppercase tracking-wider text-muted-foreground">Onboarding Checklist</h4>
            <ul className="space-y-3">
              {["Verify company details", "Assign unique username", "Set secure initial password", "Confirm contact email"].map((item, i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground/80">
                  <span className="w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center text-[10px]">{i + 1}</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
