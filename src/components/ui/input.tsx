import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          "dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-100 dark:placeholder:text-gray-400",
          "focus:border-purple-500 dark:focus:border-purple-400",
          "focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-400/20",
          "focus:shadow-[0_0_0_1px_rgb(168_85_247_/_0.4)] dark:focus:shadow-[0_0_0_1px_rgb(196_181_253_/_0.4)]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
