'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type * as z from 'zod'
import { toast } from 'sonner'

import { signUp } from '@/lib/api/auth'
import { useAuth } from '@/lib/auth/auth-context'
import { SignUpSchema } from '@/lib/validations/signUpSchema'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

export default function SignUpPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const { setToken, isAuthenticated, hydrated } = useAuth()

  const form = useForm<z.infer<typeof SignUpSchema>>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  React.useEffect(() => {
    // Prevent redirect to dashboard when we're in the middle of OTP flow
    const pendingOtp = typeof window !== 'undefined' ? sessionStorage.getItem('pending_otp') === 'true' : false
    if (hydrated && isAuthenticated && !pendingOtp) {
      router.replace('/dashboard')
    }
  }, [hydrated, isAuthenticated, router])

  const onSubmit = async (values: z.infer<typeof SignUpSchema>) => {
    setIsLoading(true)
    try {
      const { access_token } = await signUp(values)
      // Mark that user needs to complete OTP to avoid sign-up page redirect racing back to dashboard
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pending_otp', 'true')
      }
      setToken(access_token)
      toast.success('Account created! Please verify your email.')
      router.push(`/verify-otp?email=${encodeURIComponent(values.email)}`)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to sign up')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-slate-50">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_14px_70px_-24px_rgba(0,0,0,0.85)]">
        <div className="space-y-1 text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-emerald-300/80">Get started</p>
          <h1 className="text-2xl font-semibold text-white">Create account</h1>
          <p className="text-sm text-slate-300">Set up access to your sales dashboard.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input placeholder="Alex Doe" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
        </Form>

        <p className="text-center text-sm text-slate-300">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-emerald-300 underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
