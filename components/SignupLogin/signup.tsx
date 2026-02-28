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

/**
 * Signup - Multi-step registration page (5 steps)
 * Logic: Manages central form state and handles navigation logic between steps.
 * It uses a switch-case pattern to swap out form fragments based on currentStep.
 */

const stepTitles = [
  'Church Information',
  'Primary Admin Details',
  'Subscription Plan',
  'Payment Details',
  'Review & Submit',
];

const Signup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const router = useRouter();
  const { toast } = useToast();

  const pageStyles = {
    container: 'flex min-h-screen flex-col bg-background',
    mainContent: 'flex-1 w-full flex flex-col justify-center py-4 md:py-8 lg:py-12',
    stepTransition: 'animate-in fade-in slide-in-from-bottom-2 duration-500 w-full',
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const goNext = () => {
    if (currentStep < 5) {
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = () => {
    toast({
      title: 'Account created!',
      description: 'Your Open Door church account has been successfully created.',
    });

    router.push('/quick-setup');
  };

  const renderStep = () => {
    return (
      <div className={pageStyles.stepTransition}>
        {(() => {
          switch (currentStep) {
            case 1:
              return <Step1ChurchInfo data={formData} onChange={handleChange} onNext={goNext} />;
            case 2:
              return (
                <Step2AdminDetails
                  data={formData}
                  onChange={handleChange}
                  onNext={goNext}
                  onBack={goBack}
                />
              );
            case 3:
              return (
                <Step3Subscription
                  data={formData}
                  onChange={handleChange}
                  onNext={goNext}
                  onBack={goBack}
                />
              );
            case 4:
              return (
                <Step4Payment
                  data={formData}
                  onChange={handleChange}
                  onNext={goNext}
                  onBack={goBack}
                />
              );
            case 5:
              return <Step5Review data={formData} onBack={goBack} onSubmit={handleSubmit} />;
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
