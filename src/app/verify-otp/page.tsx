'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth/auth-context';
import { verifyOtp, finalizeRegistration } from '@/lib/api/auth';
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
    const { setToken } = useAuth();
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
            // Step 1: Verify OTP with backend
            await verifyOtp(email, data.otp);
            toast.success('Email verified successfully!');

            // Step 2: Finalize registration (create user and get real token)
            const result = await finalizeRegistration();
            
            // Step 3: Store the real token and clear temporary data
            setToken(result.access_token);
            
            if (typeof window !== 'undefined') {
                sessionStorage.removeItem('pending_otp');
                sessionStorage.removeItem('temp_registration_token');
                sessionStorage.removeItem('registration_email');
            }
            
            toast.success('Account created successfully!');
            router.push('/dashboard');
        } catch (error: any) {
            const message = error?.message || 'Invalid or expired OTP';
            toast.error(message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <Card className="w-full max-w-md border border-slate-800 bg-slate-900/85 rounded-md">
                <CardHeader className="pb-2 text-left">
                    <CardTitle className="text-2xl font-semibold text-white">Verify your email</CardTitle>
                    <CardDescription className="text-slate-300">
                        Enter the 6-digit code we sent to {email}
                    </CardDescription>
                </CardHeader>

                <CardContent className="pt-4">
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
                                className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 text-center text-xl font-mono"
                                disabled={isSubmitting}
                            />
                            {errors.otp && (
                                <p className="mt-1 text-sm text-red-400">{errors.otp.message}</p>
                            )}
                        </div>

                        <div className="border border-slate-800 rounded-sm p-3 bg-slate-900">
                            <p className="text-xs text-slate-300">
                                OTP is valid for <strong>10 minutes</strong>. Check your email for the code.
                            </p>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-sm transition"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Verifying...' : 'Verify OTP'}
                        </Button>
                    </form>

                    <div className="mt-6 text-left">
                        <p className="text-slate-400 text-sm">
                            Didn't receive the code?{' '}
                            <button
                                onClick={() => {
                                    toast.info('Resend functionality coming soon');
                                }}
                                className="text-emerald-400 hover:text-emerald-300 font-medium underline"
                            >
                                Resend OTP
                            </button>
                        </p>
                    </div>

                    <div className="mt-4 text-left border-t border-slate-800 pt-4">
                        <p className="text-slate-400 text-sm">
                            Want to use a different email?{' '}
                            <Link href="/sign-up" className="text-emerald-400 hover:text-emerald-300 font-medium underline">
                                Sign up again
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
