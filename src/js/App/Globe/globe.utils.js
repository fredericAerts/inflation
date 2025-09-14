import maplibregl from 'maplibre-gl';
import { area } from '@turf/area';

const ensureMapResize = (map) => {
  if (map && map.resize) {
    // Force multiple resize calls to handle any timing issues
    map.resize();
    requestAnimationFrame(() => {
      map.resize();
    });
  }
};

async function addCountriesToMap(map, countries, inflationData) {
  const { type, features } = countries;

  const enrichedFeatures = features.map((country) => {
    const inflationEntry = inflationData
      .find(({ _id }) => _id === country.properties.iso_a3);
    
    const { avg_inflation_last_10_years, skipped_years, data_source } = inflationEntry || {};

    return {
      ...country,
      properties: {
        ...country.properties,
        avg_inflation: avg_inflation_last_10_years || null,
        data_source: data_source || null,
        skipped_years: skipped_years || null,
      },
    };
  });

  // Create diagonal stripe pattern
  const createDiagonalPattern = async () => {
    const size = 16;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = size;
    canvas.height = size;
    
    ctx.clearRect(0, 0, size, size);
    
    // Draw diagonal lines with white color for visibility
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    // Increase spacing from 4 to 8 to make bands wider apart
    for (let i = -size; i <= size * 2; i += 8) {
      ctx.moveTo(i, 0);
      ctx.lineTo(i + size, size);
    }
    
    ctx.stroke();
    
    // Convert canvas to ImageBitmap for MapLibre GL v3+ compatibility
    return await createImageBitmap(canvas);
  };

  map.addSource('countries', {
    type: 'geojson',
    data: { type, features: enrichedFeatures },
  });

  // Add diagonal pattern to map
  const patternImageBitmap = await createDiagonalPattern();
  map.addImage('diagonal-stripes', patternImageBitmap, { pixelRatio: 1 });

  // Base fill layer for countries with complete data (no skipped years)
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

  // Add diagonal pattern overlay for countries with skipped years
  map.addLayer({
    id: 'countries-pattern-overlay',
    type: 'fill',
    source: 'countries',
    filter: ['!=', ['get', 'skipped_years'], null],
    paint: {
      'fill-pattern': 'diagonal-stripes',
      'fill-opacity': 0.8
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

  // map.addLayer({
  //   id: 'countries-labels',
  //   type: 'symbol',
  //   source: 'countries',
  //   layout: {
  //     'text-field': ['get', 'name'],
  //     'text-font': ['Open Sans Regular'],
  //     'text-size': 12,
  //     'text-anchor': 'center',
  //     'visibility': 'visible'
  //   },
  //   paint: {
  //     'text-color': '#ffffff',
  //     'text-halo-color': '#000000',
  //     'text-halo-width': 2
  //   },
  //   minzoom: 1
  // });

  // After adding all layers, ensure map is properly sized
  ensureMapResize(map);
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
    const countryCode = sourceCountry.properties.iso_a3;
    
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
      padding: { top: 110, bottom: 50, left: 50, right: 50 }, // Extra top padding for the 60px offset
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
      const countryId = clickedFeature.properties.iso_a3;
      
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
      layers: ['countries-fill', 'countries-pattern-overlay']
    });

    if (features?.length) {
      const feature = features[0];
      const country = feature.properties.name;
      const inflation = feature.properties.avg_inflation;
      const dataSource = feature.properties.data_source;
      const skippedYears = feature.properties.skipped_years;
      const inflationText = inflation ? `${Math.round(inflation)}%` : 'N/A';
      const incompleteClass = (skippedYears && inflation) ? ' globe-popup__inflation--incomplete' : '';
      
      popup.setLngLat(map.unproject(e.point))
        .setHTML(`
          <div class="globe-popup__content">
            <div class="globe-popup__country">${country}</div>
            <div class="globe-popup__inflation${incompleteClass}">${inflationText}</div>
            <div class="globe-popup__data-source">${dataSource || 'N/A'}</div>
          </div>
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

const highlightCountryOutline = (map, selectedCountryId) => {
  // Check if the layer exists before trying to style it
  if (map.getLayer('countries-outline')) {
    map.setPaintProperty('countries-outline', 'line-color', [
      'case',
      ['==', ['get', 'iso_a3'], selectedCountryId],
      '#FFD700', // Golden color for selected country
      'rgba(255, 255, 255, 0.3)' // Default color for other countries
    ]);
    
    map.setPaintProperty('countries-outline', 'line-width', [
      'case',
      ['==', ['get', 'iso_a3'], selectedCountryId],
      2, // Thicker line for selected country
      0.5 // Default width for other countries
    ]);
  }
};

const resetCountryOutlines = (map) => {
  // Check if the layer exists before trying to style it
  if (map.getLayer('countries-outline')) {
    map.setPaintProperty('countries-outline', 'line-color', 'rgba(255, 255, 255, 0.3)');
    map.setPaintProperty('countries-outline', 'line-width', 0.5);
  }
};

const resetMapToInitialPosition = (map) => {
  if (map) {
    // Use responsive zoom for consistent behavior
    const getInitialZoom = () => {
      const isMobile = window.innerWidth <= 767;
      return isMobile ? 1.2 : 2;
    };
    
    map.flyTo({ 
      center: [31, 25], 
      zoom: getInitialZoom(), 
      essential: true,
      padding: { top: 60, bottom: 0, left: 0, right: 0 }
    });
  }
};

export {
  addCountriesToMap,
  zoomToCountry,
  highlightCountryOutline,
  resetCountryOutlines,
  createMapInteractionHandlers,
  resetMapToInitialPosition,
  ensureMapResize,
}
