"use client"

import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import * as React from "react"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 cursor-pointer select-none",
  {
    variants: {
      variant: {
        // Negro — acción principal
        black:   "bg-brand-black text-white hover:bg-brand-black/85 rounded-full",
        // Dorado — acción destacada / CTA
        gold:    "bg-gold text-brand-black hover:bg-gold-dark hover:text-white rounded-full",
        // Verde oliva — secundario / restaurante
        olive:   "bg-olive text-white hover:bg-olive-light rounded-full",
        // Outline negro
        outline: "border border-brand-black bg-transparent text-brand-black hover:bg-brand-black hover:text-white rounded-full",
        // Outline dorado
        "outline-gold": "border border-gold bg-transparent text-gold hover:bg-gold hover:text-brand-black rounded-full",
        // Ghost
        ghost:   "bg-transparent text-foreground hover:bg-muted rounded-full",
        // Destructivo
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full",
      },
      size: {
        sm:   "h-8 px-4 text-xs tracking-wide",
        md:   "h-10 px-6 text-sm tracking-wide",
        lg:   "h-12 px-8 text-sm tracking-wider",
        xl:   "h-14 px-10 text-base tracking-wider",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: { variant: "black", size: "md" },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
)
Button.displayName = "Button"
