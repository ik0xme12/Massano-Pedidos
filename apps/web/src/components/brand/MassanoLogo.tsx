import Image from "next/image"
import { cn } from "@/lib/utils"

type LogoVariant = "dark" | "gold" | "white"
type LogoSize    = "xs" | "sm" | "md" | "lg" | "xl"

/*
 * Todos usan massano5.png (PNG con fondo transparente).
 * El color se aplica con CSS filter:
 *   dark  → sin filtro (negro original)
 *   gold  → filtro que convierte negro → #C4A35A
 *   white → invert (negro → blanco)
 */
const FILTER: Record<LogoVariant, string> = {
  dark:  "",
  gold:  "brightness(0) saturate(100%) invert(69%) sepia(28%) saturate(550%) hue-rotate(4deg) brightness(92%)",
  white: "brightness(0) invert(1)",
}

// massano.png: 1015×451 → ratio ~2.25:1
const SIZES: Record<LogoSize, { w: number; h: number }> = {
  xs: { w: 110, h: 49  },
  sm: { w: 160, h: 71  },
  md: { w: 220, h: 98  },
  lg: { w: 300, h: 133 },
  xl: { w: 400, h: 178 },
}

interface MassanoLogoProps {
  variant?:   LogoVariant
  size?:      LogoSize
  className?: string
  priority?:  boolean
  style?:     React.CSSProperties
}

export function MassanoLogo({
  variant  = "gold",
  size     = "md",
  className,
  priority = false,
  style,
}: MassanoLogoProps) {
  const { w, h } = SIZES[size]
  const filter = FILTER[variant]

  return (
    <Image
      src="/massano5.png"
      alt="Massano Cafetería"
      width={w}
      height={h}
      priority={priority}
      className={cn("object-contain select-none", className)}
      style={{ filter: filter || undefined, ...style }}
    />
  )
}
