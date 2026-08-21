import { http } from './apiClient';
import type { User } from '../types/auth';

export interface UserProfileResponse extends User {
  completedTripsCount?: number;
}

export interface UpdateProfileDto {
  userId?: string;
  name?: string;
  email?: string;
  phone?: string;
  nationality?: string;
  avatarUrl?: string;
  ecName?: string;
  ecRelationship?: string;
  ecPhone?: string;
  ecEmail?: string;
  passportType?: string;
  passportNumber?: string;
  passportCountry?: string;
  passportExpiry?: string;
  dietaryNeeds?: string;
  languages?: string;
  accessibility?: string;
  preferredCurrency?: string;
  accommodation?: string;
  tourTypes?: string[];
}

export const userService = {
  /**
   * Fetch current authenticated user's complete profile with stats
   */
  async getProfile(userParam?: { userId?: string; email?: string }): Promise<UserProfileResponse> {
    const params: Record<string, string> = {};
    if (userParam?.userId) params.userId = userParam.userId;
    if (userParam?.email) params.email = userParam.email;

    const { data } = await http.get<UserProfileResponse>('/users/profile', { params });
    return data;
  },

  /**
   * Update current authenticated user's profile
   */
  async updateProfile(dto: UpdateProfileDto): Promise<UserProfileResponse> {
    const { data } = await http.patch<UserProfileResponse>('/users/profile', dto);
    return data;
  },

  /**
   * Change user password
   */
  async changePassword(
    currentPassword: string,
    newPassword: string,
    userParam?: { userId?: string; email?: string }
  ): Promise<{ success: boolean; message: string }> {
    const { data } = await http.post<{ success: boolean; message: string }>('/users/profile/change-password', {
      currentPassword,
      newPassword,
      userId: userParam?.userId,
      email: userParam?.email,
    });
    return data;
  },
};
