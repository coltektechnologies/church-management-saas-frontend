'use client';

import { useState, useEffect, useMemo } from 'react';
import { Users, Mail, MessageSquare, Smartphone, Plus, Send } from 'lucide-react';
import { Member, Message } from '@/components/departments/MessageMembers/types/message';
import { createDepartmentMessagingApi } from '@/components/departments/MessageMembers/utils/api';
import { MessageModal } from '@/components/departments/MessageMembers/MessageModal';
import { Button } from '@/components/departments/MessageMembers/ui/button';
import { Badge } from '@/components/departments/MessageMembers/ui/badge';
import { toast } from 'sonner';
import { Toaster } from '@/components/departments/MessageMembers/ui/sonner';
import { usePortalDepartment } from '@/hooks/usePortalDepartment';

export function BulkMessagingDashboard() {
  const department = usePortalDepartment();
  const departmentId = department?.id ?? '';
  const departmentName = department?.name ?? 'Department';

  const api = useMemo(
    () => createDepartmentMessagingApi(departmentId, departmentName),
    [departmentId, departmentName]
  );

  const [members, setMembers] = useState<Member[]>([]);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    type: 'email' | 'sms' | 'in_app';
    selectAll: boolean;
  }>({ type: 'email', selectAll: false });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      if (!departmentId) {
        setMembers([]);
        setRecentMessages([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const [membersData, messagesData] = await Promise.all([
          api.getMembers(),
          api.getRecentMessages(),
        ]);
        if (!cancelled) {
          setMembers(membersData);
          setRecentMessages(messagesData);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : 'Failed to load data.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };
    void loadData();
    return () => {
      cancelled = true;
    };
  }, [api, departmentId]);

  const openModal = (type: 'email' | 'sms' | 'in_app', selectAll: boolean = false) => {
    setModalConfig({ type, selectAll });
    setIsModalOpen(true);
  };

  const handleSendMessage = async (
    title: string,
    content: string,
    type: 'email' | 'sms' | 'in_app',
    recipientIds: string[]
  ) => {
    const payload = { title, content, type, recipientIds };
    try {
      let result: { success: boolean; messageId: string };
      if (type === 'email') {
        result = await api.sendBulkEmail(payload);
      } else if (type === 'sms') {
        result = await api.sendBulkSms(payload);
      } else {
        result = await api.sendBulkInApp(payload);
      }

      if (result.success) {
        toast.success(
          `Sent to ${recipientIds.length} ${recipientIds.length === 1 ? 'member' : 'members'}.`,
          {
            description:
              type === 'email'
                ? 'Email delivery depends on your church mail settings.'
                : type === 'sms'
                  ? 'SMS uses your church SMS settings (e.g. mNotify). Long text is truncated to 160 characters.'
                  : 'Members will see this in their in-app notifications when they log in.',
          }
        );

        if (type === 'in_app') {
          try {
            const next = await api.getRecentMessages();
            setRecentMessages(next);
          } catch {
            const newMessage: Message = {
              id: result.messageId,
              title,
              content,
              type,
              recipientCount: recipientIds.length,
              recipientIds,
              status: 'delivered',
              sentAt: new Date(),
            };
            setRecentMessages((prev) => [newMessage, ...prev]);
          }
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message.');
      throw error;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  if (!departmentId) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center p-8">
        <p className="text-gray-500 text-sm text-center max-w-md">
          No department is linked to your account. Message Member is available when you are the
          department head or elder in charge.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-teal-100 p-2 rounded-lg">
                <Users className="w-6 h-6 text-teal-600" />
              </div>
              <h1 className="text-2xl font-semibold text-teal-600">Message Department Members</h1>
            </div>
            <Button
              onClick={() => openModal('email', false)}
              className="bg-gradient-to-r from-[#2FC4B2] to-[#15A493] hover:bg-teal-600 cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2" />
              New message
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => openModal('email', true)}
            className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-teal-500 hover:shadow-lg transition-all group text-left cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="bg-gray-800 p-4 rounded-xl group-hover:bg-teal-600 transition-colors">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-1">Email</h3>
                <p className="text-gray-500">Send email to members (uses email on file)</p>
              </div>
              <Send className="w-5 h-5 text-gray-400 group-hover:text-teal-600 transition-colors" />
            </div>
          </button>

          <button
            onClick={() => openModal('sms', true)}
            className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-teal-500 hover:shadow-lg transition-all group text-left cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="bg-gray-800 p-4 rounded-xl group-hover:bg-teal-600 transition-colors">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-1">SMS</h3>
                <p className="text-gray-500">
                  Text members (uses phone on file, max 160 characters)
                </p>
              </div>
              <Send className="w-5 h-5 text-gray-400 group-hover:text-teal-600 transition-colors" />
            </div>
          </button>

          <button
            onClick={() => openModal('in_app', true)}
            className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-teal-500 hover:shadow-lg transition-all group text-left cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="bg-gray-800 p-4 rounded-xl group-hover:bg-teal-600 transition-colors">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-1">In-app message</h3>
                <p className="text-gray-500">Notify members inside the app</p>
              </div>
              <Send className="w-5 h-5 text-gray-400 group-hover:text-teal-600 transition-colors" />
            </div>
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Recent in-app batches</h2>
          <p className="text-sm text-gray-500 mb-6">
            After refresh, only in-app batches appear here. Email and SMS sends are not listed in
            this history view.
          </p>

          {recentMessages.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">No in-app batches yet</p>
              <Button
                onClick={() => openModal('in_app', false)}
                variant="outline"
                className="border-teal-500 text-teal-600 hover:bg-teal-50"
              >
                Send an in-app message
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentMessages.map((message) => (
                <div
                  key={message.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`p-2 rounded-lg ${
                        message.type === 'email'
                          ? 'bg-blue-100'
                          : message.type === 'sms'
                            ? 'bg-violet-100'
                            : 'bg-green-100'
                      }`}
                    >
                      {message.type === 'email' ? (
                        <Mail className="w-5 h-5 text-blue-600" />
                      ) : message.type === 'sms' ? (
                        <Smartphone className="w-5 h-5 text-violet-600" />
                      ) : (
                        <MessageSquare className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">{message.title}</h3>
                      <p className="text-sm text-gray-500">
                        {message.type === 'email'
                          ? 'Email'
                          : message.type === 'sms'
                            ? 'SMS'
                            : 'In-app'}{' '}
                        · {message.recipientCount} members · {formatDate(message.sentAt)}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={`ml-4 ${
                      message.status === 'delivered'
                        ? 'bg-teal-100 text-teal-700 hover:bg-teal-100'
                        : message.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                          : 'bg-red-100 text-red-700 hover:bg-red-100'
                    }`}
                  >
                    {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 bg-teal-50 border border-teal-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-teal-600" />
            <div>
              <p className="text-sm text-teal-700 font-medium">Members in this department</p>
              <p className="text-2xl font-bold text-teal-900">{members.length}</p>
            </div>
          </div>
        </div>
      </div>

      <MessageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        members={members}
        onSend={handleSendMessage}
        initialType={modalConfig.type}
        initialSelectAll={modalConfig.selectAll}
      />
    </div>
  );
}
