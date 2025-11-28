import React from "react"
import { cn } from "@/lib/utils"

const Spinner = React.forwardRef(({ className, size = "md", ...props }, ref) => {
  return (
    <div
      ref={ref}
      role="status"
      aria-label="Cargando"
      className={cn(
        "inline-block animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]",
        {
          "h-4 w-4 border-2": size === "sm",
          "h-6 w-6 border-3": size === "md",
          "h-8 w-8 border-4": size === "lg",
        },
        className
      )}
      {...props}
    />
  )
})

Spinner.displayName = "Spinner"

export { Spinner }
