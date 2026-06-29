import { useContext } from 'react';
import type { AuthContextType } from '../types';
import { AuthContext } from './authContextValue';

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
