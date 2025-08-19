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
  const { inflationData } = useSelector((state) => state.asyncState);
  const [selectedCurrency, setSelectedCurrency] = useState('GOLD');
  
  const isOpen = Boolean(selectedCountryId && modalData);

  const inflationEntry = selectedCountryId && inflationData
      .find(({ _id }) => _id === selectedCountryId);
    
  const { yoy_inflation } = inflationEntry || {};
  
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

  // Generate dummy currency performance data
  const getCurrencyData = () => {
    const years = ['2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'];
    let data, label, yAxisLabel;
    
    switch (selectedCurrency) {
      case 'GOLD':
        data = [2.8, 2.6, 2.4, 2.2, 2.0, 1.8, 1.6, 1.4, 1.2, 1.0];
        label = '100€ = X oz Gold';
        yAxisLabel = 'Ounces of Gold';
        break;
      case 'USD':
        data = [130, 125, 120, 115, 110, 105, 100, 95, 90, 85];
        label = '100€ = X USD';
        yAxisLabel = 'US Dollars';
        break;
      case 'BTC':
        data = [0.25, 0.20, 0.15, 0.12, 0.08, 0.05, 0.03, 0.02, 0.01, 0.008];
        label = '100€ = X BTC';
        yAxisLabel = 'Bitcoin';
        break;
      default:
        data = [];
        label = '';
        yAxisLabel = '';
    }

    return {
      labels: years,
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
                    name="currency"
                    value="GOLD"
                    checked={selectedCurrency === 'GOLD'}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                  />
                  Gold
                </label>
                <label>
                  <input
                    type="radio"
                    name="currency"
                    value="USD"
                    checked={selectedCurrency === 'USD'}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                  />
                  USD
                </label>
                <label>
                  <input
                    type="radio"
                    name="currency"
                    value="BTC"
                    checked={selectedCurrency === 'BTC'}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                  />
                  Bitcoin
                </label>
              </div>
              <div className="chart-wrapper">
                <Line data={getCurrencyData()} options={chartOptions} />
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
              <div className="metric-value">87.3%</div>
              <div className="metric-subtitle">of GDP</div>
            </div>
          </div>
          <div className="country-modal__content__row__cell country-modal__content__row__cell--33">
            <div className="country-modal__metric">
              <div className="metric-title">Freedom Index</div>
              <div className="metric-value">7.8</div>
              <div className="metric-subtitle">out of 10</div>
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
