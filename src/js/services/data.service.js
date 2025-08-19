async function fetchCountriesGeoJson() {
  try {
    const response = await fetch('/api/countries');
    if (!response.ok) {
      throw new Error(`Failed to fetch countries GeoJSON: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`[fetchCountriesGeoJson] Error:`, error);
    throw error;
  }
}

async function fetchInflationData() {
  try {
    const response = await fetch('/api/inflation-data');
    if (!response.ok) {
      throw new Error(`Failed to fetch inflation data: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`[fetchInflationData] Error:`, error);
    throw error;
  }
}

async function fetchMetrics(iso3Code) {
  try {
    const response = await fetch(`/api/metrics/${iso3Code}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null; // No metrics found for this country
      }
      throw new Error(`Failed to fetch metrics: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`[fetchMetrics] Error for ${iso3Code}:`, error);
    throw error;
  }
}

export {
  fetchCountriesGeoJson,
  fetchInflationData,
  fetchMetrics,
}