'use client';

import { useState, useEffect } from 'react';
import { X, Mail, MessageSquare, Search, Users } from 'lucide-react';
import { Member } from '../MessageMembers/types/message';
import { Button } from '../MessageMembers/ui/button';
import { Input } from '../MessageMembers/ui/input';
import { Textarea } from '../MessageMembers/ui/textarea';
import { Label } from '../MessageMembers/ui/label';
import { Checkbox } from '../MessageMembers/ui/checkbox';
import { Badge } from '../MessageMembers/ui/badge';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onSend: (title: string, content: string, type: 'email' | 'sms', recipientIds: string[]) => void;
  initialType?: 'email' | 'sms';
  initialSelectAll?: boolean;
}

export function MessageModal({
  isOpen,
  onClose,
  members,
  onSend,
  initialType = 'email',
  initialSelectAll = false,
}: MessageModalProps) {
  const [messageType, setMessageType] = useState<'email' | 'sms'>(initialType);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMessageType(initialType);
      if (initialSelectAll) {
        setSelectedMembers(new Set(members.map((m) => m.id)));
      }
    }
  }, [isOpen, initialType, initialSelectAll, members]);

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone.includes(searchQuery)
  );

  const toggleMember = (memberId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedMembers.size === filteredMembers.length) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(filteredMembers.map((m) => m.id)));
    }
  };

  const handleSend = async () => {
    if (!title.trim() || !content.trim() || selectedMembers.size === 0) {
      return;
    }

    setIsSending(true);
    try {
      await onSend(title, content, messageType, Array.from(selectedMembers));
      // Reset form
      setTitle('');
      setContent('');
      setSelectedMembers(new Set());
      setSearchQuery('');
      onClose();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const characterLimit = messageType === 'sms' ? 160 : 5000;
  const isOverLimit = content.length > characterLimit;

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-semibold">New Message</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Message Type Selection */}
          <div>
            <Label className="mb-3 block">Message Type</Label>
            <div className="flex gap-3">
              <button
                onClick={() => setMessageType('email')}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  messageType === 'email'
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${messageType === 'email' ? 'bg-teal-600' : 'bg-gray-700'}`}
                  >
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Email</div>
                    <div className="text-sm text-gray-500">Send via email</div>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setMessageType('sms')}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  messageType === 'sms'
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${messageType === 'sms' ? 'bg-teal-600' : 'bg-gray-700'}`}
                  >
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">SMS</div>
                    <div className="text-sm text-gray-500">Send via text</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Message Title */}
          <div>
            <Label htmlFor="title" className="mb-2 block">
              Subject / Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter message title"
              className="w-full"
            />
          </div>

          {/* Message Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="content">Message</Label>
              <span className={`text-sm ${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
                {content.length} / {characterLimit}
              </span>
            </div>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                messageType === 'email'
                  ? 'Enter your email message...'
                  : 'Enter your SMS message (max 160 characters)'
              }
              className="w-full min-h-[120px]"
            />
            {isOverLimit && (
              <p className="text-sm text-red-500 mt-1">
                Message exceeds {messageType === 'sms' ? 'SMS' : 'email'} character limit
              </p>
            )}
          </div>

          {/* Member Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Recipients</Label>
              <Badge variant="secondary" className="bg-teal-100 text-teal-700">
                {selectedMembers.size} selected
              </Badge>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search members..."
                className="pl-10"
              />
            </div>

            {/* Select All */}
            <div className="flex items-center gap-2 mb-3 p-3 bg-gray-50 rounded-lg">
              <Checkbox
                id="select-all"
                checked={
                  selectedMembers.size === filteredMembers.length && filteredMembers.length > 0
                }
                onCheckedChange={toggleSelectAll}
              />
              <label htmlFor="select-all" className="flex items-center gap-2 cursor-pointer flex-1">
                <Users className="w-4 h-4 text-gray-600" />
                <span className="font-medium">Select All Members</span>
                <span className="text-sm text-gray-500">({filteredMembers.length})</span>
              </label>
            </div>

            {/* Member List */}
            <div className="border rounded-lg max-h-64 overflow-y-auto">
              {filteredMembers.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No members found</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                    >
                      <Checkbox
                        id={`member-${member.id}`}
                        checked={selectedMembers.has(member.id)}
                        onCheckedChange={() => toggleMember(member.id)}
                      />
                      <label htmlFor={`member-${member.id}`} className="flex-1 cursor-pointer">
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-gray-500">
                          {messageType === 'email' ? member.email : member.phone}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSending}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={
              !title.trim() ||
              !content.trim() ||
              selectedMembers.size === 0 ||
              isOverLimit ||
              isSending
            }
            className="bg-teal-500 hover:bg-teal-600"
          >
            {isSending ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Sending...
              </>
            ) : (
              <>
                {messageType === 'email' ? (
                  <Mail className="w-4 h-4 mr-2" />
                ) : (
                  <MessageSquare className="w-4 h-4 mr-2" />
                )}
                Send to {selectedMembers.size} {selectedMembers.size === 1 ? 'Member' : 'Members'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
