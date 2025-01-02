// /* eslint-disable @typescript-eslint/no-require-imports */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// 'use client';

// import React, { useEffect, useState } from 'react';
// import { useWallet } from '@solana/wallet-adapter-react';
// import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
// import { BN, AnchorProvider, Program } from '@coral-xyz/anchor';
// import { Loader2 } from 'lucide-react';

// import createCampaign from '@/scripts/create-campaign'; 
// import getCampaign from '@/scripts/get-campaign'; 
// import { AdapterWallet } from '@/scripts/create-campaign';  // Reuse existing wallet adapter
// import { PrePump } from '@/scripts/idl/pre_pump';
// import claimFundRaised from '@/scripts/claim-fund-raised';

// import styles from './CampaignDetails.module.css';

// interface CampaignData {
//   name: string;
//   symbol: string;
//   depositDeadline: BN;
//   tradeDeadline: BN;
//   totalFundRaised: number;
//   donationGoal: number;
//   uri: string;
//   description?: string;
//   image?: string;
// }

// const CampaignDetails: React.FC = () => {
//   // const { connected, wallet, publicKey } = useWallet();
//   const walletContextState = useWallet();
//   const { connected, publicKey, wallet } = walletContextState;
//   const [campaigns, setCampaigns] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const [selectedCampaign, setSelectedCampaign] = useState<CampaignData | null>(null);
//   const [showPopup, setShowPopup] = useState(false);
//   const [claiming, setClaiming] = useState(false);
//   const [claimError, setClaimError] = useState<string | null>(null);
//   const [claimSuccess, setClaimSuccess] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchCampaigns = async () => {
//       if (!connected || !wallet?.adapter || !publicKey) return;
//       setLoading(true);

//       try {
//         // --------------------------------------
//         // 1. Reuse logic from create-campaign.ts to set up the Anchor Program
//         // --------------------------------------
//         const devnet = true;
//         const connection = new Connection(clusterApiUrl(devnet ? 'devnet' : 'mainnet-beta'), { commitment: 'confirmed' });
//         const adapterWallet = new AdapterWallet(walletContextState);
//         const provider = new AnchorProvider(connection, adapterWallet, { commitment: 'confirmed' });
//         const IDL: PrePump = require('@/scripts/idl/pre_pump.json');
//         const program = new Program(IDL, provider);

//         // --------------------------------------
//         // 2. Get creator's account to find the lastCampaignIndex
//         // --------------------------------------
//         const [creator] = PublicKey.findProgramAddressSync(
//           [Buffer.from('creator'), publicKey.toBuffer()],
//           program.programId
//         );
//         const creatorAccount: any = await program.account.creator.fetch(creator);
//         const lastCampaignIndex = creatorAccount.lastCampaignIndex.toNumber();

//         // --------------------------------------
//         // 3. Loop through indices, fetching individual campaigns with getCampaign
//         // --------------------------------------
//         const fetchedCampaigns: CampaignData[] = [];
//         for (let index = 0; index <= lastCampaignIndex; index++) {
//           try {
//             const campaignData = await getCampaign(walletContextState, index);

//             let metadata = {};
//             if (campaignData.uri) {
//               try {
//                 const response = await fetch(campaignData.uri);
//                 if (response.ok) {
//                   metadata = await response.json();
//                   } else {
//                     console.warn(`Failed to fetch metadata for index ${index}`);
//                   } 
//                 } catch (metaErr) {
//                     console.warn(`Error fetching metadata for campaign index ${index}: ${metaErr}`);
//                 }
//               }

//               fetchedCampaigns.push({
//                 name: campaignData.name,
//                 symbol: campaignData.symbol,
//                 depositDeadline: campaignData.depositDeadline,
//                 tradeDeadline: campaignData.tradeDeadline,
//                 totalFundRaised: campaignData.totalFundRaised,
//                 donationGoal: campaignData.donationGoal,
//                 uri: campaignData.uri,
//                 description: metadata.description || '',
//                 image: metadata.image || '',
//               });
//             } catch (e) {
//             console.warn(`Skipping index 4{index} due to error: ${e}`);
//           }
//         }

//         setCampaigns(fetchedCampaigns);
//       } catch (err) {
//         setError('Failed to fetch campaigns');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCampaigns();
//   }, [connected, wallet, publicKey]);

//   // --------------------------------------
//   // Render
//   // --------------------------------------
//   if (!connected) {
//     <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-white rounded-lg px-6 py-4">
//       <span className="text-2xl font-semibold text-gray-800">
//         Please connect your wallet to view campaigns
//       </span>
//     </div>
//   }

//   if (loading) {
//     return (
//       // <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 bg-white rounded">
//       //     <Loader2 className="h-8 w-8 animate-spin text-black-800 mr-4" />
//       //     <span className="px-16 py-4 rounded-2xl font-inria font-semibold text-center text-2xl text-black">Loading campaigns...</span>
//       // </div>
//       <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-white rounded-lg px-6 py-4">
//         <Loader2 className="h-10 w-10 animate-spin text-gray-800" />
//         <span className="text-2xl font-semibold text-gray-800">
//           Loading campaigns...
//         </span>
//       </div>
//     );
//   }

