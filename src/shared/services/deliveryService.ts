import {
  Delivery,
  DeliveryListItem,
  DeliveryFilter,
  DeliveryStats,
  DeliveryStatus,
  StartDeliveryRequest,
  CompleteDeliveryRequest,
} from '../models/Delivery';
import {Coordinates} from '../models/Location';
import {ApiResponse, PaginatedResponse, PaginationParams} from '../models/ApiResponse';
import {get, post, patch} from './apiClient';

// Mock data for development
const mockDeliveries: Delivery[] = [
  {
    id: '1',
    trackingNumber: 'FLT-2024-001',
    status: 'pending',
    priority: 'high',
    origin: {
      latitude: 19.4326,
      longitude: -99.1332,
      address: 'Av. Paseo de la Reforma 222',
      city: 'Ciudad de México',
      state: 'CDMX',
      postalCode: '06600',
      country: 'México',
      formattedAddress: 'Av. Paseo de la Reforma 222, Juárez, Ciudad de México',
      name: 'Almacén Central',
      phone: '+52 555 111 2222',
    },
    destination: {
      latitude: 19.4234,
      longitude: -99.1685,
      address: 'Calle Durango 230',
      city: 'Ciudad de México',
      state: 'CDMX',
      postalCode: '06700',
      country: 'México',
      formattedAddress: 'Calle Durango 230, Roma Norte, Ciudad de México',
      name: 'Casa del Cliente',
      phone: '+52 555 333 4444',
      notes: 'Tocar el timbre del departamento 5B',
    },
    customer: {
      id: 'c1',
      name: 'María García López',
      phone: '+52 555 333 4444',
      email: 'maria.garcia@email.com',
    },
    package: {
      description: 'Paquete electrónico',
      weight: 2.5,
      dimensions: {length: 30, width: 20, height: 15},
      quantity: 1,
      value: 1500,
      fragile: true,
      requiresSignature: true,
      specialInstructions: 'Manejar con cuidado, contiene electrónicos',
    },
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTimeWindow: {start: '09:00', end: '12:00'},
    estimatedDeliveryTime: '10:30',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    statusHistory: [
      {
        status: 'pending',
        timestamp: new Date().toISOString(),
        notes: 'Entrega creada',
      },
    ],
  },
  {
    id: '2',
    trackingNumber: 'FLT-2024-002',
    status: 'in_transit',
    priority: 'normal',
    origin: {
      latitude: 19.4326,
      longitude: -99.1332,
      address: 'Av. Insurgentes Sur 1602',
      city: 'Ciudad de México',
      state: 'CDMX',
      postalCode: '03940',
      country: 'México',
      formattedAddress: 'Av. Insurgentes Sur 1602, Florida, Ciudad de México',
      name: 'Sucursal Sur',
    },
    destination: {
      latitude: 19.3921,
      longitude: -99.1734,
      address: 'Av. Universidad 1900',
      city: 'Ciudad de México',
      state: 'CDMX',
      postalCode: '04510',
      country: 'México',
      formattedAddress: 'Av. Universidad 1900, Copilco, Ciudad de México',
      name: 'Oficinas UNAM',
      phone: '+52 555 555 6666',
    },
    customer: {
      id: 'c2',
      name: 'Carlos Hernández Pérez',
      phone: '+52 555 555 6666',
      email: 'carlos.hernandez@email.com',
    },
    package: {
      description: 'Documentos importantes',
      quantity: 1,
      fragile: false,
      requiresSignature: true,
    },
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTimeWindow: {start: '14:00', end: '17:00'},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    statusHistory: [
      {
        status: 'pending',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        notes: 'Entrega creada',
      },
      {
        status: 'in_transit',
        timestamp: new Date().toISOString(),
        notes: 'En camino',
      },
    ],
  },
  {
    id: '3',
    trackingNumber: 'FLT-2024-003',
    status: 'delivered',
    priority: 'low',
    origin: {
      latitude: 19.4326,
      longitude: -99.1332,
      address: 'Calle Liverpool 123',
      city: 'Ciudad de México',
      state: 'CDMX',
      postalCode: '06600',
      country: 'México',
      formattedAddress: 'Calle Liverpool 123, Juárez, Ciudad de México',
    },
    destination: {
      latitude: 19.4156,
      longitude: -99.1782,
      address: 'Av. Chapultepec 500',
      city: 'Ciudad de México',
      state: 'CDMX',
      postalCode: '06700',
      country: 'México',
      formattedAddress: 'Av. Chapultepec 500, Roma Norte, Ciudad de México',
    },
    customer: {
      id: 'c3',
      name: 'Ana Martínez Rodríguez',
      phone: '+52 555 777 8888',
    },
    package: {
      description: 'Ropa y accesorios',
      quantity: 2,
      fragile: false,
      requiresSignature: false,
    },
    actualDeliveryTime: new Date(Date.now() - 7200000).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    statusHistory: [
      {
        status: 'pending',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        status: 'in_transit',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
      },
      {
        status: 'delivered',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        notes: 'Entregado a portero',
      },
    ],
    rating: 5,
    feedback: 'Excelente servicio, muy puntual',
  },
];

