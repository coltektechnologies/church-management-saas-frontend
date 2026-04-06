'use client';

import { useState, useEffect } from 'react';
import { Users, Mail, MessageSquare, Plus, Send } from 'lucide-react';
import { Member, Message } from '@/components/departments/MessageMembers/utils/message';
import { api } from '@/components/departments/MessageMembers/utils/api';
import { MessageModal } from '@/components/departments/MessageMembers/MessageModal';
import { Button } from '@/components/departments/MessageMembers/ui/button';
import { Badge } from '@/components/departments/MessageMembers/ui/badge';
import { toast } from 'sonner';
import { Toaster } from '@/components/departments/MessageMembers/ui/sonner';

export function BulkMessagingDashboard() {
  const [members, setMembers] = useState<Member[]>([]);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    type: 'email' | 'sms';
    selectAll: boolean;
  }>({ type: 'email', selectAll: false });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [membersData, messagesData] = await Promise.all([
        api.getMembers(),
        api.getRecentMessages(),
      ]);
      setMembers(membersData);
      setRecentMessages(messagesData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (type: 'email' | 'sms', selectAll: boolean = false) => {
    setModalConfig({ type, selectAll });
    setIsModalOpen(true);
  };

  const handleSendMessage = async (
    title: string,
    content: string,
    type: 'email' | 'sms',
    recipientIds: string[]
  ) => {
    try {
      const payload = { title, content, type, recipientIds };

      let result;
      if (type === 'email') {
        result = await api.sendBulkEmail(payload);
      } else {
        result = await api.sendBulkSMS(payload);
      }

      if (result.success) {
        toast.success(
          `Message sent successfully to ${recipientIds.length} ${recipientIds.length === 1 ? 'member' : 'members'}!`,
          {
            description: `Your ${type === 'email' ? 'email' : 'SMS'} has been delivered.`,
          }
        );

        // Add the new message to recent messages
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
        setRecentMessages([newMessage, ...recentMessages]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.');
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />

      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
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
              New Message
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Email Card */}
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
                <p className="text-gray-500">Send to all members</p>
              </div>
              <Send className="w-5 h-5 text-gray-400 group-hover:text-teal-600 transition-colors" />
            </div>
          </button>

          {/* SMS Card */}
          <button
            onClick={() => openModal('sms', true)}
            className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-teal-500 hover:shadow-lg transition-all group text-left cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="bg-gray-800 p-4 rounded-xl group-hover:bg-teal-600 transition-colors">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-1">SMS</h3>
                <p className="text-gray-500">Send to all members</p>
              </div>
              <Send className="w-5 h-5 text-gray-400 group-hover:text-teal-600 transition-colors" />
            </div>
          </button>
        </div>

        {/* Recent Messages Section */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Recent Messages</h2>

          {recentMessages.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">No messages sent yet</p>
              <Button
                onClick={() => openModal('email', false)}
                variant="outline"
                className="border-teal-500 text-teal-600 hover:bg-teal-50"
              >
                Send Your First Message
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
                        message.type === 'email' ? 'bg-blue-100' : 'bg-green-100'
                      }`}
                    >
                      {message.type === 'email' ? (
                        <Mail
                          className={`w-5 h-5 ${
                            message.type === 'email' ? 'text-blue-600' : 'text-green-600'
                          }`}
                        />
                      ) : (
                        <MessageSquare className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">{message.title}</h3>
                      <p className="text-sm text-gray-500">
                        Sent to {message.recipientCount} members • {formatDate(message.sentAt)}
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

        {/* Member Stats */}
        <div className="mt-6 bg-teal-50 border border-teal-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-teal-600" />
            <div>
              <p className="text-sm text-teal-700 font-medium">Total Members</p>
              <p className="text-2xl font-bold text-teal-900">{members.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Message Modal */}
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
