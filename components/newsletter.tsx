"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button, buttonVariants } from "./ui/button"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Cross1Icon, StarIcon } from "@radix-ui/react-icons"
import { DiscordImageIcon } from "./icons/discord-image"
import { TelegramImageIcon } from "./icons/telegram-image"
import { useIsV0 } from "@/lib/context"
import { redirectToCheckout } from "@/lib/stripe"

const DURATION = 0.3
const DELAY = DURATION
const EASE_OUT = "easeOut"
const EASE_OUT_OPACITY = [0.25, 0.46, 0.45, 0.94] as const
const SPRING = {
  type: "spring" as const,
  stiffness: 60,
  damping: 10,
  mass: 0.8,
}

export const Newsletter = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [memberCount, setMemberCount] = useState(0)
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null)

  const isInitialRender = useRef(true)

  useEffect(() => {
    return () => {
      isInitialRender.current = false
    }
  }, [isOpen])

  useEffect(() => {
    const fetchMemberCount = () => {
      const count = Math.floor(Math.random() * 5000) + 12847
      setMemberCount(count)
    }

    fetchMemberCount()
  }, [])

  const handleBecomeMember = () => {
    setIsOpen(true)
  }

  const handlePayment = async (plan: 'monthly' | 'lifetime') => {
    setPaymentLoading(plan)
    try {
      await redirectToCheckout(plan)
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setPaymentLoading(null)
    }
  }

  return (
    <div className="flex overflow-hidden relative flex-col gap-4 justify-center items-center pt-10 w-full h-full short:lg:pt-10 pb-footer-safe-area 2xl:pt-footer-safe-area px-sides short:lg:gap-4 lg:gap-8">
      <motion.div
        layout="position"
        transition={{ duration: DURATION, ease: EASE_OUT }}
        className="flex items-center gap-4"
      >
        <h1 className="font-serif text-5xl italic short:lg:text-8xl sm:text-8xl lg:text-9xl text-foreground">
          dreamzz
        </h1>
        <StarIcon className="w-12 h-12 short:lg:w-16 short:lg:h-16 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-foreground" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION, delay: DELAY }}
        className="text-center mb-2"
      >
        <p className="font-serif text-lg text-foreground/80">Join 1,000+ members</p>
      </motion.div>

      <div className="flex flex-col items-center min-h-0 shrink">
        <AnimatePresenceGuard>
          {!isOpen && (
            <motion.div
              key="membership"
              initial={isInitialRender.current ? false : "hidden"}
              animate="visible"
              exit="exit"
              variants={{
                visible: {
                  scale: 1,
                  transition: {
                    delay: DELAY,
                    duration: DURATION,
                    ease: EASE_OUT,
                  },
                },
                hidden: {
                  scale: 0.9,
                  transition: { duration: DURATION, ease: EASE_OUT },
                },
                exit: {
                  y: -150,
                  scale: 0.9,
                  transition: { duration: DURATION, ease: EASE_OUT },
                },
              }}
            >
              <div className="flex flex-col gap-4 w-full max-w-xl md:gap-6 lg:gap-8">
                <motion.div
                  initial={isInitialRender.current ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{
                    opacity: 0,
                    transition: {
                      duration: DURATION,
                      ease: EASE_OUT_OPACITY,
                    },
                  }}
                  transition={{
                    duration: DURATION,
                    ease: EASE_OUT,
                    delay: DELAY,
                  }}
                  className="flex flex-col gap-4 items-center"
                >
                  <Button className="px-8 py-3 text-lg" shine onClick={handleBecomeMember}>
                    Become a Member
                  </Button>
                </motion.div>

                <motion.p
                  initial={isInitialRender.current ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{
                    opacity: 0,
                    transition: {
                      duration: DURATION,
                      ease: EASE_OUT_OPACITY,
                    },
                  }}
                  transition={{
                    duration: DURATION,
                    ease: EASE_OUT,
                    delay: DELAY,
                  }}
                  className="text-base short:lg:text-lg sm:text-lg lg:text-xl !leading-[1.1] font-serif text-center text-foreground text-pretty"
                >
                  Step into the hottest NSFW community online. Unlock exclusive content, premium drops, and the best OnlyFans leaks. Thousands are already inside — don't stay on the outside.
                </motion.p>

                <motion.div
                  initial={isInitialRender.current ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{
                    opacity: 0,
                    transition: {
                      duration: DURATION,
                      ease: EASE_OUT_OPACITY,
                    },
                  }}
                  transition={{
                    duration: DURATION,
                    ease: EASE_OUT,
                    delay: DELAY + 0.1,
                  }}
                  className="text-center p-4 rounded-2xl bg-primary/5 border border-border/20"
                >
                  <p className="text-sm font-serif italic text-foreground/80 mb-2">
                    "dreamzz has content you won't find anywhere else — full leaks from every model you can think of. It's honestly unbeatable."
                  </p>
                  <p className="text-xs font-serif text-foreground/60">— Jake R., Premium Member</p>
                </motion.div>

                <motion.div
                  initial={isInitialRender.current ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{
                    opacity: 0,
                    transition: {
                      duration: DURATION,
                      ease: EASE_OUT_OPACITY,
                    },
                  }}
                  transition={{
                    duration: DURATION,
                    ease: EASE_OUT,
                    delay: DELAY + 0.2,
                  }}
                  className="flex items-center justify-center gap-4 mt-4"
                >
                  <div className="flex items-center gap-2 text-xs font-serif text-foreground/70">
                    <DiscordImageIcon size={16} />
                    <span>Discord</span>
                  </div>
                  <div className="w-px h-4 bg-border/30" />
                  <div className="flex items-center gap-2 text-xs font-serif text-foreground/70">
                    <TelegramImageIcon size={16} />
                    <span>Telegram</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {isOpen && (
            <motion.div layout="position" transition={SPRING} key="button" className="my-6">
              <Button className={cn("relative px-8")} onClick={() => setIsOpen(!isOpen)} shine={!isOpen}>
                <motion.span
                  animate={{ x: isOpen ? -16 : 0 }}
                  transition={{ duration: DURATION, ease: EASE_OUT }}
                  className="inline-block"
                >
                  Subscriptions
                </motion.span>

                {isOpen && (
                  <motion.div
                    className={cn(
                      buttonVariants({ variant: "iconButton", size: "icon" }),
                      "absolute -top-px -right-px aspect-square",
                    )}
                    initial={{ opacity: 0, scale: 0.8, rotate: -40 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{
                      duration: DURATION,
                      ease: EASE_OUT,
                      delay: DELAY,
                    }}
                  >
                    <Cross1Icon className="size-5 text-primary-foreground" />
                  </motion.div>
                )}
              </Button>
            </motion.div>
          )}

          {isOpen && (
            <motion.div
              key="subscription-modal"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={{
                visible: {
                  opacity: 1,
                  scale: 1,
                  transition: {
                    delay: DELAY,
                    duration: DURATION,
                    ease: EASE_OUT,
                  },
                },
                hidden: {
                  opacity: 0,
                  scale: 0.9,
                  transition: { duration: DURATION, ease: EASE_OUT },
                },
                exit: {
                  opacity: 0,
                  scale: 0.9,
                  transition: { duration: DURATION, ease: EASE_OUT_OPACITY },
                },
              }}
              className="relative flex min-h-0 flex-shrink overflow-hidden text-sm md:text-base max-h-[calc(70dvh-var(--footer-safe-area))] flex-col gap-8 text-center backdrop-blur-xl text-balance border-2 border-border/50 bg-primary/20 max-w-3xl text-foreground rounded-3xl ring-1 ring-offset-primary/10 ring-border/10 ring-offset-2 shadow-button"
            >
              <div className="relative overflow-y-auto p-6 h-full">
                <h2 className="text-2xl font-serif italic mb-6">Choose Your Plan</h2>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 p-6 rounded-2xl border border-border/30 bg-primary/10 backdrop-blur-sm relative">
                    <div className="absolute top-3 right-3 flex gap-2">
                      <DiscordImageIcon size={16} />
                      <TelegramImageIcon size={16} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Monthly Plan</h3>
                    <p className="text-3xl font-bold mb-4">
                      €14.99<span className="text-sm font-normal">/month</span>
                    </p>
                    <p className="text-xs text-foreground/60 mb-2">*VAT included</p>
                    <ul className="text-left space-y-2 mb-4">
                      <li>• 1-day free trial included</li>
                      <li>• Access to all premium content channels</li>
                      <li>• Priority customer support</li>
                      <li>• Monthly exclusive content</li>
                      <li>• Request content from any model (1 per week)</li>
                      <li>• Cancel anytime</li>
                    </ul>
                    <Button 
                      className="w-full" 
                      shine 
                      onClick={() => handlePayment('monthly')}
                      disabled={paymentLoading !== null}
                    >
                      {paymentLoading === 'monthly' ? 'Processing...' : 'Choose Monthly'}
                    </Button>
                  </div>

                  <div className="flex-1 p-6 rounded-2xl border border-border/30 bg-primary/10 backdrop-blur-sm relative">
                    <div className="absolute top-3 right-3 flex gap-2">
                      <DiscordImageIcon size={16} />
                      <TelegramImageIcon size={16} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Lifetime Plan</h3>
                    <div className="mb-4">
                      <p className="text-lg text-foreground/60 line-through">€100.00</p>
                      <p className="text-3xl font-bold">
                        €34.99<span className="text-sm font-normal"> once</span>
                      </p>
                      <p className="text-xs text-foreground/60 mb-2">*VAT included</p>
                    </div>
                    <ul className="text-left space-y-2 mb-4">
                      <li>• Everything in Monthly Plan</li>
                      <li>• Lifetime access guarantee</li>
                      <li>• Request content from any model (1 per week, forever)</li>
                      <li>• Exclusive lifetime member perks</li>
                      <li>• Best value — Save over 60%</li>
                    </ul>
                    <Button 
                      className="w-full" 
                      shine 
                      onClick={() => handlePayment('lifetime')}
                      disabled={paymentLoading !== null}
                    >
                      {paymentLoading === 'lifetime' ? 'Processing...' : 'Choose Lifetime'}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresenceGuard>
      </div>
    </div>
  )
}

const AnimatePresenceGuard = ({ children }: { children: React.ReactNode }) => {
  const isV0 = useIsV0()

  return isV0 ? (
    <>{children}</>
  ) : (
    <AnimatePresence mode="popLayout" propagate>
      {children}
    </AnimatePresence>
  )
}
