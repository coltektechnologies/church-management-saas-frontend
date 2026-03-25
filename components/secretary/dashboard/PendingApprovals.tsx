'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const approvals = [
  { name: 'Owusu William', desc: 'End of year budget', dept: 'Treasurer', avatar: 'OW' },
  { name: 'Owusu William', desc: 'End of year budget', dept: 'Treasurer', avatar: 'OW' },
];

export function PendingApprovals() {
  return (
    <Card className="bg-card">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Pending Approvals</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs h-7">
            Approve
          </Button>
          <Button variant="outline" size="sm" className="text-xs h-7">
            Details
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {approvals.map((a, i) => (
            <div key={i} className="flex items-center gap-3 border border-border rounded-lg p-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {a.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{a.name}</p>
                  <Badge
                    variant="outline"
                    className="text-[10px] text-amber-600 border-amber-300 bg-amber-50"
                  >
                    Pending
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{a.desc}</p>
                <p className="text-[10px] text-muted-foreground mt-1">🏛 {a.dept}</p>
              </div>
              <div className="flex gap-1.5">
                <Button size="sm" className="text-[10px] h-6">
                  Details
                </Button>
                <Button size="sm" className="text-[10px] h-6">
                  Approve
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
