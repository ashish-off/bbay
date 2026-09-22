'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import ServerProgressBar from '@/components/ServerProgressBar'

export default function QueryProvider({ children }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,        // 1 min fresh cache
                gcTime: 15 * 60 * 1000,      // 15 min memory cache
                refetchOnWindowFocus: false, // Smooth browsing without random reloads
                refetchOnReconnect: true,
                retry: 1,
            },
        },
    }))

    return (
        <QueryClientProvider client={queryClient}>
            <ServerProgressBar />
            {children}
        </QueryClientProvider>
    )
}
