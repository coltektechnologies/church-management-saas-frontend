'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/SignupLogin/Header';
import Footer from '@/components/SignupLogin/Footer';
import RegistrationLayout from '@/components/SignupLogin/RegistrationLayout';
import Step1ChurchInfo from '@/components/SignupLogin/registration/Step1ChurchInfo';
import Step2AdminDetails from '@/components/SignupLogin/registration/Step2AdminDetails';
import Step3Subscription from '@/components/SignupLogin/registration/Step3Subscription';
import Step5Review from '@/components/SignupLogin/registration/Step5Review';
import { useToast } from '@/hooks/use-toast';
import type { RegistrationData } from '@/components/SignupLogin/registration/Step4Payment';
import {
  registrationStep1,
  registrationStep2,
  registrationStep3,
  registrationInitializePayment,
  setStoredRegistrationSessionId,
  clearStoredRegistrationSessionId,
  getRegistrationDraft,
  setRegistrationDraft,
  clearRegistrationDraft,
  getStoredRegistrationSessionId,
} from '@/lib/api';
import { clearClientAuth } from '@/lib/churchSessionBrowser';
import { useRedirectIfAuthenticated } from '@/lib/useRedirectIfAuthenticated';

const TOTAL_STEPS = 4;

const stepTitles = [
  'Church Information',
  'Primary Admin Details',
  'Subscription Plan',
  'Review & confirm',
];

const defaultFormData: RegistrationData = {
  // Step 1
  churchName: '',
  churchEmail: '',
  subdomain: '',
  country: '',
  regionCity: '',
  address: '',
  denomination: '',
  churchSize: '',
  // Step 2
  fullName: '',
  firstName: '',
  lastName: '',
  adminEmail: '',
  role: '',
  phone: '',
  password: '',
  confirmPassword: '',
  username: '',
  // Step 3
  subscriptionPlan: '',
  billing: 'monthly',
  // Legacy fields (payment step removed from flow; Paystack is used for paid plans at final confirm)
  paymentMethod: '',
  bankName: '',
};

/** Map frontend church size (number string) to backend SMALL | MEDIUM | LARGE */
function mapChurchSize(value: string): string {
  const n = parseInt(value, 10) || 0;
  if (n <= 100) {
    return 'SMALL';
  }
  if (n <= 500) {
    return 'MEDIUM';
  }
  return 'LARGE';
}

/** Map frontend role label to backend position (PASTOR, FIRST_ELDER, SENIOR_PASTOR, PRESIDING_ELDER) */
function mapRoleToPosition(role: string): string {
  const r = (role || '').toLowerCase();
  if (r.includes('pastor') && !r.includes('senior')) {
    return 'PASTOR';
  }
  if (r.includes('senior')) {
    return 'SENIOR_PASTOR';
  }
  if (r.includes('administrator') || r.includes('presiding')) {
    return 'PRESIDING_ELDER';
  }
  if (r.includes('secretary') || r.includes('accountant')) {
    return 'FIRST_ELDER';
  }
  return 'PASTOR';
}

/** Map frontend billing to backend (MONTHLY | YEARLY) */
function mapBillingToBackend(billing: string): string {
  return (billing || 'monthly').toLowerCase() === 'yearly' ? 'YEARLY' : 'MONTHLY';
}

/** True when selected plan has no Paystack step (free / trial) */
function isFreePlan(data: RegistrationData): boolean {
  const plan = (data.subscriptionPlan || '').toUpperCase();
  return plan === 'TRIAL' || plan === 'FREE';
}

