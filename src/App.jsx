import React, { useState, useRef, useEffect } from 'react';
import { Map, Layers, Menu, Search, Download, Info, Settings, ZoomIn, ZoomOut, Maximize2, Filter, Eye, EyeOff, Edit3, Trash2, Check, X, Home, MapPin, Upload, Link, FileText, ChevronDown } from 'lucide-react';

export default function DataGridViewer() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('layers');
  const [drawMode, setDrawMode] = useState(false);
  const [drawnArea, setDrawnArea] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawPoints, setDrawPoints] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 31.0, lon: -100.0, zoom: 6 }); // Texas default
  const [vectorData, setVectorData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [lastMapCenter, setLastMapCenter] = useState({ lat: 31.0, lon: -100.0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [importedData, setImportedData] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importMethod, setImportMethod] = useState('paste');
  const [importText, setImportText] = useState('');
  const [importUrl, setImportUrl] = useState('');
  const [importError, setImportError] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [useCorsProxy, setUseCorsProxy] = useState(true);
  const [searchableLocations, setSearchableLocations] = useState([]);
  const [selectedFeatureTypes, setSelectedFeatureTypes] = useState(['city', 'park', 'imported_polygon']);
  const [selectedCountries, setSelectedCountries] = useState(['USA', 'Canada', 'Mexico']);
  const [selectedCities, setSelectedCities] = useState([]);
  const [showFeatureDropdown, setShowFeatureDropdown] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitUrl, setSubmitUrl] = useState('');
  const [editingLayerId, setEditingLayerId] = useState(null);
  const [editingLayerName, setEditingLayerName] = useState('');
  const [zoomBoxMode, setZoomBoxMode] = useState(false);
  const [zoomBoxStart, setZoomBoxStart] = useState(null);
  const [zoomBoxEnd, setZoomBoxEnd] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [identifyMode, setIdentifyMode] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [showAttributePanel, setShowAttributePanel] = useState(false);
  const [toolboxExpanded, setToolboxExpanded] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [showBasemapSelector, setShowBasemapSelector] = useState(false);
  const [selectedBasemap, setSelectedBasemap] = useState('street');
  const [expandedToolSection, setExpandedToolSection] = useState('discover');
  
  // Default extent for Texas
  const TEXAS_DEFAULT_VIEW = { lat: 31.0, lon: -100.0, zoom: 6 };
  const [layers, setLayers] = useState([
    { id: 2, name: 'Major Cities (US & Canada)', type: 'vector', visible: false, opacity: 80 },
    { id: 3, name: 'National Parks', type: 'vector', visible: false, opacity: 100 },
    { id: 4, name: 'Imported Data', type: 'vector', visible: true, opacity: 100 },
    { id: 1, name: 'Map Base Layer', type: 'raster', visible: true, opacity: 100 },
  ]);

  const mapRef = useRef(null);
  const featureDropdownRef = useRef(null);
  const countryDropdownRef = useRef(null);
  const cityDropdownRef = useRef(null);

  useEffect(() => {
    const cities = [
      // Major US Cities (50+)
      { id: 'nyc', type: 'city', name: 'New York City', lat: 40.7128, lon: -74.0060, population: 8336817, country: 'USA', category: 'Urban', state: 'New York' },
      { id: 'la', type: 'city', name: 'Los Angeles', lat: 34.0522, lon: -118.2437, population: 3979576, country: 'USA', category: 'Urban', state: 'California' },
      { id: 'chicago', type: 'city', name: 'Chicago', lat: 41.8781, lon: -87.6298, population: 2693976, country: 'USA', category: 'Urban', state: 'Illinois' },
      { id: 'houston', type: 'city', name: 'Houston', lat: 29.7604, lon: -95.3698, population: 2320268, country: 'USA', category: 'Urban', state: 'Texas' },
      { id: 'phoenix', type: 'city', name: 'Phoenix', lat: 33.4484, lon: -112.0740, population: 1680992, country: 'USA', category: 'Urban', state: 'Arizona' },
      { id: 'philadelphia', type: 'city', name: 'Philadelphia', lat: 39.9526, lon: -75.1652, population: 1584064, country: 'USA', category: 'Urban', state: 'Pennsylvania' },
      { id: 'san_antonio', type: 'city', name: 'San Antonio', lat: 29.4241, lon: -98.4936, population: 1547253, country: 'USA', category: 'Urban', state: 'Texas' },
      { id: 'san_diego', type: 'city', name: 'San Diego', lat: 32.7157, lon: -117.1611, population: 1423851, country: 'USA', category: 'Urban', state: 'California' },
      { id: 'dallas', type: 'city', name: 'Dallas', lat: 32.7767, lon: -96.7970, population: 1343573, country: 'USA', category: 'Urban', state: 'Texas' },
      { id: 'san_jose', type: 'city', name: 'San Jose', lat: 37.3382, lon: -121.8863, population: 1021795, country: 'USA', category: 'Urban', state: 'California' },
      { id: 'austin', type: 'city', name: 'Austin', lat: 30.2672, lon: -97.7431, population: 978908, country: 'USA', category: 'Urban', state: 'Texas' },
      { id: 'seattle', type: 'city', name: 'Seattle', lat: 47.6062, lon: -122.3321, population: 753675, country: 'USA', category: 'Urban', state: 'Washington' },
      { id: 'denver', type: 'city', name: 'Denver', lat: 39.7392, lon: -104.9903, population: 715522, country: 'USA', category: 'Urban', state: 'Colorado' },
      { id: 'boston', type: 'city', name: 'Boston', lat: 42.3601, lon: -71.0589, population: 692600, country: 'USA', category: 'Urban', state: 'Massachusetts' },
      { id: 'miami', type: 'city', name: 'Miami', lat: 25.7617, lon: -80.1918, population: 442241, country: 'USA', category: 'Urban', state: 'Florida' },
      { id: 'atlanta', type: 'city', name: 'Atlanta', lat: 33.7490, lon: -84.3880, population: 498715, country: 'USA', category: 'Urban', state: 'Georgia' },
      { id: 'detroit', type: 'city', name: 'Detroit', lat: 42.3314, lon: -83.0458, population: 639111, country: 'USA', category: 'Urban', state: 'Michigan' },
      { id: 'portland', type: 'city', name: 'Portland', lat: 45.5152, lon: -122.6784, population: 652503, country: 'USA', category: 'Urban', state: 'Oregon' },
      { id: 'las_vegas', type: 'city', name: 'Las Vegas', lat: 36.1699, lon: -115.1398, population: 641903, country: 'USA', category: 'Urban', state: 'Nevada' },
      { id: 'baltimore', type: 'city', name: 'Baltimore', lat: 39.2904, lon: -76.6122, population: 585708, country: 'USA', category: 'Urban', state: 'Maryland' },
      
      // Major Canadian Cities (25+)
      { id: 'toronto', type: 'city', name: 'Toronto', lat: 43.6532, lon: -79.3832, population: 2930000, country: 'Canada', category: 'Urban', state: 'Ontario' },
      { id: 'montreal', type: 'city', name: 'Montreal', lat: 45.5017, lon: -73.5673, population: 1780000, country: 'Canada', category: 'Urban', state: 'Quebec' },
      { id: 'vancouver', type: 'city', name: 'Vancouver', lat: 49.2827, lon: -123.1207, population: 675218, country: 'Canada', category: 'Urban', state: 'British Columbia' },
      { id: 'calgary', type: 'city', name: 'Calgary', lat: 51.0447, lon: -114.0719, population: 1336000, country: 'Canada', category: 'Urban', state: 'Alberta' },
      { id: 'edmonton', type: 'city', name: 'Edmonton', lat: 53.5461, lon: -113.4938, population: 1010899, country: 'Canada', category: 'Urban', state: 'Alberta' },
      { id: 'ottawa', type: 'city', name: 'Ottawa', lat: 45.4215, lon: -75.6972, population: 1017449, country: 'Canada', category: 'Urban', state: 'Ontario' },
      { id: 'winnipeg', type: 'city', name: 'Winnipeg', lat: 49.8951, lon: -97.1384, population: 749534, country: 'Canada', category: 'Urban', state: 'Manitoba' },
      { id: 'quebec_city', type: 'city', name: 'Quebec City', lat: 46.8139, lon: -71.2080, population: 542298, country: 'Canada', category: 'Urban', state: 'Quebec' },
      { id: 'hamilton', type: 'city', name: 'Hamilton', lat: 43.2557, lon: -79.8711, population: 569353, country: 'Canada', category: 'Urban', state: 'Ontario' },
      { id: 'halifax', type: 'city', name: 'Halifax', lat: 44.6488, lon: -63.5752, population: 439819, country: 'Canada', category: 'Urban', state: 'Nova Scotia' },
      
      // Major Mexican Cities (25+)
      { id: 'mexico_city', type: 'city', name: 'Mexico City', lat: 19.4326, lon: -99.1332, population: 9209944, country: 'Mexico', category: 'Urban', state: 'Ciudad de México' },
      { id: 'guadalajara', type: 'city', name: 'Guadalajara', lat: 20.6597, lon: -103.3496, population: 1495189, country: 'Mexico', category: 'Urban', state: 'Jalisco' },
      { id: 'monterrey', type: 'city', name: 'Monterrey', lat: 25.6866, lon: -100.3161, population: 1142952, country: 'Mexico', category: 'Urban', state: 'Nuevo León' },
      { id: 'puebla', type: 'city', name: 'Puebla', lat: 19.0414, lon: -98.2063, population: 1692181, country: 'Mexico', category: 'Urban', state: 'Puebla' },
      { id: 'tijuana', type: 'city', name: 'Tijuana', lat: 32.5149, lon: -117.0382, population: 1810645, country: 'Mexico', category: 'Urban', state: 'Baja California' },
      { id: 'leon', type: 'city', name: 'León', lat: 21.1250, lon: -101.6860, population: 1579803, country: 'Mexico', category: 'Urban', state: 'Guanajuato' },
      { id: 'juarez', type: 'city', name: 'Ciudad Juárez', lat: 31.6904, lon: -106.4245, population: 1501551, country: 'Mexico', category: 'Urban', state: 'Chihuahua' },
      { id: 'cancun', type: 'city', name: 'Cancún', lat: 21.1619, lon: -86.8515, population: 888797, country: 'Mexico', category: 'Urban', state: 'Quintana Roo' },
      { id: 'merida', type: 'city', name: 'Mérida', lat: 20.9674, lon: -89.5926, population: 921770, country: 'Mexico', category: 'Urban', state: 'Yucatán' },
      { id: 'queretaro', type: 'city', name: 'Querétaro', lat: 20.5888, lon: -100.3899, population: 1049777, country: 'Mexico', category: 'Urban', state: 'Querétaro' },
    ];
    
    const parks = [
      { id: 'yellowstone', type: 'park', name: 'Yellowstone', lat: 44.4280, lon: -110.5885, category: 'Forest', country: 'USA' },
      { id: 'grand_canyon', type: 'park', name: 'Grand Canyon', lat: 36.1069, lon: -112.1129, category: 'Forest', country: 'USA' },
      { id: 'yosemite', type: 'park', name: 'Yosemite', lat: 37.8651, lon: -119.5383, category: 'Forest', country: 'USA' },
      { id: 'banff', type: 'park', name: 'Banff', lat: 51.4968, lon: -115.9281, category: 'Forest', country: 'Canada' },
    ];
    
    const statesData = [
      { id: 'state_tx', type: 'state', name: 'Texas', lat: 31.9686, lon: -99.9018, zoom: 6 },
      { id: 'state_ca', type: 'state', name: 'California', lat: 36.7783, lon: -119.4179, zoom: 6 },
    ];
    
    setVectorData([...cities, ...parks]);
    setFilteredData([...cities, ...parks]);
    setSearchableLocations([...cities, ...parks, ...statesData]);
  }, []);

  useEffect(() => {
    applyFeatureFilter();
  }, [selectedFeatureTypes, selectedCountries, selectedCities, vectorData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (featureDropdownRef.current && !featureDropdownRef.current.contains(event.target)) {
        setShowFeatureDropdown(false);
      }
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
        setShowCountryDropdown(false);
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target)) {
        setShowCityDropdown(false);
        setCitySearchQuery('');
      }
      if (menuDropdownRef.current && !menuDropdownRef.current.contains(event.target)) {
        setShowMenuDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applyFeatureFilter = () => {
    const filtered = vectorData.filter(item => {
      const typeMatch = selectedFeatureTypes.includes(item.type);
      const countryMatch = !item.country || selectedCountries.includes(item.country);
      
      let cityMatch = true;
      if (item.type === 'city' && selectedCities.length > 0) {
        cityMatch = selectedCities.includes(item.id);
      }
      
      return typeMatch && countryMatch && cityMatch;
    });
    setFilteredData(filtered);
  };

  const toggleFeatureType = (type) => {
    setSelectedFeatureTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const toggleCountry = (country) => {
    setSelectedCountries(prev => {
      const newCountries = prev.includes(country) 
        ? prev.filter(c => c !== country)
        : [...prev, country];
      
      if (!newCountries.includes(country)) {
        setSelectedCities(current => 
          current.filter(cityId => {
            const city = vectorData.find(item => item.id === cityId);
            return city && city.country !== country;
          })
        );
      }
      
      return newCountries;
    });
  };

  const toggleCity = (cityId) => {
    setSelectedCities(prev => {
      if (prev.includes(cityId)) {
        return prev.filter(c => c !== cityId);
      } else {
        return [...prev, cityId];
      }
    });
  };

  const getAvailableCities = () => {
    return vectorData
      .filter(item => item.type === 'city')
      .filter(city => selectedCountries.includes(city.country))
      .filter(city => {
        if (!citySearchQuery) return true;
        const query = citySearchQuery.toLowerCase();
        return city.name.toLowerCase().includes(query) || 
               city.state?.toLowerCase().includes(query) ||
               city.country.toLowerCase().includes(query);
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const selectAllCities = () => {
    const availableCities = getAvailableCities();
    setSelectedCities(availableCities.map(c => c.id));
  };

  const deselectAllCities = () => {
    setSelectedCities([]);
  };

  const getAvailableFeatureTypes = () => {
    const types = new Set(vectorData.map(item => item.type));
    const typeLabels = {
      'city': 'Cities',
      'park': 'National Parks',
      'imported_polygon': 'Imported Bounding Boxes'
    };
    
    return Array.from(types).map(type => ({
      value: type,
      label: typeLabels[type] || type
    }));
  };

  const toggleLayer = (id) => {
    setLayers(layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  };

  const updateOpacity = (id, opacity) => {
    setLayers(layers.map(l => l.id === id ? { ...l, opacity } : l));
  };

  const startEditingLayerName = (id, currentName) => {
    setEditingLayerId(id);
    setEditingLayerName(currentName);
  };

  const saveLayerName = (id) => {
    if (editingLayerName.trim()) {
      setLayers(layers.map(l => l.id === id ? { ...l, name: editingLayerName.trim() } : l));
    }
    setEditingLayerId(null);
    setEditingLayerName('');
  };

  const cancelEditingLayerName = () => {
    setEditingLayerId(null);
    setEditingLayerName('');
  };

  const latLonToPixel = (lat, lon) => {
    if (!mapRef.current) return { x: 0, y: 0 };
    const rect = mapRef.current.getBoundingClientRect();
    const zoom = mapCenter.zoom;
    const centerX = (mapCenter.lon + 180) / 360 * Math.pow(2, zoom) * 256;
    const centerY = (1 - Math.log(Math.tan(mapCenter.lat * Math.PI / 180) + 1 / Math.cos(mapCenter.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom) * 256;
    const x = (lon + 180) / 360 * Math.pow(2, zoom) * 256;
    const y = (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom) * 256;
    return { x: rect.width / 2 + (x - centerX), y: rect.height / 2 + (y - centerY) };
  };

  const pixelToLatLon = (x, y) => {
    if (!mapRef.current) return { lat: 0, lon: 0 };
    const rect = mapRef.current.getBoundingClientRect();
    const zoom = mapCenter.zoom;
    const centerX = (mapCenter.lon + 180) / 360 * Math.pow(2, zoom) * 256;
    const centerY = (1 - Math.log(Math.tan(mapCenter.lat * Math.PI / 180) + 1 / Math.cos(mapCenter.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom) * 256;
    const worldX = centerX + (x - rect.width / 2);
    const worldY = centerY + (y - rect.height / 2);
    const lon = worldX / Math.pow(2, zoom) / 256 * 360 - 180;
    const n = Math.PI - 2 * Math.PI * worldY / Math.pow(2, zoom) / 256;
    const lat = 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
    return { lat, lon };
  };

  const getTilesForView = () => {
    if (!mapRef.current) return [];
    const rect = mapRef.current.getBoundingClientRect();
    const zoom = Math.floor(mapCenter.zoom);
    const centerTileX = Math.floor((mapCenter.lon + 180) / 360 * Math.pow(2, zoom));
    const centerTileY = Math.floor((1 - Math.log(Math.tan(mapCenter.lat * Math.PI / 180) + 1 / Math.cos(mapCenter.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
    const tiles = [];
    const tilesWide = Math.ceil(rect.width / 256) + 1;
    const tilesHigh = Math.ceil(rect.height / 256) + 1;
    
    const servers = ['a', 'b', 'c'];
    let serverIndex = 0;
    
    // Basemap URLs
    const basemapUrls = {
      street: (server, z, x, y) => `https://${server}.tile.openstreetmap.org/${z}/${x}/${y}.png`,
      satellite: (server, z, x, y) => `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`,
      light: (server, z, x, y) => `https://${server}.basemaps.cartocdn.com/light_all/${z}/${x}/${y}.png`,
      dark: (server, z, x, y) => `https://${server}.basemaps.cartocdn.com/dark_all/${z}/${x}/${y}.png`
    };
    
    for (let x = centerTileX - Math.ceil(tilesWide / 2); x <= centerTileX + Math.ceil(tilesWide / 2); x++) {
      for (let y = centerTileY - Math.ceil(tilesHigh / 2); y <= centerTileY + Math.ceil(tilesHigh / 2); y++) {
        if (x >= 0 && y >= 0 && x < Math.pow(2, zoom) && y < Math.pow(2, zoom)) {
          const tileLon = x / Math.pow(2, zoom) * 360 - 180;
          const n = Math.PI - 2 * Math.PI * y / Math.pow(2, zoom);
          const tileLat = 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
          const pos = latLonToPixel(tileLat, tileLon);
          const server = servers[serverIndex % servers.length];
          serverIndex++;
          const url = basemapUrls[selectedBasemap](server, zoom, x, y);
          tiles.push({ x, y, z: zoom, url, left: pos.x, top: pos.y });
        }
      }
    }
    return tiles;
  };

  const getCategoryColor = (category) => {
    const colors = { 'Forest': '#22c55e', 'Urban': '#ef4444'};
    return colors[category] || '#9ca3af';
  };

  const handleMapMouseDown = (e) => {
    setShowSearchResults(false);
    
    if (identifyMode) {
      const rect = mapRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const clickLatLon = pixelToLatLon(x, y);
      
      // Check if click is on any imported polygon
      const clickedFeature = filteredData.find(item => {
        if (item.type === 'imported_polygon' && item.points && item.points.length > 0) {
          return isPointInPolygon(clickLatLon.lat, clickLatLon.lon, item.points);
        }
        return false;
      });
      
      if (clickedFeature) {
        setSelectedFeature(clickedFeature);
        setShowAttributePanel(true);
      } else {
        setSelectedFeature(null);
        setShowAttributePanel(false);
      }
      return;
    }
    
    if (zoomBoxMode) {
      const rect = mapRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setZoomBoxStart({ x, y });
      setZoomBoxEnd({ x, y });
    } else if (drawMode) {
      if (!isDrawing) {
        setIsDrawing(true);
        const rect = mapRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setDrawPoints([{ x, y, ...pixelToLatLon(x, y) }]);
      }
    } else {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      setLastMapCenter({ lat: mapCenter.lat, lon: mapCenter.lon });
    }
  };

  const handleMapMouseMove = (e) => {
    if (zoomBoxMode && zoomBoxStart) {
      const rect = mapRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setZoomBoxEnd({ x, y });
    } else if (drawMode && isDrawing) {
      const rect = mapRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setDrawPoints([...drawPoints, { x, y, ...pixelToLatLon(x, y) }]);
    } else if (isPanning) {
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;
      const zoom = mapCenter.zoom;
      const scale = Math.pow(2, zoom) * 256;
      const deltaLon = -deltaX * 360 / scale;
      const deltaLat = deltaY * 360 / scale / Math.cos(lastMapCenter.lat * Math.PI / 180);
      setMapCenter({ ...mapCenter, lat: lastMapCenter.lat + deltaLat, lon: lastMapCenter.lon + deltaLon });
    }
  };

  const handleMapMouseUp = () => {
    if (zoomBoxMode && zoomBoxStart && zoomBoxEnd) {
      const dx = Math.abs(zoomBoxEnd.x - zoomBoxStart.x);
      const dy = Math.abs(zoomBoxEnd.y - zoomBoxStart.y);
      
      if (dx > 10 && dy > 10) {
        const minX = Math.min(zoomBoxStart.x, zoomBoxEnd.x);
        const maxX = Math.max(zoomBoxStart.x, zoomBoxEnd.x);
        const minY = Math.min(zoomBoxStart.y, zoomBoxEnd.y);
        const maxY = Math.max(zoomBoxStart.y, zoomBoxEnd.y);
        
        const topLeft = pixelToLatLon(minX, minY);
        const bottomRight = pixelToLatLon(maxX, maxY);
        
        const centerLat = (topLeft.lat + bottomRight.lat) / 2;
        const centerLon = (topLeft.lon + bottomRight.lon) / 2;
        
        const latRange = Math.abs(topLeft.lat - bottomRight.lat);
        const lonRange = Math.abs(topLeft.lon - bottomRight.lon);
        
        // Calculate zoom level based on the box size relative to viewport
        const rect = mapRef.current.getBoundingClientRect();
        const boxWidthRatio = (maxX - minX) / rect.width;
        const boxHeightRatio = (maxY - minY) / rect.height;
        
        // Use the smaller ratio to ensure entire box fits
        const ratio = Math.min(boxWidthRatio, boxHeightRatio);
        
        // Calculate zoom adjustment - smaller box means zoom in more
        let zoomAdjust = 0;
        if (ratio < 0.1) zoomAdjust = 3;
        else if (ratio < 0.2) zoomAdjust = 2;
        else if (ratio < 0.4) zoomAdjust = 1;
        else if (ratio < 0.7) zoomAdjust = 0;
        else zoomAdjust = -1;
        
        // Base zoom calculation on geographic extent
        let baseZoom = 10;
        if (latRange > 20 || lonRange > 20) baseZoom = 4;
        else if (latRange > 10 || lonRange > 10) baseZoom = 5;
        else if (latRange > 5 || lonRange > 5) baseZoom = 6;
        else if (latRange > 2 || lonRange > 2) baseZoom = 7;
        else if (latRange > 1 || lonRange > 1) baseZoom = 8;
        else if (latRange > 0.5 || lonRange > 0.5) baseZoom = 9;
        else if (latRange > 0.2 || lonRange > 0.2) baseZoom = 11;
        else if (latRange > 0.1 || lonRange > 0.1) baseZoom = 12;
        else if (latRange > 0.05 || lonRange > 0.05) baseZoom = 13;
        else baseZoom = 14;
        
        const finalZoom = Math.min(18, Math.max(1, baseZoom + zoomAdjust));
        
        setMapCenter({ lat: centerLat, lon: centerLon, zoom: finalZoom });
      }
      
      setZoomBoxStart(null);
      setZoomBoxEnd(null);
    } else if (drawMode && isDrawing && drawPoints.length > 2) {
      setIsDrawing(false);
      
      const filtered = vectorData.filter(item => {
        if (!selectedFeatureTypes.includes(item.type)) {
          return false;
        }
        
        if (item.country && !selectedCountries.includes(item.country)) {
          return false;
        }
        
        if (item.type === 'city' && selectedCities.length > 0) {
          if (!selectedCities.includes(item.id)) {
            return false;
          }
        }
        
        if (item.type === 'city' || item.type === 'park') {
          return isPointInPolygon(item.lat, item.lon, drawPoints);
        } else if (item.type === 'imported_polygon') {
          const anyPointInside = item.points.some(p => isPointInPolygon(p.lat, p.lon, drawPoints));
          return anyPointInside;
        }
        return true;
      });
      
      setFilteredData(filtered);
      setDrawnArea({ 
        points: drawPoints, 
        area: `${(drawPoints.length * 0.5).toFixed(1)} km²`, 
        cellCount: filtered.length.toString()
      });
    } else if (isPanning) {
      setIsPanning(false);
    } else if (drawMode && isDrawing) {
      setIsDrawing(false);
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.5 : 0.5;
    setMapCenter(prev => ({
      ...prev,
      zoom: Math.max(1, Math.min(18, prev.zoom + delta))
    }));
  };

  const getUserLocation = async () => {
    try {
      // First, try ipapi.co
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data.latitude && data.longitude) {
        const userLat = parseFloat(data.latitude);
        const userLon = parseFloat(data.longitude);
        console.log('Location found:', { lat: userLat, lon: userLon, city: data.city, region: data.region });
        setUserLocation({ lat: userLat, lon: userLon });
        setMapCenter({ lat: userLat, lon: userLon, zoom: 11 });
        return;
      }
    } catch (error) {
      console.error('ipapi.co failed:', error);
    }

    try {
      // Fallback: try ip-api.com
      const response = await fetch('http://ip-api.com/json/');
      const data = await response.json();
      
      if (data.status === 'success' && data.lat && data.lon) {
        const userLat = parseFloat(data.lat);
        const userLon = parseFloat(data.lon);
        console.log('Location found via fallback:', { lat: userLat, lon: userLon, city: data.city, region: data.regionName });
        setUserLocation({ lat: userLat, lon: userLon });
        setMapCenter({ lat: userLat, lon: userLon, zoom: 11 });
        return;
      }
    } catch (error) {
      console.error('ip-api.com failed:', error);
    }

    try {
      // Second fallback: try ipwhois
      const response = await fetch('https://ipwho.is/');
      const data = await response.json();
      
      if (data.latitude && data.longitude) {
        const userLat = parseFloat(data.latitude);
        const userLon = parseFloat(data.longitude);
        console.log('Location found via second fallback:', { lat: userLat, lon: userLon, city: data.city, region: data.region });
        setUserLocation({ lat: userLat, lon: userLon });
        setMapCenter({ lat: userLat, lon: userLon, zoom: 11 });
        return;
      }
    } catch (error) {
      console.error('ipwho.is failed:', error);
    }

    // If all fail, show error
    alert('Unable to determine your location. Please check your internet connection or try again later.');
  };

  const goToTexasHome = () => {
    setMapCenter(TEXAS_DEFAULT_VIEW);
    setSelectedFeature(null);
    setShowAttributePanel(false);
  };

  const zoomToLayer = (layerId) => {
    let layerFeatures = [];
    
    if (layerId === 2) {
      // Major Cities layer
      layerFeatures = filteredData.filter(d => d.type === 'city');
    } else if (layerId === 3) {
      // National Parks layer
      layerFeatures = filteredData.filter(d => d.type === 'park');
    } else if (layerId === 4) {
      // Imported Data layer
      layerFeatures = filteredData.filter(d => d.type === 'imported_polygon');
    }
    
    if (layerFeatures.length === 0) {
      alert('No features found in this layer');
      return;
    }
    
    // Collect all coordinates
    const allCoords = [];
    layerFeatures.forEach(feature => {
      if (feature.type === 'city' || feature.type === 'park') {
        allCoords.push({ lat: feature.lat, lon: feature.lon });
      } else if (feature.type === 'imported_polygon' && feature.points) {
        feature.points.forEach(p => allCoords.push({ lat: p.lat, lon: p.lon }));
      }
    });
    
    if (allCoords.length === 0) {
      alert('No coordinates found for this layer');
      return;
    }
    
    const bbox = calculateBoundingBox(allCoords);
    zoomToExtent(bbox);
  };

  const isPointInPolygon = (lat, lon, polygon) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lon;
      const yi = polygon[i].lat;
      const xj = polygon[j].lon;
      const yj = polygon[j].lat;
      
      const intersect = ((yi > lat) !== (yj > lat)) &&
        (lon < ((xj - xi) * (lat - yi) / (yj - yi) + xi));
      
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const clearDrawing = () => {
    setDrawPoints([]);
    setDrawnArea(null);
    applyFeatureFilter();
    setIsDrawing(false);
  };

  const extractGeoJSON = () => {
    if (!drawnArea || drawPoints.length === 0) {
      alert('Please draw an area first');
      return;
    }

    const coordinates = drawPoints.map(p => [p.lon, p.lat]);
    coordinates.push([drawPoints[0].lon, drawPoints[0].lat]); // Close the polygon

    const geojson = {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [coordinates]
        },
        properties: {
          name: "Drawn Area",
          area: drawnArea.area,
          features_count: filteredData.length
        }
      }]
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted_from_datagrid.geojson';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSubmitArea = async () => {
    if (!drawnArea || drawPoints.length === 0) {
      alert('Please draw an area first');
      return;
    }

    if (!submitUrl.trim()) {
      alert('Please enter a URL');
      return;
    }

    const coordinates = drawPoints.map(p => [p.lon, p.lat]);
    coordinates.push([drawPoints[0].lon, drawPoints[0].lat]);

    const geojson = {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [coordinates]
        },
        properties: {
          name: "Drawn Area",
          area: drawnArea.area,
          features_count: filteredData.length
        }
      }]
    };

    try {
      const response = await fetch(submitUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(geojson)
      });

      if (response.ok) {
        alert('Successfully submitted!');
        setShowSubmitModal(false);
        setSubmitUrl('');
      } else {
        alert(`Error: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      alert(`Error submitting: ${error.message}`);
    }
  };

  const zoomToExtent = (bbox) => {
    const latRange = bbox.maxLat - bbox.minLat;
    const lonRange = bbox.maxLon - bbox.minLon;
    
    let zoom = 10;
    if (latRange > 20 || lonRange > 20) zoom = 4;
    else if (latRange > 10 || lonRange > 10) zoom = 5;
    else if (latRange > 5 || lonRange > 5) zoom = 6;
    else if (latRange > 2 || lonRange > 2) zoom = 7;
    else if (latRange > 1 || lonRange > 1) zoom = 8;
    else if (latRange > 0.5 || lonRange > 0.5) zoom = 9;
    else if (latRange > 0.2 || lonRange > 0.2) zoom = 11;
    else if (latRange > 0.1 || lonRange > 0.1) zoom = 12;
    else zoom = 13;
    
    setMapCenter({ 
      lat: bbox.center.lat, 
      lon: bbox.center.lon, 
      zoom: zoom 
    });
  };

  const calculateBoundingBox = (coordinates) => {
    let minLat = Infinity, maxLat = -Infinity, minLon = Infinity, maxLon = -Infinity;
    coordinates.forEach(coord => {
      if (coord.lat < minLat) minLat = coord.lat;
      if (coord.lat > maxLat) maxLat = coord.lat;
      if (coord.lon < minLon) minLon = coord.lon;
      if (coord.lon > maxLon) maxLon = coord.lon;
    });
    return {
      minLat, maxLat, minLon, maxLon,
      center: { lat: (minLat + maxLat) / 2, lon: (minLon + maxLon) / 2 }
    };
  };

  const parseGeoJSON = (geojson) => {
    const allCoordinates = [];
    let features = [];
    const importedPolygons = [];

    if (Array.isArray(geojson)) {
      features = geojson;
    } else if (geojson.type === 'FeatureCollection') {
      features = geojson.features || [];
    } else if (geojson.type === 'Feature') {
      features = [geojson];
    } else if (geojson.features) {
      features = geojson.features;
    }

    features.forEach((feature, featureIndex) => {
      const geom = feature.geometry || feature.geom;
      if (!geom) return;

      if (geom.type === 'Point' && geom.coordinates?.length >= 2) {
        const [lon, lat] = geom.coordinates;
        if (typeof lon === 'number' && typeof lat === 'number') {
          allCoordinates.push({ lat, lon });
        }
      } else if (geom.type === 'Polygon' && geom.coordinates?.[0]) {
        const polygonPoints = [];
        geom.coordinates[0].forEach(([lon, lat]) => {
          if (typeof lon === 'number' && typeof lat === 'number') {
            allCoordinates.push({ lat, lon });
            polygonPoints.push({ lat, lon });
          }
        });
        
        if (polygonPoints.length > 0) {
          importedPolygons.push({
            id: `imported_poly_${Date.now()}_${featureIndex}`,
            type: 'imported_polygon',
            name: feature.properties?.name || `Polygon ${featureIndex + 1}`,
            points: polygonPoints,
            category: 'Urban',
            properties: feature.properties || {}
          });
        }
      } else if (geom.type === 'MultiPolygon' && geom.coordinates) {
        geom.coordinates.forEach((polygon, polyIndex) => {
          if (polygon[0]) {
            const polygonPoints = [];
            polygon[0].forEach(([lon, lat]) => {
              if (typeof lon === 'number' && typeof lat === 'number') {
                allCoordinates.push({ lat, lon });
                polygonPoints.push({ lat, lon });
              }
            });
            
            if (polygonPoints.length > 0) {
              importedPolygons.push({
                id: `imported_poly_${Date.now()}_${featureIndex}_${polyIndex}`,
                type: 'imported_polygon',
                name: feature.properties?.name || `Polygon ${featureIndex + 1}-${polyIndex + 1}`,
                points: polygonPoints,
                category: 'Urban',
                properties: feature.properties || {}
              });
            }
          }
        });
      }
    });

    if (allCoordinates.length === 0) return [];

    const bbox = calculateBoundingBox(allCoordinates);
    
    return importedPolygons.map(poly => ({
      ...poly,
      bbox: bbox
    }));
  };

  const handleImportPaste = () => {
    try {
      setImportError('');
      const parsed = JSON.parse(importText);
      const imported = parseGeoJSON(parsed);
      
      if (imported.length === 0) {
        setImportError('No valid features found');
        return;
      }

      setImportedData([...importedData, ...imported]);
      setVectorData([...vectorData, ...imported]);
      if (!layers.some(l => l.id === 4)) {
        setLayers([...layers, { id: 4, name: 'Imported Data', type: 'vector', visible: true, opacity: 100 }]);
      }
      if (!selectedFeatureTypes.includes('imported_polygon')) {
        setSelectedFeatureTypes([...selectedFeatureTypes, 'imported_polygon']);
      }
      setShowImportModal(false);
      setImportText('');
      
      if (imported[0]?.bbox) {
        zoomToExtent(imported[0].bbox);
      }
    } catch (error) {
      setImportError(`Invalid JSON: ${error.message}`);
    }
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        setImportError('');
        const parsed = JSON.parse(event.target.result);
        const imported = parseGeoJSON(parsed);
        
        if (imported.length === 0) {
          setImportError('No valid features found in the file');
          return;
        }

        setImportedData([...importedData, ...imported]);
        setVectorData([...vectorData, ...imported]);
        if (!layers.some(l => l.id === 4)) {
          setLayers([...layers, { id: 4, name: 'Imported Data', type: 'vector', visible: true, opacity: 100 }]);
        }
        if (!selectedFeatureTypes.includes('imported_polygon')) {
          setSelectedFeatureTypes([...selectedFeatureTypes, 'imported_polygon']);
        }
        setShowImportModal(false);
        
        if (imported[0]?.bbox) {
          zoomToExtent(imported[0].bbox);
        }
      } catch (error) {
        setImportError(`Error reading file: ${error.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleImportUrl = async () => {
    if (!importUrl.trim()) {
      setImportError('Please enter a URL');
      return;
    }

    setIsLoadingUrl(true);
    setImportError('');

    try {
      const fetchUrl = useCorsProxy 
        ? `https://api.allorigins.win/raw?url=${encodeURIComponent(importUrl)}`
        : importUrl;
      
      const response = await fetch(fetchUrl, {
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const imported = parseGeoJSON(data);
      
      if (imported.length === 0) {
        setImportError('No valid features found at the URL');
        setIsLoadingUrl(false);
        return;
      }

      setImportedData([...importedData, ...imported]);
      setVectorData([...vectorData, ...imported]);
      if (!layers.some(l => l.id === 4)) {
        setLayers([...layers, { id: 4, name: 'Imported Data', type: 'vector', visible: true, opacity: 100 }]);
      }
      if (!selectedFeatureTypes.includes('imported_polygon')) {
        setSelectedFeatureTypes([...selectedFeatureTypes, 'imported_polygon']);
      }
      setShowImportModal(false);
      setImportUrl('');
      setIsLoadingUrl(false);
      setUseCorsProxy(true);
      
      if (imported[0]?.bbox) {
        zoomToExtent(imported[0].bbox);
      }
    } catch (error) {
      let errorMessage = 'Error loading from URL: ';
      
      if (error.message.includes('Failed to fetch') || error.message.includes('Load failed')) {
        errorMessage = 'CORS Error: Cannot access the API directly from the browser.\n\n' +
                      '✅ QUICK FIX: Enable "Use CORS Proxy" below and try again!\n\n' +
                      'OR:\n' +
                      '1. Download the JSON directly from your browser and use "Upload File"\n' +
                      '2. Add CORS headers to your API server (see instructions below)';
      } else if (error.message.includes('HTTP error')) {
        errorMessage += `Server returned ${error.message}`;
      } else {
        errorMessage += error.message;
      }
      
      setImportError(errorMessage);
      setIsLoadingUrl(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const normalizedQuery = query.toLowerCase().trim();
    const results = searchableLocations.filter(location => {
      if (location.type === 'zip') {
        return location.name.startsWith(normalizedQuery);
      }
      const nameMatch = location.name.toLowerCase().includes(normalizedQuery);
      const stateMatch = location.state?.toLowerCase().includes(normalizedQuery);
      return nameMatch || stateMatch;
    }).slice(0, 10);

    setSearchResults(results);
    setShowSearchResults(results.length > 0);
  };

  const selectSearchResult = (result) => {
    const zoom = result.zoom || (result.type === 'city' ? 11 : 7);
    setMapCenter({ lat: result.lat, lon: result.lon, zoom });
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-white shadow-lg overflow-hidden flex flex-col`}>
        <div className="bg-white border-b-4 p-4" style={{ borderColor: '#500000' }}>
          <div className="text-center py-3">
            <h1 className="text-2xl font-bold" style={{ color: '#500000' }}>Texas A&M AgriLife Extension Service</h1>
          </div>
        </div>
        <div className="text-white p-4" style={{ backgroundColor: '#500000' }}>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="8" height="8" fill="white" stroke="white" strokeWidth="1"/>
              <rect x="14" y="2" width="8" height="8" fill="white" stroke="white" strokeWidth="1"/>
              <rect x="2" y="14" width="8" height="8" fill="white" stroke="white" strokeWidth="1"/>
              <rect x="14" y="14" width="8" height="8" fill="white" stroke="white" strokeWidth="1"/>
            </svg>
            DataGrid Viewer
          </h1>
        </div>

        <div className="flex border-b border-gray-200">
          <button onClick={() => setActiveTab('layers')} className={`flex-1 py-3 text-sm font-medium ${activeTab === 'layers' ? 'border-b-2 text-gray-600' : 'text-gray-600'}`} style={activeTab === 'layers' ? { borderColor: '#500000', color: '#500000' } : {}}>
            <Layers className="inline mr-1" size={16} />Layers
          </button>
          <button onClick={() => setActiveTab('data')} className={`flex-1 py-3 text-sm font-medium ${activeTab === 'data' ? 'border-b-2 text-gray-600' : 'text-gray-600'}`} style={activeTab === 'data' ? { borderColor: '#500000', color: '#500000' } : {}}>
            <Filter className="inline mr-1" size={16} />Data
          </button>
          <button onClick={() => setActiveTab('tools')} className={`flex-1 py-3 text-sm font-medium ${activeTab === 'tools' ? 'border-b-2 text-gray-600' : 'text-gray-600'}`} style={activeTab === 'tools' ? { borderColor: '#500000', color: '#500000' } : {}}>
            <Settings className="inline mr-1" size={16} />Tools
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'layers' && (
            <div className="space-y-3">
              {layers.map(layer => (
                <div key={layer.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <button onClick={() => toggleLayer(layer.id)}>
                        {layer.visible ? <Eye size={18} style={{ color: '#500000' }} /> : <EyeOff size={18} className="text-gray-400" />}
                      </button>
                      {editingLayerId === layer.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editingLayerName}
                            onChange={(e) => setEditingLayerName(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') saveLayerName(layer.id);
                              if (e.key === 'Escape') cancelEditingLayerName();
                            }}
                            className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2"
                            style={{ borderColor: '#500000', outlineColor: '#500000' }}
                            autoFocus
                          />
                          <button onClick={() => saveLayerName(layer.id)} className="text-green-600 hover:text-green-700">
                            <Check size={16} />
                          </button>
                          <button onClick={cancelEditingLayerName} className="text-red-600 hover:text-red-700">
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="font-medium text-sm text-gray-800">{layer.name}</span>
                          <button 
                            onClick={() => startEditingLayerName(layer.id, layer.name)}
                            className="text-gray-400 hover:text-gray-600 ml-2"
                            title="Edit layer name"
                          >
                            <Edit3 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                    {layer.id !== 1 && layer.visible && (
                      <button
                        onClick={() => zoomToLayer(layer.id)}
                        className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-200"
                        title="Zoom to layer extent"
                        style={{ color: '#500000' }}
                      >
                        <Maximize2 size={16} />
                      </button>
                    )}
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Opacity</span>
                      <span>{layer.opacity}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={layer.opacity} onChange={(e) => updateOpacity(layer.id, parseInt(e.target.value))} className="w-full h-1 bg-gray-300 rounded-lg cursor-pointer" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Feature Type</label>
                <div className="relative" ref={featureDropdownRef}>
                  <button
                    onClick={() => setShowFeatureDropdown(!showFeatureDropdown)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-300 rounded hover:bg-gray-100 text-sm"
                  >
                    <span className="text-gray-700">
                      {selectedFeatureTypes.length === 0 ? 'No features selected' : 
                       selectedFeatureTypes.length === getAvailableFeatureTypes().length ? 'All features' :
                       `${selectedFeatureTypes.length} selected`}
                    </span>
                    <ChevronDown size={16} className={`text-gray-500 transition-transform ${showFeatureDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showFeatureDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                      {getAvailableFeatureTypes().map(featureType => (
                        <label
                          key={featureType.value}
                          className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedFeatureTypes.includes(featureType.value)}
                            onChange={() => toggleFeatureType(featureType.value)}
                            className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{featureType.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Country</label>
                <div className="relative" ref={countryDropdownRef}>
                  <button
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-300 rounded hover:bg-gray-100 text-sm"
                  >
                    <span className="text-gray-700">
                      {selectedCountries.length === 0 ? 'No countries selected' : 
                       selectedCountries.length === 3 ? 'All countries' :
                       selectedCountries.join(', ')}
                    </span>
                    <ChevronDown size={16} className={`text-gray-500 transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showCountryDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      {['USA', 'Canada', 'Mexico'].map(country => (
                        <label
                          key={country}
                          className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCountries.includes(country)}
                            onChange={() => toggleCountry(country)}
                            className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{country}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by City</label>
                <div className="relative" ref={cityDropdownRef}>
                  <button
                    onClick={() => setShowCityDropdown(!showCityDropdown)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-300 rounded hover:bg-gray-100 text-sm"
                  >
                    <span className="text-gray-700">
                      {selectedCities.length === 0 ? 'All cities shown' : `${selectedCities.length} cities selected`}
                    </span>
                    <ChevronDown size={16} className={`text-gray-500 transition-transform ${showCityDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showCityDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden flex flex-col">
                      <div className="p-2 border-b border-gray-200">
                        <input
                          type="text"
                          placeholder="Search cities..."
                          value={citySearchQuery}
                          onChange={(e) => setCitySearchQuery(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      
                      <div className="flex gap-2 p-2 border-b border-gray-200">
                        <button
                          onClick={(e) => { e.stopPropagation(); selectAllCities(); }}
                          className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Select All
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deselectAllCities(); }}
                          className="flex-1 px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                          Clear All
                        </button>
                      </div>
                      
                      <div className="overflow-y-auto max-h-60">
                        {getAvailableCities().length === 0 ? (
                          <div className="px-3 py-2 text-sm text-gray-500">No cities found</div>
                        ) : (
                          getAvailableCities().map(city => (
                            <label
                              key={city.id}
                              className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedCities.includes(city.id)}
                                onChange={() => toggleCity(city.id)}
                                className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-gray-900 truncate">{city.name}</div>
                                <div className="text-xs text-gray-500">{city.state}, {city.country}</div>
                              </div>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded p-3 text-sm space-y-2" style={{ backgroundColor: '#fef2f2', borderColor: '#500000' }}>
                <p><span className="font-semibold">Total Features:</span> {filteredData.length}</p>
                <p><span className="font-semibold">Cities:</span> {filteredData.filter(d => d.type === 'city').length}</p>
                {selectedCities.length > 0 && (
                  <p className="ml-4 text-xs" style={{ color: '#500000' }}><span className="font-semibold">Filtered:</span> {selectedCities.length} specific cities selected</p>
                )}
                {selectedCountries.includes('USA') && (
                  <p className="ml-4 text-xs"><span className="font-semibold">USA:</span> {filteredData.filter(d => d.type === 'city' && d.country === 'USA').length}</p>
                )}
                {selectedCountries.includes('Canada') && (
                  <p className="ml-4 text-xs"><span className="font-semibold">Canada:</span> {filteredData.filter(d => d.type === 'city' && d.country === 'Canada').length}</p>
                )}
                {selectedCountries.includes('Mexico') && (
                  <p className="ml-4 text-xs"><span className="font-semibold">Mexico:</span> {filteredData.filter(d => d.type === 'city' && d.country === 'Mexico').length}</p>
                )}
                <p><span className="font-semibold">National Parks:</span> {filteredData.filter(d => d.type === 'park').length}</p>
                {filteredData.filter(d => d.type === 'imported_polygon').length > 0 && (
                  <p><span className="font-semibold">Bounding Boxes:</span> {filteredData.filter(d => d.type === 'imported_polygon').length}</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="space-y-3">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                <h3 className="font-semibold text-sm mb-2" style={{ color: '#500000' }}>About DataGrid®</h3>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Access high-resolution spatial data standardized into 2.5-acre grids. Discover comprehensive datasets for community planning, disaster mitigation, and land-use analysis.
                </p>
              </div>

              {/* Discover & Explore Section */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button 
                  onClick={() => setExpandedToolSection(expandedToolSection === 'discover' ? null : 'discover')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <h4 className="font-semibold text-xs text-gray-700 uppercase tracking-wide">Discover & Explore</h4>
                  <ChevronDown 
                    size={16} 
                    className={`text-gray-500 transition-transform ${expandedToolSection === 'discover' ? 'rotate-180' : ''}`}
                  />
                </button>
                
                {expandedToolSection === 'discover' && (
                  <div className="p-2 space-y-2 bg-white">
                    <button 
                      onClick={() => { 
                        setShowImportModal(true);
                      }}
                      className="w-full text-left px-4 py-3 rounded border text-sm font-medium bg-white hover:bg-gray-50 border-gray-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Search className="flex-shrink-0" size={18} style={{ color: '#500000' }} />
                        <div>
                          <div className="font-semibold">Explore Grid Data</div>
                          <div className="text-xs text-gray-600">Load and explore 2.5-acre grid datasets</div>
                        </div>
                      </div>
                    </button>

                    <button 
                      onClick={() => { 
                        if (drawMode) {
                          clearDrawing();
                          setDrawMode(false);
                        } else {
                          setDrawMode(true);
                        }
                      }} 
                      className={`w-full text-left px-4 py-3 rounded border text-sm font-medium ${drawMode ? 'border-gray-200' : 'bg-white hover:bg-gray-50 border-gray-200'} flex items-center justify-between`}
                      style={drawMode ? { backgroundColor: '#fef2f2', borderColor: '#500000' } : {}}
                    >
                      <div className="flex items-center gap-3">
                        <Edit3 className="flex-shrink-0" size={18} style={drawMode ? { color: '#500000' } : { color: '#500000' }} />
                        <div>
                          <div className="font-semibold">Define Area of Interest</div>
                          <div className="text-xs text-gray-600">Draw polygon to select grid cells</div>
                        </div>
                      </div>
                    </button>

                    <button 
                      onClick={() => {
                        setIdentifyMode(!identifyMode);
                        if (identifyMode) {
                          setSelectedFeature(null);
                          setShowAttributePanel(false);
                        }
                      }}
                      className={`w-full text-left px-4 py-3 rounded border text-sm font-medium ${identifyMode ? 'border-gray-200' : 'bg-white hover:bg-gray-50 border-gray-200'} flex items-center justify-between`}
                      style={identifyMode ? { backgroundColor: '#fef2f2', borderColor: '#500000' } : {}}
                    >
                      <div className="flex items-center gap-3">
                        <Info className="flex-shrink-0" size={18} style={identifyMode ? { color: '#500000' } : { color: '#500000' }} />
                        <div>
                          <div className="font-semibold">View Grid Attributes</div>
                          <div className="text-xs text-gray-600">Click grid cells to see all data attributes</div>
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Access & Extract Section */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button 
                  onClick={() => setExpandedToolSection(expandedToolSection === 'extract' ? null : 'extract')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <h4 className="font-semibold text-xs text-gray-700 uppercase tracking-wide">Access & Extract</h4>
                  <ChevronDown 
                    size={16} 
                    className={`text-gray-500 transition-transform ${expandedToolSection === 'extract' ? 'rotate-180' : ''}`}
                  />
                </button>
                
                {expandedToolSection === 'extract' && (
                  <div className="p-2 space-y-2 bg-white">
                    {drawnArea && (
                      <>
                        <button 
                          onClick={extractGeoJSON}
                          className="w-full text-left px-4 py-3 rounded border text-sm font-medium bg-green-50 hover:bg-green-100 border-green-200 flex items-center justify-between"
                          style={{ backgroundColor: '#f0fdf4', borderColor: '#22c55e' }}
                        >
                          <div className="flex items-center gap-3">
                            <Download className="flex-shrink-0" size={18} style={{ color: '#16a34a' }} />
                            <div>
                              <div className="font-semibold" style={{ color: '#16a34a' }}>Download Selected Area</div>
                              <div className="text-xs text-gray-600">{filteredData.length} features • Export as GeoJSON</div>
                            </div>
                          </div>
                        </button>

                        <button 
                          onClick={() => setShowSubmitModal(true)}
                          className="w-full text-left px-4 py-3 rounded border text-sm font-medium bg-purple-50 hover:bg-purple-100 border-purple-200 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <Upload className="flex-shrink-0" size={18} style={{ color: '#9333ea' }} />
                            <div>
                              <div className="font-semibold" style={{ color: '#9333ea' }}>Share to API</div>
                              <div className="text-xs text-gray-600">Send selected area to external service</div>
                            </div>
                          </div>
                        </button>
                      </>
                    )}
                    
                    {!drawnArea && (
                      <div className="px-4 py-6 text-center text-xs text-gray-500 italic bg-gray-50 rounded border border-gray-200">
                        Draw an area of interest to enable data extraction
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Documentation Section */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button 
                  onClick={() => setExpandedToolSection(expandedToolSection === 'docs' ? null : 'docs')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <h4 className="font-semibold text-xs text-gray-700 uppercase tracking-wide">Documentation</h4>
                  <ChevronDown 
                    size={16} 
                    className={`text-gray-500 transition-transform ${expandedToolSection === 'docs' ? 'rotate-180' : ''}`}
                  />
                </button>
                
                {expandedToolSection === 'docs' && (
                  <div className="p-2 space-y-2 bg-white">
                    <button 
                      className="w-full text-left px-4 py-3 rounded border text-sm font-medium bg-white hover:bg-gray-50 border-gray-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="flex-shrink-0" size={18} style={{ color: '#500000' }} />
                        <div>
                          <div className="font-semibold">Data Dictionary</div>
                          <div className="text-xs text-gray-600">View all available grid attributes & metadata</div>
                        </div>
                      </div>
                    </button>

                    <button 
                      className="w-full text-left px-4 py-3 rounded border text-sm font-medium bg-white hover:bg-gray-50 border-gray-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Link className="flex-shrink-0" size={18} style={{ color: '#500000' }} />
                        <div>
                          <div className="font-semibold">API Documentation</div>
                          <div className="text-xs text-gray-600">Learn how to integrate DataGrid® into your apps</div>
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow-md p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded">
              <Menu size={20} />
            </button>
            
            <div className="relative">
              <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
                <Search size={18} className="text-gray-500 mr-2" />
                <input
                  type="text"
                  placeholder="Search city, state..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                  className="bg-transparent outline-none text-sm w-64"
                />
                {searchQuery && (
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                      setShowSearchResults(false);
                    }}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => selectSearchResult(result)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin size={16} style={{ color: '#500000' }} />
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900">{result.name}</div>
                          <div className="text-xs text-gray-500">
                            {result.type === 'city' && result.state && `${result.state}, ${result.country}`}
                            {result.type === 'state' && 'US State'}
                            {result.type === 'park' && `National Park - ${result.country}`}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Lat: <span className="font-mono">{mapCenter.lat.toFixed(4)}</span> Lon: <span className="font-mono">{mapCenter.lon.toFixed(4)}</span>
          </div>
        </div>

        <div ref={mapRef} className={`flex-1 relative bg-gray-100 overflow-hidden ${identifyMode ? 'cursor-help' : zoomBoxMode ? 'cursor-crosshair' : drawMode ? 'cursor-crosshair' : isPanning ? 'cursor-grabbing' : 'cursor-grab'}`} onMouseDown={handleMapMouseDown} onMouseMove={handleMapMouseMove} onMouseUp={handleMapMouseUp} onMouseLeave={() => { 
          setIsDrawing(false);
          setIsPanning(false);
          setZoomBoxStart(null);
          setZoomBoxEnd(null);
        }} onWheel={handleWheel}>
          {layers.find(l => l.id === 1)?.visible && (
            <div className="absolute inset-0" style={{ opacity: layers.find(l => l.id === 1).opacity / 100 }}>
              {getTilesForView().map(tile => (
                <img key={`${tile.z}-${tile.x}-${tile.y}`} src={tile.url} alt="" className="absolute" style={{ width: '256px', height: '256px', left: `${tile.left}px`, top: `${tile.top}px` }} loading="eager" />
              ))}
            </div>
          )}

          {layers.find(l => l.id === 2)?.visible && (
            <svg className="absolute inset-0" style={{ width: '100%', height: '100%', pointerEvents: 'none', opacity: layers.find(l => l.id === 2).opacity / 100 }}>
              {filteredData.filter(d => d.type === 'city').map(city => {
                const pos = latLonToPixel(city.lat, city.lon);
                const size = Math.max(3, Math.min(8, Math.log(city.population) * 0.6));
                return (
                  <g key={city.id}>
                    <circle cx={pos.x} cy={pos.y} r={size} fill={getCategoryColor(city.category)} fillOpacity="0.7" stroke="white" strokeWidth="1.5" />
                    <text x={pos.x} y={pos.y - size - 4} fontSize="10" fontWeight="600" fill="#1f2937" textAnchor="middle" style={{ textShadow: '1px 1px 2px white, -1px -1px 2px white, 1px -1px 2px white, -1px 1px 2px white' }}>{city.name}</text>
                  </g>
                );
              })}
            </svg>
          )}

          {layers.find(l => l.id === 3)?.visible && (
            <svg className="absolute inset-0" style={{ width: '100%', height: '100%', pointerEvents: 'none', opacity: layers.find(l => l.id === 3).opacity / 100 }}>
              {filteredData.filter(d => d.type === 'park').map(park => {
                const pos = latLonToPixel(park.lat, park.lon);
                return (
                  <g key={park.id}>
                    <circle cx={pos.x} cy={pos.y} r="8" fill={getCategoryColor(park.category)} fillOpacity="0.7" stroke="white" strokeWidth="2" />
                    <text x={pos.x} y={pos.y - 15} fontSize="10" fontWeight="600" fill="#22c55e" textAnchor="middle">{park.name}</text>
                  </g>
                );
              })}
            </svg>
          )}

          {layers.find(l => l.id === 4)?.visible && filteredData.filter(d => d.type === 'imported_polygon').map(poly => {
            const points = poly.points.map(p => latLonToPixel(p.lat, p.lon));
            const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')} Z`;
            const centerLat = poly.points.reduce((sum, p) => sum + p.lat, 0) / poly.points.length;
            const centerLon = poly.points.reduce((sum, p) => sum + p.lon, 0) / poly.points.length;
            const centerPos = latLonToPixel(centerLat, centerLon);
            
            return (
              <svg key={poly.id} className="absolute inset-0" style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
                <path d={pathData} fill="#9333ea" fillOpacity="0.2" stroke="#9333ea" strokeWidth="2" />
                <text x={centerPos.x} y={centerPos.y} fontSize="11" fontWeight="600" fill="#9333ea" textAnchor="middle">{poly.name}</text>
              </svg>
            );
          })}

          {drawPoints.length > 0 && (
            <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%', zIndex: 1000 }}>
              <path 
                d={`M ${drawPoints.map(p => `${p.x},${p.y}`).join(' L ')} ${isDrawing ? '' : 'Z'}`} 
                fill="rgba(80, 0, 0, 0.2)" 
                stroke="#500000" 
                strokeWidth="3"
              />
              {drawPoints.map((point, idx) => (
                <circle key={idx} cx={point.x} cy={point.y} r="5" fill="#500000" stroke="white" strokeWidth="2" />
              ))}
            </svg>
          )}

          {userLocation && (
            <svg className="absolute inset-0" style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
              {(() => {
                const pos = latLonToPixel(userLocation.lat, userLocation.lon);
                return (
                  <g>
                    <circle cx={pos.x} cy={pos.y} r="12" fill="#500000" fillOpacity="0.3" />
                    <circle cx={pos.x} cy={pos.y} r="8" fill="#500000" stroke="white" strokeWidth="3" />
                    <circle cx={pos.x} cy={pos.y} r="3" fill="white" />
                  </g>
                );
              })()}
            </svg>
          )}

          {zoomBoxMode && zoomBoxStart && zoomBoxEnd && (
            <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%', zIndex: 1000 }}>
              <rect
                x={Math.min(zoomBoxStart.x, zoomBoxEnd.x)}
                y={Math.min(zoomBoxStart.y, zoomBoxEnd.y)}
                width={Math.abs(zoomBoxEnd.x - zoomBoxStart.x)}
                height={Math.abs(zoomBoxEnd.y - zoomBoxStart.y)}
                fill="rgba(80, 0, 0, 0.1)"
                stroke="#500000"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            </svg>
          )}

          {drawMode && (
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium z-50" style={{ backgroundColor: '#500000' }}>
              <Edit3 className="inline mr-2" size={16} />
              Drawing Mode Active
            </div>
          )}

          {zoomBoxMode && (
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium z-50" style={{ backgroundColor: '#500000' }}>
              <Maximize2 className="inline mr-2" size={16} />
              Zoom Box Mode - Draw a rectangle
            </div>
          )}

          {identifyMode && (
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium z-50" style={{ backgroundColor: '#500000' }}>
              <Info className="inline mr-2" size={16} />
              Identify Mode - Click on a feature
            </div>
          )}

          {/* Navigation Toolbox */}
          <div className="absolute bottom-32 right-6 bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Always visible - Most commonly used tools */}
            <button 
              onClick={() => setMapCenter({ ...mapCenter, zoom: Math.min(mapCenter.zoom + 1, 18) })} 
              className="p-3 hover:bg-gray-100 border-b border-gray-200 block w-full"
              title="Zoom In"
            >
              <ZoomIn size={20} />
            </button>
            <button 
              onClick={() => setMapCenter({ ...mapCenter, zoom: Math.max(mapCenter.zoom - 1, 1) })} 
              className="p-3 hover:bg-gray-100 border-b border-gray-200 block w-full"
              title="Zoom Out"
            >
              <ZoomOut size={20} />
            </button>
            
            {/* Collapsible section - Additional tools */}
            {toolboxExpanded && (
              <>
                <button 
                  onClick={goToTexasHome}
                  className="p-3 hover:bg-gray-100 border-b border-gray-200 block w-full"
                  title="Texas Home View"
                >
                  <Home size={20} />
                </button>
                <button 
                  onClick={() => {
                    setIdentifyMode(!identifyMode);
                    if (identifyMode) {
                      setSelectedFeature(null);
                      setShowAttributePanel(false);
                    }
                  }}
                  className={`p-3 hover:bg-gray-100 border-b border-gray-200 block w-full ${identifyMode ? 'bg-red-50' : ''}`}
                  title="Identify Feature"
                  style={identifyMode ? { backgroundColor: '#fef2f2' } : {}}
                >
                  <Info size={20} style={identifyMode ? { color: '#500000' } : {}} />
                </button>
                <button 
                  onClick={() => {
                    setZoomBoxMode(!zoomBoxMode);
                    setZoomBoxStart(null);
                    setZoomBoxEnd(null);
                  }}
                  className={`p-3 hover:bg-gray-100 border-b border-gray-200 block w-full ${zoomBoxMode ? 'bg-red-50' : ''}`}
                  title="Zoom to Area"
                  style={zoomBoxMode ? { backgroundColor: '#fef2f2' } : {}}
                >
                  <Maximize2 size={20} style={zoomBoxMode ? { color: '#500000' } : {}} />
                </button>
                <button 
                  onClick={getUserLocation}
                  className="p-3 hover:bg-gray-100 border-b border-gray-200 block w-full"
                  title="My Location"
                >
                  <MapPin size={20} />
                </button>
              </>
            )}
            
            {/* Toggle button */}
            <button 
              onClick={() => setToolboxExpanded(!toolboxExpanded)}
              className="p-3 hover:bg-gray-100 block w-full"
              title={toolboxExpanded ? "Show fewer tools" : "Show more tools"}
              style={{ backgroundColor: toolboxExpanded ? '#fef2f2' : 'white' }}
            >
              <Menu size={20} style={toolboxExpanded ? { color: '#500000' } : {}} />
            </button>
          </div>

          {/* Attribute Panel */}
          {showAttributePanel && selectedFeature && (
            <div className="absolute top-6 right-6 bg-white rounded-lg shadow-xl border-2 max-w-md z-50 overflow-hidden" style={{ borderColor: '#500000', maxHeight: '80vh' }}>
              <div className="text-white px-4 py-3 flex items-center justify-between" style={{ backgroundColor: '#500000' }}>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Info size={20} />
                  Feature Attributes
                </h3>
                <button 
                  onClick={() => {
                    setShowAttributePanel(false);
                    setSelectedFeature(null);
                  }}
                  className="text-white hover:bg-red-900 rounded p-1"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 60px)' }}>
                <div className="mb-4">
                  <h4 className="font-semibold text-lg mb-2" style={{ color: '#500000' }}>{selectedFeature.name}</h4>
                  <p className="text-sm text-gray-600">Type: {selectedFeature.type === 'imported_polygon' ? 'Imported Polygon' : selectedFeature.type}</p>
                </div>
                
                {selectedFeature.properties && Object.keys(selectedFeature.properties).length > 0 ? (
                  <div>
                    <h5 className="font-semibold mb-2 text-sm" style={{ color: '#500000' }}>Properties:</h5>
                    <div className="space-y-2">
                      {Object.entries(selectedFeature.properties).map(([key, value]) => (
                        <div key={key} className="border-b border-gray-200 pb-2">
                          <div className="text-xs font-semibold text-gray-600 uppercase">{key}</div>
                          <div className="text-sm text-gray-900 break-words">
                            {value !== null && value !== undefined ? String(value) : 'N/A'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">No additional properties available</div>
                )}
                
                {selectedFeature.bbox && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="font-semibold mb-2 text-sm" style={{ color: '#500000' }}>Geographic Extent:</h5>
                    <div className="text-xs space-y-1">
                      <div><span className="font-semibold">Min Lat:</span> {selectedFeature.bbox.minLat.toFixed(6)}</div>
                      <div><span className="font-semibold">Max Lat:</span> {selectedFeature.bbox.maxLat.toFixed(6)}</div>
                      <div><span className="font-semibold">Min Lon:</span> {selectedFeature.bbox.minLon.toFixed(6)}</div>
                      <div><span className="font-semibold">Max Lon:</span> {selectedFeature.bbox.maxLon.toFixed(6)}</div>
                    </div>
                  </div>
                )}
                
                {selectedFeature.points && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="font-semibold mb-2 text-sm" style={{ color: '#500000' }}>Geometry:</h5>
                    <div className="text-xs text-gray-600">
                      {selectedFeature.points.length} vertices
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Basemap Selector - Google Maps style */}
          <div className="absolute bottom-6 left-6">
            {showBasemapSelector ? (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ width: '280px' }}>
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200" style={{ backgroundColor: '#f9fafb' }}>
                  <h4 className="font-semibold text-sm">Basemaps</h4>
                  <button
                    onClick={() => setShowBasemapSelector(false)}
                    className="text-gray-500 hover:text-gray-700 p-1"
                    title="Close"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="p-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setSelectedBasemap('street');
                      setShowBasemapSelector(false);
                    }}
                    className={`relative rounded-lg overflow-hidden border-2 ${selectedBasemap === 'street' ? 'border-red-900' : 'border-gray-200'} hover:border-gray-400 transition-colors`}
                    style={selectedBasemap === 'street' ? { borderColor: '#500000' } : {}}
                  >
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      <div className="text-center">
                        <Map size={32} className="mx-auto mb-1 text-gray-600" />
                        <div className="text-xs font-medium">Street</div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedBasemap('satellite');
                      setShowBasemapSelector(false);
                    }}
                    className={`relative rounded-lg overflow-hidden border-2 ${selectedBasemap === 'satellite' ? 'border-red-900' : 'border-gray-200'} hover:border-gray-400 transition-colors`}
                    style={selectedBasemap === 'satellite' ? { borderColor: '#500000' } : {}}
                  >
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      <div className="text-center">
                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpath d='M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20'/%3E%3Cpath d='M2 12h20'/%3E%3C/svg%3E" alt="Satellite" className="mx-auto mb-1" />
                        <div className="text-xs font-medium">Satellite</div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedBasemap('light');
                      setShowBasemapSelector(false);
                    }}
                    className={`relative rounded-lg overflow-hidden border-2 ${selectedBasemap === 'light' ? 'border-red-900' : 'border-gray-200'} hover:border-gray-400 transition-colors`}
                    style={selectedBasemap === 'light' ? { borderColor: '#500000' } : {}}
                  >
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-8 h-8 mx-auto mb-1 bg-gray-200 rounded"></div>
                        <div className="text-xs font-medium">Light</div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedBasemap('dark');
                      setShowBasemapSelector(false);
                    }}
                    className={`relative rounded-lg overflow-hidden border-2 ${selectedBasemap === 'dark' ? 'border-red-900' : 'border-gray-200'} hover:border-gray-400 transition-colors`}
                    style={selectedBasemap === 'dark' ? { borderColor: '#500000' } : {}}
                  >
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-8 h-8 mx-auto mb-1 bg-gray-700 rounded"></div>
                        <div className="text-xs font-medium">Dark</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowBasemapSelector(true)}
                className="bg-white rounded-lg shadow-lg px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm font-medium"
                title="Change Basemap"
              >
                <Layers size={18} />
                <span>Basemaps</span>
              </button>
            )}
          </div>

          {/* Legend - Collapsible */}
          <div className="absolute bottom-6 right-6">
            {showLegend ? (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200" style={{ backgroundColor: '#f9fafb' }}>
                  <h4 className="font-semibold text-sm">Legend</h4>
                  <button
                    onClick={() => setShowLegend(false)}
                    className="text-gray-500 hover:text-gray-700 p-1"
                    title="Close Legend"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="p-4 space-y-2 text-xs">
                  {layers.find(l => l.id === 2)?.visible && selectedFeatureTypes.includes('city') && (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-4 rounded bg-red-500"></div>
                      <span>Cities</span>
                    </div>
                  )}
                  {layers.find(l => l.id === 3)?.visible && selectedFeatureTypes.includes('park') && (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-4 rounded bg-green-500"></div>
                      <span>Parks</span>
                    </div>
                  )}
                  {layers.find(l => l.id === 4)?.visible && selectedFeatureTypes.includes('imported_polygon') && (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-4 rounded border-2 border-purple-500 bg-purple-500 bg-opacity-20"></div>
                      <span>Imported Polygons</span>
                    </div>
                  )}
                  {userLocation && (
                    <div className="flex items-center gap-2">
                      <MapPin size={16} style={{ color: '#500000' }} />
                      <span>Your Location</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowLegend(true)}
                className="bg-white rounded-lg shadow-lg px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm font-medium"
                title="Show Legend"
              >
                <Layers size={18} />
                <span>Legend</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Import GeoJSON Data</h2>
                <button onClick={() => { 
                  setShowImportModal(false); 
                  setImportError(''); 
                  setImportUrl('');
                  setImportText('');
                  setIsLoadingUrl(false);
                  setUseCorsProxy(true);
                }} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              <div className="flex gap-2 mb-4">
                <button 
                  onClick={() => setImportMethod('paste')} 
                  className={`flex-1 py-2 px-3 rounded text-sm font-medium ${importMethod === 'paste' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  <FileText className="inline mr-1" size={14} />
                  Paste JSON
                </button>
                <button 
                  onClick={() => setImportMethod('file')} 
                  className={`flex-1 py-2 px-3 rounded text-sm font-medium ${importMethod === 'file' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  <Upload className="inline mr-1" size={14} />
                  Upload File
                </button>
                <button 
                  onClick={() => setImportMethod('url')} 
                  className={`flex-1 py-2 px-3 rounded text-sm font-medium ${importMethod === 'url' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  <Link className="inline mr-1" size={14} />
                  From URL
                </button>
              </div>

              {importError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm whitespace-pre-line">
                  {importError}
                </div>
              )}

              {importMethod === 'paste' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Paste GeoJSON:</label>
                  <textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder='{"type":"FeatureCollection","features":[...]}'
                    className="w-full h-64 border border-gray-300 rounded p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button onClick={handleImportPaste} className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 font-medium">
                    Import GeoJSON
                  </button>
                </div>
              )}

              {importMethod === 'file' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload GeoJSON file:</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                    <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                    <input
                      type="file"
                      accept=".json,.geojson"
                      onChange={handleImportFile}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 inline-block font-medium">
                      Choose File
                    </label>
                    <p className="text-sm text-gray-500 mt-3">Supports .json and .geojson files</p>
                  </div>
                </div>
              )}

              {importMethod === 'url' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Enter GeoJSON URL:</label>
                  <input
                    type="text"
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    placeholder="http://172.25.25.72:8000/api/polygons/"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !isLoadingUrl) {
                        handleImportUrl();
                      }
                    }}
                  />

                  <div className="bg-purple-50 border border-purple-200 rounded p-3 mb-3">
                    <p className="text-xs text-purple-800 font-semibold mb-2">🚀 Quick Load Examples:</p>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setImportUrl('https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-zipcodes.json');
                          setUseCorsProxy(true);
                        }}
                        className="w-full text-left bg-white hover:bg-purple-50 border border-purple-200 rounded p-2 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <MapPin size={14} className="text-purple-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-purple-900">SF Zip Codes (Demo)</p>
                            <p className="text-xs text-purple-700 font-mono truncate">
                              raw.githubusercontent.com/visgl/deck.gl-data/...
                            </p>
                          </div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => {
                          setImportUrl('http://172.25.25.72:8000/api/polygons/?attr=uid16,panel&xmin=-103.029785&ymin=26.509905&xmax=-90.571289&ymax=36.297418');
                          setUseCorsProxy(true);
                        }}
                        className="w-full text-left bg-white hover:bg-purple-50 border border-purple-200 rounded p-2 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <MapPin size={14} className="text-purple-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-purple-900">Your API (with CORS Proxy)</p>
                            <p className="text-xs text-purple-700 font-mono truncate">
                              172.25.25.72:8000/api/polygons/...
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-300 rounded p-3 mb-3">
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useCorsProxy}
                        onChange={(e) => setUseCorsProxy(e.target.checked)}
                        className="mt-1 mr-3 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-green-800">✅ Use CORS Proxy (Recommended for local APIs)</p>
                        <p className="text-xs text-green-700 mt-1">
                          Enable this to bypass CORS restrictions. This routes your request through a proxy server.
                        </p>
                      </div>
                    </label>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-300 rounded p-3 mb-4">
                    <p className="text-xs text-amber-900 font-semibold mb-2">💡 Alternative Solutions:</p>
                    <div className="space-y-2 text-xs text-amber-800">
                      <details className="cursor-pointer">
                        <summary className="font-semibold">Option 1: Download JSON manually</summary>
                        <div className="mt-2 ml-3 space-y-1">
                          <p>1. Open your URL in a browser</p>
                          <p>2. Copy the JSON response</p>
                          <p>3. Use the "Paste JSON" tab above</p>
                        </div>
                      </details>
                      
                      <details className="cursor-pointer">
                        <summary className="font-semibold">Option 2: Add CORS to your server</summary>
                        <div className="mt-2 ml-3">
                          <p className="mb-1">Add these headers to your API:</p>
                          <code className="block bg-amber-100 p-2 rounded text-xs">
                            Access-Control-Allow-Origin: *<br/>
                            Access-Control-Allow-Methods: GET
                          </code>
                        </div>
                      </details>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleImportUrl}
                    disabled={isLoadingUrl || !importUrl}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center font-medium text-sm shadow-sm"
                  >
                    {isLoadingUrl ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                      </>
                    ) : (
                      <>
                        <Link className="inline mr-2" size={16} />
                        Load from URL
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Submit Area to API</h2>
                <button onClick={() => { 
                  setShowSubmitModal(false);
                  setSubmitUrl('');
                }} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">API Endpoint URL:</label>
                <input
                  type="text"
                  value={submitUrl}
                  onChange={(e) => setSubmitUrl(e.target.value)}
                  placeholder="http://your-api.com/endpoint"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 text-sm">
                <p className="font-semibold mb-1">Area Information:</p>
                <p>Area: {drawnArea?.area}</p>
                <p>Features: {filteredData.length}</p>
              </div>

              <button 
                onClick={handleSubmitArea}
                disabled={!submitUrl}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center font-medium"
              >
                <Upload className="inline mr-2" size={16} />
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}