import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import type { Except } from "type-fest";

import { cn } from "~/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
      },
      size: {
        sm: "px-1.5 py-0.5 font-normal",
        md: "px-2.5 py-0.5",
      },
      pill: {
        true: "rounded-full",
        false: "rounded-md",
      },
      dot: {
        true: "gap-x-1.5",
      },
      color: {
        primary:
          "border-blue-700 bg-blue-50 text-blue-700 ring-blue-700/10 [&>svg]:fill-blue-500",
        success:
          "border-green-700 bg-green-50 text-green-700 ring-green-700/10 [&>svg]:fill-green-500",
        destructive:
          "border-red-700 bg-red-50 text-red-700 ring-red-600/10 [&>svg]:fill-red-500",
        warning:
          "border-yellow-700 bg-yellow-50 text-yellow-700 ring-yellow-700/10 [&>svg]:fill-yellow-500",
        indigo:
          "border-indigo-700 bg-indigo-50 text-indigo-700 ring-indigo-700/10 [&>svg]:fill-indigo-500",
        purple:
          "border-purple-700 bg-purple-50 text-purple-700 ring-purple-700/10 [&>svg]:fill-purple-500",
        pink: "border-pink-700 bg-pink-50 text-pink-700 ring-pink-700/10 [&>svg]:fill-pink-500",
      },
    },
    compoundVariants: [
      { color: "primary", className: "bg-blue-100" },
      { color: "success", className: "bg-green-100" },
      { color: "destructive", className: "bg-red-100" },
      { color: "warning", className: "bg-yellow-100" },
      { color: "indigo", className: "bg-indigo-100" },
      { color: "purple", className: "bg-purple-100" },
      { color: "pink", className: "bg-pink-100" },
    ],
    defaultVariants: {
      variant: "default",
      size: "md",
      pill: false,
      dot: false,
      color: undefined,
    },
  },
);

export interface BadgeProps
  extends Except<React.HTMLAttributes<HTMLDivElement>, "color">,
    VariantProps<typeof badgeVariants> {}

function Badge({
  className,
  variant,
  size,
  pill,
  dot,
  color,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        badgeVariants({ variant, size, pill, dot, color }),
        className,
      )}
      {...props}
    >
      {dot && (
        <svg className="h-1.5 w-1.5" viewBox="0 0 6 6" aria-hidden="true">
          <circle cx={3} cy={3} r={3} />
        </svg>
      )}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
