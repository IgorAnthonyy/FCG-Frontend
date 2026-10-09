import { usersClient } from './api';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  AdminRegisterRequest,
  UserUpdate,
  ChangePasswordRequest,
  User,
} from '../types';

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await usersClient.post<{ token: string; Token?: string }>('/api/Access/login', data);
    const token = response.data.token || response.data.Token || '';
    return { token };
  },

  async register(data: RegisterRequest): Promise<User> {
    const payload = {
      name: data.name,
      email: data.email,
      password: data.password,
      cpf: (data.cpf || '').replace(/\D/g, ''),
      phone: data.phone || '11999999999',
      birthDate: data.birthDate || '2000-01-01T00:00:00.000Z',
    };
    const response = await usersClient.post<User>('/api/User', payload);
    return response.data;
  },

  async registerAdmin(data: AdminRegisterRequest): Promise<User> {
    const payload = {
      name: data.name,
      email: data.email,
      cpf: (data.cpf || '').replace(/\D/g, ''),
      phone: data.phone || '11999999999',
      birthDate: data.birthDate || '2000-01-01T00:00:00.000Z',
    };
    const response = await usersClient.post<User>('/api/User/admin', payload);
    return response.data;
  },

  async updateUser(id: string, data: UserUpdate): Promise<User> {
    const response = await usersClient.put<User>(`/api/User/${id}`, data);
    return response.data;
  },

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await usersClient.put('/api/User/change-password', data);
  },

  async deleteUser(userId: string): Promise<void> {
    await usersClient.delete(`/api/User/${userId}`);
  },
};
