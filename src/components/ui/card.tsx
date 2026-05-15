import * as React from "react"
import { cn } from "@/src/lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-2xl border border-white/10 bg-[#0a0a0a] text-white shadow-sm overflow-hidden", className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

export { Card }
