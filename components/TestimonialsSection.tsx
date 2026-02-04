/**
 * TestimonialsSection Component
 * * Arranges testimonials and a central video element in the specific
 * 3-column layout shown in the uploaded image.
 * * Layout:
 * - Left: 2 stacked cards
 * - Center: Large video feature
 * - Right: 2 stacked cards
 */

import { Play, Star } from 'lucide-react';
import TestimonialCard from './TestimonialCard';

const testimonials = [
  {
    quote:
      'The analytics dashboard has given us a clear view of our growth trends. Making data-driven decisions for our mission has never been this simple.',
    author: 'Pastor Samuel Mensah',
    role: 'Lead Pastor - SDA',
    rating: 4,
  },
  {
    quote:
      'Recording tithes and managing department expenses is finally automated. Our financial reporting is now transparent and error-free.',
    author: 'Sister Elena Rodriguez',
    role: 'Church Treasurer - SDA',
    rating: 3,
  },
  {
    quote:
      'Managing our member directory used to be a manual nightmare. Now, updates are instant and our communication outreach is fully automated.',
    author: 'Michael Chen',
    role: 'General Secretary - SDA',
    rating: 4,
  },
  {
    quote:
      'Having a dedicated hub for our department allows us to coordinate events and manage our budget without overlapping with other ministries.',
    author: 'David Okoro',
    role: 'Youth Director - SDA',
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="testimonials-section py-24 bg-white">
      <div className="container mx-auto px-4 max-w-[1400px]">
        {/* ===== SECTION HEADER ===== */}
        <div className="testimonials-header text-center mb-16">
          <h2 className="testimonials-title text-4xl md:text-6xl font-bold text-[#00223A] tracking-tight">
            Trusted by Congregations Everywhere.
          </h2>
        </div>

        {/* ===== MAIN CONTENT GRID (Left Cards - Video - Right Cards) ===== */}
        <div className="grid lg:grid-cols-[1fr_1.2fr_1fr] gap-6 items-stretch">
          {/* LEFT COLUMN: Stacked Testimonials */}
          <div className="flex flex-col gap-6">
            <TestimonialCard {...testimonials[0]} />
            <TestimonialCard {...testimonials[1]} />
          </div>

          {/* CENTER COLUMN: Large Video Showcase */}
          <div className="video-container relative bg-[#00223A] rounded-[40px] flex flex-col items-center justify-center p-8 min-h-[600px] group cursor-pointer overflow-hidden shadow-2xl">
            {/* Video Play Button Overlay */}
            <div className="relative z-10 w-24 h-24 rounded-full bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm transition-transform group-hover:scale-110">
              <Play className="fill-white text-white h-10 w-10 ml-1" />
            </div>

            {/* Video Author Footer (John Doe as per image) */}
            <div className="absolute bottom-10 left-10 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#17D7BE]" />
              <div>
                <p className="text-white font-bold text-lg">John Doe</p>
                <p className="text-white/60 text-sm">Regional Director - SDA</p>
              </div>
              <div className="flex gap-1 ml-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < 4 ? 'text-[#17D7BE] fill-[#17D7BE]' : 'text-white/20'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Stacked Testimonials */}
          <div className="flex flex-col gap-6">
            <TestimonialCard {...testimonials[2]} />
            <TestimonialCard {...testimonials[3]} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
