'use client';

import React, { useEffect, useRef, useState } from 'react';

// Coordinated geospatial database for ETS 2, ATS, and GTC community routes
const CITY_COORDINATES = {
  // European Hubs (ETS 2)
  'munich': { lat: 48.1351, lng: 11.5820, country: 'Germany', region: 'Central Europe' },
  'milan': { lat: 45.4642, lng: 9.1900, country: 'Italy', region: 'Southern Europe' },
  'berlin': { lat: 52.5200, lng: 13.4050, country: 'Germany', region: 'Central Europe' },
  'frankfurt': { lat: 50.1109, lng: 8.6821, country: 'Germany', region: 'Central Europe' },
  'hamburg': { lat: 53.5511, lng: 9.9937, country: 'Germany', region: 'Northern Europe' },
  'paris': { lat: 48.8566, lng: 2.3522, country: 'France', region: 'Western Europe' },
  'lyon': { lat: 45.7640, lng: 4.8357, country: 'France', region: 'Western Europe' },
  'marseille': { lat: 43.2965, lng: 5.3698, country: 'France', region: 'Mediterranean' },
  'rotterdam': { lat: 51.9244, lng: 4.4777, country: 'Netherlands', region: 'Western Europe' },
  'amsterdam': { lat: 52.3676, lng: 4.9041, country: 'Netherlands', region: 'Western Europe' },
  'brussels': { lat: 50.8503, lng: 4.3517, country: 'Belgium', region: 'Western Europe' },
  'prague': { lat: 50.0755, lng: 14.4378, country: 'Czech Republic', region: 'Central Europe' },
  'vienna': { lat: 48.2082, lng: 16.3738, country: 'Austria', region: 'Central Europe' },
  'innsbruck': { lat: 47.2692, lng: 11.4041, country: 'Austria', region: 'Alpine Pass' },
  'zurich': { lat: 47.3769, lng: 8.5417, country: 'Switzerland', region: 'Alpine Pass' },
  'stockholm': { lat: 59.3293, lng: 18.0686, country: 'Sweden', region: 'Scandinavia' },
  'gothenburg': { lat: 57.7089, lng: 11.9746, country: 'Sweden', region: 'Scandinavia' },
  'oslo': { lat: 59.9139, lng: 10.7522, country: 'Norway', region: 'Scandinavia' },
  'bergen': { lat: 60.3913, lng: 5.3221, country: 'Norway', region: 'Scandinavia' },
  'copenhagen': { lat: 55.6761, lng: 12.5683, country: 'Denmark', region: 'Scandinavia' },
  'helsinki': { lat: 60.1699, lng: 24.9384, country: 'Finland', region: 'Nordic' },
  'warsaw': { lat: 52.2297, lng: 21.0122, country: 'Poland', region: 'Eastern Europe' },
  'london': { lat: 51.5074, lng: -0.1278, country: 'United Kingdom', region: 'British Isles' },
  'madrid': { lat: 40.4168, lng: -3.7038, country: 'Spain', region: 'Iberia' },
  'barcelona': { lat: 41.3879, lng: 2.1699, country: 'Spain', region: 'Iberia' },
  'lisbon': { lat: 38.7223, lng: -9.1393, country: 'Portugal', region: 'Iberia' },
  'rome': { lat: 41.9028, lng: 12.4964, country: 'Italy', region: 'Southern Europe' },

  // American Hubs (ATS)
  'las vegas': { lat: 36.1699, lng: -115.1398, country: 'USA', region: 'Nevada' },
  'los angeles': { lat: 34.0522, lng: -118.2437, country: 'USA', region: 'California' },
  'san francisco': { lat: 37.7749, lng: -122.4194, country: 'USA', region: 'California' },
  'san diego': { lat: 32.7157, lng: -117.1611, country: 'USA', region: 'California' },
  'phoenix': { lat: 33.4484, lng: -112.0740, country: 'USA', region: 'Arizona' },
  'seattle': { lat: 47.6062, lng: -122.3321, country: 'USA', region: 'Washington' },
  'portland': { lat: 45.5152, lng: -122.6784, country: 'USA', region: 'Oregon' },
  'denver': { lat: 39.7392, lng: -104.9903, country: 'USA', region: 'Colorado' },
  'salt lake city': { lat: 40.7608, lng: -111.8910, country: 'USA', region: 'Utah' },
  'albuquerque': { lat: 35.0844, lng: -106.6504, country: 'USA', region: 'New Mexico' },
  'dallas': { lat: 32.7767, lng: -96.7970, country: 'USA', region: 'Texas' },
  'houston': { lat: 29.7604, lng: -95.3698, country: 'USA', region: 'Texas' },
  'austin': { lat: 30.2672, lng: -97.7431, country: 'USA', region: 'Texas' },
  'san antonio': { lat: 29.4241, lng: -98.4936, country: 'USA', region: 'Texas' },
  'chicago': { lat: 41.8781, lng: -87.6298, country: 'USA', region: 'Illinois' },
  'miami': { lat: 25.7617, lng: -80.1918, country: 'USA', region: 'Florida' },
  'atlanta': { lat: 33.7490, lng: -84.3880, country: 'USA', region: 'Georgia' },

  // GTC Global Member Hubs
  'nairobi': { lat: -1.2921, lng: 36.8219, country: 'Kenya', region: 'East Africa' },
  'mombasa': { lat: -4.0435, lng: 39.6682, country: 'Kenya', region: 'Coast Corridor' },
  'kisumu': { lat: -0.0917, lng: 34.7680, country: 'Kenya', region: 'Lake Basin' },
  'nakuru': { lat: -0.3031, lng: 36.0800, country: 'Kenya', region: 'Rift Valley' },
  'eldoret': { lat: 0.5143, lng: 35.2698, country: 'Kenya', region: 'Rift Valley' },
  'sao paulo': { lat: -23.5505, lng: -46.6333, country: 'Brazil', region: 'South America' },
  'rio de janeiro': { lat: -22.9068, lng: -43.1729, country: 'Brazil', region: 'South America' },
  'johannesburg': { lat: -26.2041, lng: 28.0473, country: 'South Africa', region: 'Southern Africa' },
  'cape town': { lat: -33.9249, lng: 18.4241, country: 'South Africa', region: 'Southern Africa' },
  'cairo': { lat: 30.0444, lng: 31.2357, country: 'Egypt', region: 'North Africa' },
};

