export default function FeatureFooter() {
  return (
    <footer className="bg-[#05273e] px-6 pt-10 pb-6 text-white/80 text-sm">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top row */}
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="flex gap-6 flex-wrap">
            <button>Home</button>
            <button>Features</button>
            <button>Pricing</button>
            <button>Solutions</button>
          </div>

          <div className="flex gap-5">
            <button>Instagram</button>
            <button>LinkedIn</button>
            <button>X</button>
            <button>Facebook</button>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/20" />

        {/* Bottom row */}
        <div className="flex justify-between text-xs text-white/60">
          <span>Established in 2026</span>
          <span>Privacy Policy</span>
        </div>
      </div>
    </footer>
  );
}
