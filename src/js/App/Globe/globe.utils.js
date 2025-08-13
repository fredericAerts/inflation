import maplibregl from 'maplibre-gl';
import { area } from '@turf/area';

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
        getComputedStyle(document.documentElement).getPropertyValue('--color-black')?.trim() || '#1F1F1F',

        ['<', ['get', 'avg_inflation'], 2],
        '#43a047',

        ['>', ['get', 'avg_inflation'], 10],
        '#b71c1c',

        [
          'interpolate',
          ['linear'],
          ['get', 'avg_inflation'],
          2, '#43a047',   // Green (low inflation)
          3, '#689f38',   // Light green
          4, '#8bc34a',   // Yellow-green
          5, '#ffc107',   // Yellow
          6, '#ff9800',   // Orange
          7, '#ff5722',   // Deep orange
          8, '#f44336',   // Red
          9, '#d32f2f',   // Dark red
          10, '#b71c1c',  // Darkest red (high inflation)
        ]
      ],
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


  // map.addLayer({
  //   id: 'inflation-labels',
  //   type: 'symbol',
  //   source: 'countries',
  //   layout: {
  //     'text-field': [
  //       'case',
  //       ['==', ['get', 'avg_inflation'], null],
  //       'N/A',
  //       [
  //         'concat',
  //         ['to-string', ['round', ['get', 'avg_inflation']]],
  //         '%'
  //       ]
  //     ],
  //     'text-font': ['Open Sans Regular'],
  //     'text-size': 11,
  //     'text-anchor': 'center',
  //     'visibility': 'visible'
  //   },
  //   paint: {
  //     'text-color': '#ffffff',
  //     'text-halo-color': '#000000',
  //     'text-halo-width': 2
  //   },
  //   minzoom: 2
  // });

//   map.addLayer({
//     id: 'countries-labels',
//     type: 'symbol',
//     source: 'countries',
//     layout: {
//       'text-field': ['get', 'name'],
//       'text-font': ['Open Sans Regular'],
//       'text-size': 12,
//       'text-anchor': 'center',
//       'visibility': 'visible'
//     },
//     paint: {
//       'text-color': '#ffffff',
//       'text-halo-color': '#000000',
//       'text-halo-width': 2
//     },
//     minzoom: 1
//   });
}

const COUNTRIES_WITH_ALL_POLYGONS = ['IDN', 'PHL', 'JPN', 'FJI', 'VUT'];

const zoomToCountry = (map, sourceCountry, duration = 600) => {
  return new Promise((resolve) => {
    // Disable pointer events on the map container during zoom
    if (map?.getContainer) {
      map.getContainer().style.pointerEvents = 'none';
      document.body.style.pointerEvents = 'none';
    }
    
    const coordinates = sourceCountry.geometry.coordinates;
    const bounds = new maplibregl.LngLatBounds();
    const countryCode = sourceCountry.properties.iso_a3_eh;
    
    const addCoordinatesToBounds = (coords) => {
      coords.forEach(coord => {
        if (Array.isArray(coord) && typeof coord[0] === 'number') {
          bounds.extend(coord);
        } else if (Array.isArray(coord)) {
          addCoordinatesToBounds(coord);
        }
      });
    };
    
    if (sourceCountry.geometry.type === 'Polygon') {
      coordinates.forEach(ring => addCoordinatesToBounds(ring));
    } else if (sourceCountry.geometry.type === 'MultiPolygon') {
      // Check if this country should include all polygons
      if (COUNTRIES_WITH_ALL_POLYGONS.includes(countryCode)) {
        // Use all polygons for specific countries
        coordinates.forEach(polygon => {
          polygon.forEach(ring => addCoordinatesToBounds(ring));
        });
      } else {
        // Find the largest polygon using Turf.js for other countries
        const largestPolygon = coordinates.reduce((largest, current) => {
          const currentPolygon = { type: 'Polygon', coordinates: current };
          const largestPolygon = largest ? { type: 'Polygon', coordinates: largest } : null;
          
          return !largestPolygon || area(currentPolygon) > area(largestPolygon) 
            ? current 
            : largest;
        }, null);
        
        // Use only the largest polygon for bounds calculation
        if (largestPolygon) {
          largestPolygon.forEach(ring => addCoordinatesToBounds(ring));
        } else {
          // Fallback to using all polygons
          coordinates.forEach(polygon => {
            polygon.forEach(ring => addCoordinatesToBounds(ring));
          });
        }
      }
    }
    
    // Zoom to the country bounds
    map.fitBounds(bounds, {
      padding: 50,
      duration,
    });
    
    // Resolve promise when zoom animation finishes
    const onZoomEnd = () => {
      map.off('moveend', onZoomEnd);
      
      // Re-enable pointer events on the map container
      if (map?.getContainer) {
        map.getContainer().style.pointerEvents = 'auto';
      }
      document.body.style.pointerEvents = 'auto';
      
      resolve();
    };
    
    map.on('moveend', onZoomEnd);
  });
};

