import Button from '@/components/Button'
import { useRouter } from 'next/router'

const Custom500 = () => {
  const router = useRouter()

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex flex-col">
        <h1 className="text-2xl">500 - Server error</h1>
        <p>Please try again later.</p>
      </div>
      <Button onClick={() => router.push('/')}>Go to Homepage</Button>
    </div>
  )
}

export default Custom500
