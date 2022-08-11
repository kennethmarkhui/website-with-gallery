import { Dispatch, SetStateAction, useEffect, useState } from 'react'

const useActiveAnimation = (
  timeout: number
): [boolean, Dispatch<SetStateAction<boolean>>] => {
  const [activeAnimation, setActiveAnimation] = useState<boolean>(false)

  useEffect(() => {
    let timer = setTimeout(() => setActiveAnimation(false), timeout)

    return () => clearTimeout(timer)
  }, [activeAnimation, timeout])

  return [activeAnimation, setActiveAnimation]
}
export default useActiveAnimation
