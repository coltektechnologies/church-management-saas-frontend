'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/SignupLogin/Header';
import Footer from '@/components/SignupLogin/Footer';
import RegistrationLayout from '@/components/SignupLogin/RegistrationLayout';
import Step1ChurchInfo from '@/components/SignupLogin/registration/Step1ChurchInfo';
import Step2AdminDetails from '@/components/SignupLogin/registration/Step2AdminDetails';
import Step3Subscription from '@/components/SignupLogin/registration/Step3Subscription';
import Step4Payment from '@/components/SignupLogin/registration/Step4Payment';
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
} from '@/lib/api';
import { setChurchSessionCookie } from '@/lib/churchSessionBrowser';

const stepTitles = [
  'Church Information',
  'Primary Admin Details',
  'Subscription Plan',
  'Payment Details',
  'Review & Submit',
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
  // Step 4
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

/** True when selected plan is free (no payment) — skip Payment step and go straight to Review */
function isFreePlan(data: RegistrationData): boolean {
  const plan = (data.subscriptionPlan || '').toUpperCase();
  return plan === 'TRIAL' || plan === 'FREE';
}

const Signup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RegistrationData>(defaultFormData);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const pageStyles = {
    container: 'flex min-h-screen flex-col bg-background',
    mainContent: 'flex-1 w-full flex flex-col justify-center py-4 md:py-8 lg:py-12',
    stepTransition: 'animate-in fade-in slide-in-from-bottom-2 duration-500 w-full',
  };

  const handleChange = (field: keyof RegistrationData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const goNext = () => {
    if (currentStep < 5) {
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /** Go to a specific step (used to skip step 4 when plan is free). */
  const goToStep = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (currentStep <= 1) {
      return;
    }
    // From Review (5), if plan is free we skipped Payment (4) — go back to Subscription (3)
    if (currentStep === 5 && isFreePlan(formData)) {
      goToStep(3);
    } else {
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
      // Free plan: skip Payment (step 4) and go straight to Review & Submit (step 5)
      if (isFreePlan(formData)) {
        goToStep(5);
      } else {
        goNext();
      }
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
        localStorage.setItem('access_token', result.tokens.access);
        localStorage.setItem('refresh_token', result.tokens.refresh);
        localStorage.setItem('user', JSON.stringify(result.user));
        setChurchSessionCookie();
        toast({
          title: 'Registration successful!',
          description:
            'Your login credentials have been sent to your email and SMS. Please sign in.',
        });
        router.push('/login');
        return;
      }
      setStoredRegistrationSessionId(sessionId);
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
                <Step4Payment
                  data={formData}
                  onChange={handleChange}
                  onNext={goNext}
                  onBack={goBack}
                  loading={loading}
                />
              );
            case 5:
              return (
                <Step5Review
                  data={formData}
                  onBack={goBack}
                  onFinish={handleSubmit}
                  loading={loading}
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
        <RegistrationLayout currentStep={currentStep} stepTitle={stepTitles[currentStep - 1]}>
          {renderStep()}
        </RegistrationLayout>
      </main>
      <Footer />
    </div>
  );
};

export default Signup;
