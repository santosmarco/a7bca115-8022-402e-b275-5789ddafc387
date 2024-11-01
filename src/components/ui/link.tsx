import NextLink from "next/link";
import * as React from "react";

import { cn } from "~/lib/utils";

export const Link = React.forwardRef<
  React.ElementRef<typeof NextLink>,
  React.ComponentPropsWithoutRef<typeof NextLink>
>(({ className, children, ...props }, ref) => {
  return (
    <NextLink
      ref={ref}
      className={cn(
        "underline underline-offset-4 hover:text-primary",
        className,
      )}
      {...props}
    >
      {children}
    </NextLink>
  );
});
