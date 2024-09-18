'use client'

import useActiveAnimation from '@/hooks/use-active-animation'
import { cn } from '@/lib/utils'

interface AnimatedLetterProps {
  letter: string
  timeout: number
}

export default function AnimatedLetter({
  letter,
  timeout,
}: AnimatedLetterProps) {
  const [activeAnimation, setActiveAnimation] = useActiveAnimation(timeout)

  return (
    <span
      onMouseEnter={() => setActiveAnimation(true)}
      className={cn('inline-block', activeAnimation && 'animate-rubber-band')}
    >
      {letter}
    </span>
  )
}
