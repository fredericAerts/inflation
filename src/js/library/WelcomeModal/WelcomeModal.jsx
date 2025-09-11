import { useState, useEffect } from 'react';
import './welcome-modal.styl';

function WelcomeModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Show modal on every visit
    setIsVisible(true);
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    
    // Allow scrolling again
    document.body.style.overflow = '';
    
    // Wait for close animation before hiding
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`welcome-modal ${isClosing ? 'welcome-modal--closing' : ''}`}
      onClick={handleBackdropClick}
    >
      <div className="welcome-modal__content">
        <div className="welcome-modal__body">
          <div className="welcome-modal__facts">
            <p className="welcome-modal__fact">
              There are approximately <strong>160 different currencies</strong> worldwide, each holding a local monopoly within its own jurisdiction.
            </p>
            
            <p className="welcome-modal__fact">
              Roughly <strong>1.3 billion people</strong> live in jurisdictions with average inflation above 10%.
            </p>
            
            <p className="welcome-modal__fact">
              <strong>10% inflation</strong> doubles prices in 7 years.
            </p>
          </div>
          
          <div className="welcome-modal__welcome">
            <h1 className="welcome-modal__title">Welcome!</h1>
          </div>
          
          <div className="welcome-modal__action">
            <button 
              className="welcome-modal__continue" 
              onClick={handleClose}
              aria-label="Continue to website"
            >
              Continue to Website
            </button>
          </div>
        </div>
        
        <div className="welcome-modal__disclaimer">
          This website uses essential cookies only
        </div>
      </div>
    </div>
  );
}

export default WelcomeModal;