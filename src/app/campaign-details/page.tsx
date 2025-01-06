/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { BN } from '@coral-xyz/anchor';
import { Loader2 } from 'lucide-react';
import {useRouter} from "next/navigation";
import donateFund from '@/scripts/donate';
import Image from 'next/image';
// import { set } from '@metaplex-foundation/umi/serializers';
// import type { CampaignData } from '@/types';

interface CampaignData {
    id: string;
    creator: string;
    name: string;
    symbol: string;
    depositDeadline: BN;
    tradeDeadline: BN;
    totalFundRaised: number;
    donationGoal: number;
    uri: string;
    description?: string;
    image?: string;
    campaignIndex: number;
    bnIndex: BN;
}

// Create a separate component for the campaign content
const CampaignContent = () => {
    const searchParams = useSearchParams();
    const campaignId = searchParams?.get('id');
    const walletContextState = useWallet();
    const { publicKey } = walletContextState;

    const [campaign, setCampaign] = useState<CampaignData | null>(null);
    const [loading, setLoading] = useState(true);

    const [claiming, setClaiming] = useState(false);
    const [claimError, setClaimError] = useState<string | null>(null);
    const [claimSuccess, setClaimSuccess] = useState<string | null>(null);
    const [canClaim, setCanClaim] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [isCreator, setIsCreator] = useState(false);

    const [donating, setDonating] = useState(false);
    const [donateError, setDonateError] = useState<string | null>(null);
    const [donateSuccess, setDonateSuccess] = useState<string | null>(null);
    const [canDonate, setCanDonate] = useState(false);
    const [showDonatePopup, setShowDonatePopup] = useState(false);
    const [donationAmount, setDonationAmount] = useState<number>(0.1);
    const [showDonateAmountPopup, setShowDonateAmountPopup] = useState(false);

    const [isClosing, setIsClosing] = useState(false);
    const [donatePopupError, setDonatePopupError] = useState<string | null>(null);

    const router = useRouter();

    const handleDonateFundClick = () => {
        setShowDonateAmountPopup(true);
    };

    const handleConfirmDonate = async () => {
        if (!campaign) return;

        if (donationAmount < 0.1) {
            setDonatePopupError("Donation amount must be at least 0.1 SOL");
            return;
        }

        if (donationAmount <= 0) {
            setDonatePopupError("Please enter a valid amount.");
            return;
        }
    
        setShowDonateAmountPopup(false);
        setDonating(true);
        setDonateError(null);
        setDonateSuccess(null);
    
        try {
            const txSignature = await donateFund(walletContextState, new BN(campaign.campaignIndex), donationAmount, campaign.creator);
            setDonateSuccess(`Transaction successful: ${txSignature}`);
            setShowDonatePopup(true);
        } catch (err: any) {
            console.error(err);
            if (err.message.includes("CampaignDepositDeadlineNotPassed")) {
                setDonateError("Cannot donate funds yet - deposit deadline has not passed");
            } else if (err.message.includes("CampaignTradeDeadlinePassed")) {
                setDonateError("Cannot donate funds anymore - trade deadline has passed");
            } else {
                setDonateError(`Failed to donate funds: ${err.message}`);
            }
        } finally {
            setDonating(false);
        }
    };

    const handleClaimFund = async () => {
        if (!campaign) return;
        if (!campaign.campaignIndex) {
            setClaimError("Campaign index is not defined");
            return;
        }

        setClaiming(true);
        setClaimError(null);
        setClaimSuccess(null);
    
        try {
            if (!canClaim) {
                throw new Error("Campaign deposit deadline has not passed yet");
            }
            
            // const txSignature = await claimFundRaised(walletContextState, new BN(campaign.campaignIndex));
            setClaimSuccess(`Transaction successful`);
            setShowPopup(true);
        } catch (err: any) {
            console.error(err);
            // Handle specific error codes
            if (err.message.includes("CampaignDepositDeadlineNotPassed")) {
                setClaimError("Cannot claim funds yet - deposit deadline has not passed");
            } else if (err.message.includes("CampaignAlreadyClaimed")) {
                setClaimError("Funds have already been claimed for this campaign");
            } else {
                setClaimError(`Failed to claim funds: ${err.message}`);
            }
        } finally {
            setClaiming(false);
        }
    };

    const handleClosePopup = () => {
        setIsClosing(true);
        setTimeout(() => {
            setShowDonatePopup(false);
            router.back();
        }, 15000);
    }

    const handleCloseDonatePopup = () => {
        setIsClosing(true);
        setTimeout(() => {
            setShowDonatePopup(false);
            router.back();
        }, 15000);
    }

    useEffect(() => {
        if (campaign && publicKey) {
            setIsCreator(campaign.creator === publicKey.toString());
        }
    }, [campaign, publicKey]);

    useEffect(() => {
        const fetchCampaignDetails = async () => {
            if (!campaignId) return;
            
            try {
                // Fetch all campaigns from backend API
                const response = await fetch('http://localhost:3000/v1/campaign');
                if (!response.ok) {
                    throw new Error('Failed to fetch campaigns');
                }
                const data = await response.json();
                
                // Find the specific campaign by id
                const campaignData = data.data.find((camp: any) => camp.id === campaignId);
                if (!campaignData) {
                    throw new Error('Campaign not found');
                }
    
                // Fetch metadata from URI
                let metadata = {};
                if (campaignData.uri) {
                    try {
                        const metadataResponse = await fetch(campaignData.uri);
                        if (metadataResponse.ok) {
                            metadata = await metadataResponse.json();
                        }
                    } catch (error) {
                        console.error('Error fetching metadata:', error);
                    }
                }
    
                // Convert timestamp fields to BN objects for compatibility
                setCampaign({
                    ...campaignData,
                    depositDeadline: new BN(campaignData.depositDeadline),
                    tradeDeadline: new BN(campaignData.tradeDeadline),
                    description: (metadata as any).description || '',
                    image: (metadata as any).image || '',
                });
            } catch (error) {
                console.error('Error fetching campaign:', error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchCampaignDetails();
    }, [campaignId]);

    useEffect(() => {
        if (campaign) {
            const currentTimestamp = Math.floor(Date.now() / 1000);
            const hasDepositPassed = campaign.depositDeadline.toNumber() < currentTimestamp;
            const donationReached = Number((campaign.totalFundRaised / 1e9).toFixed(2)) >= campaign.donationGoal;
            setCanClaim(hasDepositPassed && !donationReached);
            // setCanClaim(hasDepositPassed);
            setCanDonate(!hasDepositPassed);
        }
    }, [campaign]);

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
    if (!campaign) {
      return (
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-white rounded-lg px-6 py-4">
          <span className="text-2xl font-semibold text-gray-800">
            Cannot find Campaign
          </span>
        </div>
      )
    };

    return (
      <div className="flex justify-center items-start min-h-screen pt-10 pb-8">
        <div className="w-full max-w-4xl mx-auto">
            <div className="bg-slate-800 rounded-xl p-8">
                <div className="bg-transparent rounded-lg shadow-lg p-8" style={{ border: '2px solid transparent', borderImage: 'linear-gradient(to right, #7823E7, #0BA1F8) 1' }}>
                    <h1 className="text-3xl font-bold text-center mb-8 text-white text-800">
                        Campaign Details
                    </h1>
        
                    <div className="grid gap-6">
                        {/* Basic Information */}
                        <div className="border-b pb-6">
                            <h2 className="text-2xl font-semibold mb-4 text-white text-700">
                                {campaign.name}
                            </h2>
                            <p className="text-lg mb-2">
                                <span className="font-medium text-white text-600">Token Symbol: </span>
                                <span className=" text-white text-800">{campaign.symbol}</span>
                            </p>
                        </div>
        
                        {/* Funding Information */}
                        <div className="border-b pb-6">
                            <h3 className="text-xl font-semibold mb-4 text-white text-700">Funding Status</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-slate-800 p-4" style={{ border: '2px solid transparent', borderImage: 'linear-gradient(to right, #7823E7, #0BA1F8) 1', borderRadius: '1rem' }}>
                                    <p className="text-white text-600">Total Fund Raised</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {(campaign.totalFundRaised / 1e9).toFixed(2)} SOL
                                    </p>
                                </div>
                                <div className="bg-slate-800 p-4" style={{ border: '2px solid transparent', borderImage: 'linear-gradient(to right, #7823E7, #0BA1F8) 1', borderRadius: '1rem' }}>                                    
                                    <p className="text-white text-600">Donation Goal</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {campaign.donationGoal.toFixed(2)} SOL
                                    </p>
                                </div>
                            </div>
                        </div>
        
                        {/* Deadlines */}
                        <div className="border-b pb-6">
                            <h3 className="text-xl font-semibold mb-4 text-white text-700">Important Dates</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-slate-800 p-4" style={{ border: '2px solid transparent', borderImage: 'linear-gradient(to right, #7823E7, #0BA1F8) 1', borderRadius: '1rem' }}>                                    
                                    <p className="text-white text-600">Deposit Deadline</p>
                                    <p className="text-lg text-white font-semibold">
                                        {new Date(campaign.depositDeadline.toNumber() * 1000).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="bg-slate-800 p-4" style={{ border: '2px solid transparent', borderImage: 'linear-gradient(to right, #7823E7, #0BA1F8) 1', borderRadius: '1rem' }}>                                    
                                    <p className="text-white text-600">Trade Deadline</p>
                                    <p className="text-lg text-white font-semibold">
                                        {new Date(campaign.tradeDeadline.toNumber() * 1000).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
        
                        {/* Additional Information */}
                        {campaign.description && (
                            <div className="border-b pb-6">
                                <h3 className="text-xl font-semibold mb-4 text-white text-700">Description</h3>
                                <p className="text-white text-800 whitespace-pre-wrap">{campaign.description}</p>
                            </div>
                        )}
        
                        {/* Token Image */}
                        {campaign.image && (
                            <div className="mt-6">
                                <h3 className="text-xl font-semibold mb-4 text-white text-700">Token Image</h3>
                                <div className="w-48 h-48 rounded-lg overflow-hidden">
                                    <Image
                                        src={campaign.image}
                                        alt="Token"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        )}
                    <div className="flex justify-center items-center w-full">
                     <div className="relative inline-block group">
                       {isCreator && (
                            <button
                                onClick={handleClaimFund}
                                disabled={claiming || !canClaim}
                                className={`font-bold py-2 px-4 rounded ${
                                    canClaim
                                      ? 'bg-green-500 hover:bg-green-700 text-white cursor-pointer'
                                      : 'bg-gray-400 text-gray-700 cursor-not-allowed'
                                }`}
                            >
                                {claiming ? 'Claiming...' : 'Claim Funds'}
                            </button>
                        )}
                       {!canClaim && (
                         <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg whitespace-nowrap">
                           You can only Claim Funds after the Deposit Deadline has passed but before the Trade Deadline
                           <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-2 border-4 border-transparent border-t-gray-900"></div>
                         </div>
                       )}
                     </div>
                    </div>
                   {claimError && (
                    <p className="mt-2 text-red-500">{claimError}</p>
                    )}
                    {claimSuccess && (
                        <p className="mt-2 text-green-500">{claimSuccess}</p>
                    )}
                    <div className="flex justify-center items-center w-full">
                        <div className="relative inline-block group">
                            {!isCreator && (
                                <button
                                    onClick={handleDonateFundClick}
                                    className={`font-bold py-2 px-4 rounded ${
                                        canDonate
                                        ? 'bg-green-500 hover:bg-green-700 text-white cursor-pointer'
                                        : 'bg-gray-400 text-gray-700 cursor-not-allowed'
                                    }`}
                                    disabled={!canDonate || donating}
                                >
                                    {donating ? 'Donating...' : canDonate ? 'Donate Funds': 'Donate Funds'}
                                </button>
                            )}
                        {!canDonate && (
                            <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg whitespace-nowrap">
                                You can only Donate Funds before the Deposit Deadline
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-2 border-4 border-transparent border-t-gray-900"></div>
                            </div>
                        )}
                        </div>
                   </div>
                   {donateError && (
                    <p className="mt-2 text-red-500">{donateError}</p>
                    )}
                    {donateSuccess && (
                        <p className="mt-2 text-green-500">{donateSuccess}</p>
                    )}       
                    </div>
                </div>
            </div>
        </div>

          {showPopup && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg">
                      <h2 className="text-2xl font-bold mb-4">Claim Successful</h2>
                      {isClosing ? (
                            <div className="flex items-center gap-3 mb-4">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <p>Please wait a moment...</p>
                            </div>
                        ) : (
                            <p className="mb-4">{donateSuccess}</p>
                        )}
                      <button
                          onClick={handleClosePopup}
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                          disabled={isClosing}
                      >
                          OK
                      </button>
                  </div>
              </div>
          )}

            {showDonatePopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold mb-4">Donation Successful</h2>
                        {isClosing ? (
                            <div className="flex items-center gap-3 mb-4">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <p>Please wait a moment...</p>
                            </div>
                        ) : (
                            <p className="mb-4">{donateSuccess}</p>
                        )}
                        <button
                            onClick={handleCloseDonatePopup}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            disabled={isClosing}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}

            {showDonateAmountPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-bold mb-4">Donate SOL</h2>
                        <p className="mb-4">Enter the amount of SOL you want to donate (Minimal 0,1 SOL):</p>
                        <input
                            type="number"
                            min="0.1"
                            // step="0.1"
                            value={donationAmount}
                            onChange={(e) => setDonationAmount(parseFloat(e.target.value))}
                            className="w-full p-2 border rounded mb-4"
                            placeholder="Enter SOL amount"
                        />
                        {donatePopupError && (
                            <p className="text-red-500 text-sm mb-4">{donatePopupError}</p>
                        )}
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowDonateAmountPopup(false)}
                                className="mr-2 px-4 py-2 bg-gray-300 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDonate}
                                className="px-4 py-2 bg-green-500 text-white rounded"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
    </div>
    );
};

// Main page component with Suspense
const CampaignDetailsPage = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CampaignContent />
        </Suspense>
    );
};

export default CampaignDetailsPage;