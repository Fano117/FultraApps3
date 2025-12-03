import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  DeliveryListItem,
  DeliveryStatus,
  DeliveryPriority,
  getStatusLabel,
  getStatusColor,
  getPriorityColor,
} from '../models/Delivery';
import {colors} from '../../design-system/theme/colors';
import {typography} from '../../design-system/theme/typography';
import {spacing} from '../../design-system/theme/spacing';
import {shadows} from '../../design-system/theme/spacing';

interface DeliveryCardProps {
  delivery: DeliveryListItem;
  onPress?: () => void;
  showPriority?: boolean;
  compact?: boolean;
}

export const DeliveryCard: React.FC<DeliveryCardProps> = ({
  delivery,
  onPress,
  showPriority = true,
  compact = false,
}) => {
  const statusColor = getStatusColor(delivery.status);
  const priorityColor = getPriorityColor(delivery.priority);

  const getStatusIcon = (status: DeliveryStatus): string => {
    const icons: Record<DeliveryStatus, string> = {
      pending: 'time-outline',
      assigned: 'person-outline',
      picked_up: 'cube-outline',
      in_transit: 'car-outline',
      arriving: 'location-outline',
      delivered: 'checkmark-circle-outline',
      cancelled: 'close-circle-outline',
      failed: 'alert-circle-outline',
    };
    return icons[status];
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={onPress}
        activeOpacity={0.7}>
        <View style={[styles.statusIndicator, {backgroundColor: statusColor}]} />
        <View style={styles.compactContent}>
          <Text style={styles.compactTrackingNumber}>{delivery.trackingNumber}</Text>
          <Text style={styles.compactAddress} numberOfLines={1}>
            {delivery.destinationAddress}
          </Text>
        </View>
        <Icon name="chevron-forward" size={20} color={colors.gray[400]} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.trackingContainer}>
          <Text style={styles.trackingNumber}>{delivery.trackingNumber}</Text>
          {showPriority && delivery.priority !== 'normal' && (
            <View style={[styles.priorityBadge, {backgroundColor: priorityColor + '20'}]}>
              <Text style={[styles.priorityText, {color: priorityColor}]}>
                {delivery.priority === 'urgent' ? 'URGENTE' : 'ALTA'}
              </Text>
            </View>
          )}
        </View>
        <View style={[styles.statusBadge, {backgroundColor: statusColor + '15'}]}>
          <Icon name={getStatusIcon(delivery.status)} size={14} color={statusColor} />
          <Text style={[styles.statusText, {color: statusColor}]}>
            {getStatusLabel(delivery.status)}
          </Text>
        </View>
      </View>

      {/* Customer Info */}
      <View style={styles.customerRow}>
        <Icon name="person-outline" size={16} color={colors.gray[500]} />
        <Text style={styles.customerName} numberOfLines={1}>
          {delivery.customerName}
        </Text>
      </View>

      {/* Destination */}
      <View style={styles.addressRow}>
        <Icon name="location-outline" size={16} color={colors.gray[500]} />
        <Text style={styles.address} numberOfLines={2}>
          {delivery.destinationAddress}
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {delivery.scheduledDate && (
          <View style={styles.infoItem}>
            <Icon name="calendar-outline" size={14} color={colors.gray[500]} />
            <Text style={styles.infoText}>{delivery.scheduledDate}</Text>
          </View>
        )}
        {delivery.estimatedDeliveryTime && (
          <View style={styles.infoItem}>
            <Icon name="time-outline" size={14} color={colors.gray[500]} />
            <Text style={styles.infoText}>{delivery.estimatedDeliveryTime}</Text>
          </View>
        )}
        {delivery.distance && (
          <View style={styles.infoItem}>
            <Icon name="navigate-outline" size={14} color={colors.gray[500]} />
            <Text style={styles.infoText}>{delivery.distance}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Mini card for lists
export const DeliveryMiniCard: React.FC<{
  trackingNumber: string;
  customerName: string;
  status: DeliveryStatus;
  onPress?: () => void;
}> = ({trackingNumber, customerName, status, onPress}) => {
  const statusColor = getStatusColor(status);

  return (
    <TouchableOpacity style={styles.miniContainer} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.miniStatusDot, {backgroundColor: statusColor}]} />
      <View style={styles.miniContent}>
        <Text style={styles.miniTrackingNumber}>{trackingNumber}</Text>
        <Text style={styles.miniCustomerName} numberOfLines={1}>
          {customerName}
        </Text>
      </View>
      <Text style={[styles.miniStatus, {color: statusColor}]}>
        {getStatusLabel(status)}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.base,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  trackingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  trackingNumber: {
    ...typography.textStyles.label,
    color: colors.text.primary,
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    ...typography.textStyles.captionSmall,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    ...typography.textStyles.captionSmall,
    fontWeight: '500',
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  customerName: {
    ...typography.textStyles.body,
    color: colors.text.primary,
    flex: 1,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  address: {
    ...typography.textStyles.bodySmall,
    color: colors.text.secondary,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.base,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    ...typography.textStyles.caption,
    color: colors.text.tertiary,
  },

  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.xs,
  },
  statusIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: spacing.md,
  },
  compactContent: {
    flex: 1,
  },
  compactTrackingNumber: {
    ...typography.textStyles.labelSmall,
    color: colors.text.primary,
    marginBottom: 2,
  },
  compactAddress: {
    ...typography.textStyles.caption,
    color: colors.text.tertiary,
  },

  // Mini styles
  miniContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  miniStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.md,
  },
  miniContent: {
    flex: 1,
  },
  miniTrackingNumber: {
    ...typography.textStyles.labelSmall,
    color: colors.text.primary,
  },
  miniCustomerName: {
    ...typography.textStyles.caption,
    color: colors.text.tertiary,
  },
  miniStatus: {
    ...typography.textStyles.captionSmall,
    fontWeight: '500',
  },
});

export default DeliveryCard;
