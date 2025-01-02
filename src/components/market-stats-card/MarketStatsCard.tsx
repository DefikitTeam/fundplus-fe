// src/components/MarketStatsCard.tsx
import React from 'react';

interface MarketStats {
    name: string;
    symbol: string;
    marketCap: number;
    completedPercentage: number;
    imageUrl: string;
}

interface MarketStatsCardProps {
    stats: MarketStats;
}

const MarketStatsCard: React.FC<MarketStatsCardProps> = ({ stats }) => {
    return (
        <div
            className="flex flex-col rounded-lg shadow-[0px_4px_4px_rgba(0,0,0,0.25)] bg-[url('/neuron.png')] bg-cover bg-center relative"
            role="region"
            aria-label="Market Statistics Card"
        >
            <div className="flex flex-col justify-end items-center px-4 py-3 w-full h-80 relative z-10">
                <div className="flex justify-between items-end w-full">
                    <div className="flex flex-col items-start overflow-hidden flex-1">
                        <div className="text-lg sm:text-xl md:text-2xl font-inria font-semibold text-white break-words w-full">
                            {stats.name}
                        </div>
                    </div>
                    <div className="flex flex-col items-end ml-2">
                        <div className="text-lg sm:text-xl md:text-2xl font-inria font-semibold text-yellow-400 break-words">
                            {stats.symbol}
                        </div>
                    </div>
                </div>
                <div className="h-[4px] w-full bg-black bg-opacity-50 my-2"></div>
                <div className="flex justify-between items-end w-full">
                    <div className="flex flex-col items-start overflow-hidden flex-1">
                        <div className="text-lg sm:text-xl md:text-2xl font-inria font-bold text-white break-words w-full">
                            $ {stats.marketCap.toLocaleString('en-US')}
                        </div>
                        <div className="text-sm sm:text-base font-inria text-zinc-300 break-words">
                            MARKETCAP
                        </div>
                    </div>
                    <div className="flex flex-col items-end ml-2">
                        <div className="text-lg sm:text-xl md:text-2xl font-inria font-bold text-green-500 break-words">
                            {stats.completedPercentage.toFixed(1)}%
                        </div>
                        <div className="text-sm sm:text-base font-inria text-zinc-300 break-words">
                            COMPLETED
                        </div>
                    </div>
                </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-2/5 bg-gradient-to-b from-[#7823E7] to-[#0BA1F8] opacity-90 rounded-b-lg"></div>
        </div>
    );
};

export default MarketStatsCard;