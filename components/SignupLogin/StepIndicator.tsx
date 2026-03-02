import { cn } from '@/lib/utils';

/**
 * StepIndicator - Visual progress bar for multi-step forms.
 * Color: #2FC4B2 for active/completed, #E2E8F0 for upcoming.
 */
interface StepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
}

const StepIndicator = ({ currentStep, totalSteps = 5 }: StepIndicatorProps) => {
  return (
    <nav className="flex items-center gap-2" aria-label="Progress">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNum = i + 1;
        const isDoneOrActive = stepNum <= currentStep;

        return (
          <div
            key={stepNum}
            className={cn(
              'h-[6px] rounded-full transition-all duration-500 ease-in-out',
              isDoneOrActive ? 'w-10 bg-[#666666]' : 'w-10 bg-[#E2E8F0]'
            )}
          />
        );
      })}
    </nav>
  );
};

export default StepIndicator;
