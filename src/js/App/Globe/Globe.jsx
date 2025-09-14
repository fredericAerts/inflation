import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { MAP_STYLE } from "./globe.constants";
import { addCountriesToMap, zoomToCountry, highlightCountryOutline, resetCountryOutlines, createMapInteractionHandlers } from './globe.utils';
import { setSelectedCountryId, setCountryModalData, setMapInstance } from './globe.redux.actions';

import './globe.styl';

function Globe() {
  const dispatch = useDispatch();
  const { countries, inflationData } = useSelector((state) => state.asyncState);
  const { selectedCountryId, map } = useSelector((state) => state.globe);
  const mapRef = useRef(null);

  useEffect(() => {
    // Determine initial zoom based on viewport size
    const getInitialZoom = () => {
      const isMobile = window.innerWidth <= 767;
      return isMobile ? 1.2 : 2;
    };

    // Small delay to ensure container dimensions are stable
    const initializeMap = () => {
      const myMap = new maplibregl.Map({
        container: mapRef.current,
        zoom: getInitialZoom(),
        maxZoom: 7,
        center: [31, 25],
        style: MAP_STYLE,
        attributionControl: false,
        padding: { top: 60, bottom: 0, left: 0, right: 0 }
      });

      myMap.addControl(new maplibregl.AttributionControl(), 'bottom-left');

      myMap.on('load', () => {
        // Force a resize after load to ensure proper dimensions
        setTimeout(() => {
          myMap.resize();
          dispatch(setMapInstance(myMap));
        }, 100);
      });

      // Handle window resize events
      const handleResize = () => {
        if (myMap) {
          myMap.resize();
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (myMap) {
          myMap.remove();
          dispatch(setMapInstance(null));
        }
      };
    };

    // Small delay for mobile to ensure container is ready
    const isMobile = window.innerWidth <= 767;
    const delay = isMobile ? 50 : 0;
    
    const timeoutId = setTimeout(initializeMap, delay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [dispatch]);

  useEffect(() => {
    if (!map || !countries || !inflationData) return;

    addCountriesToMap(map, countries, inflationData);
    setTimeout(() => {
      mapRef.current.classList.add('globe--active');  
    }, 50);

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [map, countries, inflationData]);

  // Effect to handle map interactions (click and hover)
  useEffect(() => {
    if (!map) return;

    const dispatchAction = (action) => {
      if (action.type === 'SET_SELECTED_COUNTRY_ID') {
        dispatch(setSelectedCountryId(action.payload));
      }
    };

    const { attachHandlers, detachHandlers } = createMapInteractionHandlers(map, dispatchAction, selectedCountryId);
    
    attachHandlers();

    return detachHandlers;
  }, [map, dispatch, selectedCountryId]);

  // Effect to handle country zoom when selectedCountryId changes
  useEffect(() => {
    if (!map || !countries) return;

    // Reset outlines when no country is selected
    if (!selectedCountryId) {
      resetCountryOutlines(map);
      
      // Use responsive zoom for world view
      const getWorldViewZoom = () => {
        const isMobile = window.innerWidth <= 767;
        return isMobile ? 1.2 : 2;
      };
      
      map.flyTo({ 
        center: [31, 25], 
        zoom: getWorldViewZoom(), 
        essential: true,
        padding: { top: 60, bottom: 0, left: 0, right: 0 }
      });
      return;
    }

    const handleCountryZoom = async () => {
      // Find the complete country data from Redux using iso_a3
      const sourceCountry = countries.features.find(country => 
        country.properties.iso_a3 === selectedCountryId
      );
      
      if (!sourceCountry) {
        console.warn('Could not find country in source data:', selectedCountryId);
        return;
      }

      try {
        // Highlight the selected country's outline with golden color
        highlightCountryOutline(map, selectedCountryId);
        
        // Zoom to country and wait for animation to complete
        await zoomToCountry(map, sourceCountry);
        
        // Find the enriched feature for inflation data
        const enrichedFeatures = map.querySourceFeatures('countries', {
          sourceLayer: 'countries'
        });
        const enrichedFeature = enrichedFeatures.find(feature => 
          feature.properties.iso_a3 === selectedCountryId
        );
        
        // Dispatch modal data instead of showing alert
        const inflation = enrichedFeature?.properties.avg_inflation;
        const inflationText = inflation ? `${Math.round(inflation)}%` : 'N/A';
        
        dispatch(setCountryModalData({
          ...(sourceCountry.properties || {}),
          inflation: inflationText,
        }));
      } catch (error) {
        console.error('Error zooming to country:', error);
      }
    };

    handleCountryZoom();
  }, [map, countries, selectedCountryId, dispatch]);

  return (
    <div className="globe" ref={mapRef} />
  );
}

export default Globe;