function resolveCityCoords(name, fallbackDefault) {
  if (!name) return fallbackDefault;
  const lower = name.toLowerCase().trim();
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (lower.includes(key)) {
      return coords;
    }
  }
  return fallbackDefault;
}

export default function ConvoyMapDisplay({ convoy, height = '460px' }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [activeLayer, setActiveLayer] = useState('dark');
  const [mapLoaded, setMapLoaded] = useState(false);

  const isATS = convoy?.game?.includes('ATS');
  const depLocation = convoy?.departureLocation || convoy?.departureCity || (isATS ? 'Las Vegas' : 'Munich');
  const destLocation = convoy?.destinationLocation || convoy?.destinationCity || (isATS ? 'Los Angeles' : 'Milan');

  const defaultDep = isATS ? CITY_COORDINATES['las vegas'] : CITY_COORDINATES['munich'];
  const defaultDest = isATS ? CITY_COORDINATES['los angeles'] : CITY_COORDINATES['milan'];

  const depCoords = resolveCityCoords(depLocation, defaultDep);
  const destCoords = resolveCityCoords(destLocation, defaultDest);

  // Compute waypoint midpoint for CB Radio Staging
  const midLat = (depCoords.lat + destCoords.lat) / 2 + (isATS ? 0.3 : 0.2);
  const midLng = (depCoords.lng + destCoords.lng) / 2 + (isATS ? -0.2 : 0.4);
  const waypointCoords = { lat: midLat, lng: midLng };

  useEffect(() => {
    let isCancelled = false;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      // Dynamically import Leaflet
      const L = (await import('leaflet')).default;
      if (isCancelled) return;

      // Fix default Leaflet icon paths
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [midLat, midLng],
        zoom: 6,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      mapInstanceRef.current = map;

      // Base tile layers (Modeled after GEOINSIGHTS-COMPLETE MapDisplay.tsx)
      const tileLayers = {
        dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; CartoDB &copy; GTC Telemetry',
          maxZoom: 18,
        }),
        satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri &mdash; GTC Satellite Radar',
          maxZoom: 18,
        }),
        street: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors &mdash; Highway Corridors',
          maxZoom: 18,
        }),
      };

      const selectedLayer = tileLayers[activeLayer] || tileLayers.dark;
      selectedLayer.addTo(map);

      // Custom SVG Pins
      const createIcon = (color, iconClass, label) => {
        return L.divIcon({
          className: 'gtc-custom-map-pin',
          html: `
            <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              width: 38px;
              height: 38px;
              background-color: ${color};
              color: #ffffff;
              border-radius: 50%;
              box-shadow: 0 4px 12px rgba(0,0,0,0.45);
              border: 2px solid #ffffff;
              font-size: 16px;
            ">
              <i class="bi ${iconClass}"></i>
            </div>
            <div style="
              background: rgba(15, 23, 42, 0.9);
              color: #f8fafc;
              font-size: 10px;
              font-weight: 700;
              padding: 2px 6px;
              border-radius: 4px;
              white-space: nowrap;
              border: 1px solid rgba(255,255,255,0.2);
              margin-top: 3px;
              text-align: center;
            ">${label}</div>
          `,
          iconSize: [38, 54],
          iconAnchor: [19, 19],
          popupAnchor: [0, -20],
        });
      };

      const depIcon = createIcon('#10b981', 'bi-geo-alt-fill', 'DEPARTURE');
      const wayIcon = createIcon('#f59e0b', 'bi-broadcast', 'CB CH 19');
      const destIcon = createIcon('#0284c7', 'bi-flag-fill', 'DESTINATION');

      // Add Departure Marker
      const depMarker = L.marker([depCoords.lat, depCoords.lng], { icon: depIcon }).addTo(map);
      depMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; color: #0f172a; padding: 4px;">
          <strong style="color: #10b981; font-size: 13px;">Departure Staging Hub</strong><br />
          <strong>${depLocation}</strong> (${depCoords.country || 'Europe'})<br />
          <span style="color: #64748b;">GPS: ${depCoords.lat.toFixed(4)}, ${depCoords.lng.toFixed(4)}</span><br />
          <div style="margin-top: 4px; font-weight: 600;">Staging Time: ${convoy?.meetupTime || '17:30 EAT'}</div>
        </div>
      `);

      // Add Midpoint Waypoint Marker
      const wayMarker = L.marker([midLat, midLng], { icon: wayIcon }).addTo(map);
      wayMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; color: #0f172a; padding: 4px;">
          <strong style="color: #f59e0b; font-size: 13px;">Highway Rest Stop &amp; CB Radio Station</strong><br />
          <span>Convoy Regroup &amp; Fuel Checkpoint</span><br />
          <strong>Radio: Channel 19</strong> (TruckersMP / Discord)<br />
          <span style="color: #64748b;">Pacing: ${convoy?.speedLimit || '80 - 90 km/h'}</span>
        </div>
      `);

      // Add Destination Marker
      const destMarker = L.marker([destCoords.lat, destCoords.lng], { icon: destIcon }).addTo(map);
      destMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; color: #0f172a; padding: 4px;">
          <strong style="color: #0284c7; font-size: 13px;">Convoy Destination</strong><br />
          <strong>${destLocation}</strong> (${destCoords.country || 'Europe'})<br />
          <span style="color: #64748b;">GPS: ${destCoords.lat.toFixed(4)}, ${destCoords.lng.toFixed(4)}</span><br />
          <div style="margin-top: 4px; color: #0284c7; font-weight: 600;">Final Photo Lineup &amp; Debrief</div>
        </div>
      `);

      // Highway Corridor Polyline (Connecting Dep -> Waypoint -> Dest)
      const routePoints = [
        [depCoords.lat, depCoords.lng],
        [midLat, midLng],
        [destCoords.lat, destCoords.lng],
      ];

      const routeLine = L.polyline(routePoints, {
        color: '#0284c7',
        weight: 4,
        opacity: 0.85,
        dashArray: '8, 8',
      }).addTo(map);

      // Fit map bounds to show full route
      const group = new L.featureGroup([depMarker, wayMarker, destMarker, routeLine]);
      map.fitBounds(group.getBounds().pad(0.2));

      setMapLoaded(true);
    }

    initMap();

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [convoy?.departureLocation, convoy?.departureCity, convoy?.destinationLocation, convoy?.destinationCity, convoy?.game, convoy?.id, convoy?.title, activeLayer]);

  return (
    <div className="card glass overflow-hidden shadow-lg border position-relative" style={{ borderColor: '#e2e8f0', borderRadius: '12px' }}>
      
      {/* Map Header Toolbar with GEOINSIGHTS-style telemetry badges & Layer Switcher */}
      <div className="p-2.5 p-sm-3 bg-white border-bottom d-flex flex-wrap align-items-center justify-content-between gap-2" style={{ borderColor: '#e2e8f0' }}>
        <div className="d-flex align-items-center gap-2">
          <span className="badge badge-gold px-2 py-1 small">
            <i className="bi bi-geo-alt-fill me-1"></i> GEOSPATIAL RADAR
          </span>
          <span className="fw-bold text-dark small text-truncate" style={{ maxWidth: '200px' }}>
            {depLocation} &rarr; {destLocation}
          </span>
        </div>

        {/* Satellite / Dark / Street Layer Controls (GEOINSIGHTS pattern) */}
        <div className="btn-group btn-group-sm w-100 w-sm-auto d-flex d-sm-inline-flex mt-1 mt-sm-0" role="group">
          <button
            type="button"
            onClick={() => setActiveLayer('dark')}
            className={`btn fw-bold flex-fill ${activeLayer === 'dark' ? 'btn-primary' : 'btn-outline-secondary'}`}
            style={activeLayer === 'dark' ? { backgroundColor: '#0284c7', borderColor: '#0284c7' } : {}}
            title="Night Trucking Radar"
          >
            <i className="bi bi-moon-stars-fill me-1"></i> Dark
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('satellite')}
            className={`btn fw-bold flex-fill ${activeLayer === 'satellite' ? 'btn-primary' : 'btn-outline-secondary'}`}
            style={activeLayer === 'satellite' ? { backgroundColor: '#0284c7', borderColor: '#0284c7' } : {}}
            title="Esri Satellite Imagery"
          >
            <i className="bi bi-globe-americas me-1"></i> Satellite
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('street')}
            className={`btn fw-bold flex-fill ${activeLayer === 'street' ? 'btn-primary' : 'btn-outline-secondary'}`}
            style={activeLayer === 'street' ? { backgroundColor: '#0284c7', borderColor: '#0284c7' } : {}}
            title="OpenStreetMap Highway Network"
          >
            <i className="bi bi-map-fill me-1"></i> Street
          </button>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div
        ref={mapContainerRef}
        style={{ width: '100%', height: 'clamp(280px, 45vh, 440px)', minHeight: '280px', backgroundColor: '#0a0e17' }}
      ></div>

      {/* Bottom Telemetry HUD Bar */}
      <div className="p-3 bg-light border-top d-flex flex-wrap align-items-center justify-content-between gap-3 text-secondary small" style={{ borderColor: '#e2e8f0' }}>
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <span>
            <i className="bi bi-broadcast text-warning me-1"></i>
            In-game CB Radio: <strong className="text-dark">{convoy?.radioChannel || (convoy?.voiceChannel ? convoy.voiceChannel.replace(/Discord Radio /i, '') : 'Channel 19')}</strong>
          </span>
          <span>&bull;</span>
          <span>
            <i className="bi bi-speedometer2 text-primary me-1"></i>
            Target Pace: <strong className="text-dark">{convoy?.speedLimit || (isATS ? '65 mph' : '85 km/h')}</strong>
          </span>
          <span>&bull;</span>
          <span>
            <i className="bi bi-hdd-network text-success me-1"></i>
            Server: <strong className="text-dark">{convoy?.site || convoy?.server || 'TruckersMP Sim 1'}</strong>
          </span>
        </div>

        <div className="text-dark fw-bold">
          <i className="bi bi-shield-check text-success me-1"></i> Verified Route Coordinates Live
        </div>
      </div>
    </div>
  );
}
