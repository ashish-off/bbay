'use client'
import { useEffect, useState } from 'react'

const CountdownTimer = ({ endTime, compact = false }) => {

    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
    const [isUrgent, setIsUrgent] = useState(false)
    const [ended, setEnded] = useState(false)

    useEffect(() => {
        const calcTime = () => {
            const diff = new Date(endTime) - new Date()
            if (diff <= 0) {
                setEnded(true)
                return
            }
            setIsUrgent(diff < 3600000) // < 1 hour
            setTimeLeft({
                days: Math.floor(diff / 86400000),
                hours: Math.floor((diff % 86400000) / 3600000),
                minutes: Math.floor((diff % 3600000) / 60000),
                seconds: Math.floor((diff % 60000) / 1000),
            })
        }
        calcTime()
        const interval = setInterval(calcTime, 1000)
        return () => clearInterval(interval)
    }, [endTime])

    if (ended) return <span className="text-red-500 font-medium text-xs">Ended</span>

    if (compact) {
        return (
            <span className={`text-xs font-medium ${isUrgent ? 'text-red-500 ending-soon' : 'text-slate-500'}`}>
                {timeLeft.days > 0 && `${timeLeft.days}d `}{timeLeft.hours}h {timeLeft.minutes}m
            </span>
        )
    }

    return (
        <div className={`flex gap-2 ${isUrgent ? 'ending-soon' : ''}`}>
            {[
                { label: 'Days', value: timeLeft.days },
                { label: 'Hrs', value: timeLeft.hours },
                { label: 'Min', value: timeLeft.minutes },
                { label: 'Sec', value: timeLeft.seconds },
            ].map((unit) => (
                <div key={unit.label} className={`flex flex-col items-center px-2.5 py-1.5 rounded-md ${isUrgent ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-700'}`}>
                    <span className="text-lg font-semibold leading-tight">{String(unit.value).padStart(2, '0')}</span>
                    <span className="text-[10px] uppercase tracking-wide">{unit.label}</span>
                </div>
            ))}
        </div>
    )
}

export default CountdownTimer
