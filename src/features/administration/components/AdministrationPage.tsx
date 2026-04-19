import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Loader2, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCreateStaff, useStaffs } from "@/api/staffQueries"
import type { StaffReqDto, StaffResDto, StaffRole } from "@/types/staff"

const staffSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Email is invalid"),
  phone: z.string().min(1, "Phone is required"),
  role: z.string().min(1, "Role is required"),
})

function requiredAsterisk() {
  return <span className="text-destructive">*</span>
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
      email: "",
      phone: "",
      role: "STAFF" as StaffRole,
    },
    mode: "onBlur",
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form

  const roles: StaffRole[] = useMemo(() => ["ADMIN", "MANAGER", "STAFF"], [])

  const isSaving = createMutation.isPending

  const onSubmit = useCallback(
    (values: StaffReqDto) => {
      createMutation.mutate(values, {
        onSuccess: () => {
          toast.success("Staff created")
          onCreated()
        },
      })
    },
    [createMutation, onCreated],
  )

  return (
    <motion.div
      initial={{ x: "15%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "15%", opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="h-full flex flex-col"
    >
      <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
            Add New Staff
          </div>
          <div className="text-sm font-bold mt-1">Staff profile</div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          disabled={isSaving}
          className="rounded-none disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Close"
        >
          ×
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto custom-scrollbar pt-4 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest font-bold">
              Name {requiredAsterisk()}
            </Label>
            <Input
              className="bg-background border-border rounded-none"
              disabled={isSaving}
              {...register("name")}
            />
            {errors.name?.message && (
              <div className="text-[10px] uppercase tracking-widest font-bold text-destructive">
                {errors.name.message}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest font-bold">
              Email {requiredAsterisk()}
            </Label>
            <Input
              type="email"
              className="bg-background border-border rounded-none"
              disabled={isSaving}
              {...register("email")}
            />
            {errors.email?.message && (
              <div className="text-[10px] uppercase tracking-widest font-bold text-destructive">
                {errors.email.message}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest font-bold">
              Phone {requiredAsterisk()}
            </Label>
            <Input
              className="bg-background border-border rounded-none"
              disabled={isSaving}
              {...register("phone")}
            />
            {errors.phone?.message && (
              <div className="text-[10px] uppercase tracking-widest font-bold text-destructive">
                {errors.phone.message}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest font-bold">
              Role {requiredAsterisk()}
            </Label>
            <select
              className="h-10 w-full border border-border bg-background rounded-none text-sm"
              disabled={isSaving}
              {...register("role")}
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {errors.role?.message && (
              <div className="text-[10px] uppercase tracking-widest font-bold text-destructive">
                {errors.role.message}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={isSaving}
            className="rounded-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Create Staff"
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  )
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
    <div className="space-y-4 p-0">
      {/* Dense header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col sm:flex-row gap-2 w-full md:w-[720px]"
        >
          <div className="flex-1">
            <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
              Search staff
            </Label>
            <Input
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Name, email..."
              className="mt-1 bg-background border-border rounded-none"
            />
          </div>

          <div className="pt-5 sm:pt-0">
            <Button type="submit" disabled={isLoading} className="rounded-none disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Search"
              )}
            </Button>
          </div>
        </form>

        <Button
          type="button"
          variant="default"
          onClick={() => setIsOpen(true)}
          className="rounded-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Staff
        </Button>
      </div>

      <div className="border border-border bg-card">
        {isLoading && !isLoading && (
          <div className="px-3 py-2 border-b border-border text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Updating</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-muted/5">
              <tr>
                {["Name", "Email", "Phone", "Role", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-3 py-2 border-b border-border text-[10px] uppercase tracking-widest font-bold text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-3 py-12">
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 className="h-7 w-7 animate-spin text-primary" />
                      <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                        Loading staff...
                      </div>
                    </div>
                  </td>
                </tr>
              ) : staffRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-16">
                    <div className="flex flex-col items-center justify-center gap-3 opacity-90">
                      <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                        No staff found
                      </div>
                      <div className="text-muted-foreground text-sm">Try a different search.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                staffRows.map((staff) => (
                  <tr key={staff.id} className="bg-background">
                    <td className="px-3 py-2 border-b border-border font-bold text-[12px]">
                      {staff.name}
                    </td>
                    <td className="px-3 py-2 border-b border-border text-[12px] text-muted-foreground">
                      {staff.email}
                    </td>
                    <td className="px-3 py-2 border-b border-border text-[12px] text-muted-foreground">
                      {staff.phone}
                    </td>
                    <td className="px-3 py-2 border-b border-border">
                      <span className="inline-flex items-center px-2 py-0.5 border border-border bg-muted/10 text-[10px] uppercase tracking-widest font-bold">
                        {staff.role}
                      </span>
                    </td>
                    <td className="px-3 py-2 border-b border-border">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-none disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => toast.error("Staff details are not implemented yet")}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-background/40 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <div
              role="dialog"
              aria-modal="true"
              className="absolute right-0 top-0 h-full w-full max-w-xl bg-card border-l border-border"
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
    </div>
  )
}

