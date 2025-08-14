import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAboutModalOpen, setAboutModalSection } from './navMenu.redux.actions';

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
  const { isAboutModalOpen, activeSection } = useSelector((state) => state.navMenu);
  const { selectedCountryId, map } = useSelector((state) => state.globe);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      if (map) {
        map.flyTo({ 
          center: [31, 25], 
          zoom: 2, 
          essential: true 
        });
      }
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
      <nav className={`nav-menu ${isAboutModalOpen ? 'nav-menu--modal-open' : ''}`}>
        <button 
          className="nav-menu__toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>
        
        <div className={`nav-menu__items ${isMobileMenuOpen ? 'nav-menu__items--open' : ''}`}>
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
