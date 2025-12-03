import React, {useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Header, Button, SimpleMapView, LoadingSpinner} from '../../shared/components';
import {useDeliveryDetails, useCurrentLocation} from '../../shared/hooks';
import {useDeliveryStore} from '../../shared/store';
import {getStatusLabel, getStatusColor, getPriorityLabel} from '../../shared/models/Delivery';
import {formatDateTime, formatPhoneNumber} from '../../shared/utils/helpers';
import {colors} from '../../design-system/theme/colors';
import {typography} from '../../design-system/theme/typography';
import {spacing} from '../../design-system/theme/spacing';
import {shadows} from '../../design-system/theme/spacing';
import {RootStackParamList} from '../../navigation/types';

type DeliveryDetailsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DeliveryDetails'
>;

type DeliveryDetailsScreenRouteProp = RouteProp<
  RootStackParamList,
  'DeliveryDetails'
>;

interface DeliveryDetailsScreenProps {
  navigation: DeliveryDetailsScreenNavigationProp;
  route: DeliveryDetailsScreenRouteProp;
}

export const DeliveryDetailsScreen: React.FC<DeliveryDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const {deliveryId} = route.params;
  const {delivery, isLoading, error} = useDeliveryDetails(deliveryId);
  const {startDelivery, cancelDelivery} = useDeliveryStore();
  const {location, getCurrentLocation} = useCurrentLocation();

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleStartDelivery = useCallback(async () => {
    const currentLocation = location || (await getCurrentLocation());

    if (!currentLocation) {
      Alert.alert(
        'Ubicación requerida',
        'Necesitamos tu ubicación para iniciar la entrega.',
      );
      return;
    }

    Alert.alert(
      'Iniciar entrega',
      '¿Estás seguro de que deseas iniciar esta entrega?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Iniciar',
          onPress: async () => {
            const success = await startDelivery(deliveryId, currentLocation);
            if (success) {
              navigation.replace('DeliveryInProgress', {deliveryId});
            } else {
              Alert.alert('Error', 'No se pudo iniciar la entrega.');
            }
          },
        },
      ],
    );
  }, [deliveryId, location, getCurrentLocation, startDelivery, navigation]);

  const handleCancelDelivery = useCallback(() => {
    Alert.prompt(
      'Cancelar entrega',
      'Ingresa el motivo de la cancelación:',
      [
        {text: 'Volver', style: 'cancel'},
        {
          text: 'Cancelar entrega',
          style: 'destructive',
          onPress: async (reason) => {
            if (!reason || reason.trim() === '') {
              Alert.alert('Error', 'Debes ingresar un motivo.');
              return;
            }
            const success = await cancelDelivery(deliveryId, reason);
            if (success) {
              Alert.alert('Entrega cancelada', 'La entrega ha sido cancelada.');
              navigation.goBack();
            }
          },
        },
      ],
      'plain-text',
    );
  }, [deliveryId, cancelDelivery, navigation]);

  const handleCallCustomer = useCallback(() => {
    if (delivery?.customer.phone) {
      Linking.openURL(`tel:${delivery.customer.phone}`);
    }
  }, [delivery]);

  const handleOpenMaps = useCallback(() => {
    if (delivery?.destination) {
      const {latitude, longitude} = delivery.destination;
      const url = `https://maps.google.com/?q=${latitude},${longitude}`;
      Linking.openURL(url);
    }
  }, [delivery]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Detalles" showBackButton onBackPress={handleGoBack} />
        <LoadingSpinner message="Cargando detalles..." fullScreen />
      </SafeAreaView>
    );
  }

  if (error || !delivery) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Detalles" showBackButton onBackPress={handleGoBack} />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorText}>
            {error || 'No se pudo cargar la entrega'}
          </Text>
          <Button title="Volver" onPress={handleGoBack} variant="outline" />
        </View>
      </SafeAreaView>
    );
  }

  const statusColor = getStatusColor(delivery.status);
  const canStart = delivery.status === 'pending' || delivery.status === 'assigned';
  const canCancel =
    delivery.status !== 'delivered' && delivery.status !== 'cancelled';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Detalles de entrega" showBackButton onBackPress={handleGoBack} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View>
              <Text style={styles.trackingNumber}>{delivery.trackingNumber}</Text>
              <Text style={styles.createdAt}>
                Creada: {formatDateTime(delivery.createdAt)}
              </Text>
            </View>
            <View style={[styles.statusBadge, {backgroundColor: statusColor + '15'}]}>
              <Text style={[styles.statusText, {color: statusColor}]}>
                {getStatusLabel(delivery.status)}
              </Text>
            </View>
          </View>
          {delivery.priority !== 'normal' && (
            <View style={styles.priorityRow}>
              <Icon name="flag" size={16} color={colors.warning} />
              <Text style={styles.priorityText}>
                Prioridad: {getPriorityLabel(delivery.priority)}
              </Text>
            </View>
          )}
        </View>

        {/* Map Preview */}
        <View style={styles.mapSection}>
          <SimpleMapView
            coordinate={delivery.destination}
            title={delivery.destination.address}
            style={styles.mapPreview}
          />
          <TouchableOpacity style={styles.openMapsButton} onPress={handleOpenMaps}>
            <Icon name="navigate" size={20} color={colors.primary} />
            <Text style={styles.openMapsText}>Abrir en Maps</Text>
          </TouchableOpacity>
        </View>

        {/* Customer Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cliente</Text>
          <View style={styles.infoRow}>
            <Icon name="person-outline" size={18} color={colors.gray[500]} />
            <Text style={styles.infoText}>{delivery.customer.name}</Text>
          </View>
          <TouchableOpacity style={styles.infoRow} onPress={handleCallCustomer}>
            <Icon name="call-outline" size={18} color={colors.primary} />
            <Text style={[styles.infoText, styles.linkText]}>
              {formatPhoneNumber(delivery.customer.phone)}
            </Text>
          </TouchableOpacity>
          {delivery.customer.email && (
            <View style={styles.infoRow}>
              <Icon name="mail-outline" size={18} color={colors.gray[500]} />
              <Text style={styles.infoText}>{delivery.customer.email}</Text>
            </View>
          )}
        </View>

        {/* Destination */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Destino</Text>
          <View style={styles.infoRow}>
            <Icon name="location-outline" size={18} color={colors.gray[500]} />
            <Text style={styles.infoText}>{delivery.destination.address}</Text>
          </View>
          {delivery.destination.notes && (
            <View style={styles.infoRow}>
              <Icon name="document-text-outline" size={18} color={colors.gray[500]} />
              <Text style={styles.infoText}>{delivery.destination.notes}</Text>
            </View>
          )}
        </View>

        {/* Package Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Paquete</Text>
          <View style={styles.infoRow}>
            <Icon name="cube-outline" size={18} color={colors.gray[500]} />
            <Text style={styles.infoText}>{delivery.package.description}</Text>
          </View>
          <View style={styles.packageDetails}>
            <View style={styles.packageDetail}>
              <Text style={styles.packageLabel}>Cantidad</Text>
              <Text style={styles.packageValue}>{delivery.package.quantity}</Text>
            </View>
            {delivery.package.weight && (
              <View style={styles.packageDetail}>
                <Text style={styles.packageLabel}>Peso</Text>
                <Text style={styles.packageValue}>
                  {delivery.package.weight} kg
                </Text>
              </View>
            )}
            <View style={styles.packageDetail}>
              <Text style={styles.packageLabel}>Frágil</Text>
              <Text style={styles.packageValue}>
                {delivery.package.fragile ? 'Sí' : 'No'}
              </Text>
            </View>
            <View style={styles.packageDetail}>
              <Text style={styles.packageLabel}>Firma</Text>
              <Text style={styles.packageValue}>
                {delivery.package.requiresSignature ? 'Requerida' : 'No'}
              </Text>
            </View>
          </View>
          {delivery.package.specialInstructions && (
            <View style={styles.instructionsBox}>
              <Text style={styles.instructionsLabel}>Instrucciones especiales:</Text>
              <Text style={styles.instructionsText}>
                {delivery.package.specialInstructions}
              </Text>
            </View>
          )}
        </View>

        {/* Schedule */}
        {delivery.scheduledDate && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Programación</Text>
            <View style={styles.infoRow}>
              <Icon name="calendar-outline" size={18} color={colors.gray[500]} />
              <Text style={styles.infoText}>{delivery.scheduledDate}</Text>
            </View>
            {delivery.scheduledTimeWindow && (
              <View style={styles.infoRow}>
                <Icon name="time-outline" size={18} color={colors.gray[500]} />
                <Text style={styles.infoText}>
                  {delivery.scheduledTimeWindow.start} -{' '}
                  {delivery.scheduledTimeWindow.end}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      {(canStart || canCancel) && (
        <View style={styles.actionContainer}>
          {canCancel && (
            <Button
              title="Cancelar"
              variant="outline"
              onPress={handleCancelDelivery}
              style={styles.cancelButton}
            />
          )}
          {canStart && (
            <Button
              title="Iniciar entrega"
              onPress={handleStartDelivery}
              style={styles.startButton}
            />
          )}
        </View>
      )}
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
    padding: spacing.base,
    paddingBottom: spacing['3xl'],
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.base,
  },
  errorText: {
    ...typography.textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...shadows.sm,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  trackingNumber: {
    ...typography.textStyles.h5,
    color: colors.text.primary,
  },
  createdAt: {
    ...typography.textStyles.caption,
    color: colors.text.tertiary,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  statusText: {
    ...typography.textStyles.labelSmall,
    fontWeight: '600',
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  priorityText: {
    ...typography.textStyles.bodySmall,
    color: colors.warning,
    fontWeight: '500',
  },
  mapSection: {
    marginBottom: spacing.base,
  },
  mapPreview: {
    height: 180,
    borderRadius: 12,
  },
  openMapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginTop: -12,
    ...shadows.sm,
  },
  openMapsText: {
    ...typography.textStyles.label,
    color: colors.primary,
  },
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...shadows.sm,
  },
  cardTitle: {
    ...typography.textStyles.label,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  infoText: {
    ...typography.textStyles.body,
    color: colors.text.primary,
    flex: 1,
  },
  linkText: {
    color: colors.primary,
  },
  packageDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  packageDetail: {
    width: '50%',
    marginBottom: spacing.md,
  },
  packageLabel: {
    ...typography.textStyles.caption,
    color: colors.text.tertiary,
  },
  packageValue: {
    ...typography.textStyles.body,
    color: colors.text.primary,
    marginTop: 2,
  },
  instructionsBox: {
    backgroundColor: colors.warning + '10',
    borderRadius: 8,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  instructionsLabel: {
    ...typography.textStyles.labelSmall,
    color: colors.warning,
    marginBottom: spacing.xs,
  },
  instructionsText: {
    ...typography.textStyles.bodySmall,
    color: colors.text.secondary,
  },
  actionContainer: {
    flexDirection: 'row',
    padding: spacing.base,
    paddingBottom: spacing.xl,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  startButton: {
    flex: 2,
  },
});

export default DeliveryDetailsScreen;
