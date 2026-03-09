import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CreateAnnouncementPayload,
  AnnouncementCategory,
  AnnouncementStatus,
} from '@/services/announcementService';
import {
  Bold,
  Italic,
  Underline,
  Image as ImageIcon,
  Link2,
  List,
  ListOrdered,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCreateAnnouncement } from '@/hooks/useCreateAnnouncement';

interface QuickCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const steps = [1, 2, 3, 4];

export function QuickCreateModal({ open, onOpenChange }: QuickCreateModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<CreateAnnouncementPayload>>({
    category: 'General Church',
    priority: 'Medium',
    title: '',
    content: '',
    audience: ['All Members'],
    status: 'Pending',
    scheduledDate: '',
  });

  const [attachments, setAttachments] = useState<File[]>([]);

  const createMutation = useCreateAnnouncement();

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleReset = () => {
    setStep(1);
    setFormData({
      category: 'General Church',
      priority: 'Medium',
      title: '',
      content: '',
      audience: ['All Members'],
      status: 'Pending',
      scheduledDate: '',
    });
    setAttachments([]);
  };

  const handleSubmit = (status: AnnouncementStatus) => {
    const finalData = { ...formData, status } as CreateAnnouncementPayload;
    createMutation.mutate(finalData, {
      onSuccess: () => {
        onOpenChange(false);
        handleReset();
      },
    });
  };

  const isStep1Valid =
    !!formData.category && !!formData.priority && !!formData.title && !!formData.content;

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        if (!val) {
          setTimeout(handleReset, 300);
        }
      }}
    >
      <DialogContent className="sm:max-w-[700px] h-[90vh] sm:h-auto max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-xl md:text-2xl text-[var(--color-success)]">
            Create New Announcement
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 pt-2">
          {/* Stepper */}
          <div className="flex items-center justify-between bg-muted/30 rounded-full p-2 mb-8 relative">
            <div className="absolute top-1/2 left-6 right-6 h-[2px] bg-muted -z-10 -translate-y-1/2" />
            {steps.map((s) => (
              <div
                key={s}
                className={cn(
                  'flex items-center justify-center size-10 rounded-full text-sm font-bold border-4 border-background transition-colors',
                  s === step
                    ? 'bg-chart-2 text-primary'
                    : s < step
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted-foreground/20 text-muted-foreground'
                )}
              >
                {s}
              </div>
            ))}
          </div>

          <div className="min-h-[250px]">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-foreground">
                      Category <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(val) =>
                        setFormData({ ...formData, category: val as AnnouncementCategory })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Events & Programs">Events & Programs</SelectItem>
                        <SelectItem value="Prayer Request">Prayer Request</SelectItem>
                        <SelectItem value="Thanksgiving">Thanksgiving</SelectItem>
                        <SelectItem value="Youth Activities">Youth Activities</SelectItem>
                        <SelectItem value="General Church">General Church</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Priority Level <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(val) => setFormData({ ...formData, priority: val as any })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Priority Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>
                    Title/Subject <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder="Enter announce title (max 100 characters)"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Content <span className="text-destructive">*</span>
                  </Label>
                  <p className="text-xs text-muted-foreground mb-1">
                    Use the toolbar to format your announcement.
                  </p>
                  <div className="border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:border-ring transition-all">
                    <div className="flex items-center gap-1 p-2 border-b bg-muted/10 border-border">
                      <Button variant="ghost" size="icon" className="size-8">
                        <Bold className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8">
                        <Italic className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8">
                        <Underline className="size-4" />
                      </Button>
                      <div className="w-px h-6 bg-border mx-1" />
                      <Button variant="ghost" size="icon" className="size-8">
                        <ImageIcon className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8">
                        <Link2 className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8">
                        <List className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8">
                        <ListOrdered className="size-4" />
                      </Button>
                    </div>
                    <textarea
                      className="w-full min-h-[120px] p-3 text-sm resize-y outline-none bg-transparent placeholder:text-muted-foreground"
                      placeholder="Write your announcement here..."
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label>Audience / Recipients</Label>
                  <Select
                    value={formData.audience?.[0]}
                    onValueChange={(val) => setFormData({ ...formData, audience: [val] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Members">All Members</SelectItem>
                      <SelectItem value="Pastors">Pastors</SelectItem>
                      <SelectItem value="Leaders">Church Leaders</SelectItem>
                      <SelectItem value="Youth">Youth Group</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select who should see this announcement on their dashboard.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Scheduling (Optional)</Label>
                  <Input
                    type="datetime-local"
                    value={formData.scheduledDate || ''}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave blank to publish immediately upon approval.
                  </p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="font-semibold text-lg border-b pb-2">Review</h3>
                <div className="bg-muted/20 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs text-muted-foreground">Category</span>
                      <p className="font-medium text-sm">{formData.category}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground">Priority</span>
                      <p className="font-medium text-sm">{formData.priority}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Title</span>
                    <p className="font-semibold">{formData.title}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Content Preview</span>
                    <p className="text-sm text-foreground/80 line-clamp-3">{formData.content}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Audience</span>
                    <p className="text-sm">{formData.audience?.join(', ')}</p>
                  </div>
                  {formData.scheduledDate && (
                    <div>
                      <span className="text-xs text-muted-foreground">Scheduled For</span>
                      <p className="text-sm font-medium text-warning">
                        {new Date(formData.scheduledDate).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Attachments</Label>
                  <div
                    className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <input
                      placeholder="*"
                      id="file-upload"
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) {
                          setAttachments([...attachments, ...Array.from(e.target.files)]);
                        }
                      }}
                    />
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <ImageIcon className="size-5 text-primary" />
                    </div>
                    <p className="text-sm font-medium">Click to upload files</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG (Max 5MB)</p>
                  </div>

                  {attachments.length > 0 && (
                    <div className="space-y-2 mt-4">
                      {attachments.map((file, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 text-sm border rounded-md bg-muted/20"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <ImageIcon className="size-4 shrink-0 text-muted-foreground" />
                            <span className="truncate">{file.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1 text-destructive"
                            onClick={() =>
                              setAttachments(attachments.filter((_, idx) => idx !== i))
                            }
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300 h-full">
                <div className="size-16 rounded-full bg-success/20 flex items-center justify-center text-success mb-2">
                  <span className="text-2xl">✓</span>
                </div>
                <h3 className="text-xl font-bold">Ready to Publish</h3>
                <p className="text-muted-foreground max-w-[280px]">
                  Your announcement is ready! You can save it as a draft or publish it right away.
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="p-6 border-t bg-muted/10 gap-2 sm:gap-0">
          <div className="flex items-center justify-between w-full">
            <Button variant="ghost" onClick={handleReset} className="text-muted-foreground">
              Cancel
            </Button>

            <div className="flex items-center gap-2">
              {step > 1 && (
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              )}

              {step < 4 ? (
                <Button
                  onClick={handleNext}
                  disabled={step === 1 && !isStep1Valid}
                  className="bg-[var(--color-success)] hover:bg-[var(--color-success)]/90 text-primary"
                >
                  Next Step
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleSubmit('Pending')}
                    disabled={createMutation.isPending}
                  >
                    Save Draft
                  </Button>
                  <Button
                    onClick={() => handleSubmit('Approved')}
                    disabled={createMutation.isPending}
                    className="bg-[var(--color-success)] hover:bg-[var(--color-success)]/90 text-primary"
                  >
                    Publish
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
