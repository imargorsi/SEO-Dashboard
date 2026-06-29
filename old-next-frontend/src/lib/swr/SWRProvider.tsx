import type { ReactNode } from "react"
import { SWRConfig } from "swr"
import type { ApiThrownError } from "@/lib/api"
import { swrFetcher } from "@/lib/swr/fetcher.ts"

type SWRProviderProps = {
  children: ReactNode
}

function shouldRetryOnError(error: unknown): boolean {
  const status = (error as ApiThrownError | undefined)?.status
  if (status === 401 || status === 403 || status === 404) return false
  return true
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        fetcher: swrFetcher,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        dedupingInterval: 2000,
        focusThrottleInterval: 5000,
        errorRetryCount: 2,
        errorRetryInterval: 3000,
        shouldRetryOnError,
      }}
    >
      {children}
    </SWRConfig>
  )
}
