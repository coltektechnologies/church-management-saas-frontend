'use client';

type Props = {
  title: string;
  summary: string;
  details: React.ReactNode;
};

export default function FeatureCard({ title, summary, details }: Props) {
  return (
    <div className="group bg-[#083b5c] text-white rounded-3xl overflow-hidden shadow-xl transition-all duration-500 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-10 items-center">
        {/* TEXT */}
        <div>
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-5">{title}</h3>

          <p className="text-base md:text-lg lg:text-xl text-white/85 leading-relaxed">{summary}</p>

          <button className="mt-8 px-6 py-3 border border-white/40 rounded-full text-sm md:text-base hover:bg-white/10 transition">
            Hover to view more
          </button>
        </div>

        {/* IMAGE PLACEHOLDER */}
        <div className="w-full h-64 lg:h-72 bg-gray-400 rounded-2xl" />
      </div>

      {/* EXPANDED CONTENT */}
      <div className="max-h-0 opacity-0 group-hover:max-h-[420px] group-hover:opacity-100 transition-all duration-500 px-10 pb-10">
        <div className="pt-8 border-t border-white/20 text-base md:text-lg text-white/90 leading-relaxed">
          {details}
        </div>
      </div>
    </div>
  );
}
