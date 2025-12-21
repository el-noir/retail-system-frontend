import { apiFetch } from '@/lib/api/client'
import { SignInSchema } from '@/lib/validations/signInSchema'
import { SignUpSchema } from '@/lib/validations/signUpSchema'
import type { z } from 'zod'

export async function signIn(payload: z.infer<typeof SignInSchema>) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    auth: false,
    json: payload,
  })

  return data as { access_token: string }
}

export async function signUp(payload: z.infer<typeof SignUpSchema>) {
  const data = await apiFetch('/auth/register', {
    method: 'POST',
    auth: false,
    json: payload,
  })

  return data as { access_token: string; requiresOtpVerification: boolean; message: string }
}

export async function verifyOtp(email: string, otp: string) {
  const data = await apiFetch('/auth/verify-otp', {
    method: 'POST',
    auth: false,
    json: { email, otp },
  })

  return data as { message: string }
}

export async function finalizeRegistration() {
  const data = await apiFetch('/auth/finalize-registration', {
    method: 'POST',
    auth: true,
  })

  return data as { access_token: string; message: string }
}