const highlightCountryOutline = (map, selectedCountryId) => {
  map.setPaintProperty('countries-outline', 'line-color', [
    'case',
    ['==', ['get', 'iso_a3_eh'], selectedCountryId],
    '#FFD700', // Golden color for selected country
    'rgba(255, 255, 255, 0.3)' // Default color for other countries
  ]);
  
  map.setPaintProperty('countries-outline', 'line-width', [
    'case',
    ['==', ['get', 'iso_a3_eh'], selectedCountryId],
    2, // Thicker line for selected country
    0.5 // Default width for other countries
  ]);
};

const resetCountryOutlines = (map) => {
  map.setPaintProperty('countries-outline', 'line-color', 'rgba(255, 255, 255, 0.3)');
  map.setPaintProperty('countries-outline', 'line-width', 0.5);
};

const createMapInteractionHandlers = (map, dispatch, selectedCountryId) => {
  const popup = new maplibregl.Popup({
    closeButton: false,
    closeOnClick: false,
    className: 'globe-popup',
    anchor: 'bottom',
    offset: [0, -10]
  });

  const handleMapClick = (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ['countries-fill']
    });
    if (features?.length) {
      const clickedFeature = features[0];
      const countryId = clickedFeature.properties.iso_a3_eh;
      
      dispatch({ type: 'SET_SELECTED_COUNTRY_ID', payload: countryId });
    }
  };

  const handleMapMouseMove = (e) => {
    // Don't show popup if a country is selected
    if (selectedCountryId) {
      popup.remove();
      map.getCanvas().style.cursor = '';
      return;
    }

    const features = map.queryRenderedFeatures(e.point, {
      layers: ['countries-fill']
    });

    if (features?.length) {
      const feature = features[0];
      const inflation = feature.properties.avg_inflation;
      const inflationText = inflation ? `${Math.round(inflation)}%` : 'N/A';
      
      popup.setLngLat(map.unproject(e.point))
        .setHTML(`
          <div style="background: black; color: white; padding: 8px 12px; border-radius: 4px; font-size: 12px;">
            Inflation: ${inflationText}
          </div>
          <style>
            .globe-popup .maplibregl-popup-content {
              background: transparent !important;
              box-shadow: none !important;
              padding: 0 !important;
            }
            .globe-popup .maplibregl-popup-tip {
              display: none !important;
            }
          </style>
        `)
        .addTo(map);

      map.getCanvas().style.cursor = 'pointer';
    } else {
      popup.remove();
      map.getCanvas().style.cursor = '';
    }
  };

  const handleMapMouseLeave = () => {
    popup.remove();
    map.getCanvas().style.cursor = '';
  };

  const attachHandlers = () => {
    map.on('click', handleMapClick);
    map.on('mousemove', handleMapMouseMove);
    map.on('mouseleave', handleMapMouseLeave);
  };

  const detachHandlers = () => {
    map.off('click', handleMapClick);
    map.off('mousemove', handleMapMouseMove);
    map.off('mouseleave', handleMapMouseLeave);
    popup.remove();
  };

  return { attachHandlers, detachHandlers };
};

export {
  addCountriesToMap,
  zoomToCountry,
  highlightCountryOutline,
  resetCountryOutlines,
  createMapInteractionHandlers,
}
