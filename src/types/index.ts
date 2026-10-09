// DTOs and Domain Models for FIAP Cloud Games

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'User' | string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  cpf: string;
  phone?: string;
  birthDate?: string;
}

export interface AdminRegisterRequest {
  name: string;
  email: string;
  password?: string;
  cpf: string;
  phone?: string;
  birthDate?: string;
}

export interface UserUpdate {
  name: string;
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface CategoryResponse {
  id: number;
  name: string;
  description?: string;
}

export interface CategoriesListResponse {
  categories: Category[];
}

export interface Game {
  id: number;
  externalId?: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category?: Category;
  categories?: Category[];
  categoryIds?: number[];
  rating?: number;
  createdAt?: string;
}

export interface GamesListResponse {
  games: Game[];
  totalCount?: number;
}

export interface RequestGameJson {
  name: string;
  description: string;
  price: number;
  categoryId: number;
  imageUrl?: string;
}

export interface RequestCategoryJson {
  name: string;
  description?: string;
}

export interface GameOrder {
  id: number;
  externalId?: string;
  userId?: string;
  gameId: number;
  gameName?: string;
  price?: number;
  status: 'Pending' | 'Paid' | 'Failed' | 'Completed' | string;
  createdAt?: string;
}

export interface GameOrdersListResponse {
  gameOrders: GameOrder[];
}

export interface RequestPlaceGameOrderJson {
  gameId: string; // GUID
}

export interface ResponsePlaceGameOrderJson {
  id: number;
  externalId?: string;
  gameId?: number;
  price?: number;
  status?: string;
  createdAt?: string;
}

export interface LibraryItem {
  id: number;
  externalId?: string;
  gameId?: number;
  name?: string;
  gameName?: string;
  description?: string;
  gameDescription?: string;
  imageUrl?: string;
  gameImageUrl?: string;
  price?: number;
  purchasedAt?: string;
}

export interface UserLibraryResponse {
  id?: number;
  externalId?: string;
  userId?: string;
  games?: Game[];
  library?: LibraryItem[];
}

export interface Review {
  id: string; // Mongo Guid
  gameId: number;
  userId: string;
  userName?: string;
  rating: number; // 1 to 5
  comment: string;
  helpfulVotes: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  averageRating?: number;
  totalReviews?: number;
}

export interface RequestReviewJson {
  gameId: string;
  rating: number;
  comment: string;
  tags?: string[];
}

export interface RequestReviewUpdateJson {
  rating: number;
  comment: string;
  tags?: string[];
}

export interface ApiErrorResponse {
  message?: string;
  errors?: string[];
}
