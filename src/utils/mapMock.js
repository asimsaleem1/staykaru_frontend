// Mock react-native-maps for web platform
import { View } from 'react-native';

// Mock MapView component
const MapView = (props) => {
  return null; // Don't render anything on web
};

// Mock Marker component  
const Marker = (props) => {
  return null; // Don't render anything on web
};

// Default export (MapView)
export default MapView;

// Named exports
export { Marker };

// For CommonJS compatibility
module.exports = MapView;
module.exports.Marker = Marker;
module.exports.default = MapView;
