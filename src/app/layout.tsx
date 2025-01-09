'use client';
import localFont from "next/font/local";
import "@/app/globals.css";
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter, TrustWalletAdapter } from '@solana/wallet-adapter-wallets';
// import { WalletProviderWrapper } from '../context/WalletContext';
import { clusterApiUrl } from '@solana/web3.js';
import React, { useMemo } from 'react';
import { BalanceDisplay } from '@/components/get-balance/GetBalance';
import { WalletModalProvider, WalletMultiButton, WalletDisconnectButton } from "@solana/wallet-adapter-react-ui";

import '@solana/wallet-adapter-react-ui/styles.css';
import PrePumpfun from "@/components/pre-pump-logo/PrePumpfun";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter(), new TrustWalletAdapter()], []);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect={true}>
            <WalletModalProvider>
              <main className="relative min-h-screen min-w-full ">
                <nav className="w-full flex justify-center items-center py-8">
                  <div className="flex-1 flex justify-center scale-75 sm:scale-100">
                    <PrePumpfun />
                  </div>
                  <div className="absolute top-4 right-4 flex flex-col items-end z-[100] break-words scale-50 sm:scale-90 origin-top-right">
                    <WalletMultiButton className="!px-4 !py-2 text-md" />
                    <WalletDisconnectButton className="!px-4 !py-2 text-md" />
                    <div className="scale-95">
                      <BalanceDisplay />
                    </div>
                  </div>
                </nav>
                <div className="flex-1 z-50 mt-4">{children}</div>
              </main>
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </body>
    </html>
  );
}
