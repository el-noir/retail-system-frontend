const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'

type ApiFetchOptions = RequestInit & {
  auth?: boolean
  json?: unknown
}

export async function handleResponse(res: Response) {
  const contentType = res.headers.get('content-type') ?? ''
  const isJson = contentType.includes('application/json')
  const data = isJson ? await res.json() : await res.text()

  if (!res.ok) {
    const message = typeof data === 'string' ? data : data?.message || 'Request failed'
    throw new Error(Array.isArray(message) ? message.join(', ') : message)
  }

  return data
}

export async function apiFetch(path: string, options: ApiFetchOptions = {}) {
  const { auth = true, json, headers, ...rest } = options
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null

  const mergedHeaders = new Headers(headers || undefined)

  if (json !== undefined) {
    mergedHeaders.set('Content-Type', 'application/json')
    rest.body = JSON.stringify(json)
  }

  if (auth && token && !mergedHeaders.has('Authorization')) {
    mergedHeaders.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: mergedHeaders,
  })

  return handleResponse(res)
}

export { API_BASE }
