import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { clearSelectedCountryId, setSelectedCountryId } from '../../App/Globe/globe.redux.actions';

import './country-modal.styl';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function CountryModal() {
  const dispatch = useDispatch();
  const { selectedCountryId, modalData } = useSelector((state) => state.globe);
  const { inflationData, gold_monthly_price, bitcoin_monthly_price } = useSelector((state) => state.asyncState);
  const [metrics, setMetrics] = useState(null);
  const [monthlyPrice, setMonthlyPrice] = useState(null);
  const [selectedComparison, setSelectedComparison] = useState('USD');
  
  const isOpen = Boolean(selectedCountryId && modalData);

  const inflationEntry = selectedCountryId && inflationData
      .find(({ _id }) => _id === selectedCountryId);
    
  const { yoy_inflation } = inflationEntry || {};

  // Fetch metrics when selectedCountryId changes
  useEffect(() => {
    const fetchCountryMetrics = async () => {
      if (!selectedCountryId) {
        setMetrics(null);
        return;
      }

      try {
        const response = await fetch(`/api/metrics/${selectedCountryId}`);
        if (response.ok) {
          const metricsData = await response.json();
          setMetrics(metricsData);
        } else {
          setMetrics(null);
        }
      } catch (error) {
        console.error('Error fetching metrics:', error);
        setMetrics(null);
      }
    };

    fetchCountryMetrics();
  }, [selectedCountryId]);

  // Fetch currency data when modalData?.currencyCode changes
  useEffect(() => {
    const fetchCurrencyData = async () => {
      if (!modalData?.currencyCode) {
        setMonthlyPrice(null);
        return;
      }

      try {
        const response = await fetch(`/api/currency-performance/${modalData.currencyCode}`);
        if (response.ok) {
          const currencyData = await response.json();
          setMonthlyPrice(currencyData.monthly_data);
        } else {
          setMonthlyPrice(null);
        }
      } catch (error) {
        console.error('Error fetching currency data:', error);
        setMonthlyPrice(null);
      }
    };

    fetchCurrencyData();
  }, [modalData?.currencyCode]);
  
  const handleClose = () => {
    dispatch(setSelectedCountryId(null));
    dispatch(clearSelectedCountryId());
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Generate inflation chart data from actual yoy_inflation data
  const inflationChartData = (() => {
    const fullYearRange = [];
    for (let year = 2015; year <= 2024; year++) {
      fullYearRange.push(year.toString());
    }

    if (!yoy_inflation || Object.keys(yoy_inflation).length === 0) {
      return {
        labels: fullYearRange,
        datasets: [{
          label: 'YoY Inflation (%)',
          data: new Array(fullYearRange.length).fill(null),
          borderColor: '#dbc52d',
          backgroundColor: 'rgba(219, 197, 45, 0.1)',
          borderWidth: 2,
          pointBackgroundColor: '#dbc52d',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          tension: 0.4,
          spanGaps: false, // Don't connect across null values
        }]
      };
    }

    // Create data array aligned with full year range
    const data = fullYearRange.map(year => {
      return yoy_inflation[year] !== undefined ? yoy_inflation[year] : null;
    });

    return {
      labels: fullYearRange,
      datasets: [{
        label: 'YoY Inflation (%)',
        data,
        borderColor: '#dbc52d',
        backgroundColor: 'rgba(219, 197, 45, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: data.map(value => value !== null ? '#dbc52d' : 'rgba(255, 255, 255, 0.3)'),
        pointBorderColor: data.map(value => value !== null ? '#ffffff' : 'rgba(255, 255, 255, 0.5)'),
        pointBorderWidth: 2,
        pointRadius: data.map(value => value !== null ? 4 : 6),
        pointStyle: data.map(value => value !== null ? 'circle' : 'crossRot'),
        tension: 0.4,
        spanGaps: false, // Don't connect lines across missing data
      }]
    };
  })();

  // Generate currency performance data using actual data
  const getCurrencyData = () => {
    const currencyCode = modalData?.currencyCode;
    
    // Generate date range from 2015-01 to 2024-12
    const generateDateRange = () => {
      const dates = [];
      for (let year = 2015; year <= 2024; year++) {
        for (let month = 1; month <= 12; month++) {
          dates.push(`${year}-${month.toString().padStart(2, '0')}`);
        }
      }
      return dates;
    };

    const dateRange = generateDateRange();
    let data = [];
    let label = '';

    if (!monthlyPrice || monthlyPrice.length === 0) {
      // No data available
      return {
        labels: dateRange,
        datasets: [{
          label: `${currencyCode} vs ${selectedComparison}`,
          data: new Array(dateRange.length).fill(null),
          borderColor: '#dbc52d',
          backgroundColor: 'rgba(219, 197, 45, 0.1)',
          borderWidth: 2,
          pointBackgroundColor: '#dbc52d',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          tension: 0.4,
        }],
      };
    }

    // Create lookup maps for efficient data retrieval
    const currencyMap = new Map(monthlyPrice.map(item => [item.date, item.price_usd]));
    
    if (selectedComparison === 'USD') {
      // Show currency price in USD directly
      data = dateRange.map(date => currencyMap.get(date) || null);
      label = `1 ${currencyCode} = X USD`;
    } else if (selectedComparison === 'GOLD') {
      // Calculate currency performance against GOLD
      const goldMap = new Map((gold_monthly_price || []).map(item => [item.date, item.price_usd]));
      
      data = dateRange.map(date => {
        const currencyPriceUSD = currencyMap.get(date);
        const goldPriceUSD = goldMap.get(date);
        
        if (currencyPriceUSD && goldPriceUSD) {
          // How much gold can you buy with 1 unit of currency
          return currencyPriceUSD / goldPriceUSD;
        }
        return null;
      });
      label = `1 ${currencyCode} = X oz Gold`;
    } else if (selectedComparison === 'BITCOIN') {
      // Calculate currency performance against BITCOIN
      const bitcoinMap = new Map((bitcoin_monthly_price || []).map(item => [item.date, item.price_usd]));
      
      data = dateRange.map(date => {
        const currencyPriceUSD = currencyMap.get(date);
        const bitcoinPriceUSD = bitcoinMap.get(date);
        
        if (currencyPriceUSD && bitcoinPriceUSD) {
          // How much bitcoin can you buy with 1 unit of currency
          return currencyPriceUSD / bitcoinPriceUSD;
        }
        return null;
      });
      label = `1 ${currencyCode} = X BTC`;
    }

    return {
      labels: dateRange,
      datasets: [
        {
          label,
          data,
          borderColor: '#dbc52d',
          backgroundColor: 'rgba(219, 197, 45, 0.1)',
          borderWidth: 2,
          pointBackgroundColor: '#dbc52d',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          tension: 0.4,
          spanGaps: false,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Year-over-Year Inflation',
        color: '#ffffff',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            if (context.parsed.y === null) {
              return 'No data available';
            }
            return `${context.parsed.y.toFixed(2)}%`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'category',
        labels: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'],
        ticks: { 
          color: '#ffffff',
          maxRotation: 0
        },
        grid: { 
          color: 'rgba(255, 255, 255, 0.1)' 
        },
        title: {
          display: true,
          text: 'Year',
          color: '#ffffff',
          font: {
            size: 12,
            weight: 'normal'
          }
        }
      },
      y: {
        ticks: { 
          color: '#ffffff',
          callback: function(value) {
            return value + '%';
          }
        },
        grid: { 
          color: 'rgba(255, 255, 255, 0.1)' 
        },
        title: {
          display: true,
          text: 'Inflation Rate (%)',
          color: '#ffffff',
          font: {
            size: 12,
            weight: 'normal'
          }
        }
      },
    },
  };

  const currencyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `${modalData?.currencyCode || 'Currency'} Performance vs ${selectedComparison}`,
        color: '#ffffff',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            if (context.parsed.y === null) {
              return 'No data available';
            }
            const value = context.parsed.y;
            if (selectedComparison === 'USD') {
              return `$${value.toFixed(4)}`;
            } else if (selectedComparison === 'GOLD') {
              return `${value.toFixed(6)} oz`;
            } else if (selectedComparison === 'BITCOIN') {
              return `${value.toFixed(8)} BTC`;
            }
            return value.toString();
          }
        }
      }
    },
    scales: {
      x: {
        type: 'category',
        ticks: { 
          color: '#ffffff',
          maxRotation: 45,
          callback: function(value, index) {
            // Show only January of each year for cleaner display
            const date = this.getLabelForValue(value);
            if (date && date.endsWith('-01')) {
              return date.substring(0, 4);
            }
            return '';
          }
        },
        grid: { 
          color: 'rgba(255, 255, 255, 0.1)' 
        },
        title: {
          display: true,
          text: 'Date',
          color: '#ffffff',
          font: {
            size: 12,
            weight: 'normal'
          }
        }
      },
      y: {
        ticks: { 
          color: '#ffffff',
          callback: function(value) {
            if (selectedComparison === 'USD') {
              return '$' + value.toFixed(4);
            } else if (selectedComparison === 'GOLD') {
              return value.toFixed(6) + ' oz';
            } else if (selectedComparison === 'BITCOIN') {
              return value.toFixed(8) + ' BTC';
            }
            return value;
          }
        },
        grid: { 
          color: 'rgba(255, 255, 255, 0.1)' 
        },
        title: {
          display: true,
          text: selectedComparison === 'USD' ? 'USD' : 
                selectedComparison === 'GOLD' ? 'Ounces of Gold' : 'Bitcoin',
          color: '#ffffff',
          font: {
            size: 12,
            weight: 'normal'
          }
        }
      },
    },
  };

  if (!isOpen) return null;

  return (
    <div className="country-modal" onClick={handleBackdropClick}>
      <div className="country-modal__content">
        <button 
          className="country-modal__close" 
          onClick={handleClose}
          aria-label="Close modal"
        >
          ×
        </button>

        <div className="country-modal__content__row">
          <div className="country-modal__content__row__cell tablet-50">
            <div className="country-modal__header">
              <h2 className="country-name">{modalData?.name || 'Unknown Country'}</h2>
              
              <div className="currency-section">
                <div className="currency">{modalData?.currencyCode || 'N/A'}</div>
                <div className="currency-label">{modalData?.currency || 'N/A'}</div>
              </div>
              
              <div className="inflation-section">
                <div className="inflation-label">Average Inflation</div>
                <div className="inflation-value">{modalData?.inflation || 'N/A'}</div>
                <div className="inflation-period">10-Year Period</div>
              </div>
            </div>
          </div>
          <div className="country-modal__content__row__cell tablet-50">
            <div className="country-modal__chart-container">
              <Line data={inflationChartData} options={chartOptions} />
              <div className="chart-data-source">
                Data source: {inflationEntry?.data_source || 'N/A'}
              </div>
              {inflationEntry?.skipped_years && inflationEntry.skipped_years.length > 0 && (
                <div className="chart-missing-data">
                  Missing data for: {inflationEntry.skipped_years.join(', ')}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="country-modal__content__row">
          <div className="country-modal__content__row__cell">
            <div className="country-modal__chart-section">
              <div className="country-modal__radio-group">
                <label>
                  <input
                    type="radio"
                    name="comparison"
                    value="USD"
                    checked={selectedComparison === 'USD'}
                    onChange={(e) => setSelectedComparison(e.target.value)}
                  />
                  USD
                </label>
                <label>
                  <input
                    type="radio"
                    name="comparison"
                    value="GOLD"
                    checked={selectedComparison === 'GOLD'}
                    onChange={(e) => setSelectedComparison(e.target.value)}
                  />
                  Gold
                </label>
                <label>
                  <input
                    type="radio"
                    name="comparison"
                    value="BITCOIN"
                    checked={selectedComparison === 'BITCOIN'}
                    onChange={(e) => setSelectedComparison(e.target.value)}
                  />
                  Bitcoin
                </label>
              </div>
              <div className="chart-wrapper">
                <Line data={getCurrencyData()} options={currencyChartOptions} />
              </div>
            </div>
          </div>
        </div>

        <div className="country-modal__content__row">
          <div className="country-modal__content__row__cell">
            <div className="country-modal__description">
              <p>
                The economic landscape of this nation reflects decades of monetary policy decisions that have shaped its inflation trajectory.
                Understanding these patterns provides crucial insights into the purchasing power erosion experienced by citizens over time.
              </p>
              <p>
                Historical data reveals the complex interplay between government fiscal policies, central bank interventions, and global economic forces.
                These factors collectively determine the real value of money and the economic burden placed on everyday citizens.
              </p>
              <small>
                The text above was generated by AI, using the website's data as context. Do your own research.
              </small>
            </div>
          </div>
        </div>

        <div className="country-modal__content__row">
          <div className="country-modal__content__row__cell country-modal__content__row__cell--33">
            <div className="country-modal__metric">
              <div className="metric-title">Government Debt</div>
              <div className="metric-value">{metrics?.gov_dept_per_gdp ? metrics.gov_dept_per_gdp.toFixed(1) : 'N/A'}%</div>
              <div className="metric-subtitle">of GDP</div>
              <div className="metric-data-source">IMF (2024)</div>
            </div>
          </div>
          <div className="country-modal__content__row__cell country-modal__content__row__cell--33">
            <div className="country-modal__metric">
              <div className="metric-title">Freedom Index</div>
              <div className="metric-value">
                {metrics?.freedom_index ? metrics.freedom_index.toFixed(1) : 'N/A'}
              </div>
              <div className="metric-subtitle">out of 10</div>
              <div className="metric-data-source">Cato Institute (2022)</div>
            </div>
          </div>
          <div className="country-modal__content__row__cell country-modal__content__row__cell--33">
            <div className="country-modal__metric">
              <div className="metric-title">GDP per Capita</div>
              <div className="metric-value">€47,200</div>
              <div className="metric-subtitle">PPP adjusted</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CountryModal;
