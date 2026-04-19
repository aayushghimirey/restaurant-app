import { zodResolver } from "@hookform/resolvers/zod"
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  ChevronRight,
  Info,
  Layers,
  Loader2,
  Plus,
  Scaling,
  Trash2,
  X,
} from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  Control,
  FieldErrors,
  useFieldArray,
  useForm,
  UseFormRegister,
  useWatch,
} from "react-hook-form"
import { toast } from "react-hot-toast"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { StockReqDto, StockUpdateCommand, VariantDto, UnitType } from "@/types/inventory"
import { useCreateStock, useUpdateStock } from "../api"

// ─── Validation Schema ──────────────────────────────────────────────────────────

const stockSchema = z.object({
  name: z.string().min(1, "Asset name is required"),
  type: z.enum(["BEVERAGE", "FOOD", "OTHER"]),
  variants: z
    .array(
      z.object({
        name: z.string().min(1, "Variant name is required"),
        baseUnit: z.string().min(1, "Base unit is required"),
        openingStock: z.number().nonnegative("Opening stock must be >= 0"),
        currentStock: z.number().nonnegative("Current stock must be >= 0"),
        units: z
          .array(
            z.object({
              name: z.string().min(1, "Unit name is required"),
              conversionRate: z.number().positive("Rate must be > 0"),
              unitType: z.enum(["PURCHASE", "SELL", "BOTH"]),
            })
          )
          .min(1, "At least one unit conversion is required"),
      })
    )
    .min(1, "At least one variant is required"),
})

export type StockFormValues = z.infer<typeof stockSchema>

// ─── Default Values ───────────────────────────────────────────────────────────

const getEmptyVariant = (): VariantDto => ({
  name: "",
  baseUnit: "",
  openingStock: 0,
  currentStock: 0,
  units: [{ name: "", conversionRate: 1, unitType: "SELL" as UnitType }],
})

const getDefaultValues = (): StockReqDto => ({
  name: "",
  type: "BEVERAGE",
  variants: [getEmptyVariant()],
})

// ─── Unit Type Color Map ───────────────────────────────────────────────────────

const unitTypeConfig: Record<string, { color: string; dot: string; label: string }> = {
  PURCHASE: { color: "text-violet-400", dot: "bg-violet-500", label: "Purchase" },
  SELL: { color: "text-emerald-400", dot: "bg-emerald-500", label: "Sell" },
  BOTH: { color: "text-amber-400", dot: "bg-amber-500", label: "Both" },
}

// ─── Stock Categories ─────────────────────────────────────────────────────────

const STOCK_CATEGORIES = [
  { value: "BEVERAGE", label: "Beverage", emoji: "🍺" },
  { value: "FOOD", label: "Food", emoji: "🍱" },
  { value: "OTHER", label: "Other", emoji: "📦" }
]

// ─── Main Stock Form ──────────────────────────────────────────────────────────

