// src/app/all-campaigns/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { BN } from '@coral-xyz/anchor';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import NavigationMenu from '../../components/navigation-menu/NavigationMenu';
import DashboardStats from '../../components/dashboard-stats/DashboardStats';

import styles from './app.module.css';

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
    image?: string;       // Optional: Image URL from metadata
}

const HomePage: React.FC = () => {
    const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedTab, setSelectedTab] = useState<'LIVE' | 'UPCOMING' | 'RAISING' | 'ALL'>('LIVE');

    const router = useRouter();

    const fetchCampaigns = async () => {
        try {
            const response = await fetch('http://localhost:3000/v1/campaign');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Fetch metadata for each campaign to get the image and description
            const campaignsWithMetadata: CampaignData[] = await Promise.all(
                data.data.map(async (camp: CampaignData) => {
                    try {
                        const metadataResponse = await fetch(camp.uri);
                        if (!metadataResponse.ok) {
                            throw new Error(`Failed to fetch metadata for campaign ${camp.id}`);
                        }
                        const metadata = await metadataResponse.json();
                        return {
                            ...camp,
                            description: metadata.description,
                            image: metadata.image,
                        };
                    } catch (metadataError) {
                        console.error(metadataError);
                        // Fallback to a placeholder image if metadata fetch fails
                        return {
                            ...camp,
                            description: 'No description available.',
                            image: '/path/to/placeholder.png', // Replace with your placeholder image path
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
        const now = Math.floor(Date.now() / 1000);
        const depositPassed = camp.depositDeadline >= now;
        const tradePassed = camp.tradeDeadline >= now;
        const reachedGoal = (camp.totalFundRaised / 1e9) >= camp.donationGoal;
        // const hasFunds = camp.totalFundRaised > 0;
      
        if (selectedTab === 'LIVE')    return (reachedGoal && tradePassed);
        if (selectedTab === 'UPCOMING')return ((reachedGoal && !tradePassed) || (!reachedGoal && depositPassed && !tradePassed));
        if (selectedTab === 'RAISING') return (!reachedGoal && !depositPassed);
        return true; // ALL
    });

    const handleCardClick = (campaign: CampaignData, id: string) => {
        router.push(`/campaign-details?id=${id}`);
    };

    if (loading) {
        return (
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-white rounded-lg px-6 py-4">
                <Loader2 className="h-10 w-10 animate-spin text-gray-800" />
                <span className="text-2xl font-semibold text-gray-800">
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
                            liveCount={visibleCampaigns.filter((camp) => {
                                const now = Math.floor(Date.now() / 1000);
                                const tradePassed = camp.tradeDeadline >= now;
                                const reachedGoal = (camp.totalFundRaised / 1e9) >= camp.donationGoal;
                                return (reachedGoal && tradePassed); // LIVE
                            }).length}
                            upcomingCount={visibleCampaigns.filter((camp) => {
                                const now = Math.floor(Date.now() / 1000);
                                const depositPassed = camp.depositDeadline >= now;
                                const tradePassed = camp.tradeDeadline >= now;
                                const reachedGoal = (camp.totalFundRaised / 1e9) >= camp.donationGoal;
                                return ((reachedGoal && !tradePassed) || (!reachedGoal && depositPassed && !tradePassed)); // UPCOMING
                            }).length}
                            raisingCount={visibleCampaigns.filter((camp) => {
                                const now = Math.floor(Date.now() / 1000);
                                const depositPassed = camp.depositDeadline >= now;
                                const reachedGoal = (camp.totalFundRaised / 1e9) >= camp.donationGoal;
                                return (!reachedGoal && !depositPassed); // RAISING
                            }).length}
                            allCount={visibleCampaigns.length}
                            selectedTab={selectedTab}
                            onTabChange={setSelectedTab}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 bg-slate-800 gap-4 py-8 w-full max-w-full px-4 rounded">
                    {filteredCampaigns.map((camp) => (
                            <div
                                key={camp.id}
                                className={styles['card']}
                                onClick={() => handleCardClick(camp, camp.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="flex items-center">
                                    {/* Token Image */}
                                    <div className="w-16 h-16 mr-4">
                                        <img
                                            src={camp.image || '/path/to/placeholder.png'} // Use the fetched image or a placeholder
                                            alt={`${camp.name} Token`}
                                            className="w-full h-full object-cover rounded"
                                        />
                                    </div>

                                    {/* Campaign Information */}
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            {camp.name}
                                        </h3>
                                        <p className="text-sm">
                                            <strong>Token Symbol:</strong> {camp.symbol}
                                        </p>
                                        <p className="text-sm">
                                            <strong>Donation Goal:</strong> {camp.donationGoal} SOL
                                        </p>
                                        <p className="text-sm">
                                            <strong>Fund Raised:</strong>{' '}
                                            {(camp.totalFundRaised / 1e9).toFixed(2)} SOL
                                        </p>
                                        {camp.description && (
                                            <p className="text-sm mt-2">
                                                {camp.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;