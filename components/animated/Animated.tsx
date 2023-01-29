import clsx from 'clsx'

import useActiveAnimation from 'hooks/useActiveAnimation'
import AnimatedLetter from './AnimatedLetter'

interface AnimatedProps {
  children: React.ReactNode
  timeout?: number
}

const Animated = ({ children, timeout = 600 }: AnimatedProps) => {
  const [activeAnimation, setActiveAnimation] = useActiveAnimation(timeout)

  return (
    <>
      {typeof children === 'string' ? (
        children.split(' ').map(
          (word, index): JSX.Element => (
            <span
              key={`${word}-${index}`}
              className="inline-block whitespace-nowrap"
            >
              {word.split('').map(
                (letter, index): JSX.Element => (
                  <AnimatedLetter
                    key={`${letter}-${index}`}
                    letter={letter}
                    timeout={timeout}
                  />
                )
              )}
              <span>&nbsp;</span>
            </span>
          )
        )
      ) : (
        <span
          onMouseEnter={() => setActiveAnimation(true)}
          className={clsx(
            'inline-block',
            activeAnimation && 'animate-rubber-band'
          )}
        >
          {children}
        </span>
      )}
    </>
  )
}

export default Animated
