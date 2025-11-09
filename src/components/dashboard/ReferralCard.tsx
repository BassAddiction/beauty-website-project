import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import API_ENDPOINTS from '@/config/api';

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
        `${API_ENDPOINTS.REFERRAL}?username=${username}`
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

        <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg border border-purple-200 dark:border-purple-800">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            <Icon name="Gift" className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            Как это работает?
          </h4>
          <ul className="text-sm text-purple-900 dark:text-purple-100 space-y-1">
            <li>🎁 Вы получаете <strong>+7 дней</strong> за каждого приглашённого</li>
            <li>🎁 Друг получает <strong>+7 дней</strong> к своей подписке</li>
            <li>✨ Оба выигрывают от реферальной программы!</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};