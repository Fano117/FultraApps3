import {create} from 'zustand';
import {
  Delivery,
  DeliveryFilter,
  DeliveryStats,
  DeliveryStatus,
  defaultDeliveryFilter,
  defaultDeliveryStats,
} from '../models/Delivery';
import {Coordinates} from '../models/Location';
import * as deliveryService from '../services/deliveryService';

interface DeliveryState {
  // State
  deliveries: Delivery[];
  currentDelivery: Delivery | null;
  stats: DeliveryStats;
  filter: DeliveryFilter;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Actions
  fetchDeliveries: (filter?: DeliveryFilter) => Promise<void>;
  fetchDeliveryById: (id: string) => Promise<Delivery | null>;
  fetchStats: () => Promise<void>;
  startDelivery: (deliveryId: string, startLocation: Coordinates) => Promise<boolean>;
  completeDelivery: (
    deliveryId: string,
    signature?: string,
    photos?: string[],
    notes?: string,
  ) => Promise<boolean>;
  updateStatus: (
    deliveryId: string,
    status: DeliveryStatus,
    notes?: string,
  ) => Promise<boolean>;
  updateLocation: (deliveryId: string, location: Coordinates) => Promise<void>;
  cancelDelivery: (deliveryId: string, reason: string) => Promise<boolean>;
  setCurrentDelivery: (delivery: Delivery | null) => void;
  setFilter: (filter: Partial<DeliveryFilter>) => void;
  clearFilter: () => void;
  clearError: () => void;
  refresh: () => Promise<void>;
}

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  // Initial state
  deliveries: [],
  currentDelivery: null,
  stats: defaultDeliveryStats,
  filter: defaultDeliveryFilter,
  isLoading: false,
  isRefreshing: false,
  error: null,

  // Actions
  fetchDeliveries: async (filter?: DeliveryFilter) => {
    set({isLoading: true, error: null});

    try {
      const appliedFilter = filter || get().filter;
      const response = await deliveryService.getDeliveries(appliedFilter);

      if (response.success) {
        set({
          deliveries: response.data,
          isLoading: false,
          filter: appliedFilter,
        });
      } else {
        set({
          isLoading: false,
          error: response.error?.message || 'Error al cargar entregas',
        });
      }
    } catch (error) {
      set({
        isLoading: false,
        error: 'Error de conexión',
      });
    }
  },

  fetchDeliveryById: async (id: string) => {
    set({isLoading: true, error: null});

    try {
      const response = await deliveryService.getDeliveryById(id);

      if (response.success && response.data) {
        set({
          currentDelivery: response.data,
          isLoading: false,
        });
        return response.data;
      } else {
        set({
          isLoading: false,
          error: response.error?.message || 'Error al cargar entrega',
        });
        return null;
      }
    } catch (error) {
      set({
        isLoading: false,
        error: 'Error de conexión',
      });
      return null;
    }
  },

  fetchStats: async () => {
    try {
      const response = await deliveryService.getDeliveryStats();

      if (response.success && response.data) {
        set({stats: response.data});
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  },

  startDelivery: async (deliveryId: string, startLocation: Coordinates) => {
    set({isLoading: true, error: null});

    try {
      const response = await deliveryService.startDelivery({
        deliveryId,
        startLocation,
      });

      if (response.success && response.data) {
        // Update the delivery in the list
        const deliveries = get().deliveries.map(d =>
          d.id === deliveryId ? response.data : d,
        );

        set({
          deliveries,
          currentDelivery: response.data,
          isLoading: false,
        });
        return true;
      } else {
        set({
          isLoading: false,
          error: response.error?.message || 'Error al iniciar entrega',
        });
        return false;
      }
    } catch (error) {
      set({
        isLoading: false,
        error: 'Error de conexión',
      });
      return false;
    }
  },

  completeDelivery: async (
    deliveryId: string,
    signature?: string,
    photos?: string[],
    notes?: string,
  ) => {
    set({isLoading: true, error: null});

    try {
      const response = await deliveryService.completeDelivery({
        deliveryId,
        signature,
        photos,
        notes,
      });

      if (response.success && response.data) {
        // Update the delivery in the list
        const deliveries = get().deliveries.map(d =>
          d.id === deliveryId ? response.data : d,
        );

        set({
          deliveries,
          currentDelivery: response.data,
          isLoading: false,
        });

        // Refresh stats
        get().fetchStats();

        return true;
      } else {
        set({
          isLoading: false,
          error: response.error?.message || 'Error al completar entrega',
        });
        return false;
      }
    } catch (error) {
      set({
        isLoading: false,
        error: 'Error de conexión',
      });
      return false;
    }
  },

  updateStatus: async (
    deliveryId: string,
    status: DeliveryStatus,
    notes?: string,
  ) => {
    set({isLoading: true, error: null});

    try {
      const response = await deliveryService.updateDeliveryStatus(
        deliveryId,
        status,
        notes,
      );

      if (response.success && response.data) {
        const deliveries = get().deliveries.map(d =>
          d.id === deliveryId ? response.data : d,
        );

        set({
          deliveries,
          currentDelivery:
            get().currentDelivery?.id === deliveryId
              ? response.data
              : get().currentDelivery,
          isLoading: false,
        });
        return true;
      } else {
        set({
          isLoading: false,
          error: response.error?.message || 'Error al actualizar estado',
        });
        return false;
      }
    } catch (error) {
      set({
        isLoading: false,
        error: 'Error de conexión',
      });
      return false;
    }
  },

  updateLocation: async (deliveryId: string, location: Coordinates) => {
    try {
      await deliveryService.updateDeliveryLocation(deliveryId, location);

      // Update current delivery location without triggering loading state
      const currentDelivery = get().currentDelivery;
      if (currentDelivery?.id === deliveryId) {
        set({
          currentDelivery: {
            ...currentDelivery,
            currentLocation: location,
          },
        });
      }
    } catch (error) {
      console.error('Error updating location:', error);
    }
  },

  cancelDelivery: async (deliveryId: string, reason: string) => {
    set({isLoading: true, error: null});

    try {
      const response = await deliveryService.cancelDelivery(deliveryId, reason);

      if (response.success && response.data) {
        const deliveries = get().deliveries.map(d =>
          d.id === deliveryId ? response.data : d,
        );

        set({
          deliveries,
          currentDelivery:
            get().currentDelivery?.id === deliveryId
              ? response.data
              : get().currentDelivery,
          isLoading: false,
        });

        get().fetchStats();
        return true;
      } else {
        set({
          isLoading: false,
          error: response.error?.message || 'Error al cancelar entrega',
        });
        return false;
      }
    } catch (error) {
      set({
        isLoading: false,
        error: 'Error de conexión',
      });
      return false;
    }
  },

  setCurrentDelivery: (delivery: Delivery | null) => {
    set({currentDelivery: delivery});
  },

  setFilter: (filter: Partial<DeliveryFilter>) => {
    const currentFilter = get().filter;
    const newFilter = {...currentFilter, ...filter};
    set({filter: newFilter});
    get().fetchDeliveries(newFilter);
  },

  clearFilter: () => {
    set({filter: defaultDeliveryFilter});
    get().fetchDeliveries(defaultDeliveryFilter);
  },

  clearError: () => {
    set({error: null});
  },

  refresh: async () => {
    set({isRefreshing: true});

    try {
      const filter = get().filter;
      const [deliveriesResponse, statsResponse] = await Promise.all([
        deliveryService.getDeliveries(filter),
        deliveryService.getDeliveryStats(),
      ]);

      if (deliveriesResponse.success) {
        set({deliveries: deliveriesResponse.data});
      }

      if (statsResponse.success && statsResponse.data) {
        set({stats: statsResponse.data});
      }
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      set({isRefreshing: false});
    }
  },
}));

// Selectors
export const selectDeliveries = (state: DeliveryState) => state.deliveries;
export const selectCurrentDelivery = (state: DeliveryState) => state.currentDelivery;
export const selectStats = (state: DeliveryState) => state.stats;
export const selectFilter = (state: DeliveryState) => state.filter;
export const selectIsLoading = (state: DeliveryState) => state.isLoading;
export const selectIsRefreshing = (state: DeliveryState) => state.isRefreshing;
export const selectError = (state: DeliveryState) => state.error;

// Derived selectors
export const selectPendingDeliveries = (state: DeliveryState) =>
  state.deliveries.filter(d => d.status === 'pending' || d.status === 'assigned');

export const selectInProgressDeliveries = (state: DeliveryState) =>
  state.deliveries.filter(d => d.status === 'in_transit' || d.status === 'arriving');

export const selectCompletedDeliveries = (state: DeliveryState) =>
  state.deliveries.filter(d => d.status === 'delivered');

export const selectDeliveryById = (id: string) => (state: DeliveryState) =>
  state.deliveries.find(d => d.id === id);
