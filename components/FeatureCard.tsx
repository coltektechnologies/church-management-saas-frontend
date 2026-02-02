"use client";

type Props = {
  title: string;
  summary: string;
  details: React.ReactNode;
};

export default function FeatureCard({ title, summary, details }: Props) {
  return (
    <div className="group bg-[#083b5c] text-white rounded-3xl overflow-hidden transition-all duration-500 shadow-lg">
      <div className="p-8 flex flex-col md:flex-row gap-8 items-center">
        <div className="flex-1">
          <h3 className="text-2xl font-semibold mb-4">
            {title}
          </h3>

          <p className="text-sm text-white/80 leading-relaxed">
            {summary}
          </p>

          <button className="mt-6 px-5 py-2.5 border border-white/40 rounded-full text-sm hover:bg-white/10 transition">
            Hover to view more
          </button>
        </div>

        <div className="w-full md:w-56 h-36 bg-gray-500 rounded-2xl shrink-0" />
      </div>

      <div className="max-h-0 opacity-0 group-hover:max-h-[400px] group-hover:opacity-100 transition-all duration-500 px-8 pb-8">
        <div className="pt-6 border-t border-white/20 text-sm text-white/90 leading-relaxed">
          {details}
        </div>
      </div>
    </div>
  );
}
