import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
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
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function CountryModal() {
  const dispatch = useDispatch();
  const { selectedCountryId, modalData } = useSelector((state) => state.globe);
  const { inflationData, usd_per_xau, btc_per_xau } = useSelector((state) => state.asyncState);
  const [metrics, setMetrics] = useState(null);
  const [commentary, setCommentary] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState(null);
  const [selectedComparison, setSelectedComparison] = useState('GOLD');  
  const [isLogScale, setIsLogScale] = useState(false);

  const isOpen = Boolean(selectedCountryId && modalData);

  // Reset to Gold whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedComparison('GOLD');
      setIsLogScale(false);
    }
  }, [isOpen]);

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

  // Fetch commentary when selectedCountryId changes
  useEffect(() => {
    const fetchCountryCommentary = async () => {
      if (!selectedCountryId) {
        setCommentary('');
        return;
      }

      try {
        const response = await fetch(`/api/country-commentary/${selectedCountryId}`);
        if (response.ok) {
          const commentaryData = await response.json();
          setCommentary(commentaryData.commentary || '');
        } else {
          setCommentary('');
        }
      } catch (error) {
        console.error('Error fetching commentary:', error);
        setCommentary('');
      }
    };

    fetchCountryCommentary();
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
        pointBackgroundColor: data.map(value => value !== null ? 'rgba(219, 197, 45, 0.7)' : 'rgba(255, 255, 255, 0.2)'),
        pointBorderColor: data.map(value => value !== null ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.3)'),
        pointBorderWidth: 1,
        pointRadius: data.map(value => value !== null ? 3 : 4),
        pointHoverRadius: data.map(value => value !== null ? 5 : 6),
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

    // Choose color based on selected comparison
    const lineColor = selectedComparison === 'USD' ? '#43a047' : '#dbc52d';
    const lineBackgroundColor = selectedComparison === 'USD' ? 'rgba(67, 160, 71, 0.1)' : 'rgba(219, 197, 45, 0.1)';
    const pointColor = selectedComparison === 'USD' ? 'rgba(67, 160, 71, 0.6)' : 'rgba(219, 197, 45, 0.6)';

    if (!monthlyPrice || monthlyPrice.length === 0) {
      // No data available
      return {
        labels: dateRange,
        datasets: [{
          label: `${currencyCode} vs ${selectedComparison}`,
          data: new Array(dateRange.length).fill(null),
          borderColor: lineColor,
          backgroundColor: lineBackgroundColor,
          borderWidth: 2,
          pointBackgroundColor: lineColor,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          tension: 0.4,
        }],
      };
    }

    // Create lookup maps for efficient data retrieval
    const currencyMap = new Map(monthlyPrice.map(item => [item.date, item.units_per_xau]));
    
    if (selectedComparison === 'USD') {
      // For USD comparison, we need to convert units_per_xau to USD
      const usdMap = new Map((usd_per_xau || []).map(item => [item.date, item.units_per_xau]));
      
      data = dateRange.map(date => {
        const currencyUnitsPerXau = currencyMap.get(date);
        const usdUnitsPerXau = usdMap.get(date);
        
        if (currencyUnitsPerXau && usdUnitsPerXau) {
          // 1 unit of currency = usdUnitsPerXau / currencyUnitsPerXau USD
          return usdUnitsPerXau / currencyUnitsPerXau;
        }
        return null;
      });
      label = `1 ${currencyCode} = X USD`;
    } else if (selectedComparison === 'GOLD') {
      // For GOLD comparison, we can directly use the inverse of units_per_xau
      data = dateRange.map(date => {
        const currencyUnitsPerXau = currencyMap.get(date);
        
        if (currencyUnitsPerXau) {
          // 1 unit of currency = 1/units_per_xau ounces of gold
          return 1 / currencyUnitsPerXau;
        }
        return null;
      });
      label = `1 ${currencyCode} = X oz Gold`;
    } else if (selectedComparison === 'BITCOIN') {
      // For BITCOIN comparison, we need both currency and bitcoin data
      const bitcoinMap = new Map((btc_per_xau || []).map(item => [item.date, item.units_per_xau]));
      
      data = dateRange.map(date => {
        const currencyUnitsPerXau = currencyMap.get(date);
        const bitcoinUnitsPerXau = bitcoinMap.get(date);
        
        if (currencyUnitsPerXau && bitcoinUnitsPerXau) {
          // How much bitcoin can you buy with 1 unit of currency
          // 1 unit of currency gets you bitcoinUnitsPerXau / currencyUnitsPerXau bitcoin
          return bitcoinUnitsPerXau / currencyUnitsPerXau;
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
          borderColor: lineColor,
          backgroundColor: lineBackgroundColor,
          borderWidth: 2,
          pointBackgroundColor: pointColor,
          pointBorderColor: 'rgba(255, 255, 255, 0.4)',
          pointBorderWidth: 1,
          pointRadius: 2,
          pointHoverRadius: 4,
          tension: 0.4,
          spanGaps: false,
        },
      ],
    };
  };

  // Calculate percentage change for the currency data
  const getCurrencyPerformance = () => {
    if (!monthlyPrice || monthlyPrice.length === 0) {
      return null;
    }

    const currencyMap = new Map(monthlyPrice.map(item => [item.date, item.units_per_xau]));
    
    // Get first and last available data points for the selected comparison
    let firstValue = null;
    let lastValue = null;
    
    const dateRange = [];
    for (let year = 2015; year <= 2024; year++) {
      for (let month = 1; month <= 12; month++) {
        dateRange.push(`${year}-${month.toString().padStart(2, '0')}`);
      }
    }

    if (selectedComparison === 'USD') {
      const usdMap = new Map((usd_per_xau || []).map(item => [item.date, item.units_per_xau]));
      
      for (const date of dateRange) {
        const currencyUnitsPerXau = currencyMap.get(date);
        const usdUnitsPerXau = usdMap.get(date);
        
        if (currencyUnitsPerXau && usdUnitsPerXau) {
          const value = usdUnitsPerXau / currencyUnitsPerXau;
          if (firstValue === null) firstValue = value;
          lastValue = value;
        }
      }
    } else if (selectedComparison === 'GOLD') {
      for (const date of dateRange) {
        const currencyUnitsPerXau = currencyMap.get(date);
        
        if (currencyUnitsPerXau) {
          const value = 1 / currencyUnitsPerXau;
          if (firstValue === null) firstValue = value;
          lastValue = value;
        }
      }
    } else if (selectedComparison === 'BITCOIN') {
      const bitcoinMap = new Map((btc_per_xau || []).map(item => [item.date, item.units_per_xau]));
      
      for (const date of dateRange) {
        const currencyUnitsPerXau = currencyMap.get(date);
        const bitcoinUnitsPerXau = bitcoinMap.get(date);
        
        if (currencyUnitsPerXau && bitcoinUnitsPerXau) {
          const value = bitcoinUnitsPerXau / currencyUnitsPerXau;
          if (firstValue === null) firstValue = value;
          lastValue = value;
        }
      }
    }

    if (firstValue === null || lastValue === null) {
      return null;
    }

    const percentageChange = ((lastValue - firstValue) / firstValue) * 100;
    return percentageChange;
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
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
          text: 'Inflation rate (%)',
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
        type: isLogScale ? 'logarithmic' : 'linear',
        ticks: { 
          color: '#ffffff',
          ...(isLogScale && {
            maxTicksLimit: 8,
            callback: function(value, index, values) {
              // For log scale, show cleaner tick labels
              if (selectedComparison === 'USD') {
                return '$' + value.toFixed(value < 0.001 ? 6 : value < 0.01 ? 4 : value < 1 ? 3 : 2);
              } else if (selectedComparison === 'GOLD') {
                return value.toExponential(2) + ' oz';
              } else if (selectedComparison === 'BITCOIN') {
                return value.toExponential(2) + ' BTC';
              }
              return value.toExponential(2);
            }
          }),
          ...(!isLogScale && {
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
          })
        },
        grid: { 
          color: 'rgba(255, 255, 255, 0.1)' 
        },
        title: {
          display: true,
          text: selectedComparison === 'USD' ? 'U.S. Dollar' : 
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
      <button 
        className="country-modal__close" 
        onClick={handleClose}
        aria-label="Close modal"
      >
        ×
      </button>
      {modalData?.withdrawnCurrency && modalData?.withdrawnCurrencyCode && modalData?.withdrawnCurrencyDate && (
        <div className="withdrawn-currency-banner">
          <span>
            Previous currency: {modalData.withdrawnCurrency} ({modalData.withdrawnCurrencyCode}), withdrawn {modalData.withdrawnCurrencyDate}
          </span>
        </div>
      )}
      <div className="country-modal__content">
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
              <div className="chart-title">
                <h3 className="chart-title__main">Year-over-Year Inflation</h3>
                <p className="chart-title__description">Shows how much prices of everyday goods and services went up compared to the year before.</p>
              </div>
              <div style={{ flex: 1, position: 'relative' }}>
                <Line data={inflationChartData} options={chartOptions} />
              </div>
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
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    id="comparison-toggle"
                    className="toggle-switch__input"
                    checked={selectedComparison === 'USD'}
                    onChange={(e) => setSelectedComparison(e.target.checked ? 'USD' : 'GOLD')}
                  />
                  <label htmlFor="comparison-toggle" className="toggle-switch__label">
                    <span className="toggle-switch__text toggle-switch__text--left">Gold</span>
                    <span className="toggle-switch__slider"></span>
                    <span className="toggle-switch__text toggle-switch__text--right">USD</span>
                  </label>
                </div>
                <button
                  className="scale-toggle"
                  onClick={() => setIsLogScale(!isLogScale)}
                  type="button"
                >
                  {isLogScale ? 'Switch to Linear' : 'Switch to Log'}
                </button>
                {(() => {
                  const performance = getCurrencyPerformance();
                  if (performance !== null) {
                    return (
                      <div className="currency-performance-indicator">
                        <span className="currency-performance-indicator__label">
                          ~10-year change:
                        </span>
                        <div className={`currency-performance-indicator__perf ${performance >= 0 ? 'currency-performance-indicator__perf--positive' : ''}`}>
                          <div className="currency-performance-indicator__perf__value">
                            {performance >= 0 ? '+' : ''}{performance.toFixed(1)}%
                          </div>
                          <div className="currency-performance-indicator__perf__arrow"/>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
              <div className="chart-wrapper">
                <div className="chart-title">
                  <h3 className="chart-title__main">
                    {modalData?.currencyCode || 'Currency'} Purchasing Power vs {selectedComparison}
                  </h3>
                  <p className="chart-title__description">
                    {selectedComparison === 'USD' 
                      ? `Shows how much U.S. Dollars you can buy with 1 ${modalData?.currency || 'unit'}.`
                      : `Shows how much ounce of gold you can buy with 1 ${modalData?.currency || 'unit'}.`
                    }
                  </p>
                </div>
                <div style={{ flex: 1, position: 'relative' }}>
                  <Line data={getCurrencyData()} options={currencyChartOptions} />
                </div>
              </div>
            </div>
          </div>
        </div>

        { (!!commentary && (parseInt(modalData?.inflation, 10) >= 10 || modalData?.inflation === 'N/A'))
          && (
            <div className="country-modal__content__row">
              <div className="country-modal__content__row__cell">
                <div className="country-modal__description">
                  <div dangerouslySetInnerHTML={{ __html: commentary }} />
                  <small>
                    The text above was AI generated, using the website's data as context. Do your own research.
                  </small>
                </div>
              </div>
            </div>
          )
        }

        <div className="country-modal__content__row">
          <div className="country-modal__content__row__cell country-modal__content__row__cell--50">
            <div className="country-modal__metric">
              <div className="metric-title">Government Debt</div>
              <div className="metric-value">{metrics?.gov_dept_per_gdp ? `${metrics.gov_dept_per_gdp.toFixed(1)}%` : 'N/A'}</div>
              <div className="metric-subtitle">of GDP</div>
              <div className="metric-data-source">IMF (2024)</div>
            </div>
          </div>
          <div className="country-modal__content__row__cell country-modal__content__row__cell--50">
            <div className="country-modal__metric">
              <div className="metric-title">Freedom Index</div>
              <div className="metric-value">
                {metrics?.freedom_index ? metrics.freedom_index.toFixed(1) : 'N/A'}
              </div>
              <div className="metric-subtitle">out of 10</div>
              <div className="metric-data-source">Cato Institute (2022)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default CountryModal;