const mockStats: DeliveryStats = {
  total: 150,
  pending: 12,
  inProgress: 8,
  completed: 125,
  cancelled: 5,
  todayDeliveries: 15,
  onTimeRate: 94.5,
};

// Enable mock mode for development
const USE_MOCK = __DEV__;

/**
 * Get list of deliveries with optional filtering
 */
export const getDeliveries = async (
  filter?: DeliveryFilter,
  pagination?: PaginationParams,
): Promise<PaginatedResponse<Delivery>> => {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 800));

    let filteredDeliveries = [...mockDeliveries];

    // Apply filters
    if (filter?.status && filter.status.length > 0) {
      filteredDeliveries = filteredDeliveries.filter(d =>
        filter.status!.includes(d.status),
      );
    }

    if (filter?.priority && filter.priority.length > 0) {
      filteredDeliveries = filteredDeliveries.filter(d =>
        filter.priority!.includes(d.priority),
      );
    }

    if (filter?.search) {
      const search = filter.search.toLowerCase();
      filteredDeliveries = filteredDeliveries.filter(
        d =>
          d.trackingNumber.toLowerCase().includes(search) ||
          d.customer.name.toLowerCase().includes(search) ||
          d.destination.address.toLowerCase().includes(search),
      );
    }

    return {
      success: true,
      data: filteredDeliveries,
      meta: {
        page: pagination?.page || 1,
        limit: pagination?.limit || 10,
        total: filteredDeliveries.length,
        totalPages: Math.ceil(filteredDeliveries.length / (pagination?.limit || 10)),
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }

  const params = new URLSearchParams();
  if (filter?.status) {params.append('status', filter.status.join(','));}
  if (filter?.priority) {params.append('priority', filter.priority.join(','));}
  if (filter?.search) {params.append('search', filter.search);}
  if (filter?.dateFrom) {params.append('dateFrom', filter.dateFrom);}
  if (filter?.dateTo) {params.append('dateTo', filter.dateTo);}
  if (pagination?.page) {params.append('page', pagination.page.toString());}
  if (pagination?.limit) {params.append('limit', pagination.limit.toString());}

  const response = await get<Delivery[]>(`/deliveries?${params.toString()}`);
  return response as PaginatedResponse<Delivery>;
};

/**
 * Get delivery by ID
 */
export const getDeliveryById = async (id: string): Promise<ApiResponse<Delivery>> => {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));

    const delivery = mockDeliveries.find(d => d.id === id);
    if (delivery) {
      return {
        success: true,
        data: delivery,
      };
    }

    return {
      success: false,
      data: null as unknown as Delivery,
      error: {
        code: 'NOT_FOUND',
        message: 'Entrega no encontrada',
      },
    };
  }

  return get<Delivery>(`/deliveries/${id}`);
};

