import { useEffect } from 'react';

import PriceBanner from '@library/PriceBanner/PriceBanner';
import NewsBanner from '@library/NewsBanner/NewsBanner';
import Globe from '@App/Globe/Globe';
import MapLegend from '@library/MapLegend/MapLegend';
import CountryModal from '@library/CountryModal/CountryModal';
import NavMenu from '@library/NavMenu/NavMenu';
import AboutModal from '@library/AboutModal/AboutModal';
import ZoomControl from '@library/ZoomControl/ZoomControl';
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
        <NewsBanner />
      </div>
      <div className="app__body">
        <Globe />
        <MapLegend />
      </div>
      <ZoomControl />
      <NavMenu />
      <AboutModal />
      <CountryModal />
    </div>
  );
}

export default App;