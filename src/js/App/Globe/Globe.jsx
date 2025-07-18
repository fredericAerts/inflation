import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { MAP_STYLE } from "./globe.constants";
import { addCountriesToMap } from './globe.utils';

import './globe.styl';

function Globe() {
  const [map, setMap] = useState(null);
  const { countries, inflationData } = useSelector((state) => state.asyncState);
  const mapRef = useRef(null);

  useEffect(() => {
    const myMap = new maplibregl.Map({
      container: mapRef.current,
      zoom: 2,
      maxZoom: 7,
      center: [31, 25],
      style: MAP_STYLE,
    });

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
        console.log('Clicked country feature:', features[0]);
      }
    };

    map.on('click', handleMapClick);

    return () => {
      if (map) {
        map.remove();
      }
      
    };
  }, [map, countries, inflationData]);

  return (
    <div className="globe" ref={mapRef} />
  );

}

export default Globe;