/**
 * Get delivery statistics
 */
export const getDeliveryStats = async (): Promise<ApiResponse<DeliveryStats>> => {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      data: mockStats,
    };
  }

  return get<DeliveryStats>('/deliveries/stats');
};

/**
 * Start a delivery
 */
export const startDelivery = async (
  data: StartDeliveryRequest,
): Promise<ApiResponse<Delivery>> => {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const deliveryIndex = mockDeliveries.findIndex(d => d.id === data.deliveryId);
    if (deliveryIndex === -1) {
      return {
        success: false,
        data: null as unknown as Delivery,
        error: {
          code: 'NOT_FOUND',
          message: 'Entrega no encontrada',
        },
      };
    }

    const delivery = mockDeliveries[deliveryIndex];
    if (delivery.status !== 'pending' && delivery.status !== 'assigned') {
      return {
        success: false,
        data: null as unknown as Delivery,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Esta entrega no puede ser iniciada',
        },
      };
    }

    const updatedDelivery: Delivery = {
      ...delivery,
      status: 'in_transit',
      currentLocation: data.startLocation,
      updatedAt: new Date().toISOString(),
      statusHistory: [
        ...delivery.statusHistory,
        {
          status: 'in_transit',
          timestamp: new Date().toISOString(),
          location: data.startLocation,
          notes: 'Entrega iniciada',
        },
      ],
    };

    mockDeliveries[deliveryIndex] = updatedDelivery;

    return {
      success: true,
      data: updatedDelivery,
      message: 'Entrega iniciada exitosamente',
    };
  }

  return post<Delivery>(`/deliveries/${data.deliveryId}/start`, data);
};

/**
 * Complete a delivery
 */
export const completeDelivery = async (
  data: CompleteDeliveryRequest,
): Promise<ApiResponse<Delivery>> => {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const deliveryIndex = mockDeliveries.findIndex(d => d.id === data.deliveryId);
    if (deliveryIndex === -1) {
      return {
        success: false,
        data: null as unknown as Delivery,
        error: {
          code: 'NOT_FOUND',
          message: 'Entrega no encontrada',
        },
      };
    }

    const delivery = mockDeliveries[deliveryIndex];
    if (delivery.status !== 'in_transit' && delivery.status !== 'arriving') {
      return {
        success: false,
        data: null as unknown as Delivery,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Esta entrega no puede ser completada',
        },
      };
    }

    const updatedDelivery: Delivery = {
      ...delivery,
      status: 'delivered',
      actualDeliveryTime: new Date().toISOString(),
      signature: data.signature,
      photos: data.photos,
      notes: data.notes,
      updatedAt: new Date().toISOString(),
      statusHistory: [
        ...delivery.statusHistory,
        {
          status: 'delivered',
          timestamp: new Date().toISOString(),
          notes: data.notes || 'Entrega completada',
        },
      ],
    };

    mockDeliveries[deliveryIndex] = updatedDelivery;

    return {
      success: true,
      data: updatedDelivery,
      message: 'Entrega completada exitosamente',
    };
  }

  return post<Delivery>(`/deliveries/${data.deliveryId}/complete`, data);
};

/**
 * Update delivery status
 */
export const updateDeliveryStatus = async (
  id: string,
  status: DeliveryStatus,
  notes?: string,
): Promise<ApiResponse<Delivery>> => {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 800));

    const deliveryIndex = mockDeliveries.findIndex(d => d.id === id);
    if (deliveryIndex === -1) {
      return {
        success: false,
        data: null as unknown as Delivery,
        error: {
          code: 'NOT_FOUND',
          message: 'Entrega no encontrada',
        },
      };
    }

    const delivery = mockDeliveries[deliveryIndex];
    const updatedDelivery: Delivery = {
      ...delivery,
      status,
      updatedAt: new Date().toISOString(),
      statusHistory: [
        ...delivery.statusHistory,
        {
          status,
          timestamp: new Date().toISOString(),
          notes,
        },
      ],
    };

    mockDeliveries[deliveryIndex] = updatedDelivery;

    return {
      success: true,
      data: updatedDelivery,
      message: 'Estado actualizado exitosamente',
    };
  }

  return patch<Delivery>(`/deliveries/${id}/status`, {status, notes});
};

