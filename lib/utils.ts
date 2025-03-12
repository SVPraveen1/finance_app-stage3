import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCategoryColor(category: string): string {
  const categoryColors: { [key: string]: string } = {
    housing: "bg-blue-100 text-blue-800 border-blue-200",
    transportation: "bg-red-100 text-red-800 border-red-200",
    food: "bg-green-100 text-green-800 border-green-200",
    utilities: "bg-amber-100 text-amber-800 border-amber-200",
    insurance: "bg-violet-100 text-violet-800 border-violet-200",
    healthcare: "bg-pink-100 text-pink-800 border-pink-200",
    savings: "bg-indigo-100 text-indigo-800 border-indigo-200",
    personal: "bg-teal-100 text-teal-800 border-teal-200",
    entertainment: "bg-orange-100 text-orange-800 border-orange-200",
    education: "bg-purple-100 text-purple-800 border-purple-200",
    debt: "bg-rose-100 text-rose-800 border-rose-200",
    gifts: "bg-emerald-100 text-emerald-800 border-emerald-200",
    other: "bg-gray-100 text-gray-800 border-gray-200",
  }

  return categoryColors[category] || "bg-gray-100 text-gray-800 border-gray-200"
}

