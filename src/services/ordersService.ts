import { catalogClient } from './api';
import type {
  GameOrder,
  GameOrdersListResponse,
  RequestPlaceGameOrderJson,
  ResponsePlaceGameOrderJson,
} from '../types';

export const ordersService = {
  async placeOrder(data: RequestPlaceGameOrderJson): Promise<ResponsePlaceGameOrderJson> {
    const response = await catalogClient.post<ResponsePlaceGameOrderJson>('/api/GameOrders', data);
    return response.data;
  },

  async getUserOrders(): Promise<GameOrder[]> {
    const response = await catalogClient.get<GameOrdersListResponse | GameOrder[] | any>('/api/GameOrders');
    if (!response.data) return [];
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data.gameOrders && Array.isArray(response.data.gameOrders)) {
      return response.data.gameOrders;
    }
    return [];
  },

  async getOrderById(id: number): Promise<GameOrder> {
    const response = await catalogClient.get<GameOrder>(`/api/GameOrders/${id}`);
    return response.data;
  },
};
