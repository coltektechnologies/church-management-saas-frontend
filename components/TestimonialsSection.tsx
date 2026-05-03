/**
 * TestimonialsSection Component
 * Layout: 3-column on desktop, stacks on mobile.
 * Fonts: Poppins (heading + content)
 */

import { Play } from 'lucide-react';
import TestimonialCard from './TestimonialCard';

const testimonials = [
  {
    quote:
      'The analytics dashboard has made tracking our growth trends incredibly simple and data-driven.',
    author: 'Pastor Samuel Mensah',
    role: 'Lead Pastor - SDA',
    rating: 5},
  {
    quote:
      'Recording tithes and expenses is now fully automated. Our financial reporting is finally error-free.',
    author: 'Sister Elena Rodriguez',
    role: 'Church Treasurer - SDA',
    rating: 5},
  {
    quote: 'Our member directory updates are now instant. Outreach has never been this organized.',
    author: 'Michael Chen',
    role: 'General Secretary - SDA',
    rating: 4},
  {
    quote: 'The department hub allows us to manage our budget and events without any overlaps.',
    author: 'David Okoro',
    role: 'Youth Director - SDA',
    rating: 5},
];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="testimonials-section py-24 bg-white">
      <div className="container mx-auto px-4 max-w-[1400px]">
        {/* ===== SECTION HEADER ===== */}
        <div className="testimonials-header text-center mb-16">
          <h2
            className="text-4xl md:text-6xl font-bold text-[#00223A] tracking-tight"
          >
            Trusted by Congregations Everywhere.
          </h2>
        </div>

        {/* ===== MAIN CONTENT GRID ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr_1fr] gap-6 items-stretch">
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-6 order-2 lg:order-1">
            <TestimonialCard {...testimonials[0]} />
            <TestimonialCard {...testimonials[1]} />
          </div>

          {/* CENTER COLUMN: Video Showcase */}
          <div className="video-container relative bg-[#00223A] rounded-[40px] flex flex-col items-center justify-center p-8 min-h-[450px] lg:min-h-[600px] group/testimonials cursor-pointer overflow-hidden shadow-2xl order-1 lg:order-2">
            <div className="relative z-10 w-24 h-24 rounded-full bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm transition-transform group-hover/testimonials:scale-110">
              <Play className="fill-white text-white h-10 w-10 ml-1" />
            </div>

            <div className="absolute bottom-6 left-6 lg:bottom-10 lg:left-10 flex flex-wrap items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#17D7BE]" />
              <div>
                <p
                  className="text-white font-bold text-lg"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  John Doe
                </p>
                <p className="text-white/60 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Regional Director - SDA
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-6 order-3">
            <TestimonialCard {...testimonials[2]} />
            <TestimonialCard {...testimonials[3]} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
