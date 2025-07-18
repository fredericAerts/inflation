import { useEffect, useRef } from 'react';
import PriceBannerItem from '@library/PriceBannerItem/PriceBannerItem';
import './price-banner.styl';

function generatePriceBannerItems() {
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'BTC', 'ETH', 'CAD', 'AUD', 'CHF', 'CNY'];
  const items = [];

  for (let i = 0; i < 50; i++) {
    const currency = currencies[Math.floor(Math.random() * currencies.length)];
    const value = parseFloat((Math.random() * 2000 - 1000).toFixed(2));
    items.push({ id: `${i}-${currency}`, currency, value });
  }

  return items;
}

function PriceBanner() {
  const items = generatePriceBannerItems();
  const containerRef = useRef(null);
  const tickerRef = useRef(null);

  useEffect(() => {
    const ticker = tickerRef.current;
    const container = containerRef.current;

    if (!ticker || !container) return;

    let offset = 0;
    let animationFrame;
    const speed = 0.5; // pixels per frame

    const animate = () => {
      offset -= speed;
      if (Math.abs(offset) >= ticker.scrollWidth / 2) {
        offset = 0; // Reset position when halfway scrolled
      }
      ticker.style.transform = `translateX(${offset}px)`;
      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const duplicatedItems = [...items, ...items]; // two copies side by side

  return (
    <div className="price-banner" ref={containerRef}>
      <div className="price-banner__scroll">
        <ul className="price-banner__scroll__ticker" ref={tickerRef}>
          {duplicatedItems.map(({ id, currency, value }, i) => (
            <li key={`${id}-${i}`}>
              <PriceBannerItem currency={currency} value={value} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default PriceBanner;
