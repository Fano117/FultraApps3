import {LocationWithDetails, Coordinates, RouteInfo} from './Location';

export interface Delivery {
  id: string;
  trackingNumber: string;
  status: DeliveryStatus;
  priority: DeliveryPriority;

  // Locations
  origin: LocationWithDetails;
  destination: LocationWithDetails;

  // Customer Info
  customer: CustomerInfo;

  // Driver Info
  driver?: DriverInfo;

  // Package Info
  package: PackageInfo;

  // Timing
  scheduledDate?: string;
  scheduledTimeWindow?: TimeWindow;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  createdAt: string;
  updatedAt: string;

  // Route Info
  route?: RouteInfo;
  currentLocation?: Coordinates;

  // Status History
  statusHistory: StatusHistoryEntry[];

  // Additional
  notes?: string;
  signature?: string;
  photos?: string[];
  rating?: number;
  feedback?: string;
}

export type DeliveryStatus =
  | 'pending'
  | 'assigned'
  | 'picked_up'
  | 'in_transit'
  | 'arriving'
  | 'delivered'
  | 'cancelled'
  | 'failed';

export type DeliveryPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface CustomerInfo {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

export interface DriverInfo {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  vehicleType?: string;
  vehiclePlate?: string;
}

export interface PackageInfo {
  description: string;
  weight?: number; // in kg
  dimensions?: PackageDimensions;
  quantity: number;
  value?: number;
  fragile: boolean;
  requiresSignature: boolean;
  specialInstructions?: string;
}

export interface PackageDimensions {
  length: number; // in cm
  width: number;
  height: number;
}

export interface TimeWindow {
  start: string; // HH:mm format
  end: string;
}

export interface StatusHistoryEntry {
  status: DeliveryStatus;
  timestamp: string;
  location?: Coordinates;
  notes?: string;
  updatedBy?: string;
}

export interface DeliveryListItem {
  id: string;
  trackingNumber: string;
  status: DeliveryStatus;
  priority: DeliveryPriority;
  customerName: string;
  destinationAddress: string;
  scheduledDate?: string;
  estimatedDeliveryTime?: string;
  distance?: string;
}

export interface DeliveryFilter {
  status?: DeliveryStatus[];
  priority?: DeliveryPriority[];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface DeliveryStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  todayDeliveries: number;
  onTimeRate: number;
}

export interface DeliveryUpdate {
  status?: DeliveryStatus;
  currentLocation?: Coordinates;
  notes?: string;
  photos?: string[];
  signature?: string;
}

export interface StartDeliveryRequest {
  deliveryId: string;
  startLocation: Coordinates;
}

export interface CompleteDeliveryRequest {
  deliveryId: string;
  signature?: string;
  photos?: string[];
  notes?: string;
  rating?: number;
}

// Delivery State
export interface DeliveryState {
  deliveries: Delivery[];
  currentDelivery: Delivery | null;
  stats: DeliveryStats | null;
  isLoading: boolean;
  error: string | null;
  filter: DeliveryFilter;
}

// Default values
export const defaultDeliveryStats: DeliveryStats = {
  total: 0,
  pending: 0,
  inProgress: 0,
  completed: 0,
  cancelled: 0,
  todayDeliveries: 0,
  onTimeRate: 0,
};

export const defaultDeliveryFilter: DeliveryFilter = {
  status: undefined,
  priority: undefined,
  dateFrom: undefined,
  dateTo: undefined,
  search: undefined,
};

// Helper functions
export const getStatusLabel = (status: DeliveryStatus): string => {
  const labels: Record<DeliveryStatus, string> = {
    pending: 'Pendiente',
    assigned: 'Asignada',
    picked_up: 'Recogida',
    in_transit: 'En tránsito',
    arriving: 'Por llegar',
    delivered: 'Entregada',
    cancelled: 'Cancelada',
    failed: 'Fallida',
  };
  return labels[status];
};

export const getPriorityLabel = (priority: DeliveryPriority): string => {
  const labels: Record<DeliveryPriority, string> = {
    low: 'Baja',
    normal: 'Normal',
    high: 'Alta',
    urgent: 'Urgente',
  };
  return labels[priority];
};

export const getStatusColor = (status: DeliveryStatus): string => {
  const colors: Record<DeliveryStatus, string> = {
    pending: '#FF9500',
    assigned: '#5856D6',
    picked_up: '#007AFF',
    in_transit: '#007AFF',
    arriving: '#5AC8FA',
    delivered: '#34C759',
    cancelled: '#FF3B30',
    failed: '#FF3B30',
  };
  return colors[status];
};

export const getPriorityColor = (priority: DeliveryPriority): string => {
  const colors: Record<DeliveryPriority, string> = {
    low: '#8E8E93',
    normal: '#007AFF',
    high: '#FF9500',
    urgent: '#FF3B30',
  };
  return colors[priority];
};
