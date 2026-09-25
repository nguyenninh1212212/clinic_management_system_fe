import { UserPatientAccess, GrantAccessDto, UpdateAccessDto, User } from '@/types';
import { api } from '../axios';

export const userPatientAccessApi = {
  /**
   * Get list of patients the current user has access to
   */
  getMyPatients: async (): Promise<UserPatientAccess[]> => {
    const response = await api.get('/user-patient-access/my-patients');
    return response.data;
  },

  /**
   * Check if current user has access to a specific patient
   */
  checkAccess: async (patientId: string): Promise<UserPatientAccess | null> => {
    const response = await api.get(`/user-patient-access/check/${patientId}`);
    return response.data;
  },

  /**
   * Get list of users who have access to a specific patient
   */
  getAccessors: async (patientId: string): Promise<User[]> => {
    const response = await api.get(`/user-patient-access/patient/${patientId}/accessors`);
    return response.data;
  },

  /**
   * Grant access (link user to patient)
   */
  grantAccess: async (data: GrantAccessDto): Promise<UserPatientAccess> => {
    const response = await api.post('/user-patient-access/grant', data);
    return response.data;
  },

  /**
   * Update access information
   */
  updateAccess: async (id: string, data: UpdateAccessDto): Promise<UserPatientAccess> => {
    const response = await api.patch(`/user-patient-access/${id}`, data);
    return response.data;
  },

  /**
   * Revoke access (delete link)
   */
  revokeAccess: async (id: string): Promise<void> => {
    await api.delete(`/user-patient-access/${id}/revoke`);
  },
};
