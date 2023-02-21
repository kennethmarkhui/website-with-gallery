import { useState } from 'react'
import { useLockBodyScroll } from 'react-use'

const useDrawer = () => {
  const [isOpen, setIsOpen] = useState(false)
  useLockBodyScroll(isOpen)

  const toggleDrawer = () => {
    setIsOpen((prev) => !prev)
  }

  const closeDrawer = () => {
    setIsOpen(false)
  }

  return {
    isOpen,
    toggleDrawer,
    closeDrawer,
  }
}

export default useDrawer
