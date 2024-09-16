import { useState } from 'react'
import { useLockBodyScroll } from 'react-use'

const useDrawer = () => {
  const [isOpen, setIsOpen] = useState(false)
  useLockBodyScroll(isOpen)

  const toggleDrawer = () => {
    setIsOpen((prev) => !prev)
  }

  const openDrawer = () => {
    setIsOpen(true)
  }

  const closeDrawer = () => {
    setIsOpen(false)
  }

  return {
    isOpen,
    toggleDrawer,
    openDrawer,
    closeDrawer,
  }
}

export default useDrawer
