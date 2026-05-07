import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Loader2, Plus, Search, Shield, User, MapPin, Phone, Check } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCreateStaff, useStaffs } from "@/api/staffQueries"
import type { StaffReqDto, StaffResDto, StaffRole } from "@/types/staff"
import { cn } from "@/lib/utils"

const AVAILABLE_PERMISSIONS = [
  "READ_REPORTS",
  "MANAGE_INVENTORY",
  "MANAGE_STAFF",
  "PROCESS_PAYMENTS",
  "MANAGE_ORDERS",
  "MANAGE_TABLES"
]

const staffSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  contactNumber: z.string().min(1, "Contact number is required"),
  role: z.string().min(1, "Role is required"),
  permissions: z.array(z.string()).min(1, "Select at least one permission"),
})

function requiredAsterisk() {
  return <span className="text-destructive ml-1">*</span>
}

function StaffForm({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: () => void
}) {
  const createMutation = useCreateStaff()

  const form = useForm<StaffReqDto>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      name: "",
      address: "",
      contactNumber: "",
      role: "STAFF" as StaffRole,
      permissions: [],
    },
    mode: "onBlur",
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form

  const roles: StaffRole[] = useMemo(() => ["ADMIN", "MANAGER", "STAFF"], [])
  const isSaving = createMutation.isPending
  const currentPermissions = watch("permissions") || []

  const togglePermission = (perm: string) => {
    if (currentPermissions.includes(perm)) {
      setValue("permissions", currentPermissions.filter(p => p !== perm), { shouldValidate: true })
    } else {
      setValue("permissions", [...currentPermissions, perm], { shouldValidate: true })
    }
  }

  const onSubmit = useCallback(
    (values: StaffReqDto) => {
      createMutation.mutate(values, {
        onSuccess: () => {
          toast.success("Staff created successfully")
          onCreated()
        },
      })
    },
    [createMutation, onCreated],
  )

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1, transition: { type: "spring", damping: 25, stiffness: 200 } }}
      exit={{ x: "100%", opacity: 0, transition: { type: "spring", damping: 25, stiffness: 200 } }}
      className="h-full flex flex-col bg-card/60 backdrop-blur-3xl border-l border-white/10 shadow-2xl"
    >
      <div className="flex items-start justify-between gap-3 border-b border-white/10 p-6 bg-white/[0.02]">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] font-black text-primary flex items-center gap-2">
            <User className="h-3 w-3" /> Add New Staff
          </div>
          <div className="text-2xl font-black mt-1 text-white">Staff Profile</div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          disabled={isSaving}
          className="rounded-xl hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          ✕
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
              Name {requiredAsterisk()}
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input
                className="pl-9 bg-white/5 border-white/10 rounded-xl focus-visible:ring-primary/50 transition-all"
                placeholder="John Doe"
                disabled={isSaving}
                {...register("name")}
              />
            </div>
            {errors.name?.message && (
              <div className="text-[10px] uppercase tracking-widest font-bold text-rose-400">
                {errors.name.message}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
              Contact Number {requiredAsterisk()}
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input
                className="pl-9 bg-white/5 border-white/10 rounded-xl focus-visible:ring-primary/50 transition-all"
                placeholder="+977 98..."
                disabled={isSaving}
                {...register("contactNumber")}
              />
            </div>
            {errors.contactNumber?.message && (
              <div className="text-[10px] uppercase tracking-widest font-bold text-rose-400">
                {errors.contactNumber.message}
              </div>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
              Address {requiredAsterisk()}
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input
                className="pl-9 bg-white/5 border-white/10 rounded-xl focus-visible:ring-primary/50 transition-all"
                placeholder="123 Main St, City"
                disabled={isSaving}
                {...register("address")}
              />
            </div>
            {errors.address?.message && (
              <div className="text-[10px] uppercase tracking-widest font-bold text-rose-400">
                {errors.address.message}
              </div>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
              Role {requiredAsterisk()}
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {roles.map((r) => (
                <label key={r} className="cursor-pointer">
                  <input type="radio" value={r} {...register("role")} className="peer sr-only" disabled={isSaving} />
                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center transition-all peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary hover:bg-white/10">
                    <span className="text-[11px] uppercase tracking-widest font-black">{r}</span>
                  </div>
                </label>
              ))}
            </div>
            {errors.role?.message && (
              <div className="text-[10px] uppercase tracking-widest font-bold text-rose-400">
                {errors.role.message}
              </div>
            )}
          </div>

          <div className="space-y-3 md:col-span-2">
            <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-2">
              <Shield className="h-3 w-3" /> Permissions {requiredAsterisk()}
            </Label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_PERMISSIONS.map(perm => {
                const isSelected = currentPermissions.includes(perm);
                return (
                  <button
                    key={perm}
                    type="button"
                    onClick={() => togglePermission(perm)}
                    disabled={isSaving}
                    className={cn(
                      "relative px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border flex items-center gap-2 overflow-hidden",
                      isSelected
                        ? "text-primary border-primary bg-primary/10"
                        : "text-muted-foreground border-white/10 bg-white/5 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {isSelected && (
                      <motion.div layoutId={`check-${perm}`} className="absolute left-2 flex items-center justify-center">
                        <Check className="h-3 w-3" />
                      </motion.div>
                    )}
                    <span className={cn("transition-all duration-300", isSelected ? "ml-4" : "")}>
                      {perm.replace('_', ' ')}
                    </span>
                  </button>
                )
              })}
            </div>
            {errors.permissions?.message && (
              <div className="text-[10px] uppercase tracking-widest font-bold text-rose-400">
                {errors.permissions.message}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-white/10">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-xl hover:bg-white/10"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Create Staff Profile"
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

export default function AdministrationPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchDraft, setSearchDraft] = useState("")
  const [searchSubmitted, setSearchSubmitted] = useState("")

  useEffect(() => {
    if (!isOpen) return

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [isOpen])

  const query = useMemo(
    () => ({
      search: searchSubmitted.trim() ? searchSubmitted : undefined,
      page: 0,
      size: 50,
    }),
    [searchSubmitted],
  )

  const { data, isLoading, error } = useStaffs(query)
  const staffRows: StaffResDto[] = data?.data ?? []

  useEffect(() => {
    if (error) toast.error("Failed to load staff")
  }, [error])

  const handleSearchSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      setSearchSubmitted(searchDraft)
    },
    [searchDraft],
  )

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-6 md:p-8 max-w-7xl mx-auto space-y-8"
    >
      {/* Header section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-lg shadow-blue-500/5">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">Administration</h1>
              <p className="text-sm font-medium text-muted-foreground mt-1">
                Manage staff profiles, roles, and system permissions.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <form
            onSubmit={handleSearchSubmit}
            className="flex w-full sm:w-auto relative group"
          >
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
              <Search className="h-4 w-4" />
            </div>
            <Input
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Search staff..."
              className="pl-10 w-full sm:w-64 bg-white/5 border-white/10 rounded-xl focus-visible:ring-primary/50 transition-all"
            />
            <button type="submit" className="hidden" />
          </form>

          <Button
            type="button"
            onClick={() => setIsOpen(true)}
            className="rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground whitespace-nowrap"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Staff
          </Button>
        </div>
      </motion.div>

      {/* Glassmorphism Table Container */}
      <motion.div variants={itemVariants} className="glass-card rounded-3xl overflow-hidden border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-2xl relative">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

        {isLoading && !isLoading && (
          <div className="px-6 py-3 border-b border-white/10 text-muted-foreground flex items-center gap-2 bg-white/5">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Syncing data...</span>
          </div>
        )}

        <div className="overflow-x-auto relative z-10">
          <table className="min-w-full border-collapse">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                {["Employee", "Contact", "Role & Permissions", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-24">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                      <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                        Loading directory...
                      </div>
                    </div>
                  </td>
                </tr>
              ) : staffRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-24">
                    <div className="flex flex-col items-center justify-center gap-4 opacity-90">
                      <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                      <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                        No staff records found
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                staffRows.map((staff, i) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={staff.id}
                    className="group hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 border-b border-transparent">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center font-bold text-white border border-white/10">
                          {staff.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white group-hover:text-primary transition-colors">
                            {staff.name}
                          </div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" /> {staff.address}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 border-b border-transparent text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3" /> {staff.contactNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 border-b border-transparent">
                      <div className="flex flex-col items-start gap-2">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] uppercase tracking-widest font-black border",
                          staff.role === 'ADMIN' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                            staff.role === 'MANAGER' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                              'bg-primary/10 text-primary border-primary/20'
                        )}>
                          {staff.role}
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(staff.permissions || []).slice(0, 3).map(p => (
                            <span key={p} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-muted-foreground uppercase font-bold tracking-wider">
                              {p.replace('MANAGE_', '').replace('_', ' ')}
                            </span>
                          ))}
                          {(staff.permissions || []).length > 3 && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-muted-foreground uppercase font-bold tracking-wider">
                              +{(staff.permissions || []).length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 border-b border-transparent">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="rounded-lg opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 hover:bg-primary hover:text-white"
                        onClick={() => toast.error("Staff details are not implemented yet")}
                      >
                        Edit Profile
                      </Button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <div
              role="dialog"
              aria-modal="true"
              className="relative h-full w-full max-w-xl z-50"
            >
              <StaffForm
                onClose={() => setIsOpen(false)}
                onCreated={() => {
                  setIsOpen(false)
                  setSearchSubmitted(searchDraft)
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

