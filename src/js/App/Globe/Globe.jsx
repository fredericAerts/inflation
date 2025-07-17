import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { MAP_STYLE } from "./globe.constants";
import { fetchCountriesGeoJson } from '../../services/data.service';
import { addCountriesToMap } from './globe.utils';

import './globe.styl';

function Globe() {
  const [map, setMap] = useState(null);
  const [countries, setCountries] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const myMap = new maplibregl.Map({
      container: mapRef.current,
      zoom: 2,
      maxZoom: 7,
      center: [31, 25],
      style: MAP_STYLE,
    });

    const fetchData = async () => {
      try {
        const geoJson = await fetchCountriesGeoJson();
        return geoJson;
      } catch (error) {
        console.error('Error fetching countries GeoJSON:', error);
        return null;
      }
    };

    const mapLoaded = new Promise((resolve) => {
      myMap.on('load', () => resolve());
    });

    (async () => {
      const [geoJson] = await Promise.all([fetchData(), mapLoaded]);
      setMap(myMap);
      setCountries(geoJson);
    })();
  }, []);

  useEffect(() => {
    if (!map || !countries) return;

    addCountriesToMap(map, countries);

    const handleMapClick = (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['countries-fill']
      });
      if (features?.length) {
        console.log('Clicked country feature:', features[0]);
      }
    };

    map.on('click', handleMapClick);

    return () => {
      if (map) {
        map.remove();
      }
      
    };
  }, [map, countries]);

  return (
    <div className="globe" ref={mapRef} />
  );

}

export default Globe;