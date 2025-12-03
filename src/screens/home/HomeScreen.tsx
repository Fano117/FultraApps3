import React, {useEffect, useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {CompositeNavigationProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import {MapView, DeliveryCard, LoadingSpinner} from '../../shared/components';
import {useAuth, useDeliveries, useCurrentLocation} from '../../shared/hooks';
import {DeliveryListItem} from '../../shared/models/Delivery';
import {MapMarker} from '../../shared/models/Location';
import {colors} from '../../design-system/theme/colors';
import {typography} from '../../design-system/theme/typography';
import {spacing} from '../../design-system/theme/spacing';
import {shadows} from '../../design-system/theme/spacing';
import {RootStackParamList, MainTabParamList} from '../../navigation/types';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const {user} = useAuth();
  const {
    deliveries,
    stats,
    isLoading,
    isRefreshing,
    pendingDeliveries,
    inProgressDeliveries,
    refresh,
    fetchDeliveries,
  } = useDeliveries();
  const {location} = useCurrentLocation();

  const [showFullMap, setShowFullMap] = useState(false);

  // Fetch deliveries on mount
  useEffect(() => {
    fetchDeliveries();
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  // Navigate to delivery details
  const handleDeliveryPress = useCallback(
    (delivery: DeliveryListItem) => {
      navigation.navigate('DeliveryDetails', {deliveryId: delivery.id});
    },
    [navigation],
  );

  // Navigate to settings
  const handleSettingsPress = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);

  // Create markers for map
  const mapMarkers: MapMarker[] = deliveries
    .filter(d => d.status !== 'delivered' && d.status !== 'cancelled')
    .slice(0, 10)
    .map(d => ({
      id: d.id,
      coordinate: {
        latitude: 19.4326 + Math.random() * 0.05 - 0.025,
        longitude: -99.1332 + Math.random() * 0.05 - 0.025,
      },
      title: d.trackingNumber,
      description: d.destination.address,
      type: 'delivery' as const,
    }));

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  // Convert deliveries to list items
  const deliveryListItems: DeliveryListItem[] = deliveries.map(d => ({
    id: d.id,
    trackingNumber: d.trackingNumber,
    status: d.status,
    priority: d.priority,
    customerName: d.customer.name,
    destinationAddress: d.destination.address,
    scheduledDate: d.scheduledDate,
    estimatedDeliveryTime: d.estimatedDeliveryTime,
  }));

  const renderStatsCard = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{stats.todayDeliveries}</Text>
        <Text style={styles.statLabel}>Hoy</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={[styles.statValue, {color: colors.warning}]}>
          {stats.pending}
        </Text>
        <Text style={styles.statLabel}>Pendientes</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={[styles.statValue, {color: colors.primary}]}>
          {stats.inProgress}
        </Text>
        <Text style={styles.statLabel}>En curso</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={[styles.statValue, {color: colors.success}]}>
          {stats.completed}
        </Text>
        <Text style={styles.statLabel}>Completadas</Text>
      </View>
    </View>
  );

  const renderDeliveryItem = ({item}: {item: DeliveryListItem}) => (
    <DeliveryCard
      delivery={item}
      onPress={() => handleDeliveryPress(item)}
      compact={false}
    />
  );

  if (isLoading && deliveries.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner message="Cargando entregas..." fullScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{user?.fullName || 'Usuario'}</Text>
          </View>
          <TouchableOpacity
            onPress={handleSettingsPress}
            style={styles.settingsButton}>
            <Icon name="settings-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        {renderStatsCard()}

        {/* Map Section */}
        <View style={styles.mapSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ubicación actual</Text>
            <TouchableOpacity onPress={() => setShowFullMap(!showFullMap)}>
              <Text style={styles.seeAllText}>
                {showFullMap ? 'Ver menos' : 'Ver más'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.mapContainer, showFullMap && styles.mapContainerLarge]}>
            <MapView
              markers={mapMarkers}
              showUserLocation={true}
              onMarkerPress={markerId => {
                const delivery = deliveries.find(d => d.id === markerId);
                if (delivery) {
                  handleDeliveryPress({
                    id: delivery.id,
                    trackingNumber: delivery.trackingNumber,
                    status: delivery.status,
                    priority: delivery.priority,
                    customerName: delivery.customer.name,
                    destinationAddress: delivery.destination.address,
                  });
                }
              }}
            />
          </View>
        </View>

        {/* In Progress Deliveries */}
        {inProgressDeliveries.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>En progreso</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{inProgressDeliveries.length}</Text>
              </View>
            </View>
            {inProgressDeliveries.slice(0, 2).map(delivery => (
              <DeliveryCard
                key={delivery.id}
                delivery={{
                  id: delivery.id,
                  trackingNumber: delivery.trackingNumber,
                  status: delivery.status,
                  priority: delivery.priority,
                  customerName: delivery.customer.name,
                  destinationAddress: delivery.destination.address,
                  scheduledDate: delivery.scheduledDate,
                  estimatedDeliveryTime: delivery.estimatedDeliveryTime,
                }}
                onPress={() =>
                  handleDeliveryPress({
                    id: delivery.id,
                    trackingNumber: delivery.trackingNumber,
                    status: delivery.status,
                    priority: delivery.priority,
                    customerName: delivery.customer.name,
                    destinationAddress: delivery.destination.address,
                  })
                }
              />
            ))}
          </View>
        )}

        {/* Pending Deliveries */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Entregas pendientes</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingDeliveries.length}</Text>
            </View>
          </View>
          {pendingDeliveries.length > 0 ? (
            pendingDeliveries.slice(0, 5).map(delivery => (
              <DeliveryCard
                key={delivery.id}
                delivery={{
                  id: delivery.id,
                  trackingNumber: delivery.trackingNumber,
                  status: delivery.status,
                  priority: delivery.priority,
                  customerName: delivery.customer.name,
                  destinationAddress: delivery.destination.address,
                  scheduledDate: delivery.scheduledDate,
                  estimatedDeliveryTime: delivery.estimatedDeliveryTime,
                }}
                onPress={() =>
                  handleDeliveryPress({
                    id: delivery.id,
                    trackingNumber: delivery.trackingNumber,
                    status: delivery.status,
                    priority: delivery.priority,
                    customerName: delivery.customer.name,
                    destinationAddress: delivery.destination.address,
                  })
                }
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Icon
                name="checkmark-circle-outline"
                size={48}
                color={colors.success}
              />
              <Text style={styles.emptyStateText}>
                No tienes entregas pendientes
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing['3xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background.primary,
  },
  greeting: {
    ...typography.textStyles.bodySmall,
    color: colors.text.tertiary,
  },
  userName: {
    ...typography.textStyles.h4,
    color: colors.text.primary,
  },
  settingsButton: {
    padding: spacing.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    ...typography.textStyles.h3,
    color: colors.text.primary,
  },
  statLabel: {
    ...typography.textStyles.caption,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  mapSection: {
    marginTop: spacing.base,
    paddingHorizontal: spacing.base,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.textStyles.h5,
    color: colors.text.primary,
  },
  seeAllText: {
    ...typography.textStyles.bodySmall,
    color: colors.primary,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.sm,
  },
  mapContainerLarge: {
    height: 350,
  },
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.base,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    ...typography.textStyles.captionSmall,
    color: colors.white,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    backgroundColor: colors.background.primary,
    borderRadius: 12,
  },
  emptyStateText: {
    ...typography.textStyles.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
});

export default HomeScreen;
