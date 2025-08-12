import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { MAP_STYLE } from "./globe.constants";
import { addCountriesToMap, zoomToCountry, highlightCountryOutline, resetCountryOutlines } from './globe.utils';
import { setSelectedCountryId, setCountryModalData } from './globe.redux.actions';

import './globe.styl';

function Globe() {
  const [map, setMap] = useState(null);
  const dispatch = useDispatch();
  const { countries, inflationData } = useSelector((state) => state.asyncState);
  const { selectedCountryId } = useSelector((state) => state.globe);
  const mapRef = useRef(null);

  useEffect(() => {
    const myMap = new maplibregl.Map({
      container: mapRef.current,
      zoom: 2,
      maxZoom: 7,
      center: [31, 25],
      style: MAP_STYLE,
      attributionControl: false, // Disable default attribution
    });

    myMap.addControl(new maplibregl.AttributionControl(), 'bottom-left');

    myMap.on('load', () => setMap(myMap));
  }, []);

  useEffect(() => {
    if (!map || !countries || !inflationData) return;

    addCountriesToMap(map, countries, inflationData);
    setTimeout(() => {
      mapRef.current.classList.add('globe--active');  
    }, 50);

    const handleMapClick = (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['countries-fill']
      });
      if (features?.length) {
        const clickedFeature = features[0];
        const countryId = clickedFeature.properties.iso_a3_eh;
        
        // Dispatch Redux action to update selected country
        dispatch(setSelectedCountryId(countryId));
      }
    };

    map.on('click', handleMapClick);

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [map, countries, inflationData, dispatch]);

  // Effect to handle country zoom when selectedCountryId changes
  useEffect(() => {
    if (!map || !countries) return;

    // Reset outlines when no country is selected
    if (!selectedCountryId) {
      resetCountryOutlines(map);
      // Use consistent world view center instead of current center
      map.flyTo({ center: [31, 25], zoom: 2, essential: true });
      return;
    }

    const handleCountryZoom = async () => {
      // Find the complete country data from Redux using iso_a3_eh
      const sourceCountry = countries.features.find(country => 
        country.properties.iso_a3_eh === selectedCountryId
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
          feature.properties.iso_a3_eh === selectedCountryId
        );
        
        // Dispatch modal data instead of showing alert
        const inflation = enrichedFeature?.properties.avg_inflation;
        const inflationText = inflation ? `${Math.round(inflation)}%` : 'N/A';
        
        dispatch(setCountryModalData({
          countryName: sourceCountry.properties.name || 'Unknown Country',
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