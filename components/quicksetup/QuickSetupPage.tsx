'use client';

import { useState, useCallback } from 'react';
import {
  Check,
  ChevronRight,
  Church,
  Palette,
  Clock,
  Users,
  Sparkles,
  UserCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

/* --- COMPONENTS --- */
import Header from '@/components/SignupLogin/Header';
import Footer from '@/components/SignupLogin/Footer';
import StepLogoUpload from '@/components/quicksetup/StepLogoUpload';
import StepTheme, { THEME_PALETTES } from '@/components/quicksetup/StepTheme';
import StepAdminProfile from '@/components/quicksetup/StepAdminProfile';
import StepServices, { type ServiceTime } from '@/components/quicksetup/StepServices';
import StepDepartments, { type Department } from '@/components/quicksetup/StepDepartments';
import StepFinish from '@/components/quicksetup/StepFinish';
import { useChurch } from '@/components/quicksetup/contexts/ChurchContext';

const STEPS = [
  { num: 1, icon: Church, label: 'Logo' },
  { num: 2, icon: Palette, label: 'Theme' },
  { num: 3, icon: UserCircle, label: 'Admin' },
  { num: 4, icon: Clock, label: 'Services' },
  { num: 5, icon: Users, label: 'Teams' },
  { num: 6, icon: Sparkles, label: 'Finish' },
];

const QuickSetupPage = () => {
  const router = useRouter();
  const { setChurch } = useChurch();
  const [currentStep, setCurrentStep] = useState(1);

  /* --- State Management --- */
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [churchName, setChurchName] = useState('');
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [primaryColor, setPrimaryColor] = useState(THEME_PALETTES[0].primary);
  const [accentColor, setAccentColor] = useState(THEME_PALETTES[0].accent);
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');
  const [adminRole, setAdminRole] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPic, setAdminPic] = useState<string | null>(null);

  const [services, setServices] = useState<ServiceTime[]>([
    { id: '1', day: 'Sunday', time: '08:00', label: 'First Service' },
    { id: '2', day: 'Sunday', time: '10:30', label: 'Second Service' },
  ]);

  const [departments, setDepartments] = useState<Department[]>([
    { id: '1', name: 'Choir', leader: '' },
    { id: '2', name: 'Ushering', leader: '' },
  ]);

  const totalSteps = 6;

  /* --- Navigation Logic --- */
  const goNext = () => setCurrentStep((s) => Math.min(s + 1, totalSteps));
  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const handleFinish = () => {
    setChurch({
      churchName: churchName || 'My Church',
      logoUrl: logoPreview,
      primaryColor,
      accentColor,
      services,
      departments,
      adminName: `${adminFirstName} ${adminLastName}`,
      email: adminEmail,
    });
    router.push('/dashboard');
  };

  /* --- Image Helpers --- */
  const handleLogoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const handleAdminPicChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAdminPic(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  /* --- Service/Dept Helpers --- */
  const addService = () =>
    setServices((prev) => [
      ...prev,
      { id: Date.now().toString(), day: 'Sunday', time: '09:00', label: '' },
    ]);
  const removeService = (id: string) => setServices((prev) => prev.filter((s) => s.id !== id));
  const updateService = (id: string, field: keyof ServiceTime, value: string) =>
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));

  const addDepartment = () =>
    setDepartments((prev) => [...prev, { id: Date.now().toString(), name: '', leader: '' }]);
  const removeDepartment = (id: string) =>
    setDepartments((prev) => prev.filter((d) => d.id !== id));
  const updateDepartment = (id: string, field: keyof Department, value: string) =>
    setDepartments((prev) => prev.map((d) => (d.id === id ? { ...d, [field]: value } : d)));

  return (
    /* MAIN CONTAINER: Flex Column ensures Header -> Content -> Footer stack vertically */
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* HEADER: Placed at the very top */}
      <Header />

      {/* MAIN CONTENT: flex-1 grows to fill all available space, pushing footer down */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 sm:p-10 shadow-xl shadow-slate-200/40 animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-[#0B2A4A] tracking-tight">
                Quick Church Setup
              </h2>
              <p className="text-sm text-slate-400 font-medium">
                Almost done, let&apos;s personalize your workspace.
              </p>
            </div>

            {/* Stepper Header */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-10">
              {STEPS.map((step) => {
                const Icon = step.icon;
                const isActive = step.num === currentStep;
                const isDone = step.num < currentStep;
                return (
                  <button
                    key={step.num}
                    type="button"
                    onClick={() => setCurrentStep(step.num)}
                    className="flex flex-col items-center gap-1 cursor-pointer group"
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all duration-300 ${
                        isActive
                          ? 'border-[#2FC4B2] bg-[#2FC4B2] text-white scale-110 shadow-lg shadow-[#2FC4B2]/20'
                          : isDone
                            ? 'border-[#2FC4B2] bg-[#2FC4B2]/10 text-[#2FC4B2]'
                            : 'border-slate-100 text-slate-300 group-hover:border-[#2FC4B2]/50'
                      }`}
                    >
                      {isDone ? <Check size={16} strokeWidth={3} /> : <Icon size={16} />}
                    </div>
                    <span
                      className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-[#2FC4B2]' : 'text-slate-300'}`}
                    >
                      {step.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Step Content Area */}
            <div className="min-h-[320px]">
              {currentStep === 1 && (
                <StepLogoUpload
                  logoPreview={logoPreview}
                  onLogoChange={handleLogoChange}
                  onClear={() => setLogoPreview(null)}
                  churchName={churchName}
                  onChurchNameChange={setChurchName}
                />
              )}
              {currentStep === 2 && (
                <StepTheme
                  selected={selectedTheme}
                  onSelect={(i) => {
                    setSelectedTheme(i);
                    setPrimaryColor(THEME_PALETTES[i].primary);
                    setAccentColor(THEME_PALETTES[i].accent);
                  }}
                  primaryColor={primaryColor}
                  accentColor={accentColor}
                  onPrimaryChange={setPrimaryColor}
                  onAccentChange={setAccentColor}
                />
              )}
              {currentStep === 3 && (
                <StepAdminProfile
                  firstName={adminFirstName}
                  lastName={adminLastName}
                  role={adminRole}
                  phone={adminPhone}
                  email={adminEmail}
                  profilePic={adminPic}
                  onFirstNameChange={setAdminFirstName}
                  onLastNameChange={setAdminLastName}
                  onRoleChange={setAdminRole}
                  onPhoneChange={setAdminPhone}
                  onEmailChange={setAdminEmail}
                  onProfilePicChange={handleAdminPicChange}
                  onClearPic={() => setAdminPic(null)}
                />
              )}
              {currentStep === 4 && (
                <StepServices
                  services={services}
                  onAdd={addService}
                  onRemove={removeService}
                  onUpdate={updateService}
                />
              )}
              {currentStep === 5 && (
                <StepDepartments
                  departments={departments}
                  onAdd={addDepartment}
                  onRemove={removeDepartment}
                  onUpdate={updateDepartment}
                />
              )}
              {currentStep === 6 && <StepFinish />}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3 mt-10">
              {currentStep > 1 && (
                <button
                  onClick={goBack}
                  className="flex-1 border border-slate-100 text-[#0B2A4A] font-bold rounded-2xl py-4 text-sm hover:bg-slate-50 transition-all active:scale-[0.98]"
                >
                  Back
                </button>
              )}
              {currentStep < totalSteps ? (
                <button
                  onClick={goNext}
                  className="flex-1 bg-[#0B2A4A] text-white font-bold rounded-2xl py-4 text-sm flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-[#0B2A4A]/20 active:scale-[0.98]"
                >
                  Continue <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  className="flex-1 bg-[#2FC4B2] text-white font-bold rounded-2xl py-4 text-sm flex items-center justify-center gap-2 hover:bg-[#25a898] transition-all shadow-lg shadow-[#2FC4B2]/20 active:scale-[0.98]"
                >
                  Go to Dashboard <Sparkles size={16} />
                </button>
              )}
            </div>

            {currentStep < totalSteps && (
              <button
                onClick={() => setCurrentStep(totalSteps)}
                className="w-full text-center text-[10px] font-black text-slate-300 mt-8 hover:text-[#0B2A4A] transition-colors uppercase tracking-[0.2em]"
              >
                Skip setup for now
              </button>
            )}
          </div>
        </div>
      </main>

      {/* FOOTER: Placed at the very bottom */}
      <Footer />
    </div>
  );
};

export default QuickSetupPage;
