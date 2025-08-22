import type React from "react"
import Image from "next/image"

interface TelegramImageIconProps {
  className?: string
  size?: number
}

export const TelegramImageIcon: React.FC<TelegramImageIconProps> = ({ className, size = 16 }) => {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <Image
        src="/telegram.png"
        alt="Telegram"
        width={size}
        height={size}
        className="w-full h-full object-contain"
      />
    </div>
  )
}