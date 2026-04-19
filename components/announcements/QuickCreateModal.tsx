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
  type PriorityLevel,
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
import { useUpdateAnnouncement } from '@/hooks/useUpdateAnnouncement';
import { toast } from 'sonner';
import {
  buildPublishAndExpires,
  isoToDatetimeLocal,
  nowDatetimeLocalValue,
  parseDatetimeLocalToDate,
  type ExpiryMode,
  type SchedulePublish,
} from '@/lib/announcementSchedule';
import { canInstantPublishAnnouncementsFromUi } from '@/lib/announcementPublishPolicy';

interface QuickCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<CreateAnnouncementPayload>;
}

const steps = [1, 2, 3, 4];

type QuickCreateFormData = Partial<CreateAnnouncementPayload> & {
  id?: string;
  schedulePublish: SchedulePublish;
  publishAtLocal: string;
  expiryMode: ExpiryMode;
  expiresAtLocal: string;
  expiresDaysAfterPublish: number;
};

function deriveSchedulingFromInitial(
  initial: Partial<CreateAnnouncementPayload> & { id?: string }
): Pick<
  QuickCreateFormData,
  'schedulePublish' | 'publishAtLocal' | 'expiryMode' | 'expiresAtLocal' | 'expiresDaysAfterPublish'
> {
  let schedulePublish: SchedulePublish = 'immediate';
  let publishAtLocal = '';

  if (initial.publish_at) {
    schedulePublish = 'scheduled';
    publishAtLocal = isoToDatetimeLocal(initial.publish_at);
  } else if (initial.scheduleType === 'SpecificDate' && initial.scheduledDate) {
    schedulePublish = 'scheduled';
    publishAtLocal =
      initial.scheduledDate.length >= 16
        ? initial.scheduledDate.slice(0, 16)
        : initial.scheduledDate;
  }

  let expiryMode: ExpiryMode = 'none';
  let expiresAtLocal = '';
  let expiresDaysAfterPublish = 7;

  if (initial.expires_at) {
    expiryMode = 'until';
    expiresAtLocal = isoToDatetimeLocal(initial.expires_at);
  } else if (initial.displayDurationType === 'Duration' && (initial.displayDurationDays ?? 0) > 0) {
    expiryMode = 'days';
    expiresDaysAfterPublish = initial.displayDurationDays ?? 7;
  }

  return {
    schedulePublish,
    publishAtLocal,
    expiryMode,
    expiresAtLocal,
    expiresDaysAfterPublish,
  };
}

const defaultForm = (): QuickCreateFormData => ({
  category: 'General Church',
  priority: 'Medium',
  title: '',
  content: '',
  status: 'Pending',
  schedulePublish: 'immediate',
  publishAtLocal: '',
  expiryMode: 'none',
  expiresAtLocal: '',
  expiresDaysAfterPublish: 7,
});

