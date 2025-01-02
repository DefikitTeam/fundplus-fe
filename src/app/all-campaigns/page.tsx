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

import NavigationMenu from '../../components/navigation-menu/NavigationMenu';
import DashboardStats from '../../components/dashboard-stats/DashboardStats';
import MarketStatsCard from '../../components/market-stats-card/MarketStatsCard';
import getCampaign from '@/scripts/get-campaign';
import { AdapterWallet } from '@/scripts/create-campaign';
import { PrePump } from '@/scripts/idl/pre_pump';
import claimFundRaised from '@/scripts/claim-fund-raised';

import styles from './campaigns.module.css';

interface CampaignData {
    name: string;
    symbol: string;
    depositDeadline: BN;
    tradeDeadline: BN;
    totalFundRaised: number;
    donationGoal: number;
    uri: string;
    description?: string;
    image?: string;
    campaignIndex: number; // Add this field
    bnIndex: BN;
    isClaimedFund?: boolean;
}

interface CampaignMetadata {
    description?: string;
    image?: string;
}

const AllCampaignsPage = () => {

    //Constants for campaign data
    const walletContextState = useWallet();
    const { connected, publicKey, wallet } = walletContextState;
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [selectedCampaign, setSelectedCampaign] = useState<CampaignData | null>(null);
    const [showPopup, setShowPopup] = useState(false);
    const [claiming, setClaiming] = useState(false);
    const [claimError, setClaimError] = useState<string | null>(null);
    const [claimSuccess, setClaimSuccess] = useState<string | null>(null);

    const router = useRouter();

    const [selectedTab, setSelectedTab] = useState<'LIVE' | 'UPCOMING' | 'RAISING' | 'ALL'>('LIVE');

    const handleTabChange = (tab: 'LIVE' | 'UPCOMING' | 'RAISING' | 'ALL') => {
        setSelectedTab(tab);
    };

    useEffect(() => {
        if (!connected || !wallet?.adapter || !publicKey) {
            setCampaigns([]);
            setLoading(false);
            return;
        }

        const fetchCampaigns = async () => {
            if (!connected || !wallet?.adapter || !publicKey) return;
            setLoading(true);

            try {
            // --------------------------------------
            // 1. Reuse logic from create-campaign.ts to set up the Anchor Program
            // --------------------------------------
            const devnet = true;
            const connection = new Connection(clusterApiUrl(devnet ? 'devnet' : 'mainnet-beta'), { commitment: 'confirmed' });
            const adapterWallet = new AdapterWallet(walletContextState);
            const provider = new AnchorProvider(connection, adapterWallet, { commitment: 'confirmed' });
            const IDL: PrePump = require('@/scripts/idl/pre_pump.json');
            const program = new Program(IDL, provider);

            // --------------------------------------
            // 2. Get creator's account to find the lastCampaignIndex
            // --------------------------------------
            const [creator] = PublicKey.findProgramAddressSync(
                [Buffer.from('creator'), publicKey.toBuffer()],
                program.programId
            );
            const creatorAccount: any = await program.account.creator.fetch(creator);
            const lastCampaignIndex = creatorAccount.lastCampaignIndex.toNumber();

            // --------------------------------------
            // 3. Loop through indices, fetching individual campaigns with getCampaign
            // --------------------------------------
            const fetchedCampaigns: CampaignData[] = [];
            for (let i = 0; i <= lastCampaignIndex; i++) {
                try {
                    const campaignData = await getCampaign(walletContextState, i);
                    
                    // Skip this campaign if it has been claimed
                    if (campaignData.isClaimedFund) {
                        continue;
                    }

                    let metadata: CampaignMetadata = {};
                    if (campaignData.uri) {
                        try {
                            const response = await fetch(campaignData.uri);
                            if (response.ok) {
                                metadata = await response.json() as CampaignMetadata;
                            } else {
                                console.warn(`Failed to fetch metadata for index ${i}`);
                            }
                        } catch (metaErr) {
                            console.warn(`Error fetching metadata for campaign index ${i}: ${metaErr}`);
                        }
                    }

                    // Only add non-claimed campaigns to the list
                    fetchedCampaigns.push({
                        name: campaignData.name,
                        symbol: campaignData.symbol,
                        depositDeadline: campaignData.depositDeadline,
                        tradeDeadline: campaignData.tradeDeadline,
                        totalFundRaised: campaignData.totalFundRaised,
                        donationGoal: campaignData.donationGoal,
                        uri: campaignData.uri,
                        description: metadata.description || '',
                        image: metadata.image || '',
                        campaignIndex: i,
                        bnIndex: campaignData.index,
                        isClaimedFund: campaignData.isClaimedFund
                    });
                } catch (e) {
                    console.warn(`Skipping index ${i} due to error: ${e}`);
                }
            }

            setCampaigns(fetchedCampaigns);
            } catch (err) {
            setError('Failed to fetch campaigns');
            } finally {
            setLoading(false);
            }
        };

        fetchCampaigns();
    }, [connected, wallet, publicKey]);

    if (!connected) {
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-white rounded-lg px-6 py-4">
          <span className="text-2xl font-semibold text-gray-800">
            Please connect your wallet to view campaigns
          </span>
        </div>
    }
    
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
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-white rounded-lg px-6 py-4">
          <span className="text-2xl font-semibold text-gray-800">
            Failed to fetch campaigns
          </span>
        </div>
    }
    
    const handleCardClick = (campaign: any, index: number) => {
        // setSelectedCampaign(campaign);
        // setShowPopup(true);
        router.push(`/campaign-details?id=${index}`);
    }
    
    const handleClosePopup = () => {
        setShowPopup(false);
        setSelectedCampaign(null);
    };

    const visibleCampaigns = campaigns.filter((camp) => camp.totalFundRaised > 0);

    const filteredCampaigns = visibleCampaigns.filter((camp) => {
        const now = Math.floor(Date.now() / 1000);
        const depositPassed = camp.depositDeadline.toNumber() <= now;
        const tradePassed = camp.tradeDeadline.toNumber() <= now;
        const reachedGoal = camp.totalFundRaised >= camp.donationGoal;
        // const hasFunds = camp.totalFundRaised > 0;
      
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
                                const depositPassed = camp.depositDeadline.toNumber() <= now;
                                const tradePassed = camp.tradeDeadline.toNumber() <= now;
                                const reachedGoal = camp.totalFundRaised >= camp.donationGoal;
                                return (reachedGoal && tradePassed); // LIVE
                            }).length}
                            upcomingCount={visibleCampaigns.filter((camp) => {
                                const now = Math.floor(Date.now() / 1000);
                                const depositPassed = camp.depositDeadline.toNumber() <= now;
                                const tradePassed = camp.tradeDeadline.toNumber() <= now;
                                const reachedGoal = camp.totalFundRaised >= camp.donationGoal;
                                return ((reachedGoal && !tradePassed) || (!reachedGoal && depositPassed && !tradePassed)); // UPCOMING
                            }).length}
                            raisingCount={visibleCampaigns.filter((camp) => {
                                const now = Math.floor(Date.now() / 1000);
                                const depositPassed = camp.depositDeadline.toNumber() <= now;
                                const reachedGoal = camp.totalFundRaised >= camp.donationGoal;
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
                        <div key={camp.campaignIndex} className={styles['card']} onClick={() => handleCardClick(camp, camp.campaignIndex)} style={{ cursor: 'pointer' }}>

                            <div className="flex flex-col sm:flex-row items-start">
                                {/* Token Image */}
                                {camp.image && (
                                <img
                                    src={camp.image}
                                    alt={`${camp.name} Token`}
                                    className="w-40 h-40 sm:w-32 sm:h-32 mr-0 sm:mr-4 mb-4 sm:mb-0 object-cover rounded"
                                />
                                )}

                                {/* Campaign Information */}
                                <div className="text-center sm:text-left">
                                    <p className='text-sm'>
                                        <strong>Created by:</strong> {}
                                    </p>
                                    <p className="text-sm">
                                        <strong>Fund Raised:</strong> {(camp.totalFundRaised / 1e9).toFixed(2)} SOL
                                    </p>
                                    <p className="text-lg font-bold">
                                        {camp.name} ({camp.symbol}): <span className='font-normal text-sm'>{camp.description}</span>
                                    </p>
                                </div>
                            </div>

                            {/* <h3><strong>Name: </strong>{camp.name}</h3>
                            <p><strong>Token Symbol: </strong>{camp.symbol}</p>
                            <p><strong>Fund Raised: </strong>{(camp.totalFundRaised / 1e9).toFixed(2)} SOL</p> */}
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