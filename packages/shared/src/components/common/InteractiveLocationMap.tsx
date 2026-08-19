import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from '@tms/shared/components/common/Card';
import { Badge } from '@tms/shared/components/common/Badge';
import { Button } from '@tms/shared/components/common/Button';
import { Modal } from '@tms/shared/components/common/Modal';
import {
  MapPin,
  Compass,
  Navigation,
  Hotel,
  Camera,
  Bus,
  Plus,
  Layers,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Clock,
  ExternalLink,
} from 'lucide-react';

export type MapPinCategory = 'destination' | 'attraction' | 'hotel' | 'pickup' | 'waypoint';

export interface LocationPin {
  id: string;
  name: string;
  category: MapPinCategory;
  dayNumber?: number;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  description: string;
  travelTime?: string;
  address?: string;
}

interface InteractiveLocationMapProps {
  title?: string;
  tourTitle?: string;
  tourId?: string;
  pins?: LocationPin[];
  isEditable?: boolean;
  onAddPin?: (pin: Omit<LocationPin, 'id'>) => void;
}

// Map Tile Layer Options
type MapTileLayerKey = 'streets' | 'topo' | 'satellite' | 'dark';

interface MapTileLayerOption {
  key: MapTileLayerKey;
  label: string;
  url: string;
  attribution: string;
  maxZoom: number;
}

const TILE_LAYERS: Record<MapTileLayerKey, MapTileLayerOption> = {
  streets: {
    key: 'streets',
    label: '🗺️ OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  topo: {
    key: 'topo',
    label: '⛰️ Topo / Relief',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; OSM contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)',
    maxZoom: 17,
  },
  satellite: {
    key: 'satellite',
    label: '🛰️ Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18,
  },
  dark: {
    key: 'dark',
    label: '🌙 Dark Mode',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
  },
};

// Preset GPS Waypoints for Ethiopian Tour Destinations
const BALE_MOUNTAINS_PINS: LocationPin[] = [
  {
    id: 'bale-1',
    name: 'Bole International Airport (Gate 2)',
    category: 'pickup',
    dayNumber: 1,
    latitude: 8.9779,
    longitude: 38.7993,
    imageUrl: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&q=80&w=400',
    description: 'VIP Meet & greet pickup point and baggage handling in Addis Ababa.',
    travelTime: 'Tour Start',
    address: 'Bole Rd, Addis Ababa, Ethiopia',
  },
  {
    id: 'bale-2',
    name: 'Meskel Square Meeting Hub',
    category: 'pickup',
    dayNumber: 1,
    latitude: 9.0106,
    longitude: 38.7613,
    imageUrl: 'https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&q=80&w=400',
    description: 'Central city assembly point before departing in 4x4 expedition vehicles.',
    travelTime: '+45 mins',
    address: 'Meskel Square, Addis Ababa',
  },
  {
    id: 'bale-3',
    name: 'Dinsho Park Headquarters (Mountain Nyala)',
    category: 'destination',
    dayNumber: 1,
    latitude: 7.0983,
    longitude: 39.7845,
    imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=400',
    description: 'Park HQ forest trails filled with endemic Mountain Nyala and Menelik Bushbuck grazers.',
    travelTime: '5 hrs drive from Addis',
    address: 'Dinsho District, Bale Zone, Oromia',
  },
  {
    id: 'bale-4',
    name: 'Bale Mountain Eco-Lodge',
    category: 'hotel',
    dayNumber: 1,
    latitude: 6.7289,
    longitude: 39.7214,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=400',
    description: 'Sustainable luxury lodge nestled inside the pristine Harenna Forest canopy.',
    travelTime: 'Overnight Stay',
    address: 'Katcha Clearing, Harenna Forest',
  },
  {
    id: 'bale-5',
    name: 'Sanetti Alpine Plateau (Ethiopian Wolf Haven)',
    category: 'attraction',
    dayNumber: 2,
    latitude: 6.8333,
    longitude: 39.8833,
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=400',
    description: 'Afro-alpine moorland sitting over 4,000m altitude. Best place on Earth to spot wild red Ethiopian wolves.',
    travelTime: '1 hr 15 mins safari drive',
    address: 'Sanetti Plateau, Bale Mountains',
  },
  {
    id: 'bale-6',
    name: 'Tullu Demtu Peak (4,377m Summit)',
    category: 'attraction',
    dayNumber: 2,
    latitude: 6.8247,
    longitude: 39.8197,
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=400',
    description: 'Second highest peak in Ethiopia reachable along Africa’s highest road pass.',
    travelTime: '45 mins ascent',
    address: 'Bale Highlands Pass',
  },
  {
    id: 'bale-7',
    name: 'Harenna Cloud Forest & Wild Coffee Trail',
    category: 'attraction',
    dayNumber: 3,
    latitude: 6.6833,
    longitude: 39.7333,
    imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=80&w=400',
    description: 'Lush tropical bamboo & rainforest cloud canopy where indigenous wild Arabica coffee originated.',
    travelTime: '2 hrs nature trek',
    address: 'Southern Bale Escarpment',
  },
  {
    id: 'bale-8',
    name: 'Sof Omar Underground Limestone Caves',
    category: 'destination',
    dayNumber: 4,
    latitude: 6.9056,
    longitude: 40.8528,
    imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80&w=400',
    description: 'Africa’s longest natural subterranean cave system carved by the Weyib River with cathedral limestone arches.',
    travelTime: '2 hrs cave expedition',
    address: 'Sof Omar Gorge, Bale',
  },
];

