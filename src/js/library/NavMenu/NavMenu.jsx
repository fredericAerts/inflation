import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAboutModalOpen, setAboutModalSection, setMapCoveringBanner } from './navMenu.redux.actions';
import { resetMapToInitialPosition } from '../../App/Globe/globe.utils';

import './nav-menu.styl';

const NAV_ITEMS = [
  { key: 'home', label: 'Home' },
  { key: 'story', label: 'The story' },
  { key: 'data', label: 'Data sources' },
  { key: 'reading', label: 'Further reading' },
  { key: 'about', label: 'About' },
];

function NavMenu() {
  const dispatch = useDispatch();
  const { isAboutModalOpen, activeSection, shouldResetMap, isMapCoveringBanner } = useSelector((state) => state.navMenu);
  const { selectedCountryId, map } = useSelector((state) => state.globe);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Effect to handle map reset when activeSection becomes 'home'
  useEffect(() => {
    if (shouldResetMap && map) {
      resetMapToInitialPosition(map);
      // Reset the flag to prevent unnecessary resets
      dispatch(setAboutModalSection('home'));
    }
  }, [shouldResetMap, map, dispatch]);

  // Effect to watch map zoom and detect when it covers banner
  useEffect(() => {
    if (!map) return;

    const handleMapMove = () => {
      const zoom = map.getZoom();
      const canvas = map.getCanvas();
      const { width } = canvas.getBoundingClientRect();
      
      // Check if globe covers full width at top of screen
      // At higher zoom levels (> 4), the globe will fill the viewport width
      // We also check the canvas bounds to ensure it covers the top area
      const bounds = map.getBounds();
      const topLeft = map.project([bounds.getWest(), bounds.getNorth()]);
      const topRight = map.project([bounds.getEast(), bounds.getNorth()]);
      
      // If zoom is high enough and the projected bounds span the full width
      const isCovering = zoom > 2 && (topRight.x - topLeft.x) >= width * 0.91;
      
      dispatch(setMapCoveringBanner(isCovering));
    };

    map.on('zoom', handleMapMove);
    map.on('move', handleMapMove);

    return () => {
      map.off('zoom', handleMapMove);
      map.off('move', handleMapMove);
    };
  }, [map, dispatch]);

  // Hide NavMenu when CountryModal is open
  const isCountryModalOpen = Boolean(selectedCountryId);
  if (isCountryModalOpen) {
    return null;
  }

  const handleMenuItemClick = (section) => {
    if (section === 'home') {
      // Close AboutModal and reset map to initial position when Home is clicked
      dispatch(setAboutModalOpen(false));
      dispatch(setAboutModalSection('home'));
      
      // Reset map to initial position if map instance exists
      resetMapToInitialPosition(map);
    } else {
      // Open AboutModal and set section for other items
      dispatch(setAboutModalSection(section));
      if (!isAboutModalOpen) {
        dispatch(setAboutModalOpen(true));
      }
    }
    // Close mobile menu after selection
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <nav className={`nav-menu ${isAboutModalOpen ? 'nav-menu--modal-open' : ''} ${isMapCoveringBanner ? 'nav-menu--map-covering' : ''}`}>
        <button 
          className="nav-menu__toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          Menu
        </button>
        
        <div className={`nav-menu__items ${isMobileMenuOpen ? 'nav-menu__items--open' : ''}`}>
          <button 
            className="nav-menu__close"
            onClick={toggleMobileMenu}
            aria-label="Close navigation menu"
          >
            ×
          </button>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`nav-menu__item ${activeSection === item.key ? 'nav-menu__item--active' : ''}`}
              onClick={() => handleMenuItemClick(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}

export default NavMenu;
