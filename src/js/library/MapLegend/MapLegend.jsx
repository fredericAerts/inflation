import React from 'react';

import './map-legend.styl';

function MapLegend() {
  return (
    <div className="map-legend">
      <div className="map-legend__label">Avg. inflation (YoY) over last 10 years</div>
      <div className="map-legend__values">
        <span>&lt; 2%</span>
        <span>6%</span>
        <span>&gt; 10%</span>
      </div>
      <div className="map-legend__colors">
        <div className="map-legend__marker map-legend__marker--2" />
        <div className="map-legend__marker map-legend__marker--5" />
        <div className="map-legend__marker map-legend__marker--10" />
      </div>
    </div>
  );
};

export default MapLegend;
