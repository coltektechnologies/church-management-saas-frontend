/**
 * TestimonialCard Component
 * * Displays a customer testimonial with teal rating stars, white quote,
 * a teal divider, and author info against a navy background.
 * * Colors Used:
 * - Background: Deep Navy (#002B48)
 * - Stars & Avatar: Teal (#17D7BE)
 * - Text: White (#FFFFFF)
 */

import { Star } from 'lucide-react';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role?: string;
  rating: number;
}

const TestimonialCard = ({ quote, author, role, rating }: TestimonialCardProps) => {
  return (
    <div className="testimonial-card bg-[#002B48] p-8 rounded-[34px] shadow-lg h-full flex flex-col justify-between">
      <div>
        {/* ===== RATING STARS (Teal) ===== */}
        <div className="rating-stars flex gap-1 mb-6">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`star-icon h-5 w-5 ${
                i < rating ? 'text-[#17D7BE] fill-[#17D7BE]' : 'text-white/20'
              }`}
            />
          ))}
        </div>

        {/* ===== TESTIMONIAL QUOTE ===== */}
        <p className="testimonial-quote text-white font-poppins text-lg leading-relaxed mb-8">
          {quote}
        </p>
      </div>

      <div>
        {/* ===== TEAL DIVIDER ===== */}
        <div className="w-full h-[1px] bg-white/10 mb-6" />

        {/* ===== AUTHOR INFO ===== */}
        <div className="testimonial-author flex items-center gap-4">
          {/* Author Avatar - Solid Teal Circle as per image */}
          <div className="author-avatar w-12 h-12 rounded-full bg-[#17D7BE] shrink-0" />

          <div className="author-details">
            <p className="author-name font-bold text-white text-base">{author}</p>
            {role && (
              <p className="author-role text-xs text-white/60 uppercase tracking-wider">{role}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
