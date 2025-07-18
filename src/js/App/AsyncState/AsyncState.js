import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setInitialized, 
  setCountries, 
  setInflationData,
} from '@App/AsyncState/async-state.redux.actions';
import { 
  fetchCountriesGeoJson, 
  fetchInflationData,
} from '@services/data.service';

function AsyncState() {
  const initialized = useSelector((state) => state.asyncState.initialized);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!initialized) {
      Promise.all([
        fetchCountriesGeoJson(),
        fetchInflationData(),
      ])
        .then(([countries, inflationData]) => {
          dispatch(setCountries(countries));
          dispatch(setInflationData(inflationData));
        })
        .catch((err) => console.error(err))
        .finally(() => dispatch(setInitialized(true)));
    }
  }, [dispatch, initialized]);

  return null;
}

export default AsyncState;
