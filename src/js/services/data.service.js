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

export {
  fetchCountriesGeoJson,
  fetchInflationData,
}