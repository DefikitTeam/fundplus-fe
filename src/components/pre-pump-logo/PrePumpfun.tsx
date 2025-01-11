// src/components/PrePumpfun.tsx
import React from 'react';
import { useRouter } from 'next/navigation';

interface PrePumpfunProps {
    text?: string;
}

const PrePumpfun: React.FC<PrePumpfunProps> = ({ text = 'FundPlus' }) => {
    const router = useRouter();

    const handleClick = () => {
        router.push('/');
    }
    return (
        <button
            onClick={handleClick}
            className="flex flex-col text-2xl text-white whitespace-nowrap rounded-xl max-w-[363px] mx-auto shadow-[0px_4px_4px_rgba(0,0,0,0.25)] bg-gradient-to-b from-[#7823E7] to-[#0BA1F8]"
            role="region"
            tabIndex={0}
        >
            <div
                className="px-8 py-2 rounded-2xl font-inria font-semibold text-center"
                aria-label="Pre-Pumpfun section"
            >
                {text}
            </div>
        </button>
    );
};

export default PrePumpfun;