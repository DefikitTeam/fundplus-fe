/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/all-campaigns/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { configs } from '@/env';

// import NavigationMenu from '../../components/navigation-menu/NavigationMenu';
import DashboardStats from '@/components/status-bar/DashboardStats';

import styles from './app.module.css';
import { WelcomeSection } from '@/components/welcome-section/WelcomeSection';

interface CampaignData {
    id: string;
    creator: string;
    campaignIndex: number;
    name: string;
    symbol: string;
    uri: string;
    totalFundRaised: number;
    donationGoal: number;
    depositDeadline: number;
    tradeDeadline: number;
    timestamp: number;
    description?: string; // Optional: Description from metadata
    image?: string;  // Optional: Image URL from metadata 
    status: string; 
    mint?: string;   
}

const HomePage: React.FC = () => {
    const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedTab, setSelectedTab] = useState<'LIVE' | 'CLAIMABLE' | 'RAISING' | 'ALL'>('LIVE');

    const router = useRouter();

    const fetchCampaigns = async () => {
        try {
            const [campaignsResponse, statusResponse] = await Promise.all([
                fetch(configs.api.campaign),
                fetch(configs.api.status)
            ]);
    
            if (!campaignsResponse.ok || !statusResponse.ok) {
                throw new Error('Failed to fetch campaigns or status');
            }
    
            const campaignsData = await campaignsResponse.json();
            const statusData = await statusResponse.json();
    
            // Create a map for quick status lookup
            const statusMap = new Map(
                statusData.data.map((item: any) => [`${item.creator}-${item.campaignIndex}`, item.status])
            );
    
            // Fetch metadata and combine with status
            const campaignsWithMetadata: CampaignData[] = await Promise.all(
                campaignsData.data.map(async (camp: CampaignData) => {
                    try {
                        const metadataResponse = await fetch(camp.uri);
                        if (!metadataResponse.ok) {
                            console.warn(`Metadata fetch failed for ${camp.id}`);
                            return {
                              ...camp,
                              description: 'No description available.',
                              image: '/unknown.svg',
                              status: statusMap.get(`${camp.creator}-${camp.campaignIndex}`) || 'UNKNOWN'
                            };
                        }
                        const metadata = await metadataResponse.json();
                        
                        // Get status for this campaign
                        const status = statusMap.get(`${camp.creator}-${camp.campaignIndex}`) || 'UNKNOWN';
    
                        return {
                            ...camp,
                            description: metadata.description || 'No description available.',
                            image: metadata.image || '/unknown.svg',
                            status: status
                        };
                    } catch (metadataError) {
                        console.error(metadataError);
                        return {
                            ...camp,
                            description: 'No description available.',
                            image: '/unknown.svg',
                            status: statusMap.get(`${camp.creator}-${camp.campaignIndex}`) || 'UNKNOWN'
                        };
                    }
                })
            );

            setCampaigns(campaignsWithMetadata);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch campaigns');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const filteredCampaigns = campaigns.filter((camp) => {
        switch (selectedTab) {
            case 'LIVE':
                return camp.status === 'COMPLETED';
            case 'CLAIMABLE':
                return camp.status === 'FAILED';
            case 'RAISING':
                return camp.status === 'RAISING';
            case 'ALL':
                return true;
            default:
                return false;
        }
    });

    const handleCardClick = (campaign: CampaignData, id: string) => {
        router.push(`/campaign-details?id=${id}`);
    };

    return (
        <div className="flex flex-col w-full">
            {/* Welcome Section */}
            <div className="w-full">
                <WelcomeSection />
            </div>

            {/* Dashboard Stats - Static position */}
            <div className="w-full">
                <DashboardStats
                    liveCount={campaigns.filter(camp => camp.status === 'COMPLETED').length}
                    claimableCount={campaigns.filter(camp => camp.status === 'FAILED').length}
                    raisingCount={campaigns.filter(camp => camp.status === 'RAISING').length}
                    allCount={campaigns.length}
                    selectedTab={selectedTab}
                    onTabChange={(tab: string) => {
                        if (tab === 'LIVE' || tab === 'CLAIMABLE' || tab === 'RAISING' || tab === 'ALL') {
                            setSelectedTab(tab);
                        }
                    }}
                />
            </div>

            {/* Campaign Cards Section */}
            <div className="w-full mx-auto mt-2 px-4 ">
                {loading ? (
                    <div className="relative w-full flex justify-center">
                        <div className="flex items-center gap-3 bg-transparent rounded-lg px-6 py-4"
                            style={{ border: '2px solid transparent', borderImage: 'linear-gradient(to right, #7823E7, #0BA1F8) 1' }}>
                            <Loader2 className="h-10 w-10 animate-spin text-white text-800" />
                            <span className="text-2xl font-semibold text-white text-800">
                                Loading campaigns...
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="relative grid grid-cols-1 lg:grid-cols-3 sm:grid-cols-2 gap-4 py-8 w-full rounded"
                    style={{ background: 'linear-gradient(180deg, #090C2F 0%, rgba(19, 22, 52, 0) 100%)' }}>
                        {filteredCampaigns.map((camp) => (
                            <div key={camp.id} 
                                className={styles['card']} 
                                onClick={() => handleCardClick(camp, camp.id)} 
                                style={{ cursor: 'pointer' }}>
                                <div className="flex flex-col sm:flex-row items-start overflow-hidden">
                                    {camp.status === 'COMPLETED' ? (
                                        <>
                                            {camp.image && (
                                                <img
                                                    src={camp.image || '/unknown.svg'}
                                                    alt={`${camp.name} Token`}
                                                    className="w-32 h-32 sm:w-24 sm:h-24 mr-0 sm:mr-4 mb-4 sm:mb-0 object-cover rounded"
                                                />
                                            )}
                                    
                                            {/* Campaign Information */}
                                            <div className="flex-1 min-w-0 mt-4 sm:mt-0 sm:ml-4">
                                                <p className="text-lg font-bold truncate">
                                                    {camp.name} ({camp.symbol})
                                                </p>
                                                <p className="text-sm mt-1 text-[#AE94F3] text-600 overflow-hidden text-ellipsis">
                                                    {camp.description}
                                                </p>
                                                <p className="text-sm text-[#AE94F3] mt-2">
                                                <strong className='text-white'>Trade Deadline:</strong> {new Date(camp.tradeDeadline * 1000).toLocaleDateString()}
                                                </p>
                                                <div className="text-sm mt-1 flex items-center truncate overflow-hidden overflow-ellipsis">
                                                    <strong className="flex-shrink-0 whitespace-nowrap">Mint Address:&nbsp;</strong>
                                                    <span className="truncate text-[#AE94F3]">
                                                        {camp.mint?.slice(0, 12)}...
                                                    </span>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {camp.image && (
                                            <img
                                                src={camp.image || '/unknown.svg'}
                                                alt={`${camp.name} Token`}
                                                className="w-32 h-32 sm:w-24 sm:h-24 mr-0 sm:mr-4 mb-4 sm:mb-0 object-cover rounded"
                                            />
                                            )}

                                            {/* Campaign Information */}
                                            <div className="text-center sm:text-left">
                                                <p className="text-lg font-bold truncate">
                                                    {camp.name} ({camp.symbol})
                                                </p>
                                                <p className="text-sm mt-1 text-[#AE94F3] text-600 overflow-hidden text-ellipsis">
                                                    {camp.description}
                                                </p>
                                                <p className="text-sm text-[#AE94F3]">
                                                    <strong className='text-white'>Fund Raised:</strong> {(camp.totalFundRaised / 1e9).toFixed(2)} SOL
                                                </p>
                                                <p className="text-sm text-[#AE94F3]">
                                                    <strong className='text-white'>Donation Goal:</strong> {camp.donationGoal} SOL
                                                </p>
                                                <p className="text-sm text-[#AE94F3]">
                                                    <strong className='text-white'>Deposit Deadline:</strong> {new Date(camp.depositDeadline * 1000).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;