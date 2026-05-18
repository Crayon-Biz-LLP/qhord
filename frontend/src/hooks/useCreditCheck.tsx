"use client";

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useCredits } from '@/contexts/CreditContext';

export const useCreditCheck = () => {
  const { userCredits, updateCredits } = useCredits();
  const router = useRouter();

  /**
   * checkCredits wraps a credit-consuming action.
   * @param action - The function to execute if credits are sufficient.
   *                 It should return the new total credits if applicable.
   */
  const checkCredits = async (action: () => Promise<number | void>) => {
    if (userCredits <= 0) {
      toast.error("Insufficient credits. Redirecting to billing...");
      router.push('/dashboard/billing'); // Adjusted to /dashboard/billing based on typical project structure, or just /billing as requested
      return;
    }

    try {
      const result = await action();
      
      // If the action returns a number, it's the new credit balance from the API
      if (typeof result === 'number') {
        updateCredits(result);
      }
    } catch (error) {
      console.error("Action failed or credit decrement error:", error);
      // Errors should be handled by the action itself, but we catch here to be safe
    }
  };

  return { checkCredits, userCredits };
};
