"use client";

export default function Navbar() {
  return (
    <nav className="bg-gradient-to-r from-teal-700 to-teal-600 text-white px-8 py-5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="font-semibold text-lg tracking-wide">
          The Open Door
        </div>

        <div className="hidden md:flex gap-8 text-sm font-medium">
          <a className="opacity-90 hover:opacity-100">Features</a>
          <a className="opacity-90 hover:opacity-100">Pricing</a>
          <a className="opacity-90 hover:opacity-100">Contact Us</a>
          <a className="opacity-90 hover:opacity-100">Testimonials</a>
        </div>

        <div className="flex gap-3 items-center">
          <button className="px-4 py-2 text-sm rounded-full border border-white/40 hover:bg-white/10 transition">
            Login
          </button>

          <button className="px-5 py-2.5 bg-white text-teal-700 rounded-full text-sm font-semibold hover:bg-gray-100 transition">
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}
