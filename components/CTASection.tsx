"use client";

export default function CTASection() {
  return (
    <section className="bg-gradient-to-b from-[#062f4a] to-[#05273e] px-6 py-24">
      <div className="max-w-3xl mx-auto text-center text-white">
        <h1 className="text-3xl md:text-4xl font-semibold mb-4">
          Simplify Your Church Management
        </h1>

        <p className="text-white/80 mb-8">
          Enter your email or phone number to start your 14 day trial
        </p>

        <div className="relative max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Email address or phone number"
            className="w-full px-6 py-4 rounded-full text-sm text-gray-800 outline-none"
          />

          <button className="absolute right-1 top-1 bottom-1 px-6 bg-teal-500 hover:bg-teal-400 text-white rounded-full text-sm font-semibold transition">
            Try it for free
          </button>
        </div>
      </div>
    </section>
  );
}
