'use client';

import { useState } from 'react';
import { Bell, ShieldAlert, ChevronDown } from 'lucide-react';

export default function SettingsTab() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(true);
  const [eventNotif, setEventNotif] = useState(false);
  const [prayerNotif, setPrayerNotif] = useState(true);

  return (
    <div className="bg-white border border-gray-200 border-t-0 rounded-b-xl p-6">
      {/* Notification Preferences */}
      <div className="bg-[#F8FAFC] border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
          <Bell size={20} className="text-[#0A2E46]" />
          <h3 className="text-[15px] font-bold text-[#0A2E46]">Notification Preferences</h3>
        </div>

        <div className="flex flex-col">
          {/* Item */}
          <div className="flex justify-between items-center py-4 border-b border-gray-100">
            <div>
              <h4 className="text-[13px] font-bold text-[#0A2E46] mb-0.5">Email Notifications</h4>
              <p className="text-[12px] text-gray-500 font-medium">
                Receive announcements and updates via email
              </p>
            </div>
            <button
              title="send mail"
              onClick={() => setEmailNotif(!emailNotif)}
              className={`w-11 h-6 rounded-full flex items-center transition-colors px-1 ${
                emailNotif ? 'bg-[#2FC4B2]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  emailNotif ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Item */}
          <div className="flex justify-between items-center py-4 border-b border-gray-100">
            <div>
              <h4 className="text-[13px] font-bold text-[#0A2E46] mb-0.5">SMS Notifications</h4>
              <p className="text-[12px] text-gray-500 font-medium">
                Receive urgent updates via text message
              </p>
            </div>
            <button
              title="send email"
              onClick={() => setSmsNotif(!smsNotif)}
              className={`w-11 h-6 rounded-full flex items-center transition-colors px-1 ${
                smsNotif ? 'bg-[#2FC4B2]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  smsNotif ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Item */}
          <div className="flex justify-between items-center py-4 border-b border-gray-100">
            <div>
              <h4 className="text-[13px] font-bold text-[#0A2E46] mb-0.5">Event Reminders</h4>
              <p className="text-[12px] text-gray-500 font-medium">
                Get reminders about upcoming church events
              </p>
            </div>
            <button
              title="send email"
              onClick={() => setEventNotif(!eventNotif)}
              className={`w-11 h-6 rounded-full flex items-center transition-colors px-1 ${
                eventNotif ? 'bg-[#2FC4B2]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  eventNotif ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Item */}
          <div className="flex justify-between items-center py-4">
            <div>
              <h4 className="text-[13px] font-bold text-[#0A2E46] mb-0.5">
                Prayer Request Updates
              </h4>
              <p className="text-[12px] text-gray-500 font-medium">
                Receive notifications for prayer requests
              </p>
            </div>
            <button
              title="set prayer notification"
              onClick={() => setPrayerNotif(!prayerNotif)}
              className={`w-11 h-6 rounded-full flex items-center transition-colors px-1 ${
                prayerNotif ? 'bg-[#2FC4B2]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  prayerNotif ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="bg-[#F8FAFC] border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
          <ShieldAlert size={20} className="text-[#0A2E46]" />
          <h3 className="text-[15px] font-bold text-[#0A2E46]">Privacy & Security</h3>
        </div>

        <div className="flex flex-col">
          {/* Item */}
          <div className="flex justify-between items-center py-4 border-b border-gray-100">
            <div>
              <h4 className="text-[13px] font-bold text-[#0A2E46] mb-0.5">Profile Visibility</h4>
              <p className="text-[12px] text-gray-500 font-medium">
                Control who can see your profile information
              </p>
            </div>
            <button
              title="leadership only"
              className="flex items-center gap-2 text-[13px] text-[#0A2E46] font-medium"
            >
              Leadership Only
              <ChevronDown size={16} className="text-gray-500" />
            </button>
          </div>

          {/* Item */}
          <div className="flex justify-between items-center py-4">
            <div>
              <h4 className="text-[13px] font-bold text-[#0A2E46] mb-0.5">
                Contact Info Visibility
              </h4>
              <p className="text-[12px] text-gray-500 font-medium">
                Control who can see your contact information
              </p>
            </div>
            <button
              title="leadership only"
              className="flex items-center gap-2 text-[13px] text-[#0A2E46] font-medium"
            >
              Leadership Only
              <ChevronDown size={16} className="text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
