'use client'

import { useIsFetching, useIsMutating } from '@tanstack/react-query'
import { useState, useEffect } from 'react'

export default function ServerProgressBar() {
    const isFetching = useIsFetching()
    const isMutating = useIsMutating()
    const isLoading = isFetching > 0 || isMutating > 0

    const [progress, setProgress] = useState(0)

    useEffect(() => {
        if (!isLoading) {
            if (progress > 0 && progress < 100) {
                const finishTimer = setTimeout(() => {
                    setProgress(100)
                    const hideTimer = setTimeout(() => setProgress(0), 300)
                    return () => clearTimeout(hideTimer)
                }, 0)
                return () => clearTimeout(finishTimer)
            }
            return
        }

        const startTimer = setTimeout(() => {
            setProgress(prev => (prev === 0 ? 20 : prev))
        }, 0)

        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev <= 0) return 20
                if (prev >= 88) return prev
                return prev + Math.max(1, (88 - prev) * 0.15)
            })
        }, 120)

        return () => {
            clearTimeout(startTimer)
            clearInterval(interval)
        }
    }, [isLoading, progress])

    if (!isLoading && progress === 0) return null

    return (
        <div className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none transition-opacity duration-300">
            {/* Top Glowing Progress Line */}
            <div
                className="h-[5px] bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 shadow-[0_0_14px_rgba(99,102,241,0.9)] transition-all duration-200 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    )
}
