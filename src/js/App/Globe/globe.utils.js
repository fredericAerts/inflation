function addCountriesToMap(map, countries) {
  map.addSource('countries', {
    type: 'geojson',
    data: countries,
  });

  map.addLayer({
    id: 'countries-fill',
    type: 'fill',
    source: 'countries',
      paint: {
      'fill-color': [
        'case',
        ['==', ['get', 'inflation'], null],
        'rgba(0, 0, 0, 0)',
        ['<', ['get', 'inflation'], 2],
        '#008000',
        ['>', ['get', 'inflation'], 10],
        '#FF0000',
        [
          'interpolate',
          ['linear'],
          ['get', 'inflation'],
          2, '#008000',
          4, '#84cc16',
          6, '#FFFF00',
          8, '#FFA500',
          10, '#FF0000'
        ]
      ]
    },
  });

  // map.addLayer({
  //   id: 'countries-outline',
  //   type: 'line',
  //   source: 'countries',
  //   paint: {
  //     'line-color': '#FFFFFF',
  //     'line-width': 1,
  //   },
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


}

export {
  addCountriesToMap,
}
