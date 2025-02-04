'use client';

import React, { useEffect} from 'react';
import styles from './HowItWorksModal.module.css';
import ReactMarkdown from 'react-markdown';
interface HowItWorksModalProps {
    isOpen: boolean;
    isClosing: boolean;
    onClose: () => void;
}

const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, isClosing, onClose }) => {    // const [showScroll, setShowScroll] = useState(false);

    useEffect(() => {
        const handleEscape = (ev: KeyboardEvent) => {
            if (ev.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    // const checkScrollTop = (element: HTMLDivElement) => {
    //     if (!element) return;
    //     const scrolled = element.scrollTop > 300;
    //     if (showScroll !== scrolled) {
    //         setShowScroll(scrolled);
    //     }
    // };

    if (!isOpen) return null;

    const modalClasses = `${styles.modalContent} ${isClosing ? styles.modalClosing : ''}`;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={modalClasses} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>
                    &times;
                </button>
                <h1 className="text-center text-4xl font-bold mb-6">
                    FundPlus: Fundraising and Token Management System
                </h1>
                <ReactMarkdown className="prose">
{`

## Overview

This project aims to create a multi-step system for fundraising, token creation, and token liquidity management. The system integrates with Pumpfun and Raydium, ensuring seamless transitions between fundraising and market launch.

## System Steps

### Step 1: Fundraising

1. Creators post their fundraising campaign with information similar to token creation on Pumpfun.
2. The program-pre-pumpfun handles this process.
3. **Initial Deposit Requirement:** Creators must deposit at least 1 SOL to initiate the fundraising campaign.
4. **Hardcap Selection:** Creators can set a donation goal (Hardcap) ranging from 10 SOL to 50 SOL.
5. **Donation Time Limit:** Creators select a time frame for fundraising, ranging from 1 day to 2 months.
6. Creators must choose one of the following conditions to proceed to Step 2:
    - Raise a sufficient amount of SOL.
    - Meet a predefined time limit.
7. **Failure Condition:** If neither condition is met, the creator can call the claim function on program-pre-pumpfun.

### Step 2: Token Creation and SOL Management

If the fundraising is successful:
- The system calls program-pre-pumpfun, which:
    - Calls createToken on Pumpfun.
    - Buys the newly created token using the SOL raised.
- Tokens are stored in program-pre-pumpfun and are locked until launched on Raydium.
- **Time Limit:** If tokens are not launched on Raydium within 30 days, the system will sell the tokens and return the SOL to the creator.

### Step 3: Market Cap Achievement and Liquidity Management

Once the token reaches a specific Market Cap (MC) on Pumpfun:
- Pumpfun automatically calls addLiquidity on Raydium.
- Creators can claim tokens based on the MC achieved:
    - MC $500k: Claim 10% of tokens.
    - MC $1M: Claim 30% of tokens.
    - MC $2M: Claim 40% of tokens.
    - MC $5M: Claim 20% of tokens.
- **System Retention:** For every token claim by the creator, the system retains 10% of the claimed tokens in its wallet.

## Technical Components

**Smart Contract (program-pre-pumpfun):** Manages fundraising, token creation, and SOL allocation.
**Integration with Pumpfun:** Utilizes Pumpfun's createToken functionality.
**Raydium Interaction:** Automatically adds liquidity and manages token sales.

## Key Constraints

- Tokens must be launched on Raydium within 30 days of creation.
- Fundraising campaigns must specify clear conditions (SOL target or time limit).
- The system enforces retention of 10% of tokens during creator claims.

## Graphical Illustration

![Creator Flow](/creator_flow.jpg)
`}
                </ReactMarkdown>
            </div>
        </div>
    );
};

export default HowItWorksModal;