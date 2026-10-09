import { catalogClient } from './api';
import type {
  Review,
  ReviewsResponse,
  RequestReviewJson,
  RequestReviewUpdateJson,
} from '../types';

export const reviewsService = {
  async getReviewsByGameId(gameId: string | number): Promise<Review[]> {
    const response = await catalogClient.get<ReviewsResponse | Review[]>('/api/Reviews', {
      params: { GameId: gameId },
    });
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data?.reviews || [];
  },

  async createReview(data: RequestReviewJson): Promise<Review> {
    const response = await catalogClient.post<Review>('/api/Reviews', data);
    return response.data;
  },

  async updateReview(id: string, data: RequestReviewUpdateJson): Promise<void> {
    await catalogClient.put(`/api/Reviews/${id}`, data);
  },

  async deleteReview(id: string): Promise<void> {
    await catalogClient.delete(`/api/Reviews/${id}`);
  },

  async markHelpfulVote(reviewId: string): Promise<void> {
    await catalogClient.post(`/api/Reviews/${reviewId}/helpful-votes`);
  },
};