export function StockForm({
  mode,
  defaultValues,
  stockId,
  onCancel,
  onSuccess,
}: {
  mode: "create" | "edit"
  defaultValues?: StockReqDto
  stockId?: string
  onCancel: () => void
  onSuccess: () => void
}) {
  const createMutation = useCreateStock()
  const updateMutation = useUpdateStock()
  const [activeVariantIndex, setActiveVariantIndex] = useState(0)
  const sidebarRef = useRef<HTMLDivElement>(null)

  const resolvedDefaultValues = useMemo(
    () => defaultValues ?? getDefaultValues(),
    [defaultValues]
  )

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<StockFormValues>({
    resolver: zodResolver(stockSchema),
    defaultValues: resolvedDefaultValues,
    mode: "onBlur",
  })

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: "variants",
  })

  const watchedVariants = useWatch({ control, name: "variants" })
  const watchedName = useWatch({ control, name: "name" })

  useEffect(() => {
    reset(resolvedDefaultValues)
  }, [reset, resolvedDefaultValues])

  const isSaving = createMutation.isPending || updateMutation.isPending

  const handleAddVariant = () => {
    if (variantFields.length >= 10) {
      toast.error("Maximum 10 variants allowed")
      return
    }
    appendVariant(getEmptyVariant())
    const newIndex = variantFields.length
    setActiveVariantIndex(newIndex)
    // Scroll new item into view in sidebar
    setTimeout(() => {
      const items = sidebarRef.current?.querySelectorAll("[data-variant-item]")
      items?.[newIndex]?.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }, 50)
  }

  const handleRemoveVariant = (index: number) => {
    removeVariant(index)
    if (activeVariantIndex >= index && activeVariantIndex > 0) {
      setActiveVariantIndex(activeVariantIndex - 1)
    } else if (activeVariantIndex >= variantFields.length - 1) {
      setActiveVariantIndex(Math.max(0, variantFields.length - 2))
    }
  }

  const onSubmit = (values: StockFormValues) => {
    if (mode === "create") {
      createMutation.mutate(values, {
        onSuccess: () => {
          toast.success("Asset onboarded successfully")
          onSuccess()
        },
        onError: () => toast.error("Failed to create asset"),
      })
    } else {
      if (!stockId) {
        toast.error("Missing asset ID")
        return
      }
      const command: StockUpdateCommand = values
      updateMutation.mutate(
        { id: stockId, command },
        {
          onSuccess: () => {
            toast.success("Asset updated successfully")
            onSuccess()
          },
          onError: () => toast.error("Failed to update asset"),
        }
      )
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col h-full">

      {/* ─── General Info Strip ────────────────────────────────────────────── */}
      <div className="px-6 pt-5 pb-5 border-b border-border/60 bg-muted/20">
        <div className="flex items-start gap-3 mb-5">
          <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
            <Info className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground leading-tight">General Information</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Core identity and category of this inventory asset.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Asset Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Asset Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g. Craft Lager, Organic Coffee"
              className={cn(
                "h-10 rounded-lg text-sm bg-background/60 border-border/80",
                errors.name && "border-destructive focus-visible:ring-destructive/30"
              )}
            />
            {errors.name && (
              <p className="text-[11px] text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label htmlFor="type" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Category <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <select
                id="type"
                {...register("type")}
                className={cn(
                  "h-10 w-full bg-background/60 border border-border/80 rounded-lg px-3 pr-8 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all cursor-pointer appearance-none",
                  errors.type && "border-destructive focus:ring-destructive/30"
                )}
              >
                {STOCK_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value} className="bg-background text-foreground">
                    {cat.emoji} {cat.label}
                  </option>
                ))}
              </select>
              <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground rotate-90 pointer-events-none" />
            </div>
            {errors.type && (
              <p className="text-[11px] text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.type.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ─── Variants Section ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Sub-header */}
        <div className="px-6 py-3.5 border-b border-border/60 bg-muted/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Layers className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Variants</span>
            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold tabular-nums">
              {variantFields.length}
            </span>
            <span className="text-[10px] text-muted-foreground/60">/ 10 max</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddVariant}
            disabled={variantFields.length >= 10}
            className="h-8 rounded-lg gap-1.5 text-xs font-medium border-dashed border-primary/40 text-primary hover:bg-primary/5 hover:border-primary/60"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Variant
          </Button>
        </div>

        {/* Two-column layout: sidebar + editor */}
        <div className="flex-1 flex min-h-0 overflow-hidden">

          {/* ── Variant Sidebar ── */}
          <div
            ref={sidebarRef}
            className="w-52 shrink-0 border-r border-border/60 bg-muted/10 overflow-y-auto custom-scrollbar py-2.5 px-2 flex flex-col gap-1"
          >
            {variantFields.map((field, index) => {
              const variantName = watchedVariants?.[index]?.name
              const unitCount = watchedVariants?.[index]?.units?.length ?? 0
              const hasError = !!errors.variants?.[index]
              const isActive = activeVariantIndex === index

              return (
                <button
                  key={field.id}
                  data-variant-item
                  type="button"
                  onClick={() => setActiveVariantIndex(index)}
                  className={cn(
                    "w-full text-left rounded-lg px-3 py-2.5 transition-all group relative",
                    isActive
                      ? "bg-primary/10 border border-primary/25 shadow-sm"
                      : "hover:bg-muted/60 border border-transparent"
                  )}
                >
                  {/* Active stripe */}
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-primary" />
                  )}

                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      "text-[10px] font-semibold uppercase tracking-wider",
                      isActive ? "text-primary" : "text-muted-foreground/70"
                    )}>
                      V{index + 1}
                    </span>
                    {hasError && (
                      <span className="h-1.5 w-1.5 rounded-full bg-destructive shrink-0" title="Has errors" />
                    )}
                  </div>

                  <p className={cn(
                    "text-[12px] font-medium leading-tight truncate",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {variantName || <span className="italic opacity-50">Unnamed</span>}
                  </p>

                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Scaling className={cn("h-3 w-3", isActive ? "text-primary/60" : "text-muted-foreground/40")} />
                    <span className={cn("text-[10px]", isActive ? "text-primary/70" : "text-muted-foreground/50")}>
                      {unitCount} unit{unitCount !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {isActive && (
                    <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-primary/50" />
                  )}
                </button>
              )
            })}

            {/* Add hint when sidebar is short */}
            {variantFields.length < 10 && (
              <button
                type="button"
                onClick={handleAddVariant}
                className="w-full rounded-lg px-3 py-2 border border-dashed border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all group text-center mt-1"
              >
                <Plus className="h-3.5 w-3.5 mx-auto text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
              </button>
            )}
          </div>

          {/* ── Active Variant Editor ── */}
          <div className="flex-1 min-w-0 overflow-y-auto custom-scrollbar">
            {variantFields.map((field, index) => (
              <div
                key={field.id}
                className={cn(index !== activeVariantIndex && "hidden")}
              >
                <VariantEditor
                  variantIndex={index}
                  register={register}
                  control={control}
                  onRemove={() => handleRemoveVariant(index)}
                  canRemove={variantFields.length > 1}
                  errors={errors}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Footer Actions ────────────────────────────────────────────────── */}
      <div className="px-6 py-4 border-t border-border/60 bg-muted/10 flex items-center justify-between gap-3 shrink-0">
        {/* Progress indicators */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className={cn(
              "h-1.5 w-1.5 rounded-full",
              watchedName ? "bg-emerald-500" : "bg-muted-foreground/30"
            )} />
            <span className={watchedName ? "text-foreground/70" : ""}>Name</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={cn(
              "h-1.5 w-1.5 rounded-full",
              (variantFields.length > 0) ? "bg-emerald-500" : "bg-muted-foreground/30"
            )} />
            <span className={(variantFields.length > 0) ? "text-foreground/70" : ""}>
              {variantFields.length} variant{variantFields.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSaving}
            className="h-9 px-5 rounded-lg text-sm"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="h-9 px-6 rounded-lg text-sm gap-2 font-medium"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                {mode === "create" ? "Save Asset" : "Update Asset"}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}

// ─── Variant Editor ─────────────────────────────────────────────────────────────

function VariantEditor({
  variantIndex,
  register,
  control,
  onRemove,
  canRemove,
  errors,
}: {
  variantIndex: number
  register: UseFormRegister<StockFormValues>
  control: Control<StockFormValues>
  onRemove: () => void
  canRemove: boolean
  errors: FieldErrors<StockFormValues>
}) {
  const {
    fields: unitFields,
    append: appendUnit,
    remove: removeUnit,
  } = useFieldArray({
    control,
    name: `variants.${variantIndex}.units`,
  })

  const watchedUnits = useWatch({
    control,
    name: `variants.${variantIndex}.units`,
  })

  const watchedBaseUnit = useWatch({
    control,
    name: `variants.${variantIndex}.baseUnit`,
  })

  const vPrefix = `variants.${variantIndex}` as const
  const variantErrors = errors.variants?.[variantIndex]

  const handleAddUnit = () => {
    if (unitFields.length >= 10) {
      toast.error("Maximum 10 units per variant")
      return
    }
    appendUnit({ name: "", conversionRate: 1, unitType: "SELL" })
  }

  return (
    <div className="p-5 space-y-5">

      {/* ── Variant Details Card ── */}
      <div className="rounded-xl border border-border/70 bg-card/50 overflow-hidden">
        {/* Card header */}
        <div className="px-4 py-3 bg-muted/30 border-b border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary/15 flex items-center justify-center">
              <Layers className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-xs font-semibold text-foreground">Variant {variantIndex + 1} Details</span>
          </div>
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md"
              title="Remove variant"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Card body */}
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Variant Label */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Label <span className="text-destructive">*</span>
              </Label>
              <Input
                {...register(`${vPrefix}.name`)}
                placeholder="e.g. Large, 500ml"
                className={cn(
                  "h-9 rounded-lg text-sm bg-background/60",
                  variantErrors?.name && "border-destructive"
                )}
              />
              {variantErrors?.name && (
                <p className="text-[11px] text-destructive">{variantErrors.name.message}</p>
              )}
            </div>

            {/* Base Unit */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Base Unit <span className="text-destructive">*</span>
              </Label>
              <Input
                {...register(`${vPrefix}.baseUnit`)}
                placeholder="e.g. ml, pc, kg"
                className={cn(
                  "h-9 rounded-lg text-sm bg-background/60",
                  variantErrors?.baseUnit && "border-destructive"
                )}
              />
              {variantErrors?.baseUnit && (
                <p className="text-[11px] text-destructive">{variantErrors.baseUnit.message}</p>
              )}
            </div>

            {/* Opening Stock */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Opening Stock
              </Label>
              <Input
                type="number"
                min={0}
                {...register(`${vPrefix}.openingStock`, { valueAsNumber: true })}
                className={cn(
                  "h-9 rounded-lg text-sm bg-background/60",
                  variantErrors?.openingStock && "border-destructive"
                )}
              />
              {variantErrors?.openingStock && (
                <p className="text-[11px] text-destructive">{variantErrors.openingStock.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Unit Conversion Matrix ── */}
      <div className="rounded-xl border border-border/70 bg-card/50 overflow-hidden">
        {/* Matrix header */}
        <div className="px-4 py-3 bg-muted/30 border-b border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary/15 flex items-center justify-center">
              <Scaling className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-xs font-semibold text-foreground">Unit Conversion Matrix</span>
            <span className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-primary/15 text-primary text-[9px] font-bold tabular-nums">
              {unitFields.length}
            </span>
            <span className="text-[10px] text-muted-foreground/50">/ 10 max</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAddUnit}
            disabled={unitFields.length >= 10}
            className="h-7 px-2.5 text-[11px] font-medium gap-1.5 rounded-md text-primary hover:bg-primary/10"
          >
            <Plus className="h-3 w-3" />
            Add Unit
          </Button>
        </div>

        {/* Column header row */}
        <div className="px-4 py-2 border-b border-border/40 bg-muted/10 grid grid-cols-12 gap-2 items-center">
          <div className="col-span-4">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Unit Name</span>
          </div>
          <div className="col-span-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Usage</span>
          </div>
          <div className="col-span-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Conv. Rate</span>
          </div>
          <div className="col-span-2 text-right">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Remove</span>
          </div>
        </div>

        {/* Unit rows */}
        <div className="divide-y divide-border/40">
          {unitFields.map((field, uIndex) => {
            const unitCfg = unitTypeConfig[watchedUnits?.[uIndex]?.unitType ?? "SELL"]
            const unitName = watchedUnits?.[uIndex]?.name
            const convRate = watchedUnits?.[uIndex]?.conversionRate
            const unitTypeErrs = (errors.variants?.[variantIndex]?.units as any)?.[uIndex]

            return (
              <div
                key={field.id}
                className="px-4 py-3 hover:bg-muted/20 transition-colors group"
              >
                {/* Input row */}
                <div className="grid grid-cols-12 gap-2 items-center">
                  {/* Unit Name */}
                  <div className="col-span-4">
                    <Input
                      {...register(`${vPrefix}.units.${uIndex}.name`)}
                      placeholder="e.g. Case, Box, Bottle"
                      className={cn(
                        "h-8 text-sm rounded-md bg-background/60 border-border/60",
                        unitTypeErrs?.name && "border-destructive"
                      )}
                    />
                  </div>

                  {/* Unit Type */}
                  <div className="col-span-3">
                    <div className="relative">
                      <select
                        {...register(`${vPrefix}.units.${uIndex}.unitType`)}
                        className="h-8 w-full bg-background/60 border border-border/60 rounded-md pl-2 pr-6 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer"
                      >
                        {Object.entries(unitTypeConfig).map(([val, cfg]) => (
                          <option key={val} value={val} className="bg-background text-foreground">
                            {cfg.label}
                          </option>
                        ))}
                      </select>
                      <span className={cn(
                        "absolute right-1.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full shrink-0 pointer-events-none",
                        unitCfg?.dot ?? "bg-muted-foreground"
                      )} />
                    </div>
                  </div>

                  {/* Conversion Rate */}
                  <div className="col-span-3">
                    <Input
                      type="number"
                      step="0.001"
                      min="0.001"
                      {...register(`${vPrefix}.units.${uIndex}.conversionRate`, { valueAsNumber: true })}
                      className={cn(
                        "h-8 text-sm rounded-md bg-background/60 border-border/60",
                        unitTypeErrs?.conversionRate && "border-destructive"
                      )}
                    />
                  </div>

                  {/* Remove */}
                  <div className="col-span-2 flex justify-end">
                    {unitFields.length > 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeUnit(uIndex)}
                        className="h-7 w-7 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <div className="h-7 w-7" /> /* spacer */
                    )}
                  </div>
                </div>

                {/* Conversion preview inline */}
                {(unitName || convRate) && (
                  <div className="mt-2 flex items-center gap-2 pl-0.5">
                    <div className={cn("h-[1px] flex-none w-4 rounded-full", unitCfg?.dot.replace("bg-", "bg-") + "/30" || "bg-border")} />
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 font-mono">
                      <span className="font-semibold text-muted-foreground/80">1</span>
                      <span>{unitName || "Unit"}</span>
                      <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/40" />
                      <span className={cn("font-semibold", unitCfg?.color || "text-muted-foreground")}>
                        {convRate || 0}
                      </span>
                      <span>{watchedBaseUnit || "Base"}</span>
                    </div>
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-border/40 to-transparent" />
                  </div>
                )}

                {/* Errors */}
                {(unitTypeErrs?.name || unitTypeErrs?.conversionRate) && (
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 pl-0.5">
                    {unitTypeErrs?.name && (
                      <p className="text-[10px] text-destructive flex items-center gap-1">
                        <AlertCircle className="h-2.5 w-2.5" />
                        {unitTypeErrs.name.message}
                      </p>
                    )}
                    {unitTypeErrs?.conversionRate && (
                      <p className="text-[10px] text-destructive flex items-center gap-1">
                        <AlertCircle className="h-2.5 w-2.5" />
                        {unitTypeErrs.conversionRate.message}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Matrix footer CTA when empty or near limit */}
        {unitFields.length === 0 && (
          <div className="px-4 py-6 text-center">
            <Scaling className="h-8 w-8 mx-auto text-muted-foreground/20 mb-2" />
            <p className="text-xs text-muted-foreground/50">No units added yet</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddUnit}
              className="mt-3 h-7 text-xs gap-1.5 border-dashed"
            >
              <Plus className="h-3 w-3" />
              Add First Unit
            </Button>
          </div>
        )}

        {/* Footer summary */}
        {unitFields.length > 0 && (
          <div className="px-4 py-2.5 border-t border-border/40 bg-muted/10 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground/50">
              Base: <span className="font-semibold text-muted-foreground">{watchedBaseUnit || "—"}</span>
            </span>
            {unitFields.length < 10 && (
              <button
                type="button"
                onClick={handleAddUnit}
                className="text-[10px] text-primary/60 hover:text-primary underline-offset-2 hover:underline transition-colors flex items-center gap-1"
              >
                <Plus className="h-2.5 w-2.5" />
                Add another unit
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Tips strip ── */}
      <div className="rounded-lg bg-primary/5 border border-primary/15 px-4 py-3 flex items-start gap-3">
        <Info className="h-3.5 w-3.5 text-primary/60 mt-0.5 shrink-0" />
        <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
          The <span className="text-foreground/80 font-medium">Base Unit</span> is the smallest measurement unit for this variant
          (e.g. <em>ml</em>, <em>g</em>, <em>pc</em>). All conversion rates represent how many base units equal one unit of this entry.
        </p>
      </div>
    </div>
  )
}