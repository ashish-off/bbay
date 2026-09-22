'use client'

const Loading = ({ fullScreen = false, label = "Loading...", className = "" }) => {
    return (
        <div className={`flex flex-col items-center justify-center gap-3 w-full ${fullScreen ? 'h-screen' : 'py-16 min-h-[220px]'} ${className}`}>
            <div className='relative flex items-center justify-center'>
                <div className='size-11 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin'></div>
                <div className='absolute size-2 rounded-full bg-indigo-600/80'></div>
            </div>
            {label && (
                <p className="text-xs text-slate-400 font-medium tracking-wide animate-pulse">
                    {label}
                </p>
            )}
        </div>
    )
}

export default Loading