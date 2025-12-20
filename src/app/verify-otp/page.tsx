'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth/auth-context';
import { apiFetch } from '@/lib/api/client';
import { toast } from 'sonner';
import { useEffect } from 'react';
import Link from 'next/link';

const VerifyOtpSchema = z.object({
    otp: z.string().min(6, 'OTP must be 6 digits').max(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
});

type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;

export default function VerifyOtpPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isAuthenticated, token } = useAuth();
    const email = searchParams.get('email') || '';

    // Stay on this page even if authenticated; user needs to verify OTP.

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<VerifyOtpInput>({
        resolver: zodResolver(VerifyOtpSchema),
    });

    const onSubmit = async (data: VerifyOtpInput) => {
        try {
            await apiFetch('/auth/verify-otp', {
                method: 'POST',
                json: {
                    email,
                    otp: data.otp,
                },
            });

            toast.success('Email verified successfully!');
            if (typeof window !== 'undefined') {
                sessionStorage.removeItem('pending_otp');
            }
            router.push('/dashboard');
        } catch (error: any) {
            const message = error?.message || 'Invalid or expired OTP';
            toast.error(message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 px-4">
            <Card className="w-full max-w-md bg-slate-800 border-slate-700">
                <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-t-lg">
                    <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
                    <CardDescription className="text-emerald-50">
                        Enter the 6-digit OTP sent to {email}
                    </CardDescription>
                </CardHeader>

                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label htmlFor="otp" className="block text-sm font-medium text-slate-200 mb-2">
                                OTP Code
                            </label>
                            <Input
                                id="otp"
                                placeholder="000000"
                                maxLength={6}
                                {...register('otp')}
                                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 text-center text-2xl letter-spacing-2 font-mono"
                                disabled={isSubmitting}
                            />
                            {errors.otp && (
                                <p className="mt-1 text-sm text-red-400">{errors.otp.message}</p>
                            )}
                        </div>

                        <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-lg p-3">
                            <p className="text-xs text-emerald-200">
                                💡 OTP is valid for <strong>10 minutes</strong>. Check your email for the code.
                            </p>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-2 rounded-lg transition"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Verifying...' : 'Verify OTP'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-slate-400 text-sm">
                            Didn't receive the code?{' '}
                            <button
                                onClick={() => {
                                    toast.info('Resend functionality coming soon');
                                }}
                                className="text-emerald-400 hover:text-emerald-300 font-medium"
                            >
                                Resend OTP
                            </button>
                        </p>
                    </div>

                    <div className="mt-4 text-center border-t border-slate-700 pt-4">
                        <p className="text-slate-400 text-sm">
                            Want to use a different email?{' '}
                            <Link href="/sign-up" className="text-emerald-400 hover:text-emerald-300 font-medium">
                                Sign up again
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
