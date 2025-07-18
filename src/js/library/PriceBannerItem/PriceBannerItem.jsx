import './price-banner-item.styl';

function PriceBannerItem({ currency, value }) {
  return (
    <div className="price-banner-item">
      <div className="price-banner-item__currency">{currency}</div>
      <div className={`price-banner-item__perf ${value >= 0 ? 'price-banner-item__perf--positive' : ''}`}>
        <div className="price-banner-item__perf__value">{value}%</div>
        <div className="price-banner-item__perf__arrow"/>
      </div>
    </div>
  );
}

export default PriceBannerItem;