/**
 * Update delivery location (for tracking)
 */
export const updateDeliveryLocation = async (
  id: string,
  location: Coordinates,
): Promise<ApiResponse<Delivery>> => {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300));

    const deliveryIndex = mockDeliveries.findIndex(d => d.id === id);
    if (deliveryIndex !== -1) {
      mockDeliveries[deliveryIndex] = {
        ...mockDeliveries[deliveryIndex],
        currentLocation: location,
        updatedAt: new Date().toISOString(),
      };

      return {
        success: true,
        data: mockDeliveries[deliveryIndex],
      };
    }

    return {
      success: false,
      data: null as unknown as Delivery,
      error: {
        code: 'NOT_FOUND',
        message: 'Entrega no encontrada',
      },
    };
  }

  return patch<Delivery>(`/deliveries/${id}/location`, {location});
};

/**
 * Cancel a delivery
 */
export const cancelDelivery = async (
  id: string,
  reason: string,
): Promise<ApiResponse<Delivery>> => {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 800));

    const deliveryIndex = mockDeliveries.findIndex(d => d.id === id);
    if (deliveryIndex === -1) {
      return {
        success: false,
        data: null as unknown as Delivery,
        error: {
          code: 'NOT_FOUND',
          message: 'Entrega no encontrada',
        },
      };
    }

    const delivery = mockDeliveries[deliveryIndex];
    if (delivery.status === 'delivered' || delivery.status === 'cancelled') {
      return {
        success: false,
        data: null as unknown as Delivery,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Esta entrega no puede ser cancelada',
        },
      };
    }

    const updatedDelivery: Delivery = {
      ...delivery,
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
      statusHistory: [
        ...delivery.statusHistory,
        {
          status: 'cancelled',
          timestamp: new Date().toISOString(),
          notes: reason,
        },
      ],
    };

    mockDeliveries[deliveryIndex] = updatedDelivery;

    return {
      success: true,
      data: updatedDelivery,
      message: 'Entrega cancelada exitosamente',
    };
  }

  return post<Delivery>(`/deliveries/${id}/cancel`, {reason});
};

/**
 * Get pending deliveries count
 */
export const getPendingCount = async (): Promise<ApiResponse<number>> => {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300));

    const count = mockDeliveries.filter(
      d => d.status === 'pending' || d.status === 'assigned',
    ).length;

    return {
      success: true,
      data: count,
    };
  }

  return get<number>('/deliveries/pending/count');
};

/**
 * Get delivery list items (lightweight)
 */
export const getDeliveryListItems = async (
  filter?: DeliveryFilter,
): Promise<ApiResponse<DeliveryListItem[]>> => {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));

    const items: DeliveryListItem[] = mockDeliveries.map(d => ({
      id: d.id,
      trackingNumber: d.trackingNumber,
      status: d.status,
      priority: d.priority,
      customerName: d.customer.name,
      destinationAddress: d.destination.address,
      scheduledDate: d.scheduledDate,
      estimatedDeliveryTime: d.estimatedDeliveryTime,
    }));

    return {
      success: true,
      data: items,
    };
  }

  const params = new URLSearchParams();
  if (filter?.status) {params.append('status', filter.status.join(','));}
  if (filter?.priority) {params.append('priority', filter.priority.join(','));}
  if (filter?.search) {params.append('search', filter.search);}

  return get<DeliveryListItem[]>(`/deliveries/list?${params.toString()}`);
};
