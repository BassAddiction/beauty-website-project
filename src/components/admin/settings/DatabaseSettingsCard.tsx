import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface DatabaseSettingsCardProps {
  databaseUrl: string;
  editMode: boolean;
  editedValue?: string;
  testing: boolean;
  testResult: any;
  onEdit: (value: string) => void;
  onTest: () => void;
}

export function DatabaseSettingsCard({
  databaseUrl,
  editMode,
  editedValue,
  testing,
  testResult,
  onEdit,
  onTest
}: DatabaseSettingsCardProps) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Icon name="Database" size={24} />
          База данных PostgreSQL
        </CardTitle>
        <CardDescription>
          Подключение к базе данных проекта
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-gray-300">DATABASE_URL</Label>
          <div className="flex gap-2 mt-2">
            <Input
              type={editMode ? "text" : "password"}
              value={editedValue !== undefined ? editedValue : databaseUrl}
              onChange={(e) => onEdit(e.target.value)}
              readOnly={!editMode}
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
                {testResult.version && (
                  <p className="text-sm opacity-80 mt-1">{testResult.version}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
