import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import PriceBanner from '@library/PriceBanner/PriceBanner';
import NewsBanner from '@library/NewsBanner/NewsBanner';
import Globe from '@App/Globe/Globe';
import MapLegend from '@library/MapLegend/MapLegend';
import CountryModal from '@library/CountryModal/CountryModal';
import NavMenu from '@library/NavMenu/NavMenu';
import AboutModal from '@library/AboutModal/AboutModal';
import ZoomControl from '@library/ZoomControl/ZoomControl';
import WelcomeModal from '@library/WelcomeModal/WelcomeModal';
import { setViewHeight } from '@services/utils.service';

import './app.styl';

function App() {
  const dispatch = useDispatch();
  const [isAppVisible, setIsAppVisible] = useState(false);

  useEffect(() => {
    setViewHeight();
    window.addEventListener('resize', setViewHeight);
    return () => window.removeEventListener('resize', setViewHeight);
  }, []);

  // Listen for welcome modal close by checking if modal is still mounted
  useEffect(() => {
    // Check periodically if welcome modal is closed
    const interval = setInterval(() => {
      // If no welcome modal is visible, show the app
      const welcomeModal = document.querySelector('.welcome-modal');
      if (!welcomeModal && !isAppVisible) {
        setIsAppVisible(true);
      }
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [isAppVisible]);

  return (
    <>
      <WelcomeModal />
      <div className={`app ${isAppVisible ? 'app--visible' : 'app--hidden'}`}>
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
    </>
  );
}

export default App;