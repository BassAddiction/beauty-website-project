import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface EmailSettingsCardProps {
  resendApiKeyMasked: string;
  unisenderApiKeyMasked: string;
  editMode: boolean;
  editedResendKey?: string;
  editedUnisenderKey?: string;
  onEditResendKey: (value: string) => void;
  onEditUnisenderKey: (value: string) => void;
}

export function EmailSettingsCard({
  resendApiKeyMasked,
  unisenderApiKeyMasked,
  editMode,
  editedResendKey,
  editedUnisenderKey,
  onEditResendKey,
  onEditUnisenderKey
}: EmailSettingsCardProps) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Icon name="Mail" size={24} />
          Email сервисы
        </CardTitle>
        <CardDescription>
          Настройки отправки email уведомлений
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-gray-300">Resend API Key</Label>
          <Input
            type={editMode ? "text" : "password"}
            value={editedResendKey !== undefined ? editedResendKey : resendApiKeyMasked}
            onChange={(e) => onEditResendKey(e.target.value)}
            readOnly={!editMode}
            placeholder={editMode ? "Введите новый ключ или оставьте пустым" : ""}
            className="bg-zinc-800 border-zinc-700 text-gray-300 font-mono text-sm mt-2"
          />
        </div>
        
        <div>
          <Label className="text-gray-300">Unisender API Key</Label>
          <Input
            type={editMode ? "text" : "password"}
            value={editedUnisenderKey !== undefined ? editedUnisenderKey : unisenderApiKeyMasked}
            onChange={(e) => onEditUnisenderKey(e.target.value)}
            readOnly={!editMode}
            placeholder={editMode ? "Введите новый ключ или оставьте пустым" : ""}
            className="bg-zinc-800 border-zinc-700 text-gray-300 font-mono text-sm mt-2"
          />
        </div>
      </CardContent>
    </Card>
  );
}
