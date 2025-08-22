import { useAuth } from './useAuth';

export const useUserProfile = () => {
  const { user, userProfile, fetchUserProfile } = useAuth();

  const updateProfile = async (updates) => {
    try {
      // Update in backend
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      // Refresh user profile
      await fetchUserProfile();
      return true;
    } catch (error) {
      console.error('Profile update failed:', error);
      return false;
    }
  };

  return {
    user,
    userProfile,
    updateProfile,
    fetchUserProfile
  };
};
