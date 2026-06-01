import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// shadcn-vue-Standard: clsx fuer Conditionals, tailwind-merge zum Aufloesen
// kollidierender Utility-Klassen.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
