function addCountriesToMap(map, countries, inflationData) {
  const { type, features } = countries;

  const enrichedFeatures = features.map((country) => {
    const inflationEntry = inflationData
      .find(({ _id }) => _id === country.properties.iso_a3_eh);
    
    const { avg_inflation_last_10_years } = inflationEntry || {};

    return {
      ...country,
      properties: {
        ...country.properties,
        avg_inflation: avg_inflation_last_10_years || null,
      },
    };
  });

  map.addSource('countries', {
    type: 'geojson',
    data: { type, features: enrichedFeatures },
  });

  map.addLayer({
    id: 'countries-fill',
    type: 'fill',
    source: 'countries',
    paint: {
      'fill-color': [
        'case',
        ['==', ['get', 'avg_inflation'], null],
        'rgba(0, 0, 0, 0)', // transparent if no data

        ['<', ['get', 'avg_inflation'], 2],
        '#2e7d32', // dark green — low inflation, good

        ['>', ['get', 'avg_inflation'], 8],
        '#b71c1c', // dark red — critical

        [
          'interpolate',
          ['linear'],
          ['get', 'avg_inflation'],
          2, '#2e7d32',
          3, '#d4ac0d',
          4, '#f39c12',
          5, '#e67e22',
          6, '#e74c3c',
          8, '#b71c1c',
        ]
      ]
    }
  });


  map.addLayer({
    id: 'countries-outline',
    type: 'line',
    source: 'countries',
    paint: {
      'line-color': 'rgba(255, 255, 255, 0.3)',
      'line-width': 0.5,
    },
  });


  map.addLayer({
    id: 'countries-labels',
    type: 'symbol',
    source: 'countries',
    layout: {
      'text-field': ['get', 'name'],
      'text-font': ['Open Sans Regular'],
      'text-size': 12,
      'text-anchor': 'center',
      'visibility': 'visible'
    },
    paint: {
      'text-color': '#ffffff',
      'text-halo-color': '#000000',
      'text-halo-width': 2
    },
    minzoom: 1
  });
}

export {
  addCountriesToMap,
}
