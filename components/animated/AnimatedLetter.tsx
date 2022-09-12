import useActiveAnimation from 'hooks/useActiveAnimation'

interface IAnimatedLetter {
  letter: string
  timeout: number
}

const AnimatedLetter = ({ letter, timeout }: IAnimatedLetter): JSX.Element => {
  const [activeAnimation, setActiveAnimation] = useActiveAnimation(timeout)

  return (
    <span
      onMouseEnter={() => setActiveAnimation(true)}
      className={
        'inline-block' + `${activeAnimation ? ' animate-rubber-band' : ''}`
      }
    >
      {letter}
    </span>
  )
}

export default AnimatedLetter
