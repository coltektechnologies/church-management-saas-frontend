/**
 * TestimonialCard Component
 * * Displays a customer testimonial with teal rating stars.
 * Fonts: Poppins (Regular for quote/role, SemiBold for author)
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
    <div className="testimonial-card bg-[#002B48] p-8 rounded-[34px] shadow-lg h-full flex flex-col justify-between w-full">
      <div>
        <div className="rating-stars flex gap-1 mb-6">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${i < rating ? 'text-[#17D7BE] fill-[#17D7BE]' : 'text-white/20'}`}
            />
          ))}
        </div>

        <p
          className="testimonial-quote text-white text-lg leading-relaxed mb-8"
          style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 400 }}
        >
          "{quote}"
        </p>
      </div>

      <div>
        <div className="w-full h-[1px] bg-white/10 mb-6" />

        <div className="testimonial-author flex items-center gap-4">
          <div className="author-avatar w-12 h-12 rounded-full bg-[#17D7BE] shrink-0" />
          <div className="author-details">
            <p
              className="author-name text-white text-base"
              style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}
            >
              {author}
            </p>
            {role && (
              <p
                className="author-role text-xs text-white/60 uppercase tracking-wider"
                style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 400 }}
              >
                {role}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
