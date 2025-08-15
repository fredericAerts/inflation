import { useSelector } from 'react-redux';

import './zoom-control.styl';

function ZoomControl() {
  const { selectedCountryId, map } = useSelector((state) => state.globe);
  const { isAboutModalOpen, isMapCoveringBanner } = useSelector((state) => state.navMenu);

  // Hide ZoomControl when CountryModal is open
  const isCountryModalOpen = Boolean(selectedCountryId);
  if (isCountryModalOpen || isAboutModalOpen) {
    return null;
  }

  const handleZoomIn = () => {
    if (map) {
      map.zoomIn({ duration: 300 });
    }
  };

  const handleZoomOut = () => {
    if (map) {
      map.zoomOut({ duration: 300 });
    }
  };

  return (
    <div className={`zoom-control ${isMapCoveringBanner ? 'zoom-control--map-covering' : ''}`}>
      <button 
        className="zoom-control__button zoom-control__button--zoom-in"
        onClick={handleZoomIn}
        aria-label="Zoom in"
        disabled={!map}
      >
        +
      </button>
      <button 
        className="zoom-control__button zoom-control__button--zoom-out"
        onClick={handleZoomOut}
        aria-label="Zoom out"
        disabled={!map}
      >
        −
      </button>
    </div>
  );
}

export default ZoomControl;
