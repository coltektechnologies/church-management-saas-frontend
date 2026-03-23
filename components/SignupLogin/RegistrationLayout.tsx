import InfoPanel from './InfoPanel';
import StepIndicator from './StepIndicator';

/**
 * RegistrationLayout - Shared wrapper for the multi-step signup process.
 * Logic: Handles responsiveness and consistent spacing for all steps.
 */
interface RegistrationLayoutProps {
  currentStep: number;
  /** Total steps shown in the header and progress bar (e.g. 4). */
  totalSteps?: number;
  stepTitle: string;
  children: React.ReactNode;
}

const RegistrationLayout = ({
  currentStep,
  totalSteps = 4,
  stepTitle,
  children,
}: RegistrationLayoutProps) => {
  // Organized styles for better code maintenance
  const styles = {
    wrapper: 'container mx-auto px-4 py-8 lg:py-16 min-h-screen flex items-center justify-center',
    mainContainer:
      'w-full max-w-6xl flex flex-col lg:flex-row gap-8 lg:gap-14 bg-white rounded-[32px] overflow-hidden border border-gray-100',
    leftCol: 'w-full lg:w-[42%] lg:shrink-0',
    rightCol: 'flex w-full flex-col lg:w-[58%] p-6 md:p-10',
    header:
      'mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-gray-50 pb-6',
    stepLabel: 'font-poppins font-semibold text-[14px] text-gray-400 uppercase tracking-widest',
    title: 'font-poppins font-bold text-[22px] text-black mt-1',
  };

  return (
    <main className={styles.wrapper}>
      <div className={styles.mainContainer}>
        {/* Branding Side */}
        <aside className={styles.leftCol}>
          <InfoPanel />
        </aside>

        {/* Content Side */}
        <section className={styles.rightCol}>
          <div className={styles.header}>
            <div>
              <p className={styles.stepLabel}>
                Step {currentStep} of {totalSteps}
              </p>
              <h2 className={styles.title}>{stepTitle}</h2>
            </div>
            <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
          </div>

          {/* Render Active Step */}
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">{children}</div>
        </section>
      </div>
    </main>
  );
};

export default RegistrationLayout;
