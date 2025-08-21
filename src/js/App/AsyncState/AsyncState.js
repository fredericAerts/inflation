import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setInitialized, 
  setCountries, 
  setInflationData,
  setUsdPerXau,
  setBtcPerXau,
  setAllFiatPerXau,
} from '@App/AsyncState/async-state.redux.actions';
import { 
  fetchCountriesGeoJson, 
  fetchInflationData,
  fetchCurrencyPerformanceData,
} from '@services/data.service';

function AsyncState() {
  const initialized = useSelector((state) => state.asyncState.initialized);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!initialized) {
      Promise.all([
        fetchCountriesGeoJson(),
        fetchInflationData(),
        fetchCurrencyPerformanceData(),
      ])
        .then(([countries, inflationData, currencyPerformanceData]) => {
          const btc_per_xau = currencyPerformanceData.find(x => x._id === 'BTC')?.monthly_data;
          const usd_per_xau = currencyPerformanceData.find(x => x._id === 'USD')?.monthly_data;
          const all_fiat_per_xau = currencyPerformanceData;

          dispatch(setCountries(countries));
          dispatch(setInflationData(inflationData));
          dispatch(setUsdPerXau(usd_per_xau));
          dispatch(setBtcPerXau(btc_per_xau));
          dispatch(setAllFiatPerXau(all_fiat_per_xau));
        })
        .catch((err) => console.error(err))
        .finally(() => dispatch(setInitialized(true)));
    }
  }, [dispatch, initialized]);

  return null;
}

export default AsyncState;
