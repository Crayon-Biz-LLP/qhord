"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

interface CreditContextType {
  userCredits: number;
  loading: boolean;
  fetchCredits: () => Promise<void>;
  updateCredits: (newTotal: number) => void;
  handlePurchaseSuccess: (addedCredits: number, newTotal: number) => void;
  topUpCredits: (amount: number) => Promise<void>;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export const CreditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userCredits, setUserCredits] = useState<number>(2000);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCredits = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/user/balance');
      if (response.data && typeof response.data.balance === 'number') {
        setUserCredits(response.data.balance);
      }
    } catch (error) {
      console.error('Failed to fetch credit balance:', error);
      // Fallback to default if API fails, or keep current state
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
      const response = await axios.post('/api/billing/top-up', { amount });
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
        topUpCredits
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
