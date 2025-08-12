import { useEffect } from 'react';

import PriceBanner from '@library/PriceBanner/PriceBanner';
import Globe from '@App/Globe/Globe';
import MapLegend from '@library/MapLegend/MapLegend';
import CountryModal from '@library/CountryModal/CountryModal';
import { setViewHeight } from '@services/utils.service';

import './app.styl';

function App() {
  useEffect(() => {
    setViewHeight();
    window.addEventListener('resize', setViewHeight);
    return () => window.removeEventListener('resize', setViewHeight);
  }, []);

  return (
    <div className="app">
      <div className="app__banner">
        <PriceBanner />
      </div>
      <div className="app__body">
        <Globe />
        <MapLegend />
      </div>
      <CountryModal />
    </div>
  );
}

export default App;