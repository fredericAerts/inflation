import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import PriceBannerItem from '@library/PriceBannerItem/PriceBannerItem';
import './price-banner.styl';

function PriceBanner() {
  const { all_fiat_per_xau = [] } = useSelector((state) => state.asyncState);
  const containerRef = useRef(null);
  const tickerRef = useRef(null);

  const btc_per_xau = all_fiat_per_xau.find(({ _id }) => _id === 'BTC');

  // Create array with evenly distributed Bitcoin entries
  const createDistributedArray = () => {
    const fiatOnly = all_fiat_per_xau.filter(({ _id }) => _id !== 'BTC');

    if (!btc_per_xau || fiatOnly.length === 0) {
      return all_fiat_per_xau;
    }

    const result = [...fiatOnly];
    const interval = Math.floor(result.length / 10);

    // Insert Bitcoin at evenly spaced positions
    result.splice(interval, 0, btc_per_xau);
    result.splice(interval * 2 + 1, 0, btc_per_xau);
    result.splice(interval * 3 + 2, 0, btc_per_xau);
    result.splice(interval * 4 + 3, 0, btc_per_xau);
    result.splice(interval * 5 + 4, 0, btc_per_xau);
    result.splice(interval * 6 + 5, 0, btc_per_xau);
    result.splice(interval * 7 + 6, 0, btc_per_xau);
    result.splice(interval * 8 + 7, 0, btc_per_xau);
    result.splice(interval * 9 + 8, 0, btc_per_xau);
    result.splice(interval * 10 + 9, 0, btc_per_xau);

    return result;
  };

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

  const duplicatedItems = [...createDistributedArray(), ...createDistributedArray()]; // two copies side by side

  return (
    <div className="price-banner" ref={containerRef}>
      <div className="price-banner__context">
        {/* 10-year depreciation vs gold */}
        <span>10-year vs</span>
        <strong>Gold</strong>
      </div>
      <div className="price-banner__scroll">
        <ul className="price-banner__scroll__ticker" ref={tickerRef}>
          {duplicatedItems.map(({ _id, ten_year_performance_vs_xau_in_perc }, i) => (
            <li key={`${_id}-${i}`}>
              <PriceBannerItem currency={_id} value={ten_year_performance_vs_xau_in_perc} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default PriceBanner;
