import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { toast } from 'sonner';

const PaymentSettingsTab = () => {
  const [method, setMethod] = useState('momo');
  const [network, setNetwork] = useState('MTN');
  const [phone, setPhone] = useState('');
  const [accountName, setAccountName] = useState('');

  const handleSave = () => {
    toast.success('Payment settings saved');
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-6 max-w-2xl">
      <h3 className="text-base font-semibold text-foreground">Payment Settings</h3>

      <div className="space-y-1.5">
        <Label className="text-xs">Payment Method</Label>
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="momo">Mobile Money</SelectItem>
            <SelectItem value="bank">Bank Transfer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {method === 'momo' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Network</Label>
            <Select value={network} onValueChange={setNetwork}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MTN">MTN</SelectItem>
                <SelectItem value="Telecel">Telecel</SelectItem>
                <SelectItem value="AirtelTigo">AirtelTigo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Mobile Number</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="024-XXX-XXXX"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs">Account Name</Label>
            <Input
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Name on account"
            />
          </div>
        </div>
      )}

      {method === 'bank' && (
        <p className="text-sm text-muted-foreground">Bank transfer settings coming soon.</p>
      )}

      <Button onClick={handleSave} className="bg-primary text-primary-foreground">
        Save Payment Settings
      </Button>
    </div>
  );
};

export default PaymentSettingsTab;
