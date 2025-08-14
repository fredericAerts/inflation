import { useSelector, useDispatch } from 'react-redux';
import { setAboutModalOpen, setAboutModalSection } from '../NavMenu/navMenu.redux.actions';

import './about-modal.styl';

const CONTENT_SECTIONS = {
  story: {
    title: 'The Story',
    content: (
      <>
        <p>Inflation affects everyone, yet understanding its true impact on purchasing power remains complex. This interactive globe visualizes inflation data across countries, making economic patterns accessible and understandable.</p>
        <p>Through visual storytelling, we aim to illuminate how monetary policies shape the economic reality of citizens worldwide. Each country tells a story of fiscal decisions, central bank interventions, and their consequences on everyday life.</p>
        <p>The visualization reveals patterns that might otherwise remain hidden in spreadsheets and economic reports, empowering users to draw their own conclusions about global economic trends.</p>
      </>
    ),
  },
  data: {
    title: 'Data Sources',
    content: (
      <>
        <p>Our inflation data is sourced from reputable international organizations and central banks to ensure accuracy and reliability.</p>
        <h3>Primary Sources:</h3>
        <ul>
          <li>International Monetary Fund (IMF) - Consumer Price Index data</li>
          <li>World Bank - Economic indicators and GDP data</li>
          <li>OECD Statistics - Inflation rates for member countries</li>
          <li>National Central Banks - Country-specific monetary data</li>
        </ul>
        <p>All data is processed and normalized to provide consistent comparisons across different economies and time periods.</p>
      </>
    ),
  },
  reading: {
    title: 'Further Reading',
    content: (
      <>
        <h3>Recommended Resources:</h3>
        <ul>
          <li><strong>"The Bitcoin Standard"</strong> by Saifedean Ammous - Understanding sound money principles</li>
          <li><strong>"What Has Government Done to Our Money?"</strong> by Murray Rothbard - Monetary theory fundamentals</li>
          <li><strong>"The Creature from Jekyll Island"</strong> by G. Edward Griffin - Federal Reserve history</li>
        </ul>
        <h3>Online Resources:</h3>
        <ul>
          <li>Mises Institute - Austrian Economics research and articles</li>
          <li>Federal Reserve Economic Data (FRED) - Historical economic data</li>
          <li>CoinMetrics - Cryptocurrency and monetary analysis</li>
        </ul>
        <p>These resources provide deeper insights into monetary theory, inflation mechanisms, and alternative monetary systems.</p>
      </>
    ),
  },
  about: {
    title: 'About',
    content: (
      <>
        <p>This project was created to make complex economic data accessible through interactive visualization. We believe that understanding inflation and its effects is crucial for making informed financial decisions.</p>
        <h3>Mission Statement:</h3>
        <p>To democratize access to economic information and empower individuals to understand the impact of monetary policy on their lives.</p>
        <h3>Technical Implementation:</h3>
        <p>Built with modern web technologies including React, MapLibre GL, and Chart.js to provide a smooth, interactive experience across all devices.</p>
        <small className="disclaimer">The text above is AI generated. Do your own research</small>
      </>
    ),
  },
};

function AboutModal() {
  const dispatch = useDispatch();
  const { isAboutModalOpen, activeSection } = useSelector((state) => state.navMenu);

  const handleClose = () => {
    dispatch(setAboutModalOpen(false));
    dispatch(setAboutModalSection('home'));
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isAboutModalOpen) return null;

  const currentSection = CONTENT_SECTIONS[activeSection] || CONTENT_SECTIONS.story;

  return (
    <div className="about-modal" onClick={handleBackdropClick}>
      <div className="about-modal__content">
        <button 
          className="about-modal__close" 
          onClick={handleClose}
          aria-label="Close modal"
        >
          ×
        </button>

        <div className="about-modal__body">
          <main className="about-modal__main">
            <h1 className="about-modal__title">{currentSection.title}</h1>
            <div className="about-modal__text">
              {currentSection.content}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AboutModal;
