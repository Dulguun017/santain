import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { AxiosError } from 'axios'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { decodeJwt, useLogin } from '@/features/auth/data/auth-api'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'

const formSchema = z.object({
  email: z.email({
    error: (iss) => (iss.input === '' ? 'Please enter your email' : undefined),
  }),
  password: z
    .string()
    .min(1, 'Please enter your password')
    .min(6, 'Password must be at least 6 characters long'),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const navigate = useNavigate()
  const { auth } = useAuthStore()
  const loginMutation = useLogin()
  const isLoading = loginMutation.isPending

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    toast.promise(loginMutation.mutateAsync(data), {
      loading: 'Signing in...',
      success: ({ access_token }) => {
        const decoded = decodeJwt(access_token)
        const user = {
          accountNo: decoded?.sub ? String(decoded.sub) : 'unknown',
          email: decoded?.email ?? data.email,
          role: decoded?.role ? [decoded.role] : ['staff'],
          exp: decoded?.exp
            ? decoded.exp * 1000
            : Date.now() + 24 * 60 * 60 * 1000,
        }
        auth.setUser(user)
        auth.setAccessToken(access_token)

        const targetPath = redirectTo || '/'
        navigate({ to: targetPath, replace: true })

        return `Welcome back, ${user.email}!`
      },
      error: (err) => {
        if (err instanceof AxiosError) {
          if (err.response?.status === 401) return 'Invalid email or password'
          if (err.code === 'ERR_NETWORK')
            return 'Cannot reach server — is the API running?'
        }
        return (err as Error)?.message ?? 'Sign-in failed'
      },
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='name@example.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to='/forgot-password'
                className='absolute end-0 -top-0.5 text-sm font-medium text-muted-foreground hover:opacity-75'
              >
                Forgot password?
              </Link>
            </FormItem>
          )}
        />
        <Button
          className='mt-2 bg-[#C9A84C] text-white hover:bg-[#b8973e]'
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
          Sign in
        </Button>
      </form>
    </Form>
  )
}
