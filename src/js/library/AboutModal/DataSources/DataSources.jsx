import './data-sources.styl';

function DataSources() {
  return (
    <article className="data-sources">
      <small className="disclaimer">
        If you have questions about how this data was integrated into the website and the methodologies behind it, 
        you can contact me at{' '}
        <a 
          href="mailto:info@fredericaerts.com"
          className="data-sources__link"
        >
          info@fredericaerts.com
        </a>
        .<br/>
        <br/>
        You can also review the code of the scripts that processed the data{' '}
        <a 
          href="https://github.com/fredericAerts/inflation/tree/main/server/data/scripts" 
          target="_blank" 
          rel="noopener noreferrer"
          className="data-sources__link"
        >
          here
        </a>
        .
      </small>
      
      <section className="data-sources__section">
        <h3 className="data-sources__section-title">Datahub</h3>
        <ul className="data-sources__list">
          <li className="data-sources__item">
            <strong>Country Polygons as GeoJSON</strong>
            <br />
            <a 
              href="https://datahub.io/core/geo-countries" 
              target="_blank" 
              rel="noopener noreferrer"
              className="data-sources__link"
            >
              https://datahub.io/core/geo-countries
            </a>
          </li>
          <li className="data-sources__item">
            <strong>ISO 4217 Currency Codes</strong>
            <br />
            <a 
              href="https://datahub.io/core/currency-codes" 
              target="_blank" 
              rel="noopener noreferrer"
              className="data-sources__link"
            >
              https://datahub.io/core/currency-codes
            </a>
          </li>
          <li className="data-sources__item">
            <strong>Population figures for countries</strong>
            <br />
            <a 
              href="https://datahub.io/core/population" 
              target="_blank" 
              rel="noopener noreferrer"
              className="data-sources__link"
            >
              https://datahub.io/core/population
            </a>
          </li>
        </ul>
      </section>

      <section className="data-sources__section">
        <h3 className="data-sources__section-title">International Monetary Fund (IMF)</h3>
        <ul className="data-sources__list">
          <li className="data-sources__item">
            <strong>Consumer Price Index (CPI)</strong>
            <br />
            <a 
              href="https://data.imf.org/en/Data-Explorer?datasetUrn=IMF.STA:CPI(5.0.0)" 
              target="_blank" 
              rel="noopener noreferrer"
              className="data-sources__link"
            >
              https://data.imf.org/en/Data-Explorer?datasetUrn=IMF.STA:CPI(5.0.0)
            </a>
          </li>
          <li className="data-sources__item">
            <strong>General government gross debt (percent of GDP)</strong>
            <br />
            <a 
              href="https://www.imf.org/external/datamapper/GGXWDG_NGDP@WEO/OEMDC/ADVEC/WEOWORLD" 
              target="_blank" 
              rel="noopener noreferrer"
              className="data-sources__link"
            >
              https://www.imf.org/external/datamapper/GGXWDG_NGDP@WEO/OEMDC/ADVEC/WEOWORLD
            </a>
          </li>
          <li className="data-sources__item">
            <strong>Exchange Rates (ER)</strong>
            <br />
            <a 
              href="https://data.imf.org/en/Data-Explorer?datasetUrn=IMF.STA:ER(4.0.1)" 
              target="_blank" 
              rel="noopener noreferrer"
              className="data-sources__link"
            >
              https://data.imf.org/en/Data-Explorer?datasetUrn=IMF.STA:ER(4.0.1)
            </a>
          </li>
        </ul>
      </section>

      <section className="data-sources__section">
        <h3 className="data-sources__section-title">World Bank</h3>
        <ul className="data-sources__list">
          <li className="data-sources__item">
            <strong>Consumer Price Index (CPI) for Nepal, Palestine, Kosovo and Yemen</strong>
            <br />
            <a 
              href="https://databank.worldbank.org/metadataglossary/world-development-indicators/series/FP.CPI.TOTL" 
              target="_blank" 
              rel="noopener noreferrer"
              className="data-sources__link"
            >
              https://databank.worldbank.org/metadataglossary/world-development-indicators/series/FP.CPI.TOTL
            </a>
          </li>
          <li className="data-sources__item">
            <strong>Commodity Markets | Annual prices</strong>
            <br />
            <a 
              href="https://www.worldbank.org/en/research/commodity-markets" 
              target="_blank" 
              rel="noopener noreferrer"
              className="data-sources__link"
            >
              https://www.worldbank.org/en/research/commodity-markets
            </a>
          </li>
        </ul>
      </section>

      <section className="data-sources__section">
        <h3 className="data-sources__section-title">Bank for International Settlements (BIS)</h3>
        <ul className="data-sources__list">
          <li className="data-sources__item">
            <strong>Consumer Price Index (CPI) for Argentina, Lithuania, North Macedonia and Russia</strong>
            <br />
            <a 
              href="https://data.bis.org/topics/CPI/BIS,WS_LONG_CPI,1.0/A.AR.628?additional_ts=BIS%2CWS_LONG_CPI%2C1.0%255EA.MK%2BRU%2BLT.628&filter=LAST_N_PERIODS%3D12" 
              target="_blank" 
              rel="noopener noreferrer"
              className="data-sources__link"
            >
              https://data.bis.org/topics/CPI/BIS,WS_LONG_CPI,1.0/A.AR.628?additional_ts=BIS%2CWS_LONG_CPI%2C1.0%255EA.MK%2BRU%2BLT.628&filter=LAST_N_PERIODS%3D12
            </a>
          </li>
        </ul>
      </section>

      <section className="data-sources__section">
        <h3 className="data-sources__section-title">Statistics Greenland</h3>
        <ul className="data-sources__list">
          <li className="data-sources__item">
            <strong>Consumer Price Index (CPI) for Greenland</strong>
            <br />
            <a 
              href="https://bank.stat.gl/pxweb/en/Greenland/Greenland__PR/PRXPRISF.px?rxid=PRXPRISF09-09-2025%2011:59:19" 
              target="_blank" 
              rel="noopener noreferrer"
              className="data-sources__link"
            >
              https://bank.stat.gl/pxweb/en/Greenland/Greenland__PR/PRXPRISF.px?rxid=PRXPRISF09-09-2025%2011:59:19
            </a>
          </li>
        </ul>
      </section>

      <section className="data-sources__section">
        <h3 className="data-sources__section-title">Federal Reserve Bank of St. Louis</h3>
        <ul className="data-sources__list">
          <li className="data-sources__item">
            <strong>Bitcoin price</strong>
            <br />
            <a 
              href="https://fred.stlouisfed.org/series/CBBTCUSD" 
              target="_blank" 
              rel="noopener noreferrer"
              className="data-sources__link"
            >
              https://fred.stlouisfed.org/series/CBBTCUSD
            </a>
          </li>
        </ul>
      </section>

      <section className="data-sources__section">
        <h3 className="data-sources__section-title">Cato Institute</h3>
        <ul className="data-sources__list">
          <li className="data-sources__item">
            <strong>Human Freedom Index</strong>
            <br />
            <a 
              href="https://www.cato.org/human-freedom-index/2024" 
              target="_blank" 
              rel="noopener noreferrer"
              className="data-sources__link"
            >
              https://www.cato.org/human-freedom-index/2024
            </a>
          </li>
        </ul>
      </section>
    </article>
  );
}

export default DataSources;