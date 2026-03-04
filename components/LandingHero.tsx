'use client';

import { Play } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import heroWorship from '@/assets/hero-worship.png';

const LandingHero = () => {
  return (
    <section
      className="relative w-full overflow-hidden py-20 sm:py-24 lg:py-0 lg:min-h-screen"
      style={{
        background: 'linear-gradient(to right, #1C3D72, #2EC4B6)',
      }}
    >
      {/* GRID OVERLAY */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 lg:min-h-screen lg:flex lg:items-center lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center w-full">
          {/* TEXT — bottom on mobile, left on desktop */}
          <div className="space-y-6 text-center lg:text-left order-2 lg:order-1">
            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1]"
              style={{ fontFamily: 'OV Soge, sans-serif', letterSpacing: '0.03em' }}
            >
              Empower Your Ministry.
              <br className="hidden sm:block" />
              <span className="text-[#17D7BE]"> Streamline Your Church.</span>
            </h1>

            <div className="space-y-3">
              <p
                className="text-base sm:text-lg md:text-xl lg:text-2xl text-white font-medium"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                The all-in-one management platform designed for modern congregations.
              </p>
              <p
                className="text-sm sm:text-base lg:text-lg text-white/80 max-w-md mx-auto lg:mx-0 leading-relaxed"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Manage your members, track finances with precision, and coordinate every department
                from a single, secure dashboard.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
              <Button
                className="bg-[#17D7BE] hover:bg-[#17D7BE]/90 text-[#020202] px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full w-full sm:w-auto font-medium shadow-lg"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Start Free Trial
              </Button>
              <Button
                variant="outline"
                className="bg-[#002B48] hover:bg-[#002B48]/90 text-white px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full border-none w-full sm:w-auto shadow-md"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                <div className="bg-white/10 rounded-full p-1 mr-2">
                  <Play className="h-4 w-4 fill-current" />
                </div>
                Watch Demo Walkthrough
              </Button>
            </div>
          </div>

          {/* IMAGE — top on mobile, right on desktop */}
          <div
            className="order-1 lg:order-2 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-none mx-auto rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl leading-[0] text-[0]"
            style={{ fontSize: 0, lineHeight: 0 }}
          >
            <Image
              src={heroWorship}
              alt="Congregation worshipping"
              width={700}
              height={600}
              className="w-full h-auto block"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
