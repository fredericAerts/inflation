import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useRef } from 'react';
import { setAboutModalOpen, setAboutModalSection } from '../NavMenu/navMenu.redux.actions';
import Story from './Story/Story';
import FurtherReading from './FurtherReading/FurtherReading';
import DataSources from './DataSources/DataSources';
import About from './About/About';

import './about-modal.styl';

const CONTENT_SECTIONS = {
  story: {
    title: 'The Story',
    content: <Story />,
  },
  data: {
    title: 'Data Sources',
    content: <DataSources />,
  },
  reading: {
    title: 'Further Reading',
    content: <FurtherReading />,
  },
  about: {
    title: 'About',
    content: <About />,
  },
};

function AboutModal() {
  const dispatch = useDispatch();
  const { isAboutModalOpen, activeSection } = useSelector((state) => state.navMenu);
  const mainRef = useRef(null);

  const handleClose = () => {
    dispatch(setAboutModalOpen(false));
    dispatch(setAboutModalSection('home'));
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [activeSection]);

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
          <main className="about-modal__main" ref={mainRef}>
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
