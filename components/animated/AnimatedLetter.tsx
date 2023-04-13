import useActiveAnimation from 'hooks/useActiveAnimation'
import { cn } from 'lib/utils'

interface AnimatedLetterProps {
  letter: string
  timeout: number
}

const AnimatedLetter = ({
  letter,
  timeout,
}: AnimatedLetterProps): JSX.Element => {
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

export default AnimatedLetter
