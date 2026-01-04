import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-600/20",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600/20",
        outline:
          "border border-slate-700 bg-slate-900 text-slate-100 shadow-xs hover:bg-slate-800 hover:text-slate-50",
        secondary:
          "bg-slate-800 text-slate-100 hover:bg-slate-700",
        ghost:
          "text-slate-100 hover:bg-slate-800 hover:text-slate-50",
        link: "text-emerald-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-3 py-2 sm:h-10 sm:px-4 sm:py-2 has-[>svg]:px-2.5 sm:has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-2.5 sm:px-3 has-[>svg]:px-2 sm:has-[>svg]:px-2.5",
        lg: "h-10 sm:h-11 rounded-md px-4 sm:px-6 has-[>svg]:px-3 sm:has-[>svg]:px-4",
        icon: "size-8 sm:size-9",
        "icon-sm": "size-7 sm:size-8",
        "icon-lg": "size-9 sm:size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
