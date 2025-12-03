import {useCallback, useEffect} from 'react';
import {useDeliveryStore} from '../store/deliveryStore';
import {DeliveryFilter, DeliveryStatus} from '../models/Delivery';
import {Coordinates} from '../models/Location';

export const useDeliveries = () => {
  const {
    deliveries,
    currentDelivery,
    stats,
    filter,
    isLoading,
    isRefreshing,
    error,
    fetchDeliveries,
    fetchDeliveryById,
    fetchStats,
    startDelivery,
    completeDelivery,
    updateStatus,
    updateLocation,
    cancelDelivery,
    setCurrentDelivery,
    setFilter,
    clearFilter,
    clearError,
    refresh,
  } = useDeliveryStore();

  // Fetch deliveries and stats on mount
  useEffect(() => {
    fetchDeliveries();
    fetchStats();
  }, []);

  const handleFetchDeliveries = useCallback(
    async (newFilter?: DeliveryFilter) => {
      await fetchDeliveries(newFilter);
    },
    [fetchDeliveries],
  );

  const handleFetchDeliveryById = useCallback(
    async (id: string) => {
      return await fetchDeliveryById(id);
    },
    [fetchDeliveryById],
  );

  const handleStartDelivery = useCallback(
    async (deliveryId: string, startLocation: Coordinates) => {
      return await startDelivery(deliveryId, startLocation);
    },
    [startDelivery],
  );

  const handleCompleteDelivery = useCallback(
    async (
      deliveryId: string,
      signature?: string,
      photos?: string[],
      notes?: string,
    ) => {
      return await completeDelivery(deliveryId, signature, photos, notes);
    },
    [completeDelivery],
  );

  const handleUpdateStatus = useCallback(
    async (deliveryId: string, status: DeliveryStatus, notes?: string) => {
      return await updateStatus(deliveryId, status, notes);
    },
    [updateStatus],
  );

  const handleUpdateLocation = useCallback(
    async (deliveryId: string, location: Coordinates) => {
      await updateLocation(deliveryId, location);
    },
    [updateLocation],
  );

  const handleCancelDelivery = useCallback(
    async (deliveryId: string, reason: string) => {
      return await cancelDelivery(deliveryId, reason);
    },
    [cancelDelivery],
  );

  const handleSetFilter = useCallback(
    (newFilter: Partial<DeliveryFilter>) => {
      setFilter(newFilter);
    },
    [setFilter],
  );

  const handleRefresh = useCallback(async () => {
    await refresh();
  }, [refresh]);

  // Derived data
  const pendingDeliveries = deliveries.filter(
    d => d.status === 'pending' || d.status === 'assigned',
  );

  const inProgressDeliveries = deliveries.filter(
    d => d.status === 'in_transit' || d.status === 'arriving',
  );

  const completedDeliveries = deliveries.filter(d => d.status === 'delivered');

  const todayDeliveries = deliveries.filter(d => {
    if (!d.scheduledDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return d.scheduledDate === today;
  });

  return {
    // State
    deliveries,
    currentDelivery,
    stats,
    filter,
    isLoading,
    isRefreshing,
    error,

    // Derived data
    pendingDeliveries,
    inProgressDeliveries,
    completedDeliveries,
    todayDeliveries,

    // Actions
    fetchDeliveries: handleFetchDeliveries,
    fetchDeliveryById: handleFetchDeliveryById,
    fetchStats,
    startDelivery: handleStartDelivery,
    completeDelivery: handleCompleteDelivery,
    updateStatus: handleUpdateStatus,
    updateLocation: handleUpdateLocation,
    cancelDelivery: handleCancelDelivery,
    setCurrentDelivery,
    setFilter: handleSetFilter,
    clearFilter,
    clearError,
    refresh: handleRefresh,
  };
};

export const useDeliveryDetails = (deliveryId: string) => {
  const {fetchDeliveryById, currentDelivery, isLoading, error} = useDeliveryStore();

  useEffect(() => {
    if (deliveryId) {
      fetchDeliveryById(deliveryId);
    }
  }, [deliveryId, fetchDeliveryById]);

  return {
    delivery: currentDelivery,
    isLoading,
    error,
    refetch: () => fetchDeliveryById(deliveryId),
  };
};
