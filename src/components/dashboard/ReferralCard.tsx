import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface ReferralData {
  referral_code: string;
  stats: {
    activated: number;
    pending: number;
    total_bonus_days: number;
  };
}

interface ReferralCardProps {
  username: string;
}

export const ReferralCard = ({ username }: ReferralCardProps) => {
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, [username]);

  const fetchReferralData = async () => {
    try {
      const response = await fetch(
        `https://functions.poehali.dev/c2ba3181-8d0f-4bb5-b0fb-06f7770e8037?username=${username}`
      );
      const data = await response.json();
      setReferralData(data);
    } catch (error) {
      console.error('Failed to load referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReferralLink = () => {
    if (!referralData) return '';
    return `https://speedvpn.io/?ref=${referralData.referral_code}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getReferralLink());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Users" className="w-5 h-5" />
            Реферальная программа
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Icon name="Loader2" className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!referralData) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Users" className="w-5 h-5" />
          Реферальная программа
        </CardTitle>
        <CardDescription>
          Приглашайте друзей и получайте 7 дней подписки за каждого
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Ваша реферальная ссылка
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={getReferralLink()}
              className="flex-1 px-3 py-2 text-sm bg-muted rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="sm"
              className="shrink-0"
            >
              <Icon 
                name={copied ? "Check" : "Copy"} 
                className="w-4 h-4"
              />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {referralData.stats.activated}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Активных
            </div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-yellow-500">
              {referralData.stats.pending}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Ожидают
            </div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-green-500">
              {referralData.stats.total_bonus_days}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Дней бонус
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            <Icon name="Gift" className="w-4 h-4 text-primary" />
            Как это работает?
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Отправьте ссылку другу</li>
            <li>• Друг регистрируется и покупает подписку</li>
            <li>• Вы получаете +7 дней к подписке</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};