const WENCHI_PINS: LocationPin[] = [
  {
    id: 'wenchi-1',
    name: 'Bole International Airport (Gate 2)',
    category: 'pickup',
    dayNumber: 1,
    latitude: 8.9779,
    longitude: 38.7993,
    imageUrl: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&q=80&w=400',
    description: 'International arrival pickup and briefing lounge.',
    travelTime: 'Start Point',
    address: 'Addis Ababa',
  },
  {
    id: 'wenchi-2',
    name: 'Meskel Square Meeting Point',
    category: 'pickup',
    dayNumber: 1,
    latitude: 9.0106,
    longitude: 38.7613,
    imageUrl: 'https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&q=80&w=400',
    description: 'Central city assembly before 4x4 convoy departure west.',
    travelTime: '+30 mins',
    address: 'Meskel Square, Addis Ababa',
  },
  {
    id: 'wenchi-3',
    name: 'Wenchi Crater Lake Rim & Viewpoint',
    category: 'destination',
    dayNumber: 1,
    latitude: 8.7905,
    longitude: 37.8992,
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=400',
    description: 'Panoramic volcanic crater rim viewpoint sitting 3,386m above sea level.',
    travelTime: '2 hrs 45 mins drive',
    address: 'Ambo/Wenchi District, Oromia Region',
  },
  {
    id: 'wenchi-4',
    name: 'Wenchi Eco-Lodge & Lakeside Villas',
    category: 'hotel',
    dayNumber: 1,
    latitude: 8.7880,
    longitude: 37.9010,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=400',
    description: 'Luxury eco-lodge featuring private lakeside wooden bungalows and campfire dining.',
    travelTime: 'Check-in 15:00',
    address: 'Wenchi Lake Shoreline',
  },
  {
    id: 'wenchi-5',
    name: 'Cherkos Monastery Island',
    category: 'attraction',
    dayNumber: 2,
    latitude: 8.7920,
    longitude: 37.9050,
    imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80&w=400',
    description: 'Historic 13th-century island monastery accessible via traditional wooden boat ride.',
    travelTime: '20 mins boat ride',
    address: 'Wenchi Lake Island',
  },
  {
    id: 'wenchi-6',
    name: 'Mineral Thermal Springs & Waterfall',
    category: 'attraction',
    dayNumber: 3,
    latitude: 8.7830,
    longitude: 37.9120,
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400',
    description: 'Natural therapeutic thermal hot springs & cascading waterfall trail.',
    travelTime: '45 mins trek',
    address: 'East Wenchi Valley Trail',
  },
];

