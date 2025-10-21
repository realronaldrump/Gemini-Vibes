
import React, { useEffect, useRef } from 'react';
import type { Trip, GeoJSONLineString } from '../types';

// Asserting L is on the window object from the CDN script
declare const L: any;

interface TripMapProps {
  trips: Trip[];
}

const TripMap: React.FC<TripMapProps> = ({ trips }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null); // To hold the Leaflet map instance
  const tripsLayerRef = useRef<any>(null); // To hold the layer group for trips

  // Initialize map
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [39.8283, -98.5795], // Center of US
        zoom: 4,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map);

      mapRef.current = map;
      tripsLayerRef.current = L.layerGroup().addTo(map);
    }
  }, []);

  // Update trips on map
  useEffect(() => {
    if (mapRef.current && tripsLayerRef.current) {
      const layerGroup = tripsLayerRef.current;
      layerGroup.clearLayers();

      if (trips.length === 0) {
        return;
      }

      const allPolylines: any[] = [];

      trips.forEach((trip) => {
        try {
          const geoJson: GeoJSONLineString = JSON.parse(trip.gps);
          if (geoJson && geoJson.type === 'LineString' && geoJson.coordinates.length > 0) {
            // Leaflet expects [lat, lng], GeoJSON is [lng, lat]
            const latLngs = geoJson.coordinates.map(coord => [coord[1], coord[0]]);
            
            // Neon glow effect by layering two lines
            const glowLine = L.polyline(latLngs, {
              color: '#00f6ff',
              weight: 7,
              opacity: 0.3,
            });

            const mainLine = L.polyline(latLngs, {
              color: '#ffffff',
              weight: 2,
              opacity: 0.8,
            });

            allPolylines.push(glowLine, mainLine);
          }
        } catch (error) {
          console.error('Failed to parse trip GPS data:', error);
        }
      });
      
      allPolylines.forEach(line => line.addTo(layerGroup));

      if (allPolylines.length > 0) {
        const bounds = layerGroup.getBounds();
        if (bounds.isValid()) {
            mapRef.current.flyToBounds(bounds, { padding: [50, 50] });
        }
      }
    }
  }, [trips]);

  return <div ref={mapContainerRef} className="h-full w-full bg-gray-900" />;
};

export default TripMap;
