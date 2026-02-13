import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/src/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl border text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 shrink-0 select-none",
  {
    variants: {
      variant: {
        default: "rounded-full bg-primary border-transparent text-primary-foreground hover:bg-primary/90",
        outline: "rounded-full bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/8",
        secondary: "bg-primary/15 border-primary/25 text-primary hover:bg-primary/25",
        ghost: "border-transparent text-white/40 hover:text-white/70 hover:bg-white/5",
        destructive: "border-transparent text-red-400 hover:bg-red-500/10",
        link: "border-transparent text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "px-5 py-2.5",
        sm: "px-4 py-2",
        xs: "px-3 py-1.5 text-xs",
        lg: "px-6 py-3",
        icon: "size-9",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
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
  const Comp = asChild ? Slot.Root : "button"

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
