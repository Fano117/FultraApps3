import React, {useEffect, useCallback} from 'react';
import {View, Text, StyleSheet, BackHandler} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Button, LoadingSpinner} from '../../shared/components';
import {useDeliveryDetails} from '../../shared/hooks';
import {formatDateTime} from '../../shared/utils/helpers';
import {colors} from '../../design-system/theme/colors';
import {typography} from '../../design-system/theme/typography';
import {spacing} from '../../design-system/theme/spacing';
import {shadows} from '../../design-system/theme/spacing';
import {RootStackParamList} from '../../navigation/types';

type DeliveryCompletedScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DeliveryCompleted'
>;

type DeliveryCompletedScreenRouteProp = RouteProp<
  RootStackParamList,
  'DeliveryCompleted'
>;

interface DeliveryCompletedScreenProps {
  navigation: DeliveryCompletedScreenNavigationProp;
  route: DeliveryCompletedScreenRouteProp;
}

export const DeliveryCompletedScreen: React.FC<DeliveryCompletedScreenProps> = ({
  navigation,
  route,
}) => {
  const {deliveryId} = route.params;
  const {delivery, isLoading} = useDeliveryDetails(deliveryId);

  // Prevent going back with hardware button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleGoHome();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  const handleGoHome = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{name: 'MainTabs'}],
    });
  }, [navigation]);

  const handleViewDetails = useCallback(() => {
    navigation.replace('DeliveryDetails', {deliveryId});
  }, [navigation, deliveryId]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner message="Cargando..." fullScreen />
      </SafeAreaView>
    );
  }

  // Calculate delivery stats
  const getDeliveryStats = () => {
    if (!delivery) {
      return {duration: '--', distance: '--'};
    }

    // Mock data for now - in real app, calculate from actual tracking data
    const startTime = new Date(
      delivery.statusHistory.find(h => h.status === 'in_transit')?.timestamp ||
        delivery.createdAt,
    );
    const endTime = new Date(delivery.actualDeliveryTime || new Date().toISOString());
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationMinutes = Math.floor(durationMs / 60000);

    return {
      duration:
        durationMinutes > 60
          ? `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}min`
          : `${durationMinutes} min`,
      distance: '3.2 km', // Mock data
    };
  };

  const stats = getDeliveryStats();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Animation/Icon */}
        <View style={styles.successIcon}>
          <View style={styles.iconCircle}>
            <Icon name="checkmark" size={60} color={colors.white} />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Entrega completada</Text>
        <Text style={styles.subtitle}>
          La entrega ha sido realizada exitosamente
        </Text>

        {/* Tracking number */}
        <View style={styles.trackingCard}>
          <Text style={styles.trackingLabel}>Número de seguimiento</Text>
          <Text style={styles.trackingNumber}>
            {delivery?.trackingNumber || 'N/A'}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Icon name="time-outline" size={24} color={colors.primary} />
            <Text style={styles.statValue}>{stats.duration}</Text>
            <Text style={styles.statLabel}>Duración</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Icon name="navigate-outline" size={24} color={colors.primary} />
            <Text style={styles.statValue}>{stats.distance}</Text>
            <Text style={styles.statLabel}>Distancia</Text>
          </View>
        </View>

        {/* Delivery info */}
        {delivery && (
          <View style={styles.deliveryInfo}>
            <View style={styles.infoRow}>
              <Icon name="person-outline" size={18} color={colors.gray[500]} />
              <Text style={styles.infoText}>{delivery.customer.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="location-outline" size={18} color={colors.gray[500]} />
              <Text style={styles.infoText} numberOfLines={2}>
                {delivery.destination.address}
              </Text>
            </View>
            {delivery.actualDeliveryTime && (
              <View style={styles.infoRow}>
                <Icon name="calendar-outline" size={18} color={colors.gray[500]} />
                <Text style={styles.infoText}>
                  Entregado: {formatDateTime(delivery.actualDeliveryTime)}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <Button
          title="Ver detalles"
          variant="outline"
          onPress={handleViewDetails}
          fullWidth
          style={styles.detailsButton}
        />
        <Button
          title="Volver al inicio"
          onPress={handleGoHome}
          fullWidth
          size="large"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  successIcon: {
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  title: {
    ...typography.textStyles.h2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  trackingCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.base,
    alignItems: 'center',
    marginBottom: spacing.xl,
    width: '100%',
  },
  trackingLabel: {
    ...typography.textStyles.caption,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  trackingNumber: {
    ...typography.textStyles.h4,
    color: colors.primary,
    letterSpacing: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: colors.border.light,
  },
  statValue: {
    ...typography.textStyles.h4,
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  statLabel: {
    ...typography.textStyles.caption,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  deliveryInfo: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.base,
    width: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  infoText: {
    ...typography.textStyles.bodySmall,
    color: colors.text.secondary,
    flex: 1,
  },
  actionsContainer: {
    padding: spacing.base,
    paddingBottom: spacing['2xl'],
    backgroundColor: colors.background.primary,
    gap: spacing.md,
  },
  detailsButton: {
    marginBottom: spacing.sm,
  },
});

export default DeliveryCompletedScreen;
