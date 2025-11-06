import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

interface RemnawaveSettingsCardProps {
  apiUrl: string;
  apiTokenMasked: string;
  functionUrl: string;
  squadUuids: string;
  trafficLimitGb: string;
  trafficStrategy: string;
  editMode: boolean;
  editedApiUrl?: string;
  editedApiToken?: string;
  editedFunctionUrl?: string;
  editedSquadUuids?: string;
  editedTrafficLimit?: string;
  editedTrafficStrategy?: string;
  testing: boolean;
  testResult: any;
  onEditApiUrl: (value: string) => void;
  onEditApiToken: (value: string) => void;
  onEditFunctionUrl: (value: string) => void;
  onEditSquadUuids: (value: string) => void;
  onEditTrafficLimit: (value: string) => void;
  onEditTrafficStrategy: (value: string) => void;
  onTest: () => void;
}

export function RemnawaveSettingsCard({
  apiUrl,
  apiTokenMasked,
  functionUrl,
  squadUuids,
  trafficLimitGb,
  trafficStrategy,
  editMode,
  editedApiUrl,
  editedApiToken,
  editedFunctionUrl,
  editedSquadUuids,
  editedTrafficLimit,
  editedTrafficStrategy,
  testing,
  testResult,
  onEditApiUrl,
  onEditApiToken,
  onEditFunctionUrl,
  onEditSquadUuids,
  onEditTrafficLimit,
  onEditTrafficStrategy,
  onTest
}: RemnawaveSettingsCardProps) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Icon name="Shield" size={24} />
          Remnawave (VPN Панель)
        </CardTitle>
        <CardDescription>
          Подключение к панели управления VPN
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-gray-300">API URL</Label>
          <Input
            type="text"
            value={editedApiUrl !== undefined ? editedApiUrl : apiUrl}
            onChange={(e) => onEditApiUrl(e.target.value)}
            readOnly={!editMode}
            className="bg-zinc-800 border-zinc-700 text-gray-300 font-mono text-sm mt-2"
          />
        </div>
        
        <div>
          <Label className="text-gray-300">API Token</Label>
          <div className="flex gap-2 mt-2">
            <Input
              type={editMode ? "text" : "password"}
              value={editedApiToken !== undefined ? editedApiToken : apiTokenMasked}
              onChange={(e) => onEditApiToken(e.target.value)}
              readOnly={!editMode}
              placeholder={editMode ? "Введите новый токен или оставьте пустым" : ""}
              className="bg-zinc-800 border-zinc-700 text-gray-300 font-mono text-sm"
            />
            {!editMode && (
              <Button
                onClick={onTest}
                disabled={testing}
                variant="outline"
                className="border-cyan-600 text-cyan-400 hover:bg-cyan-600/10"
              >
                {testing ? (
                  <Icon name="Loader2" className="animate-spin" size={20} />
                ) : (
                  <Icon name="TestTube" size={20} />
                )}
              </Button>
            )}
          </div>
        </div>
        
        <Separator className="bg-zinc-800" />
        
        <div>
          <Label className="text-gray-300">Function URL</Label>
          <Input
            type="text"
            value={editedFunctionUrl !== undefined ? editedFunctionUrl : functionUrl}
            onChange={(e) => onEditFunctionUrl(e.target.value)}
            readOnly={!editMode}
            className="bg-zinc-800 border-zinc-700 text-gray-300 font-mono text-sm mt-2"
          />
        </div>
        
        <div>
          <Label className="text-gray-300">Squad UUIDs</Label>
          <Input
            type="text"
            value={editedSquadUuids !== undefined ? editedSquadUuids : squadUuids}
            onChange={(e) => onEditSquadUuids(e.target.value)}
            readOnly={!editMode}
            className="bg-zinc-800 border-zinc-700 text-gray-300 font-mono text-sm mt-2"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-300">Лимит трафика (GB)</Label>
            <Input
              type="text"
              value={editedTrafficLimit !== undefined ? editedTrafficLimit : trafficLimitGb}
              onChange={(e) => onEditTrafficLimit(e.target.value)}
              readOnly={!editMode}
              className="bg-zinc-800 border-zinc-700 text-gray-300 font-mono text-sm mt-2"
            />
          </div>
          <div>
            <Label className="text-gray-300">Стратегия сброса</Label>
            <Input
              type="text"
              value={editedTrafficStrategy !== undefined ? editedTrafficStrategy : trafficStrategy}
              onChange={(e) => onEditTrafficStrategy(e.target.value)}
              readOnly={!editMode}
              className="bg-zinc-800 border-zinc-700 text-gray-300 font-mono text-sm mt-2"
            />
          </div>
        </div>
        
        {testResult && (
          <div className={`p-3 rounded-lg border ${
            testResult.success 
              ? 'bg-green-500/10 border-green-500/50 text-green-400' 
              : 'bg-red-500/10 border-red-500/50 text-red-400'
          }`}>
            <div className="flex items-start gap-2">
              <Icon 
                name={testResult.success ? 'CheckCircle' : 'XCircle'} 
                size={20} 
                className="mt-0.5"
              />
              <div>
                <p className="font-medium">{testResult.message}</p>
                {testResult.api_url && (
                  <p className="text-sm opacity-80 mt-1">{testResult.api_url}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
