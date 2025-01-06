// src/components/DashboardStats.tsx
import React from 'react';
import styles from './DashboardStats.module.css';

interface DashboardStatsProps {
    liveCount: number;
    claimableCount: number;
    raisingCount: number;
    allCount: number;
    selectedTab: 'LIVE' | 'CLAIMABLE' | 'RAISING' | 'ALL';
    onTabChange: (tab: 'LIVE' | 'CLAIMABLE' | 'RAISING' | 'ALL') => void;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
    liveCount,
    claimableCount,
    raisingCount,
    allCount,
    selectedTab,
    onTabChange,
 }) => {
    // const [selectedTab, setSelectedTab] = useState<'LIVE' | 'UPCOMING' | 'ALL'>('LIVE');
    // const allCount = liveCount + claimableCount + raisingCount;

    // const handleTabClick = (tab: 'LIVE' | 'UPCOMING' | 'ALL') => {
    //     setSelectedTab(tab);
    // }
    return (
        <div className="flex justify-between items-center bg-slate-800 rounded-lg p-2 space-x-5">
            <div className={`${styles['option-container']} ${selectedTab === 'LIVE' ? styles['active'] : ''} cursor-pointer`}
                onClick={() => onTabChange('LIVE')}>
                <div className={`${styles['text-gray-400']} text-lg font-inria`}>
                    <span>LIVE - {liveCount}</span>
                </div>
                {liveCount > 0 && <div className={styles['indicator']}></div>}
            </div>

            <div className={`${styles['option-container']} ${selectedTab === 'CLAIMABLE' ? styles['active'] : ''} cursor-pointer`}
                onClick={() => onTabChange('CLAIMABLE')}>
                <div className={`${styles['text-gray-400']} text-lg font-inria`}>
                    <span>CLAIMABLE - {claimableCount}</span>
                </div>
                {/* {upcomingCount > 0 && <div className={styles['indicator']}></div>} */}
            </div>

            <div className={`${styles['option-container']} ${selectedTab === 'RAISING' ? styles['active'] : ''} cursor-pointer`}
                onClick={() => onTabChange('RAISING')}>
                <div className={`${styles['text-gray-400']} text-lg font-inria`}>
                    <span>RAISING - {raisingCount}</span>
                </div>
                {/* {upcomingCount > 0 && <div className={styles['indicator']}></div>} */}
            </div>

            <div className={`${styles['option-container']} ${selectedTab === 'ALL' ? styles['active'] : ''} cursor-pointer`}
                onClick={() => onTabChange('ALL')}>
                <div className={`${styles['text-gray-400']} text-lg font-inria`}>
                    <span>ALL - {allCount}</span>
                </div>
                {/* {allCount > 0 && <div className={styles['indicator']}></div>} */}
            </div>
        </div>
    );
};

export default DashboardStats;