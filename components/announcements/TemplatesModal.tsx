import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreateAnnouncementPayload } from '@/services/announcementService';
import { ANNOUNCEMENT_TEMPLATES } from '@/services/announcementTemplates';

interface TemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (templatePayload: Partial<CreateAnnouncementPayload>) => void;
}

export function TemplatesModal({ open, onOpenChange, onSelectTemplate }: TemplatesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[80vh] sm:h-auto max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b bg-muted/10">
          <DialogTitle className="text-xl md:text-2xl text-[var(--color-warning)] flex items-center gap-2">
            <span>📋</span> Announcement Templates
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a pre-designed template to quickly create your announcement.
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 bg-muted/5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ANNOUNCEMENT_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  onSelectTemplate(template.payload);
                  onOpenChange(false);
                }}
                className="flex flex-col text-left p-5 bg-background border rounded-xl hover:border-warning hover:shadow-md hover:-translate-y-1 transition-all duration-200 group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-warning/50 group-hover:bg-warning transition-colors" />

                <div className="flex items-center gap-3 mb-3">
                  <span className="flex items-center justify-center size-10 rounded-full bg-warning/10 text-xl shadow-sm">
                    {template.icon}
                  </span>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-warning transition-colors">
                      {template.name}
                    </h3>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full mt-1 inline-block">
                      {template.payload.category}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
