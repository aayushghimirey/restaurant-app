import * as React from "react"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { Plus, Trash2, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useCreateMenu } from "../api"
import { useStocks } from "@/features/inventory/api"
import type { StockResponse } from "@/types/inventory"
import { VariantSelector } from "@/features/inventory/components/VariantSelector"

interface MenuFormProps {
  onSuccess: () => void
  onCancel: () => void
}

interface IngredientFormData {
  variantId: string
  unitId: string
  quantity: number
}

interface MenuFormData {
  name: string
  code: string
  category: string
  price: number
  ingredients: IngredientFormData[]
}

export function MenuForm({ onSuccess, onCancel }: MenuFormProps) {
  const mutation = useCreateMenu()
  const { data: stocksData } = useStocks({ size: 100 })
  
  const stocks = stocksData?.data || []
  
  const allVariants = React.useMemo(() => {
    return stocks.flatMap((s: StockResponse) => 
      s.variants
        .filter(v => !!v.id)
        .map(v => ({ ...v, id: v.id as string, stockName: s.name }))
    )
  }, [stocks])

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<MenuFormData>({
    defaultValues: {
      name: "",
      code: "",
      category: "APPETIZER",
      price: 0,
      ingredients: []
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "ingredients"
  })

  // We need to watch ingredients to know what variantId is selected per row to show units
  const watchedIngredients = watch("ingredients")

  const onSubmit = (data: MenuFormData) => {
    mutation.mutate(data, {
      onSuccess: () => {
        onSuccess()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2" noValidate>
      {/* General Details */}
      <div className="space-y-4 px-6 pt-2 pb-2">
        <p className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
          Menu details
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium">Item Name <span className="text-destructive">*</span></Label>
              <Input 
                 id="name"
                 placeholder="e.g. Signature Burger"
                 className={cn("h-10 rounded-lg text-sm", errors.name && "border-destructive focus-visible:ring-destructive/30")}
                 {...register("name", { required: "Name is required" })}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
           </div>

           <div className="space-y-1.5">
              <Label htmlFor="category" className="text-sm font-medium">Category</Label>
              <select
                 id="category"
                 {...register("category")}
                 className="h-10 w-full rounded-lg text-sm bg-background border border-input focus:ring-1 focus:ring-ring transition-colors px-3 appearance-none cursor-pointer"
              >
                 <option value="APPETIZER">Appetizer</option>
                 <option value="MAIN_COURSE">Main Course</option>
                 <option value="DESSERT">Dessert</option>
                 <option value="BEVERAGE">Beverage</option>
                 <option value="OTHER">Other</option>
              </select>
           </div>

           <div className="space-y-1.5">
              <Label htmlFor="code" className="text-sm font-medium">SKU / Code</Label>
              <Input 
                 id="code"
                 placeholder="e.g. BGR-01"
                 className="h-10 rounded-lg text-sm"
                 {...register("code")}
              />
           </div>

           <div className="space-y-1.5">
              <Label htmlFor="price" className="text-sm font-medium">Unit Price <span className="text-destructive">*</span></Label>
              <Input 
                 id="price"
                 type="number"
                 step="0.01"
                 placeholder="0.00"
                 className={cn("h-10 rounded-lg text-sm", errors.price && "border-destructive focus-visible:ring-destructive/30")}
                 {...register("price", { required: "Price is required", valueAsNumber: true, min: 0 })}
              />
              {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
           </div>
        </div>
      </div>

      <div className="border-t border-border" />

      {/* Recipe / Ingredients */}
      <div className="space-y-4 px-6 pb-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
            Recipe &amp; Ingredients
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ variantId: "", unitId: "", quantity: 1 })}
            className="h-8 gap-2"
          >
            <Plus className="h-3.5 w-3.5" />
            Add ingredient
          </Button>
        </div>

        <div className="space-y-2">
          {fields.length > 0 && (
            <div className="flex gap-2 px-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">
              <div className="flex-1">Inventory Asset</div>
              <div className="w-[120px]">Unit</div>
              <div className="w-[100px] text-right">Quantity</div>
              <div className="w-8"></div>
            </div>
          )}
          {fields.map((field, index) => {
             const variantId = watchedIngredients[index]?.variantId
             const selectedVariant = allVariants.find(v => v.id === variantId)

             return (
               <div 
                 key={field.id} 
                 className="flex gap-2 items-center group relative"
                 style={{ zIndex: fields.length - index }}
               >
                 <div className="flex-1">
                   <Controller
                     control={control}
                     name={`ingredients.${index}.variantId`}
                     rules={{ required: true }}
                     render={({ field }) => (
                       <VariantSelector
                         options={allVariants}
                         value={field.value}
                         className="h-8 text-sm"
                         onChange={(newVariantId) => {
                           field.onChange(newVariantId)
                           const v = allVariants.find(av => av.id === newVariantId)
                           const allowedUnits = v?.units?.filter((u: any) => u.unitType === "SELL" || u.unitType === "BOTH") || []
                           if (allowedUnits.length > 0) {
                             setValue(`ingredients.${index}.unitId`, allowedUnits[0].id || "")
                           } else {
                             setValue(`ingredients.${index}.unitId`, "")
                           }
                         }}
                       />
                     )}
                   />
                 </div>
                 
                 <div className="w-[120px]">
                   <select
                     disabled={!selectedVariant}
                     className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm disabled:opacity-50 appearance-none focus:ring-1 focus:ring-ring transition-colors"
                     {...register(`ingredients.${index}.unitId`, { required: true })}
                   >
                     <option value="">Select...</option>
                     {selectedVariant?.units
                        ?.filter((u: any) => u.unitType === "SELL" || u.unitType === "BOTH")
                        .map((u: any) => (
                       <option key={u.id} value={u.id}>
                         {u.name}
                       </option>
                     ))}
                   </select>
                 </div>
                 
                 <div className="w-[100px]">
                   <Input
                     type="number"
                     step="0.01"
                     className="h-8 rounded-md text-sm text-right px-2"
                     {...register(`ingredients.${index}.quantity`, { required: true, valueAsNumber: true, min: 0.01 })}
                   />
                 </div>
                 
                 <div className="w-8 flex justify-end">
                   <Button
                     type="button"
                     variant="ghost"
                     size="icon"
                     onClick={() => remove(index)}
                     className="h-8 w-8 text-muted-foreground opacity-50 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 shrink-0 transition-opacity"
                   >
                     <Trash2 className="h-4 w-4" />
                   </Button>
                 </div>
               </div>
             )
          })}
          
          {fields.length === 0 && (
            <div className="text-center py-6 border border-dashed border-border rounded-lg bg-muted/10">
              <p className="text-sm text-muted-foreground">No ingredients linked. This is a standalone item.</p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border" />

      <div className="px-6 pb-6 pt-2">
        {mutation.error && (
          <div className="mb-4 flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Could not save menu item. Please check the values.
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="ghost" 
            className="h-10 px-4 text-sm rounded-lg"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="h-10 px-5 text-sm rounded-lg gap-2"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : <><CheckCircle className="h-4 w-4" /> Save menu</>}
          </Button>
        </div>
      </div>
    </form>
  )
}