//   if (error) {
//     return <p>{error}</p>;
//   }

//   const handleCardClick = (campaign: any) => {
//     setSelectedCampaign(campaign);
//     setShowPopup(true);
//   }

//   const handleClosePopup = () => {
//     setShowPopup(false);
//     setSelectedCampaign(null);
//   }

//   const handleClaimFund = async () => {
//     if (!selectedCampaign) return;
//     setClaiming(true);
//     setClaimError(null);
//     setClaimSuccess(null);

//     try {
//       const txSignature = await claimFundRaised(walletContextState, new BN(selectedCampaign.donationGoal)); // Adjust the parameter if needed
//       setClaimSuccess(`Transaction successful: ${txSignature}`);
//     } catch (err: any) {
//       console.error(err);
//       setClaimError(`Failed to claim funds: ${err.message}`);
//     } finally {
//       setClaiming(false);
//     }
//   };

//   return (
//     <div className={styles.cardContainer}>
//       <h2 className={styles['heading']}>Campaign Management</h2>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-full">
//       {campaigns.map((campaign, idx) => {
//         return (
//           <div key={idx} className={styles.card} onClick={() => handleCardClick(campaign)} style={{ cursor: 'pointer' }}>
//             <h3><strong>Name: </strong>{campaign.name}</h3>
//             <p><strong>Token Symbol: </strong>{campaign.symbol}</p>
//             <p><strong>Fund Raised: </strong>{(campaign.totalFundRaised / 1e9).toFixed(2)} SOL</p>
//           </div>  
//         );
//       })}

//       {showPopup && selectedCampaign && (
//         <div className={styles['popupOverlay']}>
//           <div className={styles['popupContent']}>
//             <button className={styles['popupClose']} onClick={handleClosePopup}>
//               &times;
//             </button>
//             {(() => {
//               // Convert BN deadlines to date strings
//               const depositDeadlineStr = selectedCampaign.depositDeadline
//                 ? new Date(selectedCampaign.depositDeadline.toNumber() * 1000).toLocaleDateString()
//                 : 'N/A';

//               const tradeDeadlineStr = selectedCampaign.tradeDeadline
//                 ? new Date(selectedCampaign.tradeDeadline.toNumber() * 1000).toLocaleDateString()
//                 : 'N/A';

//               // Convert fund amounts to SOL
//               const totalFundRaisedSOL = selectedCampaign.totalFundRaised
//                 ? (selectedCampaign.totalFundRaised / 1e9).toFixed(2)
//                 : '0.00';

//               const donationGoalSOL = selectedCampaign.donationGoal
//                 ? (selectedCampaign.donationGoal / 1e9).toFixed(2)
//                 : 'N/A';

//               const currentTimestamp = Math.floor(Date.now() / 1000);
//               const hasDepositPassed = selectedCampaign.depositDeadline.toNumber() < currentTimestamp;

//               return (
//                 <div>
//                   <h3><strong>Name:</strong> {selectedCampaign.name}</h3>
//                   <p><strong>Token Symbol:</strong> {selectedCampaign.symbol}</p>
//                   <p><strong>Deposit Deadline:</strong> {depositDeadlineStr}</p>
//                   <p><strong>Trade Deadline:</strong> {tradeDeadlineStr}</p>
//                   <p><strong>Donation Goal:</strong> {donationGoalSOL} SOL</p>
//                   <p><strong>Fund Raised:</strong> {totalFundRaisedSOL} SOL</p>

//                   {/* If a description field is present */}
//                   {selectedCampaign.description && (
//                     <p><strong>Description:</strong> {selectedCampaign.description}</p>
//                   )}

//                   {/* If uri exists and can be used as an image */}
//                   {selectedCampaign.uri && (
//                     <div>
//                       <strong>Token Image:</strong>
//                       <img
//                         src={selectedCampaign.image}
//                         alt="Token Image"
//                         style={{ maxWidth: '25%', borderRadius: '0.25rem' }}
//                       />
//                     </div>
//                   )}

//                   <button
//                     onClick={handleClaimFund}
//                     className={`absolute right-4 top-1/2 transform -translate-y-1/2 font-bold py-2 px-4 rounded ${
//                       hasDepositPassed
//                         ? 'bg-green-500 hover:bg-green-700 text-white cursor-pointer'
//                         : 'bg-gray-400 text-gray-700 cursor-not-allowed'
//                     }`}
//                     disabled={!hasDepositPassed || claiming}
//                   >
//                     {claiming ? 'Claiming...' : 'Claim Fund Raised'}
//                   </button>

//                   {/* Display success or error messages */}
//                   {claimSuccess && <p className="mt-2 text-green-600">{claimSuccess}</p>}
//                   {claimError && <p className="mt-2 text-red-600">{claimError}</p>}
//                 </div>
//               );
//             })()}
//           </div>
//         </div>
//       )}
//       </div>
//     </div>
//   );
// };

// export default CampaignDetails;