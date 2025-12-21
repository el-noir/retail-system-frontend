import { useEffect, useRef, useState } from 'react'

/**
 * Custom hook for throttling a value
 * @param value - The value to throttle
 * @param interval - The interval in milliseconds (default: 500ms)
 * @returns The throttled value
 */
export function useThrottle<T>(value: T, interval: number = 500): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastUpdated = useRef<number>(Date.now())

  useEffect(() => {
    const now = Date.now()
    const timeSinceLastUpdate = now - lastUpdated.current

    if (timeSinceLastUpdate >= interval) {
      lastUpdated.current = now
      setThrottledValue(value)
    } else {
      const timer = setTimeout(() => {
        lastUpdated.current = Date.now()
        setThrottledValue(value)
      }, interval - timeSinceLastUpdate)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [value, interval])

  return throttledValue
}
