/**
 * LandingHero Component
 * * Main landing section with headline, description, CTA buttons, and hero image.
 * Features a decorative gradient background and responsive layout.
 * * Colors Used:
 * - Background: Navy to Teal Gradient
 * - Text: White (primary-foreground)
 * - Accent: Teal (secondary)
 */

import { Play } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-worship.svg';

const LandingHero = () => {
  return (
    <section className="hero-section-root relative min-h-screen pt-20 bg-[linear-gradient(to_right,#1C3D72,#2EC4B6)]">
      <div className="hero-main-container container mx-auto px-4 py-16 lg:py-24">
        <div className="hero-layout-grid grid lg:grid-cols-2 gap-12 items-center">
          {/* ===== LEFT CONTENT: HEADLINE & ACTIONS ===== */}
          <div className="hero-text-content space-y-6">
            {/* Main Headline */}
            <h1 className="hero-main-title text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary-foreground leading-tight">
              Empower Your Ministry.
              <br />
              {/* Teal accent text */}
              <span className="hero-title-highlight text-secondary">Streamline Your Church.</span>
            </h1>

            {/* Tagline - Catchy summary */}
            <p className="hero-tagline-text text-lg text-primary-foreground/90 max-w-lg">
              The all-in-one management platform designed for modern congregations.
            </p>

            {/* Detailed Description */}
            <p className="hero-sub-description text-primary-foreground/70 max-w-lg">
              Manage your members, track finances with precision, and coordinate every department
              from a single, secure dashboard.
            </p>

            {/* Call to Action Group */}
            <div className="hero-actions-row flex flex-wrap gap-4 pt-4">
              {/* Primary Action - Free Trial */}
              <Button className="cta-button-primary bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-6 text-lg rounded-full">
                Start Free Trial
              </Button>

              {/* Secondary Action - Demo Video */}
              <Button
                variant="outline"
                className="cta-button-secondary bg-[#002B48] hover:bg-[#002B48]/90 text-[#ffffff] px-8 py-6 text-lg rounded-full border-none"
              >
                {/* Play icon in circular container */}
                <div className="play-icon-container bg-primary-foreground/10 rounded-full p-1 mr-2">
                  <Play className="h-4 w-4 fill-current" />
                </div>
                Watch Demo Walkthrough
              </Button>
            </div>
          </div>

          {/* ===== RIGHT CONTENT: VISUAL HERO IMAGE ===== */}
          <div className="hero-visual-wrapper relative">
            <div className="hero-image-frame rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={heroImage}
                alt="Congregation worshipping"
                // Using 'priority' for LCP (Largest Contentful Paint) optimization
                priority
                width={600}
                height={500}
                className="hero-display-image w-full h-auto min-h-[400px] lg:min-h-[500px] object-cover"
              />
            </div>

            {/* Decorative background element for depth */}
            <div className="hero-visual-accent absolute -bottom-4 -right-4 w-full h-full bg-gradient-to-br from-secondary/20 to-transparent rounded-2xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
