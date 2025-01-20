'use client';

import React, { useEffect, useState } from 'react';
import { BiSolidToTop } from "react-icons/bi";

const BackToTop: React.FC = () => {
  const [backToTopVisible, setBackToTopVisible] = useState(false);

  useEffect(() => {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        setBackToTopVisible(true);
      } else {
        setBackToTopVisible(false);
      }
    });
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className='App'>
        {backToTopVisible && (
        <button
              className={` 
                        fixed bottom-[30px] right-[10px] h-[50px] w-[50px] 
                        rounded-[25%] text-[40px] text-white border-none
                        cursor-pointer flex items-center justify-center
                        bg-gradient-to-r from-[#7823E7] to-[#0BA1F8] scale-75 sm:scale-100 z-[100]`}
              onClick={scrollToTop}>
                <BiSolidToTop />
        </button>
      )}
    </div>
  );
}

export default BackToTop;