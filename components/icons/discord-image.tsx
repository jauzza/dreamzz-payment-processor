import type React from "react"
import Image from "next/image"

interface DiscordImageIconProps {
  className?: string
  size?: number
}

export const DiscordImageIcon: React.FC<DiscordImageIconProps> = ({ className, size = 16 }) => {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <Image
        src="/discord.png"
        alt="Discord"
        width={size}
        height={size}
        className="w-full h-full object-contain"
      />
    </div>
  )
}