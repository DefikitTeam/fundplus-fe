/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/all-campaigns/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { BN } from '@coral-xyz/anchor';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import NavigationMenu from '../../components/navigation-menu/NavigationMenu';
import DashboardStats from '../../components/dashboard-stats/DashboardStats';

import styles from './app.module.css';
import Image from 'next/image';

interface CampaignData {
    id: string;
    creator: string;
    campaignIndex: number;
    name: string;
    symbol: string;
    uri: string;
    totalFundRaised: number;
    donationGoal: number;
    depositDeadline: BN;
    tradeDeadline: BN;
    timestamp: number;
    description?: string; // Optional: Description from metadata
    image?: string;  // Optional: Image URL from metadata 
    status: string;    
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
                fetch('http://localhost:3000/v1/campaign'),
                fetch('http://localhost:3000/v1/campaign/status')
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
                        const metadata = await metadataResponse.json();
                        
                        // Get status for this campaign
                        const status = statusMap.get(`${camp.creator}-${camp.campaignIndex}`) || 'UNKNOWN';
    
                        return {
                            ...camp,
                            description: metadata.description || 'No description available.',
                            image: metadata.image || '/path/to/placeholder.png',
                            status: status
                        };
                    } catch (metadataError) {
                        console.error(metadataError);
                        return {
                            ...camp,
                            description: 'No description available.',
                            image: '/path/to/placeholder.png',
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

    const visibleCampaigns = campaigns.filter((camp) => camp.totalFundRaised > 0);

    const filteredCampaigns = visibleCampaigns.filter((camp) => {
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

    if (loading) {
        return (
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-transparent rounded-lg px-6 py-4"
            style={{ border: '2px solid transparent', borderImage: 'linear-gradient(to right, #7823E7, #0BA1F8) 1' }}>
                <Loader2 className="h-10 w-10 animate-spin text-white text-800" />
                <span className="text-2xl font-semibold text-white text-800">
                Loading campaigns...
                </span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2">
                <span className="text-2xl font-semibold text-red-600">{error}</span>
            </div>
        );
    }

    return (
        <div className={`min-h-screen min-w-full`}>
            <div className={`${styles['app-container']} flex flex-col items-center min-h-screen min-w-full py-8 px-16 relative z-0`}>

                <nav className="sticky top-0 z-10 mb-8 w-full max-w-2xl">
                    <NavigationMenu />
                </nav>

                <div className="flex flex-col w-full min-h-screen">
                    <div className="mb-8 w-full max-w-3xl mx-auto">
                        <DashboardStats
                            liveCount={visibleCampaigns.filter(camp => camp.status === 'COMPLETED').length}
                            claimableCount={visibleCampaigns.filter(camp => camp.status === 'FAILED').length}
                            raisingCount={visibleCampaigns.filter(camp => camp.status === 'RAISING').length}
                            allCount={visibleCampaigns.length}
                            selectedTab={selectedTab}
                            onTabChange={setSelectedTab}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 bg-slate-800 gap-4 py-8 w-full max-w-full px-4 rounded">
                        {filteredCampaigns.map((camp) => {
                        return (    
                        <div key={camp.id} className={styles['card']} onClick={() => handleCardClick(camp, camp.id)} style={{ cursor: 'pointer' }}>

                            <div className="flex flex-col sm:flex-row items-start">
                                {/* Token Image */}
                                {camp.image && (
                                <Image
                                    src={camp.image || '/path/to/placeholder.png'}
                                    alt={`${camp.name} Token`}
                                    className="w-40 h-40 sm:w-32 sm:h-32 mr-0 sm:mr-4 mb-4 sm:mb-0 object-cover rounded"
                                />
                                )}

                                {/* Campaign Information */}
                                <div className="text-center sm:text-left">
                                    <p className="text-sm">
                                        <strong>Fund Raised:</strong> {(camp.totalFundRaised / 1e9).toFixed(2)} SOL
                                    </p>
                                    <p className="text-sm">
                                        <strong>Donation Goal:</strong> {camp.donationGoal} SOL
                                    </p>
                                    <p className="text-sm">
                                        <strong>Deposit Deadline:</strong> {new Date(camp.depositDeadline * 1000).toLocaleDateString()}
                                    </p>
                                    <p className="text-lg font-bold">
                                        {camp.name} ({camp.symbol}): <span className='font-normal text-sm'>{camp.description}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        );
                        })}

                        
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;