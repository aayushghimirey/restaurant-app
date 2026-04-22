import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  Loader2, Building2, Mail, User, Lock, Phone, 
  CheckCircle2, Calendar, Globe, ShieldCheck, 
  Search, ExternalLink, MoreVertical, Building
} from "lucide-react"
import { toast } from "react-hot-toast"
import { tenantApi } from "../api/tenantApi"
import { useTenants } from "../api/queries/useTenants"
import { invalidateKey } from "@/lib/eventBus"

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
  const [searchTerm, setSearchTerm] = useState("")
  
  const { data: tenants, isLoading: loadingTenants } = useTenants()

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
      invalidateKey(["tenants"])
      reset()
      setTimeout(() => setIsSuccess(false), 5000)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to register tenant")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTenants = tenants?.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <div className="p-6 md:p-10 space-y-12 animate-in max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-foreground">Tenant Infrastructure</h2>
          </div>
          <p className="text-muted-foreground text-sm font-medium flex items-center gap-2">
             Provision and monitor business ecosystems across the platform.
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-muted/30 px-5 py-3 rounded-[1.5rem] border border-border/50">
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Global Status</span>
              <span className="text-xs font-bold text-foreground">All Systems Operational</span>
           </div>
           <div className="h-8 w-[1px] bg-border mx-1" />
           <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Registration Form */}
        <div className="xl:col-span-5 space-y-6">
           <div className="space-y-1 px-2">
             <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Provision New Tenant</h3>
             <p className="text-xs text-muted-foreground font-medium">Create a dedicated environment for a new partner.</p>
           </div>
           
           <div className="bg-card border border-border/60 rounded-[2.5rem] p-8 shadow-xl shadow-foreground/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
               <Building2 className="h-32 w-32" />
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Company Name</label>
                  <div className="relative group/input">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                    <input
                      {...register("companyName")}
                      className="w-full bg-muted/20 border border-border/50 rounded-2xl py-3 pl-11 pr-4 focus:bg-card focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-sm"
                      placeholder="Acme International"
                    />
                  </div>
                  {errors.companyName && <p className="text-[10px] font-bold text-red-500 ml-1 mt-1 uppercase tracking-wider">{errors.companyName.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Business Email</label>
                  <div className="relative group/input">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                    <input
                      {...register("email")}
                      type="email"
                      className="w-full bg-muted/20 border border-border/50 rounded-2xl py-3 pl-11 pr-4 focus:bg-card focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-sm"
                      placeholder="admin@acme.io"
                    />
                  </div>
                  {errors.email && <p className="text-[10px] font-bold text-red-500 ml-1 mt-1 uppercase tracking-wider">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Admin Identity</label>
                  <div className="relative group/input">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                    <input
                      {...register("username")}
                      className="w-full bg-muted/20 border border-border/50 rounded-2xl py-3 pl-11 pr-4 focus:bg-card focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-sm"
                      placeholder="root_admin"
                    />
                  </div>
                  {errors.username && <p className="text-[10px] font-bold text-red-500 ml-1 mt-1 uppercase tracking-wider">{errors.username.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Initial Key</label>
                  <div className="relative group/input">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                    <input
                      {...register("password")}
                      type="password"
                      className="w-full bg-muted/20 border border-border/50 rounded-2xl py-3 pl-11 pr-4 focus:bg-card focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && <p className="text-[10px] font-bold text-red-500 ml-1 mt-1 uppercase tracking-wider">{errors.password.message}</p>}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Global Phone Contact</label>
                  <div className="relative group/input">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                    <input
                      {...register("adminPhone")}
                      className="w-full bg-muted/20 border border-border/50 rounded-2xl py-3 pl-11 pr-4 focus:bg-card focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-sm"
                      placeholder="+1-555-0123"
                    />
                  </div>
                  {errors.adminPhone && <p className="text-[10px] font-bold text-red-500 ml-1 mt-1 uppercase tracking-wider">{errors.adminPhone.message}</p>}
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-primary-foreground font-black uppercase tracking-[0.3em] text-[10px] py-4 rounded-2xl hover:shadow-[0_10px_30px_rgba(var(--primary),0.3)] disabled:opacity-50 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isSuccess ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Provision Successful
                    </>
                  ) : (
                    "Authorize & Provision"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Tenant List Section */}
        <div className="xl:col-span-7 space-y-6">
           <div className="flex items-center justify-between px-2">
             <div className="space-y-1">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Registered Ecosystems</h3>
                <p className="text-xs text-muted-foreground font-medium">Monitoring {tenants?.length || 0} active business environments.</p>
             </div>
             
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Filter environments..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-muted/20 border border-border/50 rounded-xl outline-none focus:border-primary/40 focus:bg-card transition-all text-[11px] font-bold w-[220px]"
                />
             </div>
           </div>

           <div className="bg-card border border-border/60 rounded-[2.5rem] overflow-hidden shadow-xl shadow-foreground/5 min-h-[500px]">
              {loadingTenants ? (
                <div className="p-20 flex flex-col items-center justify-center gap-4">
                   <Loader2 className="h-8 w-8 text-primary animate-spin" />
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Synchronizing Registry...</p>
                </div>
              ) : filteredTenants.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/10 border-b border-border/50">
                        <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Environment Name</th>
                        <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Root Contact</th>
                        <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Established</th>
                        <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Access</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {filteredTenants.map((tenant) => (
                        <tr key={tenant.id} className="hover:bg-primary/5 transition-all duration-300 group">
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-muted/20 flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-sm border border-border/40">
                                   <Building className="h-5 w-5" />
                                </div>
                                <div>
                                   <p className="text-sm font-black text-foreground tracking-tight">{tenant.name}</p>
                                   <p className="text-[10px] text-muted-foreground font-bold font-mono tracking-tighter mt-0.5 opacity-60">ID: {tenant.id.substring(0, 13)}...</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex flex-col">
                                <p className="text-[11px] font-bold text-foreground">{tenant.email}</p>
                                <div className="flex items-center gap-1 mt-1">
                                   <ShieldCheck className="h-3 w-3 text-emerald-500/60" />
                                   <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Authorized</span>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                <span className="text-[11px] font-bold">
                                   {new Date(tenant.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                             </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <button className="h-9 w-9 rounded-xl bg-muted/10 border border-border/50 flex items-center justify-center text-muted-foreground hover:bg-foreground hover:text-background transition-all">
                                <MoreVertical className="h-4 w-4" />
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-32 flex flex-col items-center justify-center gap-4 grayscale opacity-40">
                   <Globe className="h-16 w-16 mb-2" />
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">No registered ecosystems found.</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  )
}