export function QuickCreateModal({ open, onOpenChange, initialData }: QuickCreateModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<QuickCreateFormData>(defaultForm);
  const instantPublish = canInstantPublishAnnouncementsFromUi();

  // Sync incoming initialData if present when modal opens
  React.useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          ...defaultForm(),
          id: (initialData as { id?: string }).id,
          category: initialData.category || 'General Church',
          priority: initialData.priority || 'Medium',
          title: initialData.title || '',
          content: initialData.content || '',
          audience: initialData.audience,
          status: initialData.status || 'Pending',
          publish_at: initialData.publish_at,
          expires_at: initialData.expires_at,
          ...deriveSchedulingFromInitial(initialData),
        });
      } else {
        setFormData(defaultForm());
      }
      setStep(1);
    }
  }, [open, initialData]);

  const [attachments, setAttachments] = useState<File[]>([]);

  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();

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
    setFormData(defaultForm());
    setAttachments([]);
  };

  const handleSubmit = (status: AnnouncementStatus) => {
    let publish_at: string | null;
    let expires_at: string | null;
    try {
      ({ publish_at, expires_at } = buildPublishAndExpires({
        schedulePublish: formData.schedulePublish,
        publishAtLocal: formData.publishAtLocal,
        expiryMode: formData.expiryMode,
        expiresAtLocal: formData.expiresAtLocal,
        expiresDaysAfterPublish: formData.expiresDaysAfterPublish,
      }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Invalid schedule');
      return;
    }

    const payload: CreateAnnouncementPayload = {
      category: formData.category as AnnouncementCategory,
      priority: formData.priority as CreateAnnouncementPayload['priority'],
      title: formData.title || '',
      content: formData.content || '',
      status,
      publish_at,
      expires_at,
      ...(formData.audience?.length ? { audience: formData.audience } : {}),
    };

    const { id } = formData;

    if (id) {
      updateMutation.mutate(
        { id, payload },
        {
          onSuccess: () => {
            onOpenChange(false);
            handleReset();
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          onOpenChange(false);
          handleReset();
        },
      });
    }
  };

  const isStep1Valid =
    !!formData.category && !!formData.priority && !!formData.title && !!formData.content;

  const isStep2Valid =
    (formData.schedulePublish !== 'scheduled' || !!formData.publishAtLocal?.trim()) &&
    (formData.expiryMode !== 'until' || !!formData.expiresAtLocal?.trim()) &&
    (formData.expiryMode !== 'days' || (formData.expiresDaysAfterPublish ?? 0) >= 1);

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
            {formData.id ? 'Edit Announcement' : 'Create New Announcement'}
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
                      onValueChange={(val) =>
                        setFormData({ ...formData, priority: val as PriorityLevel })
                      }
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
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 pb-8">
                <p className="text-sm text-muted-foreground rounded-lg border border-border bg-muted/20 p-3">
                  Scheduling matches the API: <strong>publish_at</strong> is when the announcement
                  becomes visible; <strong>expires_at</strong> is when it stops showing. Audience
                  targeting is not on the announcement model yet.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="text-base">Publish</Label>
                    <p className="text-xs text-muted-foreground">
                      Maps to <code className="text-[11px]">publish_at</code> — leave unscheduled to
                      go live when you publish/approve.
                    </p>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 text-sm cursor-pointer">
                        <input
                          type="radio"
                          name="schedulePublish"
                          className="size-4 accent-primary"
                          checked={formData.schedulePublish === 'immediate'}
                          onChange={() =>
                            setFormData({ ...formData, schedulePublish: 'immediate' })
                          }
                        />
                        Publish as soon as approved (not date-scheduled)
                      </label>
                      <label className="flex items-center gap-3 text-sm cursor-pointer">
                        <input
                          type="radio"
                          name="schedulePublish"
                          className="size-4 accent-primary"
                          checked={formData.schedulePublish === 'scheduled'}
                          onChange={() =>
                            setFormData({
                              ...formData,
                              schedulePublish: 'scheduled',
                              publishAtLocal:
                                formData.publishAtLocal?.trim() || nowDatetimeLocalValue(),
                            })
                          }
                        />
                        Schedule first publish (date &amp; time)
                      </label>
                      {formData.schedulePublish === 'scheduled' && (
                        <div className="pl-7 pt-1 space-y-1">
                          <Input
                            type="datetime-local"
                            step={60}
                            value={formData.publishAtLocal || ''}
                            onChange={(e) =>
                              setFormData({ ...formData, publishAtLocal: e.target.value })
                            }
                            className="h-9"
                          />
                          <p className="text-[11px] text-muted-foreground">
                            Sent to API as ISO 8601 <code>publish_at</code>.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base">Stop showing</Label>
                    <p className="text-xs text-muted-foreground">
                      Maps to <code className="text-[11px]">expires_at</code>. Omit for no automatic
                      end.
                    </p>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 text-sm cursor-pointer">
                        <input
                          type="radio"
                          name="expiryMode"
                          className="size-4 accent-primary"
                          checked={formData.expiryMode === 'none'}
                          onChange={() => setFormData({ ...formData, expiryMode: 'none' })}
                        />
                        No end date
                      </label>
                      <label className="flex items-center gap-3 text-sm cursor-pointer">
                        <input
                          type="radio"
                          name="expiryMode"
                          className="size-4 accent-primary"
                          checked={formData.expiryMode === 'until'}
                          onChange={() =>
                            setFormData({
                              ...formData,
                              expiryMode: 'until',
                              expiresAtLocal:
                                formData.expiresAtLocal?.trim() || nowDatetimeLocalValue(),
                            })
                          }
                        />
                        Stop at date &amp; time
                      </label>
                      {formData.expiryMode === 'until' && (
                        <div className="pl-7 pt-1 space-y-1">
                          <Input
                            type="datetime-local"
                            step={60}
                            value={formData.expiresAtLocal || ''}
                            onChange={(e) =>
                              setFormData({ ...formData, expiresAtLocal: e.target.value })
                            }
                            className="h-9"
                          />
                          <p className="text-[11px] text-muted-foreground">
                            Pick date and time — stored as <code>expires_at</code> (UTC) for the
                            API.
                          </p>
                        </div>
                      )}
                      <label className="flex items-center gap-3 text-sm cursor-pointer flex-wrap">
                        <input
                          type="radio"
                          name="expiryMode"
                          className="size-4 accent-primary"
                          checked={formData.expiryMode === 'days'}
                          onChange={() => setFormData({ ...formData, expiryMode: 'days' })}
                        />
                        <span className="flex flex-wrap items-center gap-2">
                          Show for
                          <Input
                            type="number"
                            min={1}
                            className="w-16 h-8 text-center px-1"
                            value={formData.expiresDaysAfterPublish || ''}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                expiresDaysAfterPublish: Math.max(
                                  1,
                                  parseInt(e.target.value, 10) || 1
                                ),
                              })
                            }
                            disabled={formData.expiryMode !== 'days'}
                          />
                          days after publish time
                        </span>
                      </label>
                      {formData.expiryMode === 'days' && (
                        <p className="text-[11px] text-muted-foreground pl-7">
                          Computes <code>expires_at</code> from the scheduled publish time, or from
                          &quot;now&quot; if not scheduled.
                        </p>
                      )}
                    </div>
                  </div>
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
                    <span className="text-xs text-muted-foreground">Publish (publish_at)</span>
                    <p className="text-sm font-medium">
                      {formData.schedulePublish === 'scheduled' && formData.publishAtLocal
                        ? (() => {
                            const d = parseDatetimeLocalToDate(formData.publishAtLocal);
                            return d
                              ? d.toLocaleString(undefined, {
                                  dateStyle: 'medium',
                                  timeStyle: 'short',
                                })
                              : formData.publishAtLocal;
                          })()
                        : 'When approved / published (not date-scheduled)'}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Stop showing (expires_at)</span>
                    <p className="text-sm text-foreground/80">
                      {formData.expiryMode === 'none' && 'No automatic end date'}
                      {formData.expiryMode === 'until' &&
                        formData.expiresAtLocal &&
                        (() => {
                          const d = parseDatetimeLocalToDate(formData.expiresAtLocal);
                          return d
                            ? d.toLocaleString(undefined, {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })
                            : formData.expiresAtLocal;
                        })()}
                      {formData.expiryMode === 'days' &&
                        `${formData.expiresDaysAfterPublish} day(s) after publish time (computed on save)`}
                    </p>
                  </div>
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
                <h3 className="text-xl font-bold">
                  {instantPublish ? 'Ready to Publish' : 'Submit for approval'}
                </h3>
                <p className="text-muted-foreground max-w-[280px]">
                  {instantPublish
                    ? 'Your announcement is ready. Save a draft or publish when you are satisfied.'
                    : 'Save a draft, or send this announcement to the secretariat for review and publishing.'}
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
                  disabled={(step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid)}
                  className="bg-[var(--color-success)] hover:bg-[var(--color-success)]/90 text-primary"
                >
                  Next Step
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleSubmit('Pending')}
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    Save Draft
                  </Button>
                  <Button
                    onClick={() => handleSubmit('Approved')}
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="bg-[var(--color-success)] hover:bg-[var(--color-success)]/90 text-primary"
                  >
                    {formData.id
                      ? 'Save Changes'
                      : instantPublish
                        ? 'Publish'
                        : 'Submit for approval'}
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
