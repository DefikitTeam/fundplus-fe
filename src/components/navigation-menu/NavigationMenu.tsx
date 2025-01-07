// src/components/navigation-menu/NavigationMenu.tsx
import React, { useState } from 'react';
import Link from 'next/link';
import styles from './NavigationMenu.module.css';
import HowItWorksModal from '../modals/HowItWorksModal';
import Image from 'next/image';

const NavigationMenu: React.FC = () => {
    const [activeLink, setActiveLink] = useState<string>('home');
    const [isHowItWorksModalOpen, setIsHowItWorksModalOpen] = useState<boolean>(false);
    const [isHowItWorksModalClosing, setIsHowItWorksModalClosing] = useState<boolean>(false);

    const openHowItWorksModal = () => {
        setIsHowItWorksModalOpen(true);
    };

    const closeHowItWorksModal = () => {
        setIsHowItWorksModalClosing(true);
        setTimeout(() => {
            setIsHowItWorksModalClosing(false);
            setIsHowItWorksModalOpen(false);
            setActiveLink('');
        }, 300); // Duration should match the CSS animation duration
    };

    const handleHowItWorksClick = () => {
        setActiveLink('how-it-works');
        openHowItWorksModal();
    }

    const handleTelegramClick = () => {
        setActiveLink('telegram');
        window.open('https://wheelofnames.com/', '_blank');
        setActiveLink('');
    };

    return (
        <nav className="flex justify-between items-center w-full" role="navigation" aria-label="Main navigation">
            <div className="flex items-center">
                <Image
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/8a86a4353d32cfb1db8f4b1cb1999f050dd0c20b0f28e78caadc47fa47cd0834?placeholderIfAbsent=true&apiKey=eab818b3eb2a4948adf5e95f36413932"
                    width={6}
                    height={6}
                    className="h-6 w-6" /* Reduce image size to half */
                    alt="Telegram icon"
                />
                <Link href="/" legacyBehavior>
                    <a
                        className={`${styles['nav-link']} text-center ${activeLink === 'telegram' ? styles['active'] : ''}`}
                        onClick={handleTelegramClick}
                        aria-label="Join on Telegram"
                    >
                        JOIN ON TELEGRAM
                    </a>
                </Link>
            </div>
            <a
                className={`${styles['nav-link']} text-center ${activeLink === 'how-it-works' ? styles['active'] : ''}`}
                onClick={handleHowItWorksClick}
                aria-label="How it works"
                style={{ cursor: 'pointer' }}
            >
                HOW IT WORKS?
            </a>
            <HowItWorksModal
                isOpen={isHowItWorksModalOpen}
                isClosing={isHowItWorksModalClosing}
                onClose={closeHowItWorksModal}
            />
            <Link href="/create-campaign" className="relative group">
                <span className={`${styles['nav-link']} text-center ${activeLink === 'create-campaign' ? styles['active'] : ''}`}>CREATE NEW CAMPAIGN</span>
                <div className="invisible group-hover:visible text-center absolute z-10 w-64 px-4 py-2 mb-2 text-sm text-white bg-gray-900 rounded-md shadow-lg -right-2 bottom-full transform -translate-x-1/2 left-1/2">
                    <div className="absolute -bottom-1 left-1/2 right-3 w-2 h-2 bg-gray-900 transform rotate-45 -translate-x-1/2" />
                    Create a Fund Raising Campaign for your Token Creation
                </div>
            </Link>
            <Link href="/all-campaigns" className="relative group">
                <span className={`${styles['nav-link']} text-center ${activeLink === 'my-campaigns' ? styles['active'] : ''}`}>MY CAMPAIGN</span>
                <div className="invisible group-hover:visible text-center absolute z-10 w-64 px-4 py-2 mb-2 text-sm text-white bg-gray-900 rounded-md shadow-lg -right-2 bottom-full transform -translate-x-1/2 left-1/2">
                    <div className="absolute -bottom-1 left-1/2 right-3 w-2 h-2 bg-gray-900 transform rotate-45 -translate-x-1/2" />
                    Your Created Campaigns
                </div>
            </Link>
        </nav>
    );
};

export default NavigationMenu;