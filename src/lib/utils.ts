import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

const customTailwindMerge = extendTailwindMerge({})

export function cn(...inputs: ClassValue[]) {
  return customTailwindMerge(clsx(inputs))
}
