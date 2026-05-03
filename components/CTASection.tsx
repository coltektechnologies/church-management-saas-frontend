'use client';

export default function CTASection() {
  return (
    <section
      className="px-6 py-28"
      style={{
        background: 'linear-gradient(to right, #1C3D72, #2EC4B6)',
      }}
    >
      {/* CTA CARD */}
      <div
        className="
        max-w-5xl
        mx-auto
        bg-[#083b5c]
        border
        border-white/30
        rounded-3xl
        px-10
        py-16
        text-center
        text-white
      "
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-6">
          Simplify Your Church Management
        </h1>

        <p className="text-lg md:text-xl text-white/85 mb-10">
          Enter your email or phone number to start your 14 day trial
        </p>

        <div className="relative max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Email address or phone number"
            className="
              w-full
              px-6
              py-4
              pr-44
              rounded-full
              text-base
              text-gray-900
              bg-white
              border
              border-white/60
              outline-none
              focus:ring-2
              focus:ring-[#2EC4B6]
            "
          />

          <button
            type="button"
            className="
            absolute
            right-1
            top-1
            bottom-1
            px-8
            rounded-full
            cursor-pointer
            bg-[#2EC4B6]
            hover:bg-[#27b3a7]
            text-[#083b5c]
            font-semibold
            transition
          "
          >
            Try it for free
          </button>
        </div>
      </div>
    </section>
  );
}
