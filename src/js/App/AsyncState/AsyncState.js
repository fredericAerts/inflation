import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setInitialized, 
  setCountries, 
  setInflationData,
  setGoldMonthlyPrice,
  setBitcoinMonthlyPrice,
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
          const btc_monthly_price = currencyPerformanceData.find(x => x._id === 'BTC')?.monthly_data;
          const gold_monthly_price = currencyPerformanceData.find(x => x._id === 'GOLD')?.monthly_data;

          dispatch(setCountries(countries));
          dispatch(setInflationData(inflationData));
          dispatch(setGoldMonthlyPrice(gold_monthly_price));
          dispatch(setBitcoinMonthlyPrice(btc_monthly_price));
        })
        .catch((err) => console.error(err))
        .finally(() => dispatch(setInitialized(true)));
    }
  }, [dispatch, initialized]);

  return null;
}

export default AsyncState;
