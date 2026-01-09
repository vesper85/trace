"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Brand {
  name: string;
  logo: string;
}

interface BrandsGridProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  brands: Brand[];
  imageHeight?: number;
}

export const BrandsGrid = React.forwardRef<HTMLDivElement, BrandsGridProps>(
  ({ 
    className,
    title = "Trusted and loved by fast-growing companies worldwide",
    brands,
    imageHeight = 56, // 14 * 4 = 56px (h-14)
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("pt-24", className)}
        {...props}
      >
        <div className="max-w-screen-xl mx-auto px-4 lg:px-8">
          {title && (
            <p className="max-w-sm mx-auto text-pretty text-center font-medium mb-6 text-foreground md:text-lg">
              {title}
            </p>
          )}
        </div>
      </div>
    );
  }
);

BrandsGrid.displayName = "BrandsGrid";