"use client";

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useCredits } from '@/contexts/CreditContext';

export const useCreditCheck = () => {
  const { userCredits, updateCredits } = useCredits();
  const router = useRouter();

  const checkCredits = async (action: () => Promise<number | void>) => {
    if (userCredits <= 0) {
      toast.error('Insufficient credits. Redirecting to billing...');
      router.push('/dashboard/billing');
      return;
    }

    try {
      const result = await action();
      if (typeof result === 'number') {
        updateCredits(result);
      }
    } catch (error) {
      console.error('Action failed or credit decrement error:', error);
    }
  };

  return { checkCredits, userCredits };
};
