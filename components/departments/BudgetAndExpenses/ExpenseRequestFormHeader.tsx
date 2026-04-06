import listIcon from '@/assets/list-icon.svg';

export default function ExpenseRequestFormHeader() {
  return (
    <>
      <div className="relative pt-7 px-4">
        {/* Icon */}
        <div className="inline-flex items-center gap-2 mb-6">
          <div className="w-6 h-6">
            <img src={listIcon.src} alt="List Icon" className="w-full h-full object-contain" />
          </div>
          <h1 className="font-['Poppins',sans-serif] font-bold text-[24px] text-[#0b2a4a] leading-normal">
            Expense Request Form
          </h1>
        </div>

        {/* Subtitle */}
        <p className="font-['Poppins',sans-serif] font-normal text-[16px] text-black leading-normal ml-8">
          Fill in the details below to submit a new expense request
        </p>
      </div>

      {/* Divider Line */}
      <div className="flex items-center justify-center mt-8 mb-8">
        <div className="w-full h-[2px] bg-[#2FC4B2]" />
      </div>
    </>
  );
}