const Signup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RegistrationData>(defaultFormData);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useRedirectIfAuthenticated();

  // Restore draft (sessionId, formData, step) on mount so back navigation / refresh preserves progress
  useEffect(() => {
    const restart = searchParams?.get('restart') === '1';
    if (restart) {
      clearStoredRegistrationSessionId();
      clearRegistrationDraft();
    }
    const draft = restart ? null : getRegistrationDraft();
    const storedSession = getStoredRegistrationSessionId();
    if (draft) {
      setFormData(() => ({ ...defaultFormData, ...draft.formData }) as RegistrationData);
      setCurrentStep(Math.min(Math.max(1, draft.currentStep), TOTAL_STEPS));
      setSessionId(draft.sessionId || storedSession);
    } else if (storedSession) {
      setSessionId(storedSession);
    }
    setHydrated(true);
  }, [searchParams]);

  // Persist draft whenever state changes so back/refresh preserves progress
  useEffect(() => {
    if (!hydrated) {
      return;
    }
    setRegistrationDraft({
      formData: formData as unknown as Record<string, string>,
      currentStep,
      sessionId,
    });
  }, [hydrated, formData, currentStep, sessionId]);

  const pageStyles = {
    container: 'flex min-h-screen flex-col bg-background',
    mainContent: 'flex-1 w-full flex flex-col justify-center py-4 md:py-8 lg:py-12',
    stepTransition: 'animate-in fade-in slide-in-from-bottom-2 duration-500 w-full',
  };

  const handleChange = (field: keyof RegistrationData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const goNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (currentStep <= 1) {
      return;
    }
    setCurrentStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep1Next = async () => {
    const d = formData;
    const regionCity = (d.regionCity || '').trim() || 'N/A';
    setLoading(true);
    try {
      const { session_id } = await registrationStep1({
        church_name: (d.churchName || '').trim(),
        church_email: (d.churchEmail || '').trim().toLowerCase(),
        subdomain: (d.subdomain || '').trim().toLowerCase(),
        country: (d.country || '').trim(),
        region: regionCity,
        city: regionCity,
        address: (d.address || '').trim(),
        denomination: (d.denomination || '').trim(),
        church_size: mapChurchSize(d.churchSize || ''),
      });
      setSessionId(session_id);
      setStoredRegistrationSessionId(session_id);
      goNext();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Could not save church information.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Next = async () => {
    if (!sessionId) {
      toast({
        title: 'Error',
        description: 'Session expired. Please start from step 1.',
        variant: 'destructive',
      });
      return;
    }
    const d = formData;
    setLoading(true);
    try {
      const { session_id } = await registrationStep2(sessionId, {
        first_name: (d.firstName || '').trim(),
        last_name: (d.lastName || '').trim(),
        admin_email: (d.adminEmail || '').trim().toLowerCase(),
        phone_number: (d.phone || '').trim().replace(/\s/g, ''),
        position: mapRoleToPosition(d.role || ''),
        password: d.password || '',
        confirm_password: d.confirmPassword || '',
      });
      setSessionId(session_id);
      setStoredRegistrationSessionId(session_id);
      goNext();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Could not save admin details.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStep3Next = async () => {
    if (!sessionId) {
      toast({
        title: 'Error',
        description: 'Session expired. Please start from step 1.',
        variant: 'destructive',
      });
      return;
    }
    const d = formData;
    setLoading(true);
    try {
      const { session_id } = await registrationStep3(sessionId, {
        subscription_plan: (d.subscriptionPlan || '').trim() || 'TRIAL',
        billing_cycle: mapBillingToBackend(d.billing || 'monthly'),
      });
      setSessionId(session_id);
      setStoredRegistrationSessionId(session_id);
      // Free or paid: next step is always final review (no separate payment UI)
      goToStep(4);
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Could not save plan selection.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!sessionId) {
      toast({
        title: 'Error',
        description: 'Session expired. Please start from step 1.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    try {
      const result = await registrationInitializePayment(sessionId);
      if (!result.requires_payment) {
        clearStoredRegistrationSessionId();
        clearRegistrationDraft();
        // Do not store tokens here: login page treats access_token as "already signed in" and
        // would skip the form. User must sign in explicitly (email/SMS are backend-owned).
        clearClientAuth();
        toast({
          title: 'Registration successful!',
          description:
            'Sign in with your admin email and the password you created. If your server sends welcome messages, check email or SMS.',
        });
        router.push('/login?registered=1');
        return;
      }
      setStoredRegistrationSessionId(sessionId);
      clearRegistrationDraft();
      window.location.href = result.authorization_url;
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Could not complete registration.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    return (
      <div className={pageStyles.stepTransition}>
        {(() => {
          switch (currentStep) {
            case 1:
              return (
                <Step1ChurchInfo
                  data={formData}
                  onChange={handleChange}
                  onNext={handleStep1Next}
                  loading={loading}
                />
              );
            case 2:
              return (
                <Step2AdminDetails
                  data={formData}
                  onChange={handleChange}
                  onNext={handleStep2Next}
                  onBack={goBack}
                  loading={loading}
                />
              );
            case 3:
              return (
                <Step3Subscription
                  data={formData}
                  onChange={handleChange}
                  onNext={handleStep3Next}
                  onBack={goBack}
                  loading={loading}
                />
              );
            case 4:
              return (
                <Step5Review
                  data={formData}
                  onBack={goBack}
                  onFinish={handleSubmit}
                  loading={loading}
                  requiresPayment={!isFreePlan(formData)}
                />
              );
            default:
              return null;
          }
        })()}
      </div>
    );
  };

  return (
    <div className={pageStyles.container}>
      <Header />
      <main className={pageStyles.mainContent}>
        <RegistrationLayout
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
          stepTitle={stepTitles[currentStep - 1]}
        >
          {renderStep()}
        </RegistrationLayout>
      </main>
      <Footer />
    </div>
  );
};

export default Signup;