const LALIBELA_PINS: LocationPin[] = [
  {
    id: 'lali-1',
    name: 'Lalibela Airport (LLI)',
    category: 'pickup',
    dayNumber: 1,
    latitude: 12.0236,
    longitude: 38.9886,
    imageUrl: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&q=80&w=400',
    description: 'Airport flight arrival transfer into the historic mountain town.',
    travelTime: 'Transfer 30 mins',
    address: 'Lalibela Airport, Amhara',
  },
  {
    id: 'lali-2',
    name: 'Bet Medhane Alem (Northern Cluster)',
    category: 'destination',
    dayNumber: 1,
    latitude: 12.0321,
    longitude: 39.0435,
    imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&q=80&w=400',
    description: 'The largest monolithic rock-hewn church in the world, supported by 36 massive stone pillars.',
    travelTime: 'Morning Pilgrimage',
    address: 'Lalibela World Heritage Site',
  },
  {
    id: 'lali-3',
    name: 'Bet Giyorgis (Church of Saint George)',
    category: 'attraction',
    dayNumber: 2,
    latitude: 12.0305,
    longitude: 39.0418,
    imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&q=80&w=400',
    description: 'The iconic Greek-cross monolithic cathedral carved down into solid volcanic rock.',
    travelTime: 'Sunset Visit',
    address: 'Western Lalibela Compound',
  },
  {
    id: 'lali-4',
    name: 'Yemrehana Krestos Cave Monastery',
    category: 'attraction',
    dayNumber: 3,
    latitude: 12.1469,
    longitude: 39.0722,
    imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80&w=400',
    description: 'Built-up Aksumite-style wood and stone church tucked inside a vast basalt mountain cavern.',
    travelTime: '1 hr 30 mins 4x4 drive',
    address: 'Mount Abuna Yosef Foothills',
  },
];

const SIMIEN_PINS: LocationPin[] = [
  {
    id: 'sim-1',
    name: 'Debark National Park Headquarters',
    category: 'pickup',
    dayNumber: 1,
    latitude: 13.1444,
    longitude: 37.8967,
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=400',
    description: 'Ranger briefing, scout assignment and park permits office.',
    travelTime: 'Registration',
    address: 'Debark, Amhara Region',
  },
  {
    id: 'sim-2',
    name: 'Sankaber Camp & Jinbar Waterfall Gorge',
    category: 'destination',
    dayNumber: 1,
    latitude: 13.2269,
    longitude: 38.0317,
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=400',
    description: 'Spectacular 500m Jinbar waterfall plunging into the abyss, with Gelada baboon troops.',
    travelTime: '3 hrs hike',
    address: 'Simien Mountains Ridge',
  },
  {
    id: 'sim-3',
    name: 'Imet Gogo Cliff Peak (3,926m)',
    category: 'attraction',
    dayNumber: 2,
    latitude: 13.2750,
    longitude: 38.0900,
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400',
    description: 'One of the most jaw-dropping 360-degree panoramic canyon viewpoints in all of Africa.',
    travelTime: '2 hrs ridge trek',
    address: 'Geech Plateau',
  },
  {
    id: 'sim-4',
    name: 'Chennek Camp & Walia Ibex Escarpment',
    category: 'hotel',
    dayNumber: 3,
    latitude: 13.2500,
    longitude: 38.1833,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=400',
    description: 'High-altitude mountain camp where endangered Walia Ibex and Lammergeier vultures roost.',
    travelTime: 'Overnight Camp',
    address: 'Chennek Valley (3,620m)',
  },
];

