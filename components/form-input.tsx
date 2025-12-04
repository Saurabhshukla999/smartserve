import type React from "react"
import { forwardRef } from "react"

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, icon, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-sm font-medium text-foreground mb-2">{label}</label>}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">{icon}</div>
          )}
          <input
            ref={ref}
            className={`w-full px-4 py-2 ${icon ? "pl-10" : ""} border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder-muted-foreground transition ${
              error ? "border-danger focus:ring-danger" : ""
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-sm text-danger mt-1">{error}</p>}
      </div>
    )
  },
)

FormInput.displayName = "FormInput"
