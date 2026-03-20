// @/lib/selectedPlan.ts
export const getSelectedPlan = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('pending_registration_plan');
};

export const setSelectedPlan = (planId: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pending_registration_plan', planId);
  }
};

export const clearSelectedPlan = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pending_registration_plan');
  }
};
