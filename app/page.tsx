'use client';

import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Users, DollarSign, Bell, BarChart3, ChevronRight } from 'lucide-react';

export default function Home() {
  const handleToastDemo = () => {
    toast.success('Welcome to Church Management SAAS!', {
      description: 'Your modern solution for church administration',
      duration: 3000,
    });
  };

  const handleErrorToast = () => {
    toast.error('Error Demo', {
      description: 'This is how error messages will look',
    });
  };

  const handleInfoToast = () => {
    toast.info('Information', {
      description: 'New features coming soon!',
    });
  };

  const handleWarningToast = () => {
    toast.warning('Warning', {
      description: 'Please review your settings',
    });
  };

  const features = [
    {
      icon: <Users className="h-6 w-6 text-blue-600" />,
      title: 'Member Management',
      description: 'Complete member profiles, registration, and tracking system',
    },
    {
      icon: <DollarSign className="h-6 w-6 text-green-600" />,
      title: 'Financial Tracking',
      description: 'Track tithes, offerings, expenses with approval workflows',
    },
    {
      icon: <Bell className="h-6 w-6 text-purple-600" />,
      title: 'Smart Notifications',
      description: 'Automated SMS and email reminders for events and services',
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-orange-600" />,
      title: 'Analytics & Reports',
      description: 'Comprehensive reporting and data visualization tools',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-8 text-center">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 p-3">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Church Management SAAS
            </h1>
          </div>

          {/* Hero Text */}
          <div className="max-w-3xl space-y-4">
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl">
              Manage Your Church{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Efficiently
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Complete solution for member management, financial tracking, announcements, and more.
              Built for modern churches.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/auth/login">
              <Button size="lg" className="w-full gap-2 sm:w-auto">
                Get Started
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={handleToastDemo}
              className="w-full sm:w-auto"
            >
              Try Toast Demo
            </Button>
          </div>

          {/* Toast Demo Buttons */}
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <Button size="sm" variant="default" onClick={handleToastDemo}>
              Success Toast
            </Button>
            <Button size="sm" variant="destructive" onClick={handleErrorToast}>
              Error Toast
            </Button>
            <Button size="sm" variant="secondary" onClick={handleInfoToast}>
              Info Toast
            </Button>
            <Button size="sm" variant="outline" onClick={handleWarningToast}>
              Warning Toast
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-slate-200 transition-all hover:shadow-lg dark:border-slate-800"
            >
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-3 text-center">
                  <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-24 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="text-4xl font-bold">500+</div>
              <div className="mt-2 text-blue-100">Churches Using</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">50K+</div>
              <div className="mt-2 text-blue-100">Active Members</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">99.9%</div>
              <div className="mt-2 text-blue-100">Uptime</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-24 border-t border-slate-200 pt-8 text-center dark:border-slate-800">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              © 2025 Church Management SAAS. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link
                href="/docs"
                className="text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                Documentation
              </Link>
              <Link
                href="/support"
                className="text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                Support
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                Privacy
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
