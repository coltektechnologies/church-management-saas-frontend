'use client';

import { Plus, Trash2 } from 'lucide-react';

export interface Department {
  id: string;
  name: string;
  leader: string;
}

interface StepDepartmentsProps {
  departments: Department[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof Department, value: string) => void;
}

const StepDepartments = ({ departments, onAdd, onRemove, onUpdate }: StepDepartmentsProps) => (
  <>
    <div className="animate-in fade-in duration-500 py-6">
      <label className="text-sm font-medium text-foreground mb-1 block">Departments & Teams</label>
      <p className="text-xs text-muted-foreground mb-4">Set up your church's ministry groups.</p>

      <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-muted">
        {departments.length === 0 ? (
          <div className="text-center py-6 border border-dashed rounded-lg text-muted-foreground text-xs">
            No departments added yet.
          </div>
        ) : (
          departments.map((dept) => (
            <div
              key={dept.id}
              className="flex items-center gap-2 bg-muted/50 rounded-lg p-3 border border-border group"
            >
              <input
                type="text"
                placeholder="Department name"
                value={dept.name}
                onChange={(e) => onUpdate(dept.id, 'name', e.target.value)}
                className="form-input-od text-xs py-1.5 flex-1 min-w-0"
              />
              <input
                type="text"
                placeholder="Leader (optional)"
                value={dept.leader}
                onChange={(e) => onUpdate(dept.id, 'leader', e.target.value)}
                className="form-input-od text-xs py-1.5 flex-1 min-w-0"
              />
              <button
                onClick={() => onRemove(dept.id)}
                className="text-muted-foreground hover:text-destructive transition-colors shrink-0 p-1"
                aria-label="Remove department"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      <button
        onClick={onAdd}
        className="mt-4 w-full flex items-center justify-center gap-1.5 text-sm text-primary font-bold py-2.5 border border-dashed border-primary/40 rounded-lg hover:bg-primary/5 transition-all active:scale-[0.98]"
      >
        <Plus size={16} /> Add Department
      </button>
    </div>
  </>
);

export default StepDepartments;
