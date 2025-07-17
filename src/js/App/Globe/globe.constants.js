const MAP_STYLE = {
  'version': 8,
  'projection': {
    'type': 'globe'
  },
  'glyphs': 'http://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
  'sources': {
    'satellite': {
      'url': `https://api.maptiler.com/tiles/satellite-v2/tiles.json?key=${import.meta.env.VITE_MAPTILER_KEY}`,
      'type': 'raster'
    },
  },
  'layers': [
    {
      'id': 'Satellite',
      'type': 'raster',
      'source': 'satellite',
    }
  ],
  'sky': {
    'atmosphere-blend': [
      'interpolate',
      ['linear'],
      ['zoom'],
      0, 1,
      5, 1,
      7, 0
    ]
  },
  'light': {
    'position': [1, 90, 130]
  }
}

export { MAP_STYLE };