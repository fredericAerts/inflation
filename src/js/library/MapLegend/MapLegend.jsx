import React, { useState } from 'react';

import './map-legend.styl';

function MapLegend() {
  const [isOpen, setIsOpen] = useState(true);

  const toggleLegend = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`map-legend ${isOpen ? 'map-legend--open' : ''}`}>
      <button 
        className="map-legend__toggle"
        onClick={toggleLegend}
        aria-label={isOpen ? 'Close legend' : 'Open legend'}
      >
        {isOpen ? '×' : '?'}
      </button>
      
      <div className="map-legend__content">
        <div className="map-legend__label">
          <div className="map-legend__label-highlight">Inflation</div>
          <div className="map-legend__label-period">Average 2015-2024</div>
        </div>

        <div className="map-legend__values">
          <span>&lt; 2%</span>
          <span>6%</span>
          <span>&gt; 10%</span>
        </div>

        <div className="map-legend__colors">
          <div className="map-legend__marker map-legend__marker--2"></div>
          <div className="map-legend__marker map-legend__marker--5"></div>
          <div className="map-legend__marker map-legend__marker--10"></div>
        </div>

        <div className="map-legend__pattern-section">
          <div className="map-legend__pattern-indicator">
            <div className="map-legend__pattern-sample"></div>
            <div className="map-legend__pattern-label">Incomplete data</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapLegend;