export const InteractiveLocationMap: React.FC<InteractiveLocationMapProps> = ({
  title = 'Interactive Location Map & Route',
  tourTitle = '',
  tourId = '',
  pins,
  isEditable = true,
  onAddPin,
}) => {
  // Select preset pins based on tour title if pins are not explicitly provided
  const initialPins = React.useMemo(() => {
    if (pins && pins.length > 0) return pins;
    const lowerTitle = (tourTitle || title || '').toLowerCase();
    if (lowerTitle.includes('bale')) return BALE_MOUNTAINS_PINS;
    if (lowerTitle.includes('lali')) return LALIBELA_PINS;
    if (lowerTitle.includes('simien')) return SIMIEN_PINS;
    if (lowerTitle.includes('wenchi')) return WENCHI_PINS;
    return BALE_MOUNTAINS_PINS;
  }, [pins, tourTitle, title]);

  const [mapPins, setMapPins] = useState<LocationPin[]>(initialPins);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<number | 'all'>('all');
  const [activePin, setActivePin] = useState<LocationPin | null>(null);
  const [currentTileLayer, setCurrentTileLayer] = useState<MapTileLayerKey>('streets');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Add Pin Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPinName, setNewPinName] = useState('');
  const [newPinCategory, setNewPinCategory] = useState<MapPinCategory>('attraction');
  const [newPinDay, setNewPinDay] = useState(1);
  const [newPinLat, setNewPinLat] = useState(mapPins[0]?.latitude || 8.9779);
  const [newPinLng, setNewPinLng] = useState(mapPins[0]?.longitude || 38.7993);
  const [newPinDesc, setNewPinDesc] = useState('');
  const [newPinAddress, setNewPinAddress] = useState('');

  // Leaflet references
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  // Update mapPins if initialPins changes
  useEffect(() => {
    setMapPins(initialPins);
  }, [initialPins]);

  const filteredPins = mapPins.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesDay = selectedDay === 'all' || p.dayNumber === selectedDay;
    return matchesCat && matchesDay;
  });

  const getCategoryMeta = (cat: MapPinCategory) => {
    switch (cat) {
      case 'destination':
        return { iconEmoji: '📍', label: 'Destination', color: '#034ea2', bg: 'rgba(3,78,162,0.15)' };
      case 'attraction':
        return { iconEmoji: '📸', label: 'Attraction / Sight', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' };
      case 'hotel':
        return { iconEmoji: '🏨', label: 'Hotel & Lodge', color: '#10b981', bg: 'rgba(16,185,129,0.15)' };
      case 'pickup':
        return { iconEmoji: '🚐', label: 'Pickup / Meeting', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' };
      default:
        return { iconEmoji: '🧭', label: 'Waypoint Stop', color: '#ec4899', bg: 'rgba(236,72,153,0.15)' };
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const centerLat = mapPins[0]?.latitude || 9.0;
      const centerLng = mapPins[0]?.longitude || 39.0;

      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 8,
        zoomControl: false,
        attributionControl: true,
      });

      // Add Tile Layer
      const initialLayerConfig = TILE_LAYERS[currentTileLayer];
      const tileLayer = L.tileLayer(initialLayerConfig.url, {
        attribution: initialLayerConfig.attribution,
        maxZoom: initialLayerConfig.maxZoom,
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      // Layer groups for markers & routes
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;

      mapInstanceRef.current = map;
    }

    return () => {
      // Map cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Switch Tile Layer when user toggles
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    const layerConfig = TILE_LAYERS[currentTileLayer];
    const newTileLayer = L.tileLayer(layerConfig.url, {
      attribution: layerConfig.attribution,
      maxZoom: layerConfig.maxZoom,
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newTileLayer;
  }, [currentTileLayer]);

  // Update Markers & Polyline when pins or filters change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();
    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }

    if (filteredPins.length === 0) return;

    const latLngs: L.LatLngExpression[] = [];

    filteredPins.forEach((pin, index) => {
      const meta = getCategoryMeta(pin.category);
      const isSelected = activePin?.id === pin.id;
      latLngs.push([pin.latitude, pin.longitude]);

      // Create Custom HTML Pin Marker
      const customIcon = L.divIcon({
        className: 'custom-osm-pin-marker',
        html: `
          <div style="
            position: relative;
            cursor: pointer;
            transform: translate(-50%, -100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            filter: drop-shadow(0 4px 10px rgba(0,0,0,0.45));
            transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          ">
            <div style="
              display: flex;
              align-items: center;
              gap: 6px;
              padding: 5px 11px;
              background-color: ${meta.color};
              color: #ffffff;
              font-weight: 800;
              font-size: 11px;
              border-radius: 9999px;
              border: 2px solid #ffffff;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              white-space: nowrap;
              ${isSelected ? 'transform: scale(1.1); outline: 3px solid #f59e0b;' : ''}
            ">
              <span>${meta.iconEmoji}</span>
              <span>${pin.name}</span>
              ${pin.dayNumber ? `<span style="font-size: 9px; background: rgba(0,0,0,0.3); padding: 1px 5px; border-radius: 4px;">Day ${pin.dayNumber}</span>` : ''}
            </div>
            <div style="
              width: 0;
              height: 0;
              border-left: 6px solid transparent;
              border-right: 6px solid transparent;
              border-top: 8px solid ${meta.color};
              margin-top: -1px;
            "></div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([pin.latitude, pin.longitude], { icon: customIcon });

      marker.on('click', () => {
        setActivePin(pin);
        map.flyTo([pin.latitude, pin.longitude], Math.max(map.getZoom(), 11), {
          duration: 1.2,
        });
      });

      marker.addTo(markersLayer);
    });

    // Draw Smooth Animated Route Polyline
    if (latLngs.length > 1) {
      const polyline = L.polyline(latLngs, {
        color: '#f59e0b',
        weight: 4,
        opacity: 0.85,
        dashArray: '8, 8',
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      routePolylineRef.current = polyline;
    }

    // Auto fit bounds to visible pins
    if (latLngs.length > 0) {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [filteredPins, activePin]);

  // Recenter Map
  const handleRecenter = () => {
    if (!mapInstanceRef.current || filteredPins.length === 0) return;
    const latLngs = filteredPins.map((p) => [p.latitude, p.longitude] as [number, number]);
    const bounds = L.latLngBounds(latLngs);
    mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 12 });
  };

  // Zoom In / Out
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  // Focus specific pin from card list
  const handleFocusPin = (pin: LocationPin) => {
    setActivePin(pin);
    mapInstanceRef.current?.flyTo([pin.latitude, pin.longitude], 12, {
      duration: 1.2,
    });
  };

  // Handle Create Pin
  const handleCreatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPinName.trim()) return;

    const created: LocationPin = {
      id: `pin-${Date.now()}`,
      name: newPinName,
      category: newPinCategory,
      dayNumber: newPinDay,
      latitude: Number(newPinLat),
      longitude: Number(newPinLng),
      description: newPinDesc || 'Custom itinerary waypoint stop.',
      address: newPinAddress || 'Ethiopian Expedition Location',
      imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600',
    };

    setMapPins([...mapPins, created]);
    if (onAddPin) onAddPin(created);

    setNewPinName('');
    setNewPinDesc('');
    setIsAddModalOpen(false);
  };

  return (
    <Card glass style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header Bar */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)', fontSize: '11px', fontWeight: 700, marginBottom: '0.4rem' }}>
            <Navigation size={12} /> Real GPS Route Waypoints
          </div>
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            {title}
          </h2>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Interactive OpenStreetMap expedition route with live street tiles, topographic contours, and GPS waypoint stops.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {isEditable && (
            <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setIsAddModalOpen(true)}>
              Add GPS Stop
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Day Selector Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.875rem', backgroundColor: 'var(--bg-tertiary)', padding: '0.65rem 0.875rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        
        {/* Category Filters */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'All Stops' },
            { key: 'destination', label: '📍 Destinations' },
            { key: 'attraction', label: '📸 Sights' },
            { key: 'hotel', label: '🏨 Lodges' },
            { key: 'pickup', label: '🚐 Pickup Points' },
          ].map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              style={{
                padding: '0.3rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                backgroundColor: selectedCategory === cat.key ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                color: selectedCategory === cat.key ? '#ffffff' : 'var(--text-secondary)',
                fontSize: 11,
                fontWeight: selectedCategory === cat.key ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Day Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: 'var(--font-size-xs)' }}>
          <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Itinerary Day:</span>
          {[
            { day: 'all', label: 'Full Route' },
            { day: 1, label: 'Day 1' },
            { day: 2, label: 'Day 2' },
            { day: 3, label: 'Day 3' },
            { day: 4, label: 'Day 4' },
          ].map((d) => (
            <button
              key={d.day.toString()}
              type="button"
              onClick={() => setSelectedDay(d.day as any)}
              style={{
                padding: '0.25rem 0.55rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: selectedDay === d.day ? 'var(--brand-primary-light)' : 'transparent',
                color: selectedDay === d.day ? 'var(--brand-primary)' : 'var(--text-muted)',
                fontWeight: selectedDay === d.day ? 800 : 500,
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Street Map Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: isFullscreen ? '75vh' : '460px',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          border: '1px solid var(--border-color)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
        }}
      >
        {/* Leaflet Street Map Container DOM */}
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

        {/* Floating Tile Layer Selector Pill */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 1000,
            display: 'flex',
            gap: 4,
            padding: 4,
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            border: '1px solid rgba(0,0,0,0.08)',
          }}
        >
          {Object.values(TILE_LAYERS).map((layer) => (
            <button
              key={layer.key}
              type="button"
              onClick={() => setCurrentTileLayer(layer.key)}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                backgroundColor: currentTileLayer === layer.key ? 'var(--brand-primary)' : 'transparent',
                color: currentTileLayer === layer.key ? '#ffffff' : '#334155',
                fontSize: 11,
                fontWeight: currentTileLayer === layer.key ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {layer.label}
            </button>
          ))}
        </div>

        {/* Floating Zoom & Map Controls */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            style={{
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              color: '#0f172a',
            }}
          >
            <ZoomIn size={16} />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            style={{
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              color: '#0f172a',
            }}
          >
            <ZoomOut size={16} />
          </button>
          <button
            type="button"
            onClick={handleRecenter}
            title="Fit All Route Stops"
            style={{
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              color: '#0f172a',
            }}
          >
            <Crosshair size={16} />
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Map'}
            style={{
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              color: '#0f172a',
            }}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>

        {/* Live Active Pin Overlay Bubble on Map Bottom */}
        {activePin && (
          <div
            style={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              right: 16,
              maxWidth: 420,
              zIndex: 1000,
              padding: '0.875rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(10px)',
              color: '#ffffff',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
            }}
          >
            {activePin.imageUrl && (
              <img
                src={activePin.imageUrl}
                alt={activePin.name}
                style={{ width: 50, height: 50, borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0 }}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {activePin.name}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
                📍 {activePin.address || 'Ethiopia Route Stop'}
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 4, alignItems: 'center' }}>
                <span style={{ fontSize: 9, backgroundColor: getCategoryMeta(activePin.category).color, color: '#fff', padding: '1px 6px', borderRadius: 4, fontWeight: 700, textTransform: 'uppercase' }}>
                  {activePin.category}
                </span>
                {activePin.travelTime && (
                  <span style={{ fontSize: 10, color: '#f59e0b', fontWeight: 600 }}>
                    ⏱️ {activePin.travelTime}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setActivePin(null)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 16, padding: '4px' }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Horizontal Waypoint Stop Cards Carousel */}
      <div>
        <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Itinerary Route Stops & Waypoints ({filteredPins.length}) — Click to Fly To Location
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {filteredPins.map((pin) => {
            const meta = getCategoryMeta(pin.category);
            const isSelected = activePin?.id === pin.id;

            return (
              <div
                key={pin.id}
                onClick={() => handleFocusPin(pin)}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1.5px solid ${isSelected ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                  backgroundColor: isSelected ? 'var(--brand-primary-light)' : 'var(--bg-secondary)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  display: 'flex',
                  gap: '0.65rem',
                  alignItems: 'center',
                }}
              >
                {pin.imageUrl ? (
                  <img
                    src={pin.imageUrl}
                    alt={pin.name}
                    style={{ width: 42, height: 42, borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0 }}
                  />
                ) : (
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: meta.bg,
                      color: meta.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      flexShrink: 0,
                    }}
                  >
                    {meta.iconEmoji}
                  </div>
                )}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 'var(--font-size-xs)', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {pin.name}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {pin.dayNumber ? `Day ${pin.dayNumber} • ` : ''}{meta.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add GPS Stop Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New GPS Location Stop"
        footer={
          <div className="flex-between" style={{ width: '100%' }}>
            <Button variant="ghost" size="sm" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleCreatePin} icon={<Plus size={14} />}>
              Save GPS Pin
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreatePin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
              Location Stop Name *
            </label>
            <input
              type="text"
              value={newPinName}
              onChange={(e) => setNewPinName(e.target.value)}
              placeholder="e.g. Sanetti Alpine Plateau"
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
              }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                Category
              </label>
              <select
                value={newPinCategory}
                onChange={(e) => setNewPinCategory(e.target.value as MapPinCategory)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="destination">Destination</option>
                <option value="attraction">Attraction / Sight</option>
                <option value="hotel">Hotel / Eco-Lodge</option>
                <option value="pickup">Pickup / Meeting Point</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                Itinerary Day Number
              </label>
              <input
                type="number"
                min={1}
                max={14}
                value={newPinDay}
                onChange={(e) => setNewPinDay(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                Latitude (GPS)
              </label>
              <input
                type="number"
                step="0.0001"
                value={newPinLat}
                onChange={(e) => setNewPinLat(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                }}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                Longitude (GPS)
              </label>
              <input
                type="number"
                step="0.0001"
                value={newPinLng}
                onChange={(e) => setNewPinLng(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
              Address / Stop Location
            </label>
            <input
              type="text"
              value={newPinAddress}
              onChange={(e) => setNewPinAddress(e.target.value)}
              placeholder="e.g. Bale Zone, Oromia Region"
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
              Description
            </label>
            <textarea
              rows={3}
              value={newPinDesc}
              onChange={(e) => setNewPinDesc(e.target.value)}
              placeholder="Describe sight highlights, meeting times, and travel notes..."
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: 'var(--font-size-xs)',
              }}
            />
          </div>
        </form>
      </Modal>

    </Card>
  );
};
