import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import './call-to-action.styl';

function CallToAction() {
  const [hasOpenedCountry, setHasOpenedCountry] = useState(false);
  const { selectedCountryId } = useSelector((state) => state.globe);
  const { isMapCoveringBanner } = useSelector((state) => state.navMenu);

  useEffect(() => {
    if (selectedCountryId && !hasOpenedCountry) {
      setHasOpenedCountry(true);
    }
  }, [selectedCountryId, hasOpenedCountry]);

  if (hasOpenedCountry) return null;

  return (
    <div className={`call-to-action ${isMapCoveringBanner ? 'call-to-action--map-covering' : ''}`}>
      <div className="call-to-action__text">
        Tap a country for more details
      </div>
    </div>
  );
}

export default CallToAction;
