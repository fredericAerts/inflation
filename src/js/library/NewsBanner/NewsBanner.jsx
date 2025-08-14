import { useState, useEffect } from 'react';

import './news-banner.styl';

const NEWS_ITEMS = [
  'Federal Reserve signals potential rate cuts amid inflation concerns',
  'European Central Bank maintains aggressive monetary policy stance',
  'Global inflation rates show mixed signals across major economies',
  'Bitcoin volatility reaches new highs as institutional adoption grows',
  'Gold prices surge as investors seek inflation hedges',
  'Consumer price index data reveals persistent inflationary pressures',
  'Central banks worldwide coordinate response to rising costs',
  'Housing markets face affordability crisis due to monetary expansion',
];

function NewsBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % NEWS_ITEMS.length);
        
        setTimeout(() => {
          setIsAnimating(false);
        }, 100);
      }, 400);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="news-banner">
      <div className="news-banner__container">
        <div className="news-banner__label">
          NEWS
        </div>
        <div className="news-banner__content">
          <div 
            className={`news-banner__item ${isAnimating ? 'news-banner__item--sliding' : ''}`}
          >
            {NEWS_ITEMS[currentIndex]}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewsBanner;
