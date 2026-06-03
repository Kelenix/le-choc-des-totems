"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { TotemIcon, getTotemColor } from "@/components/ui/TotemIcon";
import { Flag } from "@/components/ui/Flag";
import type { Totem } from "@/types";

interface Props {
  totem: Totem;
  side: "home" | "away";
  selected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}

export function TotemCard({ totem, side, selected, onClick, size = "md" }: Props) {
  const color = getTotemColor(totem.countryCode);

  const iconSize   = { sm: 32, md: 52, lg: 72 }[size];
  const nameCls    = { sm: "text-sm",    md: "text-base md:text-lg", lg: "text-lg md:text-2xl" }[size];
  const countryCls = { sm: "text-[10px]", md: "text-xs",             lg: "text-sm" }[size];
  const padCls     = { sm: "p-3",         md: "p-4",                 lg: "p-5" }[size];

  return (
    <motion.div
      onClick={onClick}
      whileHover={onClick ? { scale: 1.03 } : undefined}
      whileTap={onClick  ? { scale: 0.97 } : undefined}
      className={cn(
        "card-safe flex flex-col items-center gap-2 rounded-2xl transition-all duration-200 w-full",
        padCls,
        onClick ? "cursor-pointer" : "",
        selected
          ? (side === "home"
              ? "border-2 border-[#3B82F6]"
              : "border-2 border-[#EF4444]")
          : "glass",
        !selected && onClick && "hover:border-[#FBBF24]/30"
      )}
      style={selected ? {
        background: `rgba(${side === "home" ? "59,130,246" : "239,68,68"},0.1)`,
        boxShadow: `0 0 18px ${color}35`,
      } : undefined}
    >
      {/* Check mark */}
      {selected && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-black"
          style={{ background: color }}
        >
          ✓
        </motion.span>
      )}

      {/* Icon */}
      <motion.div
        className="animate-float"
        style={{ animationDelay: side === "home" ? "0s" : "0.6s" }}
      >
        {totem.imageUrl ? (
          <Image
            src={totem.imageUrl}
            alt={totem.name}
            width={iconSize}
            height={iconSize}
            className="object-contain drop-shadow-xl"
          />
        ) : (
          <TotemIcon
            countryCode={totem.countryCode}
            size={iconSize}
            withGlow={selected}
          />
        )}
      </motion.div>

      {/* Name */}
      <div className="text-center w-full min-w-0 space-y-1">
        <div className={cn("font-title tracking-wide text-white leading-tight truncate", nameCls)}>
          {totem.name}
        </div>
        <div className={cn("flex items-center justify-center gap-1.5 text-[#94A3B8]", countryCls)}>
          <Flag code={totem.countryCode} size="sm" />
          <span className="truncate">{totem.country}</span>
        </div>
      </div>
    </motion.div>
  );
}
