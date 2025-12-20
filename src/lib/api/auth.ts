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

  return data as { access_token: string }
}
