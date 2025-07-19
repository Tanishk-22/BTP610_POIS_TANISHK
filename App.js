import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Image,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { GEOAPIFY_API_KEY, POI_CATEGORIES } from './utils/config';

export default function App() {
  const [location, setLocation] = useState(null);
  const [POIs, setPOIs] = useState([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is required.');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      fetchPOIs(loc.coords.latitude, loc.coords.longitude);
    })();
  }, []);

  const fetchPOIs = async (lat, lon) => {
    try {
      const categories = POI_CATEGORIES.join(',');
      const url = `https://api.geoapify.com/v2/places?categories=${categories}&filter=circle:${lon},${lat},5000&limit=20&apiKey=${GEOAPIFY_API_KEY}`;

      const res = await fetch(url);
      const data = await res.json();
      setPOIs(data.features || []);
    } catch (err) {
      Alert.alert('Error fetching POIs', err.message);
    } finally {
      setLoading(false);
    }
  };

  const getIconForCategory = (categories) => {

  if (Array.isArray(categories)) {
    if (categories.some((cat) => cat.includes('healthcare'))) {
      return require('./assets/hosp.png');
    } else if (categories.some((cat) => cat.includes('catering'))) {
      return require('./assets/food.png');
    }
  }

  console.log('Using default icon');
  return require('./assets/default.png');
};

  if (!location || loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#abababff" />
        <Text style={styles.loadingText}>Loading map and POIs...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>What's Nearby?</Text>
        <Text style={styles.subtitle}>Displaying health care buildings and food stores near you.</Text>
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
      >
        {POIs.map((poi) => (
          <Marker
            key={poi.properties.place_id}
            coordinate={{
              latitude: poi.geometry.coordinates[1],
              longitude: poi.geometry.coordinates[0],
            }}
          >
            <Image
              source={getIconForCategory(poi.properties.categories)}
              style={{ width: 30, height: 30 }}
              resizeMode="contain"
            />
          </Marker>
        ))}
      </MapView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Showing results within 5km radius.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    zIndex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  map: {
    flex: 1,
  },
  footer: {
    padding: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#777',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#555',
  },
  calloutContainer: {
    width: 200,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 5,
  },
  calloutDescription: {
    fontSize: 12,
  },
});
