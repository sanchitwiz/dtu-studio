"use client"

import { motion } from "framer-motion"
import { Card } from "./card"
import { forwardRef } from "react"

// Extract props type from the Card component itself
type CardProps = React.ComponentProps<typeof Card>

const AnimatedCard = forwardRef<HTMLDivElement, CardProps & { delay?: number }>(
  ({ className, delay = 0, children, ...props }, ref) => {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.3, delay }}
      >
        <Card ref={ref} className={className} {...props}>
          {children}
        </Card>
      </motion.div>
    )
  },
)

AnimatedCard.displayName = "AnimatedCard"

export { AnimatedCard }
