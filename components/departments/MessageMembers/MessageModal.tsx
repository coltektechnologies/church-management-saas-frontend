'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Mail, MessageSquare, Smartphone, Search, Users } from 'lucide-react';
import { Member } from './types/message';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';

function memberHasPhone(m: Member): boolean {
  const p = m.phone.trim();
  return p.length > 0 && p !== '—' && p !== '-';
}

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onSend: (
    title: string,
    content: string,
    type: 'email' | 'sms' | 'in_app',
    recipientIds: string[]
  ) => void;
  initialType?: 'email' | 'sms' | 'in_app';
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
  const [messageType, setMessageType] = useState<'email' | 'sms' | 'in_app'>(initialType);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);

  const selectableMembers = useMemo(() => {
    if (messageType === 'email') {
      return members.filter((m) => m.email.trim().length > 0);
    }
    if (messageType === 'sms') {
      return members.filter(memberHasPhone);
    }
    return members;
  }, [members, messageType]);

  useEffect(() => {
    if (isOpen) {
      setMessageType(initialType);
      if (initialSelectAll) {
        let pool = members;
        if (initialType === 'email') {
          pool = members.filter((m) => m.email.trim());
        } else if (initialType === 'sms') {
          pool = members.filter(memberHasPhone);
        }
        setSelectedMembers(new Set(pool.map((m) => m.id)));
      }
    }
  }, [isOpen, initialType, initialSelectAll, members]);

  const filteredMembers = selectableMembers.filter(
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
    if (selectedMembers.size === filteredMembers.length && filteredMembers.length > 0) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(filteredMembers.map((m) => m.id)));
    }
  };

  const handleSend = async () => {
    if (!content.trim() || selectedMembers.size === 0) {
      return;
    }
    if (messageType === 'email' && !title.trim()) {
      return;
    }

    setIsSending(true);
    try {
      await onSend(title.trim(), content.trim(), messageType, Array.from(selectedMembers));
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

  const characterLimit = messageType === 'sms' ? 160 : messageType === 'in_app' ? 4000 : 5000;
  const isOverLimit = content.length > characterLimit;

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-semibold">Message members</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <Label className="mb-3 block">Channel</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setMessageType('email');
                  setSelectedMembers(new Set());
                }}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  messageType === 'email'
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg shrink-0 ${messageType === 'email' ? 'bg-teal-600' : 'bg-gray-700'}`}
                  >
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium">Email</div>
                    <div className="text-sm text-gray-500">Uses member email</div>
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMessageType('sms');
                  setSelectedMembers(new Set());
                }}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  messageType === 'sms'
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg shrink-0 ${messageType === 'sms' ? 'bg-teal-600' : 'bg-gray-700'}`}
                  >
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium">SMS</div>
                    <div className="text-sm text-gray-500">Uses primary phone</div>
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMessageType('in_app');
                  setSelectedMembers(new Set());
                }}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  messageType === 'in_app'
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg shrink-0 ${messageType === 'in_app' ? 'bg-teal-600' : 'bg-gray-700'}`}
                  >
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium">In-app</div>
                    <div className="text-sm text-gray-500">In-app notification</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="title" className="mb-2 block">
              {messageType === 'email'
                ? 'Subject'
                : messageType === 'sms'
                  ? 'Prefix (optional)'
                  : 'Title (optional)'}
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                messageType === 'email'
                  ? 'Email subject'
                  : messageType === 'sms'
                    ? 'Short label before the SMS body'
                    : 'Short title (optional)'
              }
              className="w-full"
            />
          </div>

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
                  ? 'Write your email…'
                  : messageType === 'sms'
                    ? 'SMS body (prefix + body combined, max 160 characters total)'
                    : 'Write the notification members will see in the app…'
              }
              className="w-full min-h-[120px]"
            />
            {isOverLimit && (
              <p className="text-sm text-red-500 mt-1">Message is too long for this channel.</p>
            )}
          </div>

          {messageType === 'email' && members.some((m) => !m.email.trim()) && (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Members without an email on file are hidden for email. Try SMS or in-app for those
              members.
            </p>
          )}
          {messageType === 'sms' && members.some((m) => !memberHasPhone(m)) && (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Members without a usable phone number are hidden for SMS.
            </p>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Recipients</Label>
              <Badge variant="secondary" className="bg-teal-100 text-teal-700">
                {selectedMembers.size} selected
              </Badge>
            </div>

            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search members…"
                className="pl-10"
              />
            </div>

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
                <span className="font-medium">Select all</span>
                <span className="text-sm text-gray-500">({filteredMembers.length})</span>
              </label>
            </div>

            <div className="border rounded-lg max-h-64 overflow-y-auto">
              {filteredMembers.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>
                    {messageType === 'email'
                      ? 'No members with email on file.'
                      : messageType === 'sms'
                        ? 'No members with phone on file.'
                        : 'No members found.'}
                  </p>
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
                          {messageType === 'email'
                            ? member.email || '—'
                            : messageType === 'sms'
                              ? member.phone || '—'
                              : 'In-app notification'}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSending}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={
              !content.trim() ||
              (messageType === 'email' && !title.trim()) ||
              selectedMembers.size === 0 ||
              isOverLimit ||
              isSending
            }
            className="bg-teal-500 hover:bg-teal-600"
          >
            {isSending ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Sending…
              </>
            ) : (
              <>
                {messageType === 'email' ? (
                  <Mail className="w-4 h-4 mr-2" />
                ) : messageType === 'sms' ? (
                  <Smartphone className="w-4 h-4 mr-2" />
                ) : (
                  <MessageSquare className="w-4 h-4 mr-2" />
                )}
                Send to {selectedMembers.size} {selectedMembers.size === 1 ? 'member' : 'members'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
