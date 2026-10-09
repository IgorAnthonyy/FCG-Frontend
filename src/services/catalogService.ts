import { catalogClient } from './api';
import type {
  Game,
  GamesListResponse,
  RequestGameJson,
  Category,
  CategoriesListResponse,
  RequestCategoryJson,
  LibraryItem,
} from '../types';

export const catalogService = {
  // Games
  async getAllGames(params?: { categoryId?: number; search?: string; pageNumber?: number; pageSize?: number }): Promise<Game[]> {
    const response = await catalogClient.get<GamesListResponse | Game[]>('/api/Game', { params });
    let list: Game[] = [];
    if (Array.isArray(response.data)) {
      list = response.data;
    } else if (response.data?.games) {
      list = response.data.games;
    }

    if (list.length > 0) {
      const detailedList = await Promise.all(
        list.map(async (shortGame) => {
          try {
            const detail = await catalogClient.get<Game>(`/api/Game/${shortGame.id}`);
            return {
              ...shortGame,
              ...detail.data,
            };
          } catch {
            return shortGame;
          }
        })
      );
      return detailedList;
    }

    return list;
  },

  async getGameById(id: number): Promise<Game> {
    const response = await catalogClient.get<Game>(`/api/Game/${id}`);
    return response.data;
  },

  async createGame(data: RequestGameJson): Promise<Game> {
    const response = await catalogClient.post<Game>('/api/Game', data);
    return response.data;
  },

  async updateGame(id: number, data: RequestGameJson): Promise<void> {
    await catalogClient.put(`/api/Game/${id}`, data);
  },

  async deleteGame(id: number): Promise<void> {
    await catalogClient.delete(`/api/Game/${id}`);
  },

  // Categories
  async getAllCategories(): Promise<Category[]> {
    const response = await catalogClient.get<CategoriesListResponse | Category[]>('/api/Category');
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data?.categories || [];
  },

  async getCategoryById(id: number): Promise<Category> {
    const response = await catalogClient.get<Category>(`/api/Category/${id}`);
    return response.data;
  },

  async createCategory(data: RequestCategoryJson): Promise<Category> {
    const response = await catalogClient.post<Category>('/api/Category', data);
    return response.data;
  },

  async updateCategory(id: number, data: RequestCategoryJson): Promise<void> {
    await catalogClient.put(`/api/Category/${id}`, data);
  },

  async deleteCategory(id: number): Promise<void> {
    await catalogClient.delete(`/api/Category/${id}`);
  },

  // User Library
  async getUserLibrary(): Promise<LibraryItem[]> {
    const response = await catalogClient.get<any>('/api/Library');
    if (!response.data) return [];
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data.games && Array.isArray(response.data.games)) {
      return response.data.games.map((g: any) => ({
        id: g.id,
        externalId: g.externalId,
        gameId: g.id,
        name: g.name,
        gameName: g.name,
        price: g.price,
        description: g.description,
        gameDescription: g.description,
        imageUrl: g.imageUrl,
        gameImageUrl: g.imageUrl,
      }));
    }
    if (response.data.library && Array.isArray(response.data.library)) {
      return response.data.library;
    }
    return [];
  },
};
