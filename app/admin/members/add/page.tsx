'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Briefcase,
  Home,
  Building2,
  Globe,
  Church,
  Calendar,
  GraduationCap,
  FileText,
  Lock,
  Shield,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const DEPARTMENTS = [
  'Secretariat',
  'Treasury',
  'Deaconry',
  'Personal Ministry',
  'Sabbath School',
  'Adventist Youth',
];

export default function AddMemberPage() {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-row items-start justify-between gap-4">
        <div>
          <h1
            style={{
              width: 230,
              height: 33,
              fontFamily: 'OV Soge, sans-serif',
              fontWeight: 600,
              fontSize: '24px',
              lineHeight: '100%',
              letterSpacing: 0,
              color: '#0B2A4A',
            }}
          >
            Add New Member
          </h1>
          <p
            className="mt-1"
            style={{
              width: 267,
              height: 17,
              fontFamily: 'OV Soge, sans-serif',
              fontWeight: 400,
              fontSize: '12px',
              lineHeight: '100%',
              letterSpacing: 0,
              color: '#666666',
            }}
          >
            Administrative panel for member registration
          </p>
        </div>
        <Link
          href="/admin/members"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 shrink-0 ml-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Members', value: '2,500', labelWidth: 94, contentWidth: 94 },
          { label: 'New Members This Month', value: '50', labelWidth: 165, contentWidth: 165 },
          { label: 'Pending Approvals', value: '25', labelWidth: 122, contentWidth: 122 },
          {
            label: 'Active this Month',
            value: '1,950',
            highlight: true,
            labelWidth: 108,
            contentWidth: 108,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-4 flex flex-col justify-center items-start"
            style={{
              width: 267,
              height: 90,
              borderRadius: 15,
              borderLeft: '5px solid #0B2A4A',
              background: '#F8FAFC',
            }}
          >
            <div
              className="flex flex-col justify-center"
              style={{ width: stat.contentWidth, height: 51 }}
            >
              <p
                style={{
                  width: stat.labelWidth,
                  height: 17,
                  fontFamily: 'OV Soge, sans-serif',
                  fontWeight: 700,
                  fontSize: '12px',
                  lineHeight: '100%',
                  letterSpacing: 0,
                  color: '#717171',
                }}
              >
                {stat.label}
              </p>
              <p
                className="mt-1"
                style={{
                  fontFamily: 'OV Soge, sans-serif',
                  fontWeight: 700,
                  fontSize: '24px',
                  lineHeight: '100%',
                  letterSpacing: 0,
                  color: stat.highlight ? '#116CC9' : '#0B2A4A',
                }}
              >
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Member Registration Form - Mother container (full width) */}
      <div className="w-full max-w-full space-y-0">
        {/* Form banner */}
        <div
          className="flex items-center justify-between text-white w-full"
          style={{
            height: 67,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            paddingTop: 20,
            paddingRight: 30,
            paddingBottom: 20,
            paddingLeft: 30,
            background: '#0B2A4A',
            marginBottom: 38,
          }}
        >
          <h2 className="text-lg font-semibold" style={{ fontFamily: 'OV Soge, sans-serif' }}>
            Member Registration Form
          </h2>
          <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-xs font-medium">
            <Shield className="h-4 w-4" />
            Administrative Access Required
          </span>
        </div>

        {/* Form - two columns, 3 aligned rows: Personal|Emergency, Contact|System, Church|Admin */}
        <form className="block w-full">
          <div
            className="w-full grid overflow-hidden"
            style={{
              gridTemplateColumns: '638px minmax(394px, 1fr)',
              gridTemplateRows: 'auto auto 1fr',
              gap: '0 24px',
              minHeight: 1005,
              marginLeft: 25,
              marginRight: 25,
            }}
          >
            {/* Row 1 left: Personal Information */}
            <div
              className="flex flex-col p-6 overflow-y-auto border border-[#E9ECEF] border-b-0 bg-[#F8F9FA] rounded-tl-[10px]"
              style={{ minHeight: 0 }}
            >
              <section className="space-y-4">
                <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                  <User className="h-5 w-5 text-gray-600" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Title *</Label>
                      <select className="h-9 w-full rounded-none border border-[#DDDDDD] px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                        <option>Select title</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <div className="flex gap-4 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="gender" value="male" className="rounded-none" />
                          <span className="text-sm">Male</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value="female"
                            className="rounded-none"
                          />
                          <span className="text-sm">Female</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>First Name *</Label>
                      <Input placeholder="First Name" className="pl-9" />
                    </div>
                    <div className="space-y-2">
                      <Label>Middle Name</Label>
                      <Input placeholder="Middle Name" className="pl-9" />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name *</Label>
                      <Input placeholder="Last Name" className="pl-9" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Date of Birth *</Label>
                      <Input type="date" placeholder="Date of Birth" className="pl-9" />
                    </div>
                    <div className="space-y-2">
                      <Label>Marital Status</Label>
                      <select className="h-9 w-full rounded-none border border-[#DDDDDD] px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                        <option>Marital Status</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>National ID Number</Label>
                      <Input placeholder="Optional" className="pl-9" />
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Row 1 right: Emergency Contact */}
            <div
              className="flex flex-col p-6 overflow-y-auto border border-[#E9ECEF] border-b-0 bg-[#F8F9FA] rounded-tr-[10px]"
              style={{ minHeight: 0 }}
            >
              <section className="space-y-4">
                <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                  <User className="h-5 w-5 text-gray-600" />
                  Emergency Contact
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input placeholder="First Name" className="pl-9" />
                  </div>
                  <div className="space-y-2">
                    <Label>Relationship *</Label>
                    <select className="h-9 w-full rounded-none border border-[#DDDDDD] px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                      <option>Select Relationship</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number *</Label>
                    <Input placeholder="Phone Number" className="pl-9" />
                  </div>
                </div>
              </section>
            </div>

            {/* Row 2 left: Contact Information */}
            <div
              className="flex flex-col p-6 overflow-y-auto border border-[#E9ECEF] border-b-0 bg-[#F8F9FA]"
              style={{ minHeight: 0 }}
            >
              <section className="space-y-4">
                <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                  <FileText className="h-5 w-5 text-gray-600" />
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Primary Phone *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input placeholder="+233 596 038 258" className="pl-9" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input type="email" placeholder="opendoor@gmail.com" className="pl-9" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Occupation *</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input placeholder="Senior Pastor" className="pl-9" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Residential Address *</Label>
                      <div className="relative">
                        <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input placeholder="Street Address" className="pl-9" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>City *</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input placeholder="City" className="pl-9" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Region *</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select className="h-9 w-full rounded-none border border-[#DDDDDD] pl-9 pr-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                          <option>Select Region</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Row 2 right: System Access */}
            <div
              className="flex flex-col p-6 overflow-y-auto border border-[#E9ECEF] border-b-0 bg-[#F8F9FA]"
              style={{ minHeight: 0 }}
            >
              <section className="space-y-4">
                <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                  <Lock className="h-5 w-5 text-gray-600" />
                  System Access
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center justify-between">
                      <span>Username</span>
                      <span className="text-xs font-normal text-gray-500">Auto-generated</span>
                    </Label>
                    <Input readOnly placeholder="username" className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center justify-between">
                      <span>Password</span>
                      <span className="text-xs font-normal text-gray-500">Auto-generated</span>
                    </Label>
                    <Input type="password" readOnly value="••••••••••••" className="bg-gray-50" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="checkbox" className="rounded-none border border-[#DDDDDD]" />
                      Send credentials via SMS
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="checkbox" className="rounded-none border border-[#DDDDDD]" />
                      Send credentials via Email
                    </label>
                  </div>
                </div>
              </section>
            </div>

            {/* Row 3 left: Church Information - Department Interest, Skills & Talents */}
            <div className="flex flex-col p-6 overflow-y-auto border border-[#E9ECEF] bg-[#F8F9FA] rounded-bl-[10px] min-h-0">
              <section className="space-y-4">
                <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                  <Church className="h-5 w-5 text-gray-600" />
                  Church Information
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Member Since *</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input type="date" defaultValue="2024-05-02" className="pl-9" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Membership Status *</Label>
                      <select className="h-9 w-full rounded-none border border-[#DDDDDD] px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                        <option>Select Status</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Educational Level *</Label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select className="h-9 w-full rounded-none border border-[#DDDDDD] pl-9 pr-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                          <option>Select Education</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Are you Baptized *</Label>
                    <select className="h-9 w-full rounded-none border border-[#DDDDDD] px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                      <option>Select Status</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Department Interest</Label>
                    <div className="flex flex-wrap gap-2">
                      {DEPARTMENTS.map((dept) => (
                        <button
                          key={dept}
                          type="button"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none border border-[#DDDDDD] text-sm hover:bg-gray-50"
                        >
                          <FileText className="h-3.5 w-3.5 text-gray-500" />
                          {dept}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Skills & Talents</Label>
                    <textarea
                      className="min-h-[80px] w-full rounded-none border border-[#DDDDDD] px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="List skills, talents, or areas of service."
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Row 3 right: Admin Notes */}
            <div className="flex flex-col p-6 overflow-y-auto border border-[#E9ECEF] bg-[#F8F9FA] rounded-br-[10px] min-h-0">
              <section className="space-y-4">
                <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                  <FileText className="h-5 w-5 text-gray-600" />
                  Admin Notes
                </h3>
                <div className="space-y-2">
                  <Label>Internal Notes</Label>
                  <textarea
                    className="min-h-[80px] w-full rounded-none border border-[#DDDDDD] px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Notes visible to only administrators....."
                  />
                </div>
                <p className="text-sm text-gray-500">Added By: Nancy Ampedu (Secretary)</p>
              </section>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" className="text-red-600 border-gray-300">
              Cancel
            </Button>
            <Button type="button" variant="outline" className="text-red-600 border-red-300">
              Save as Draft
            </Button>
            <Button
              type="submit"
              className="bg-[#0B2A4A] hover:bg-[#0B2A4A]/90 text-white"
              style={{ fontFamily: 'OV Soge, sans-serif' }}
            >
              <User className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
