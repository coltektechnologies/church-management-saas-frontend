'use client';

import { Play } from 'lucide-react';
import Image, { StaticImageData } from 'next/image';
import { Button } from '@/components/ui/button';
import heroWorship from '@/assets/hero-worship.svg';

/**
 * LandingHero Component
 */
const LandingHero = () => {
  return (
    <section
      className="hero-root relative min-h-screen pt-28 pb-12 overflow-hidden"
      style={{
        background: 'linear-gradient(to right, #1C3D72, #2EC4B6)',
      }}
    >
      {/* GRID OVERLAY: 
          Uses a repeating linear gradient to create 1px lines. 
      */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      <div className="hero-content-wrapper container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <div className="hero-main-grid grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* TEXT CONTENT */}
          <div className="hero-copy-block space-y-8 text-center lg:text-left order-2 lg:order-1">
            <h1
              className="hero-h1 text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1]"
              style={{ fontFamily: 'OV Soge, sans-serif', letterSpacing: '0.03em' }}
            >
              Empower Your Ministry.
              <br className="hidden md:block" />
              <span className="hero-h1-accent text-[#17D7BE]"> Streamline Your Church.</span>
            </h1>

            <div className="hero-subtext-container space-y-4">
              <p
                className="hero-tagline text-xl md:text-2xl text-white font-medium"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                The all-in-one management platform designed for modern congregations.
              </p>

              <p
                className="hero-desc text-lg text-white/80 max-w-lg mx-auto lg:mx-0 leading-relaxed"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Manage your members, track finances with precision, and coordinate every department
                from a single, secure dashboard.
              </p>
            </div>

            <div className="hero-cta-row flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <Button
                className="hero-btn-primary bg-[#17D7BE] hover:bg-[#17D7BE]/90 text-[#020202] px-10 py-7 text-lg rounded-full w-full sm:w-auto font-medium shadow-lg"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Start Free Trial
              </Button>

              <Button
                variant="outline"
                className="hero-btn-secondary bg-[#002B48] hover:bg-[#002B48]/90 text-white px-10 py-7 text-lg rounded-full border-none w-full sm:w-auto shadow-md"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                <div className="play-icon-bg bg-white/10 rounded-full p-1 mr-2">
                  <Play className="play-icon h-4 w-4 fill-current" />
                </div>
                Watch Demo Walkthrough
              </Button>
            </div>
          </div>

          {/* VISUAL CONTENT */}
          <div className="hero-visual-block relative order-1 lg:order-2 max-w-2xl mx-auto lg:max-w-none w-full">
            <div className="image-frame rounded-2xl overflow-hidden shadow-2xl relative z-10 border-4 border-white/10">
             <Image
  src={heroWorship}
  alt="Congregation worshipping"
  priority
  width={700}
  height={600}
  className="hero-img w-full h-auto object-cover min-h-[300px]"
/>
            </div>
            <div className="image-bg-decoration absolute -bottom-6 -right-6 w-full h-full bg-white/5 rounded-2xl z-0" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
