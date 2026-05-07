'use client';

import { User, X } from 'lucide-react';
import {
  sanitizeNoDigits,
  sanitizePersonNameInput,
  sanitizePhoneStripLetters,
} from '@/lib/signupValidation';
import Image from 'next/image';

interface StepAdminProfileProps {
  firstName: string;
  lastName: string;
  role: string;
  phone: string;
  email: string;
  profilePic: string | null;
  onFirstNameChange: (val: string) => void;
  onLastNameChange: (val: string) => void;
  onRoleChange: (val: string) => void;
  onPhoneChange: (val: string) => void;
  onEmailChange: (val: string) => void;
  onProfilePicChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearPic: () => void;
}

const StepAdminProfile = ({
  firstName,
  lastName,
  role,
  phone,
  email,
  profilePic,
  onFirstNameChange,
  onLastNameChange,
  onRoleChange,
  onPhoneChange,
  onEmailChange,
  onProfilePicChange,
  onClearPic,
}: StepAdminProfileProps) => (
  <>
    <div className="animate-in fade-in duration-500 py-6">
      <label className="text-sm font-medium text-foreground mb-3 block">Admin Profile</label>
      <p className="text-xs text-muted-foreground mb-4">Your personal info — linked to Settings.</p>

      {/* Profile picture */}
      <div className="flex items-center gap-4 mb-5">
        {profilePic ? (
          <div className="relative w-16 h-16">
            <Image
              src={profilePic}
              alt="Admin"
              fill
              className="rounded-full object-cover border-2 border-border"
            />
            <button
              onClick={onClearPic}
              className="absolute -top-1 -right-1 z-10 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <label className="w-16 h-16 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
            <User size={24} className="text-muted-foreground" />
            <input type="file" accept="image/*" className="hidden" onChange={onProfilePicChange} />
          </label>
        )}
        <span className="text-xs text-muted-foreground">Upload profile photo</span>
      </div>

      {/* Name fields */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs font-medium text-foreground mb-1 block">First Name*</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => onFirstNameChange(sanitizePersonNameInput(e.target.value))}
            placeholder="First name"
            className="form-input-od"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-foreground mb-1 block">Last Name*</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => onLastNameChange(sanitizePersonNameInput(e.target.value))}
            placeholder="Last name"
            className="form-input-od"
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="text-xs font-medium text-foreground mb-1 block">Role</label>
        <input
          type="text"
          value={role}
          onChange={(e) => onRoleChange(sanitizeNoDigits(e.target.value))}
          placeholder="e.g. Senior Pastor"
          className="form-input-od"
        />
      </div>

      <div className="mb-3">
        <label className="text-xs font-medium text-foreground mb-1 block">Phone Number</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => onPhoneChange(sanitizePhoneStripLetters(e.target.value))}
          placeholder="+233 00 000 0000"
          className="form-input-od"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-foreground mb-1 block">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="admin@church.com"
          className="form-input-od"
        />
      </div>
    </div>
  </>
);

export default StepAdminProfile;
