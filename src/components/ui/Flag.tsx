"use client";

import { hasFlag } from "country-flag-icons";
import * as Flags from "country-flag-icons/react/3x2";
import { cn } from "@/lib/utils";

interface Props {
  code: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  rounded?: boolean;
}

const SIZE_CLS = {
  xs: "w-4 h-3",
  sm: "w-5 h-3.5",
  md: "w-6 h-4",
  lg: "w-8 h-5",
};

export function Flag({ code, size = "md", className, rounded = true }: Props) {
  const upper = code.toUpperCase();

  // Fallback if country not supported
  if (!hasFlag(upper)) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center bg-[#1E293B] text-[#94A3B8] text-[8px] font-bold",
          SIZE_CLS[size],
          rounded && "rounded-sm",
          className
        )}
      >
        {upper}
      </span>
    );
  }

  // GB shows England flag — use traditional GB flag instead
  const FlagComponent = (Flags as Record<string, React.ComponentType<{ title?: string; className?: string }>>)[upper];

  return (
    <FlagComponent
      title={upper}
      className={cn(
        "inline-block object-cover shrink-0",
        SIZE_CLS[size],
        rounded && "rounded-sm",
        className
      )}
    />
  );
}
