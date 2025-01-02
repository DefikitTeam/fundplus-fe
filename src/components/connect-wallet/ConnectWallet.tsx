'use client';

import React from 'react';
import {
  WalletMultiButton,
  WalletDisconnectButton,
} from '@solana/wallet-adapter-react-ui';
import styles from './ConnectWallet.module.css';

// Default styles that can be overridden by your app

// eslint-disable-next-line @typescript-eslint/no-require-imports
require('@solana/wallet-adapter-react-ui/styles.css');

const ConnectWallet: React.FC = () => {
  return (
    
      <div className={styles['wallet-container']}>
        <WalletMultiButton />
        <WalletDisconnectButton />
      </div>
  );
};


export default ConnectWallet;