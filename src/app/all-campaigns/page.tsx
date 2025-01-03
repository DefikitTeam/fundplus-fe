/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/views/home/index.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import { BN, AnchorProvider, Program } from '@coral-xyz/anchor';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import DashboardStats from '../../components/dashboard-stats/DashboardStats';
import getCampaign from '@/scripts/get-campaign';
import { AdapterWallet } from '@/scripts/create-campaign';
import { PrePump } from '@/scripts/idl/pre_pump';

import styles from './campaigns.module.css';

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

// useEffect(() => {

// })
const AllCampaignsPage = () => {

    const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedTab, setSelectedTab] = useState<'LIVE' | 'UPCOMING' | 'RAISING' | 'ALL'>('LIVE');

    const router = useRouter();
    const walletContextState = useWallet();
    const { connected, publicKey, wallet } = walletContextState;
    console.log(publicKey?.toBase58().toString());

    const fetchMyCampaigns = async () => {
        try {
            const response = await fetch('http://localhost:3000/v1/campaign');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Find creator's campaign
            const mcampaignData = data.data.filter((camp: any) => camp.creator === publicKey?.toBase58());
            if (mcampaignData.length === 0) {
                console.log('fetch failed');
                setCampaigns([]);
                setLoading(false);
                return;
            }

            // Fetch metadata for each campaign to get the image and description
            const campaignsWithMetadata: CampaignData[] = await Promise.all(
                mcampaignData.map(async (camp: CampaignData) => {
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

            setCampaigns(campaignsWithMetadata)
        } catch (err) {
            console.error(err);
            setError('Failed to fetch campaigns');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyCampaigns();
    }, [publicKey]);

    if (!connected) {
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-white rounded-lg px-6 py-4">
          <span className="text-2xl font-semibold text-gray-800">
            Please connect your wallet to view campaigns
          </span>
        </div>
    }
    
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
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-white rounded-lg px-6 py-4">
          <span className="text-2xl font-semibold text-gray-800">
            Failed to fetch campaigns
          </span>
        </div>
    }
    
    const handleCardClick = (campaign: any, id: string) => {
        // setSelectedCampaign(campaign);
        // setShowPopup(true);
        router.push(`/campaign-details?id=${id}`);
    }

    const visibleCampaigns = campaigns.filter((camp) => camp.totalFundRaised > 0);

    const filteredCampaigns = visibleCampaigns.filter((camp) => {
        const now = Math.floor(Date.now() / 1000);
        const depositPassed = camp.depositDeadline <= now;
        const tradePassed = camp.tradeDeadline <= now;
        const reachedGoal = (camp.totalFundRaised / 1e9) >= camp.donationGoal;
      
        if (selectedTab === 'LIVE')    return (reachedGoal && tradePassed);
        if (selectedTab === 'UPCOMING')return ((reachedGoal && !tradePassed) || (!reachedGoal && depositPassed && !tradePassed));
        if (selectedTab === 'RAISING') return (!reachedGoal && !depositPassed);
        return true; // ALL
    });

    return (
        <div className={`min-h-screen min-w-full`}>
            <div className={`${styles['app-container']} flex flex-col items-center min-h-screen min-w-full py-8 px-16 relative z-0`}>

            <nav className="sticky top-0 z-10 mb-8 w-full max-w-xl mx-auto flex items-center justify-center">
                <h3 className="text-2xl font-semibold text-white">Your Campaigns</h3>
            </nav>

                <div className="flex flex-col w-full min-h-screen">
                    <div className="mb-8 w-full max-w-3xl mx-auto">
                        <DashboardStats
                            liveCount={visibleCampaigns.filter((camp) => {
                                const now = Math.floor(Date.now() / 1000);
                                const tradePassed = camp.tradeDeadline <= now;
                                const reachedGoal = (camp.totalFundRaised / 1e9) >= camp.donationGoal;
                                return (reachedGoal && tradePassed); // LIVE
                            }).length}
                            upcomingCount={visibleCampaigns.filter((camp) => {
                                const now = Math.floor(Date.now() / 1000);
                                const depositPassed = camp.depositDeadline <= now;
                                const tradePassed = camp.tradeDeadline <= now;
                                const reachedGoal = (camp.totalFundRaised / 1e9) >= camp.donationGoal;
                                return ((reachedGoal && !tradePassed) || (!reachedGoal && depositPassed && !tradePassed)); // UPCOMING
                            }).length}
                            raisingCount={visibleCampaigns.filter((camp) => {
                                const now = Math.floor(Date.now() / 1000);
                                const depositPassed = camp.depositDeadline <= now;
                                const reachedGoal = (camp.totalFundRaised / 1e9) >= camp.donationGoal;
                                return (!reachedGoal && !depositPassed); // RAISING
                            }).length}
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
                                <img
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

export default AllCampaignsPage;