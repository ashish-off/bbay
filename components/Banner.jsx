'use client'
import React from 'react'
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function Banner() {

    const router = useRouter();
    const [isOpen, setIsOpen] = React.useState(true);

    const handleClaim = () => {
        setIsOpen(false);
        router.push('/sell/create-listing');
    };

    return isOpen && (
        <div className="w-full px-6 py-1 font-medium text-sm text-white text-center bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500">
            <div className='flex items-center justify-between max-w-7xl  mx-auto'>
                <p>🔨 List your first item FREE — Start selling today!</p>
                <div className="flex items-center space-x-6">
                    <button onClick={handleClaim} type="button" className="font-normal text-gray-800 bg-white px-7 py-2 rounded-full max-sm:hidden">Start Selling</button>
                    <button onClick={() => setIsOpen(false)} type="button" className="font-normal text-gray-800 py-2 rounded-full">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect y="12.532" width="17.498" height="2.1" rx="1.05" transform="rotate(-45.74 0 12.532)" fill="#fff" />
                            <rect x="12.533" y="13.915" width="17.498" height="2.1" rx="1.05" transform="rotate(-135.74 12.533 13.915)" fill="#fff" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};