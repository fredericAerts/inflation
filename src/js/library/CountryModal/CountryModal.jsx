import { useSelector, useDispatch } from 'react-redux';
import { clearSelectedCountryId, setSelectedCountryId } from '../../App/Globe/globe.redux.actions';

import './country-modal.styl';

function CountryModal() {
  const dispatch = useDispatch();
  const { selectedCountryId, modalData } = useSelector((state) => state.globe);
  const { countries } = useSelector((state) => state.asyncState);
  
  const isOpen = Boolean(selectedCountryId && modalData);
  
  const handleClose = () => {
    dispatch(setSelectedCountryId(null));
    dispatch(clearSelectedCountryId());
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="country-modal" onClick={handleBackdropClick}>
      <div className="country-modal__content">
        <div className="country-modal__header">
          <h2 className="country-modal__title">{modalData.countryName}</h2>
          <button 
            className="country-modal__close" 
            onClick={handleClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        
        <div className="country-modal__body">
          <p>Average Inflation (10 years): <strong>{modalData.inflation}</strong></p>
        </div>
      </div>
    </div>
  );
}

export default CountryModal;
