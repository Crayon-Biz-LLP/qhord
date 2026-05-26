"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface CreditContextType {
  userCredits: number;
  loading: boolean;
  fetchCredits: () => Promise<void>;
  updateCredits: (newTotal: number) => void;
  handlePurchaseSuccess: (addedCredits: number, newTotal: number) => void;
  topUpCredits: (amount: number) => Promise<void>;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

const DEFAULT_CREDITS = 2000;

export const CreditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userCredits, setUserCredits] = useState<number>(DEFAULT_CREDITS);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCredits = useCallback(async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (!token) {
        setUserCredits(DEFAULT_CREDITS);
        return;
      }
      const response = await api.get('/subscription/credits');
      const balance =
        typeof response.data?.balance === 'number'
          ? response.data.balance
          : response.data?.credits?.remaining_credits;
      if (typeof balance === 'number') {
        setUserCredits(balance);
      }
    } catch (error) {
      console.error('Failed to fetch credit balance:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  const updateCredits = (newTotal: number) => {
    setUserCredits(newTotal);
  };

  const handlePurchaseSuccess = (addedCredits: number, newTotal: number) => {
    toast.success('Payment successful! Credits added to your account.');
    setUserCredits(newTotal);
  };

  const topUpCredits = async (amount: number) => {
    try {
      const response = await api.post('/subscription/top-up', { amount });
      if (response.data.success) {
        handlePurchaseSuccess(response.data.addedCredits, response.data.newTotal);
      }
    } catch (error) {
      toast.error('Failed to process top-up. Please try again.');
      console.error('Top-up error:', error);
      throw error;
    }
  };

  return (
    <CreditContext.Provider
      value={{
        userCredits,
        loading,
        fetchCredits,
        updateCredits,
        handlePurchaseSuccess,
        topUpCredits,
      }}
    >
      {children}
    </CreditContext.Provider>
  );
};

export const useCredits = () => {
  const context = useContext(CreditContext);
  if (context === undefined) {
    throw new Error('useCredits must be used within a CreditProvider');
  }
  return context;
};
