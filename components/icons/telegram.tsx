import type React from "react"

interface TelegramIconProps {
  className?: string
}

export const TelegramIcon: React.FC<TelegramIconProps> = ({ className }) => {
  return (
    <svg
      viewBox="0 0 1024 1024"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M512 0C229.2 0 0 229.2 0 512s229.2 512 512 512 512-229.2 512-512S794.8 0 512 0zm243.1 369.2l-85.3 402.4c-6.4 28.5-23.2 35.6-47 22.1l-129.8-95.7-62.7 60.3c-6.9 6.9-12.8 12.8-26.2 12.8l9.3-133.1 241.9-218.5c10.5-9.3-2.3-14.5-16.3-5.2L362.8 581.6l-128.6-40.2c-27.9-8.7-28.5-27.9 5.8-41.3l502.4-193.7c23.2-8.7 43.5 5.8 36 41.3z"/>
    </svg>
  )
}