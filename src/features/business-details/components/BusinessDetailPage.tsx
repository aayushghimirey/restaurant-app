import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Building2, Save, ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/features/auth/store/authStore"
import {
  useBusinessDetail,
  useCreateBusinessDetail,
  useUpdateBusinessDetail,
} from "@/api/businessDetailQueries"
import type { BusinessDetailRequest } from "@/types/businessDetail"

const businessDetailSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  address: z.string().min(1, "Address is required"),
  panNumber: z.string().min(1, "PAN number is required"),
  businessNumber: z.string().min(1, "Business number is required"),
  businessEmail: z.string().email("Valid business email is required"),
})

export default function BusinessDetailPage() {
  const navigate = useNavigate()

  const { data: detailData, isLoading: isLoadingDetail } = useBusinessDetail()
  const existingDetail = detailData

  const createMutation = useCreateBusinessDetail()
  const updateMutation = useUpdateBusinessDetail()

  const isSaving = createMutation.isPending || updateMutation.isPending
  const isUpdating = !!existingDetail

  const form = useForm<z.infer<typeof businessDetailSchema>>({
    resolver: zodResolver(businessDetailSchema),
    defaultValues: {
      companyName: "",
      address: "",
      panNumber: "",
      businessNumber: "",
      businessEmail: "",
    },
    mode: "onBlur",
  })

  // Populate form when data loads
  useEffect(() => {
    if (existingDetail) {
      form.reset({
        companyName: existingDetail.companyName,
        address: existingDetail.address,
        panNumber: existingDetail.panNumber,
        businessNumber: existingDetail.businessNumber,
        businessEmail: existingDetail.businessEmail,
      })
    }
  }, [existingDetail, form])

  const onSubmit = (values: z.infer<typeof businessDetailSchema>) => {
    if (isUpdating) {
      updateMutation.mutate(values)
    } else {
      createMutation.mutate(values as BusinessDetailRequest)
    }
  }

  if (isLoadingDetail) {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 flex justify-center">
      <div className="space-y-6 w-full max-w-2xl">
        <div className="flex items-center gap-4 border-b border-border/50 pb-6">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full hover:bg-white/5 transition-colors -ml-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="h-12 w-12 shrink-0 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/5">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-wider text-white">Business Profile</h1>
            <p className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground mt-1.5">
              Update your corporate identity and billing information
            </p>
          </div>
        </div>

        <div className="border border-white/5 bg-card/40 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 relative z-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">
                  Company Name <span className="text-primary">*</span>
                </Label>
                <Input
                  className="bg-background/50 border-white/10 rounded-xl h-11 px-4 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all text-sm font-medium"
                  disabled={isSaving}
                  placeholder="e.g. Acme Corporation"
                  {...form.register("companyName")}
                />
                {form.formState.errors.companyName && (
                  <div className="text-[10px] uppercase tracking-widest font-bold text-red-400 mt-1">
                    {form.formState.errors.companyName.message}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">
                  Business Email <span className="text-primary">*</span>
                </Label>
                <Input
                  type="email"
                  className="bg-background/50 border-white/10 rounded-xl h-11 px-4 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all text-sm font-medium"
                  disabled={isSaving}
                  placeholder="billing@acmecorp.com"
                  {...form.register("businessEmail")}
                />
                {form.formState.errors.businessEmail && (
                  <div className="text-[10px] uppercase tracking-widest font-bold text-red-400 mt-1">
                    {form.formState.errors.businessEmail.message}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">
                  Registered Address <span className="text-primary">*</span>
                </Label>
                <Input
                  className="bg-background/50 border-white/10 rounded-xl h-11 px-4 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all text-sm font-medium"
                  disabled={isSaving}
                  placeholder="123 Corporate Blvd, Business District"
                  {...form.register("address")}
                />
                {form.formState.errors.address && (
                  <div className="text-[10px] uppercase tracking-widest font-bold text-red-400 mt-1">
                    {form.formState.errors.address.message}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">
                    PAN Number <span className="text-primary">*</span>
                  </Label>
                  <Input
                    className="bg-background/50 border-white/10 rounded-xl h-11 px-4 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all text-sm font-medium uppercase placeholder:normal-case"
                    disabled={isSaving}
                    placeholder="Enter PAN"
                    {...form.register("panNumber")}
                  />
                  {form.formState.errors.panNumber && (
                    <div className="text-[10px] uppercase tracking-widest font-bold text-red-400 mt-1">
                      {form.formState.errors.panNumber.message}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">
                    Contact No. <span className="text-primary">*</span>
                  </Label>
                  <Input
                    className="bg-background/50 border-white/10 rounded-xl h-11 px-4 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all text-sm font-medium"
                    disabled={isSaving}
                    placeholder="Enter Contact No."
                    {...form.register("businessNumber")}
                  />
                  {form.formState.errors.businessNumber && (
                    <div className="text-[10px] uppercase tracking-widest font-bold text-red-400 mt-1">
                      {form.formState.errors.businessNumber.message}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex gap-3 justify-end items-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(-1)}
                disabled={isSaving}
                className="rounded-xl px-6 text-[11px] uppercase tracking-widest font-bold text-muted-foreground hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving || !form.formState.isDirty}
                className="rounded-xl px-8 h-11 text-[11px] uppercase tracking-widest font-bold shadow-lg shadow-primary/20 disabled:opacity-50 transition-all"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isUpdating ? "Save Changes" : "Create Profile"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
