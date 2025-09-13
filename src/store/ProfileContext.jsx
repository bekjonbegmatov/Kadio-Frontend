import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserProfile } from '../api/auth';

const ProfileContext = createContext();

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const result = await getUserProfile();
      if (result.success) {
        setProfile(result.data);
        setError('');
      } else {
        setError(result.error || 'Ошибка загрузки профиля');
      }
    } catch (err) {
      setError('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = (newProfileData) => {
    setProfile(prev => ({ ...prev, ...newProfileData }));
  };

  const refreshProfile = () => {
    fetchProfile();
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const value = {
    profile,
    loading,
    error,
    updateProfile,
    refreshProfile,
    fetchProfile
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileContext;