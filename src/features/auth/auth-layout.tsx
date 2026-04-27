import { Diamond } from 'lucide-react'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className='container grid h-svh max-w-none items-center justify-center bg-white text-[#1a2744]'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-2 py-8 sm:w-[480px] sm:p-8'>
        <div className='mb-4 flex items-center justify-center gap-2'>
          <Diamond className='h-5 w-5 text-[#C9A84C]' />
          <h1 className='text-xl font-medium tracking-tight'>Santain</h1>
        </div>
        {children}
      </div>
    </div>
  )
}
