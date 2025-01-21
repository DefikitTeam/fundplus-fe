import React, { useState } from 'react';
import Link from 'next/link';
import styles from './FormNav.module.css';
import HowItWorksModal from '../modals/HowItWorksModal';
import { FaSquareXTwitter } from 'react-icons/fa6';

const FormNav: React.FC = () => {
    const [activeLink, setActiveLink] = useState<string>('');
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
        }, 300);
    };

    const handleHowItWorksClick = () => {
        setActiveLink('how-it-works');
        openHowItWorksModal();
    }

    const handleTwitterClick = () => {
        setActiveLink('twitter');
        window.open('https://x.com/FundPlusDotOrg', '_blank');
        setActiveLink('');
    };

    return (
        <>
        <div className="navbar">
            <div className="navbar-start sm:hidden">
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost sm:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                        </svg>
                    </div>
                    <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
                        <li>
                            <div className='relative group'>
                                <FaSquareXTwitter size={20} />
                                <a className={`${styles['nav-link']} text-center`} onClick={handleTwitterClick}>
                                    VISIT OUR SOCIAL MEDIA
                                </a>
                            </div>
                        </li>
                        <li>
                            <div className='relative group'>
                                <a className={`${styles['nav-link']} text-center`} onClick={handleHowItWorksClick}>
                                    HOW IT WORKS?
                                </a>
                            </div>
                        </li>
                        <li>
                          <Link href="/my-campaigns" className="relative group">
                              <span className={`${styles['nav-link']} text-center ${activeLink === 'my-campaigns' ? styles['active'] : ''}`}>
                                  MY CAMPAIGN
                              </span>
                              <div className="invisible group-hover:visible text-center absolute z-10 w-64 px-4 py-2 mb-2 text-sm text-white bg-gray-900 rounded-md shadow-lg -right-2 bottom-full transform -translate-x-1/2 left-1/2">
                                  <div className="absolute -bottom-1 left-1/2 right-3 w-2 h-2 bg-gray-900 transform rotate-45 -translate-x-1/2" />
                                  Your Created Campaigns
                              </div>
                          </Link>
                      </li>
                    </ul>
                </div>
            </div>
            <div className="navbar-center hidden sm:block">
                <ul className="menu menu-horizontal px-1">
                    <li>
                        <div className='relative group'>
                            <FaSquareXTwitter color='white' size={20} />
                            <a className={`${styles['nav-link']} text-center`} onClick={handleTwitterClick}>
                                VISIT OUR SOCIAL MEDIA
                            </a>
                        </div>
                    </li>
                    <li>
                        <div className='relative group'>
                            <a className={`${styles['nav-link']} text-center`} onClick={handleHowItWorksClick}>
                                HOW IT WORKS?
                            </a>
                        </div>
                    </li>
                    <li>
                      <Link href="/my-campaigns" className="relative group">
                          <span className={`${styles['nav-link']} text-center ${activeLink === 'my-campaigns' ? styles['active'] : ''}`}>
                              MY CAMPAIGN
                          </span>
                          <div className="invisible group-hover:visible text-center absolute z-10 w-64 px-4 py-2 mb-2 text-sm text-white bg-gray-900 rounded-md shadow-lg -right-2 bottom-full transform -translate-x-1/2 left-1/2">
                              <div className="absolute -bottom-1 left-1/2 right-3 w-2 h-2 bg-gray-900 transform rotate-45 -translate-x-1/2" />
                              Your Created Campaigns
                          </div>
                      </Link>
                  </li>
                </ul>
            </div>
        </div>
        <HowItWorksModal
            isOpen={isHowItWorksModalOpen}
            isClosing={isHowItWorksModalClosing}
            onClose={closeHowItWorksModal}
        />
        </>
    );
};

export default FormNav;