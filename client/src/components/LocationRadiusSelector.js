import React, { useState, useEffect } from 'react';
import { MapPin, Loader } from 'lucide-react';

const LocationRadiusSelector = ({ onLocationChange, initialRadius = 10 }) => {
  const [location, setLocation] = useState(null);
  const [radius, setRadius] = useState(initialRadius);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usingCurrentLocation, setUsingCurrentLocation] = useState(false);

  const radiusOptions = [
    { value: 5, label: '5 miles' },
    { value: 10, label: '10 miles' },
    { value: 25, label: '25 miles' },
    { value: 50, label: '50 miles' },
    { value: 100, label: '100 miles' }
  ];

  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setLocation(newLocation);
        setUsingCurrentLocation(true);
        setLoading(false);
        onLocationChange({ ...newLocation, radius });
      },
      (error) => {
        setError('Unable to get your location');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  const handleRadiusChange = (e) => {
    const newRadius = parseInt(e.target.value);
    setRadius(newRadius);
    if (location) {
      onLocationChange({ ...location, radius: newRadius });
    }
  };

  return (
    <div className="flex flex-col space-y-4 p-4 bg-white rounded-lg shadow">
      <div className="flex items-center space-x-2">
        <button
          onClick={getCurrentLocation}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          {loading ? (
            <Loader className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <MapPin className="w-4 h-4 mr-2" />
          )}
          {usingCurrentLocation ? 'Update Location' : 'Use Current Location'}
        </button>
        
        <select
          value={radius}
          onChange={handleRadiusChange}
          className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {radiusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      {location && (
        <div className="text-sm text-gray-600">
          Using location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
        </div>
      )}
    </div>
  );
};

export default LocationRadiusSelector;