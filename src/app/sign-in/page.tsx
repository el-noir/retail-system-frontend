'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type * as z from 'zod'
import { toast } from 'sonner'

import { signIn } from '@/lib/api/auth'
import { useAuth } from '@/lib/auth/auth-context'
import { SignInSchema } from '@/lib/validations/signInSchema'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

export default function SignInPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false)
    const { setToken, isAuthenticated, hydrated } = useAuth()

    const form = useForm<z.infer<typeof SignInSchema>>({
        resolver: zodResolver(SignInSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    React.useEffect(() => {
        if (hydrated && isAuthenticated) {
            router.replace('/dashboard')
        }
    }, [hydrated, isAuthenticated, router])

    const onSubmit = async (values: z.infer<typeof SignInSchema>) => {
        setIsLoading(true)
        try {
            const { access_token } = await signIn(values)
            setToken(access_token)
            toast.success('Signed in successfully')
            router.push('/dashboard')
        } catch (error: any) {
            toast.error(error?.message || 'Failed to sign in')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-slate-50">
            <div className="w-full max-w-md space-y-6 rounded-md border border-slate-800 bg-slate-900/80 p-8 shadow-sm">
                <div className="space-y-1 text-left">
                    <p className="text-xs font-medium text-slate-400">Welcome back</p>
                    <h1 className="text-2xl font-semibold text-white">Sign in</h1>
                    <p className="text-sm text-slate-300">Use your account to access the dashboard.</p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </Button>
                    </form>
                </Form>

                <p className="text-center text-sm text-slate-300">
                    Don&apos;t have an account?{' '}
                    <Link href="/sign-up" className="text-emerald-300 underline-offset-4 hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    )
}
