import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';

interface Location {
  location_id: number;
  name: string;
  country_code: string;
  flag: string;
  price_per_day: number;
  traffic_gb_per_day: number;
  is_active: boolean;
  sort_order: number;
}

interface SelectedLocation extends Location {
  days: number;
}

const SubscriptionBuilder = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<SelectedLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const LOCATIONS_API = 'https://functions.poehali.dev/3271c5a0-f0f4-42e8-b230-c35b772c0024';

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    setLoading(true);
    try {
      const response = await fetch(LOCATIONS_API);
      if (response.ok) {
        const data = await response.json();
        setLocations(data.locations || []);
      }
    } catch (error) {
      toast({
        title: '❌ Ошибка загрузки',
        description: 'Не удалось загрузить список локаций',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleLocation = (location: Location) => {
    const exists = selectedLocations.find(l => l.location_id === location.location_id);
    
    if (exists) {
      setSelectedLocations(selectedLocations.filter(l => l.location_id !== location.location_id));
    } else {
      setSelectedLocations([...selectedLocations, { ...location, days: 30 }]);
    }
  };

  const updateDays = (locationId: number, days: number) => {
    setSelectedLocations(
      selectedLocations.map(l => 
        l.location_id === locationId ? { ...l, days } : l
      )
    );
  };

  const calculateTotal = () => {
    return selectedLocations.reduce((sum, loc) => 
      sum + (loc.price_per_day * loc.days), 0
    );
  };

  const calculateTotalTraffic = () => {
    return selectedLocations.reduce((sum, loc) => 
      sum + (loc.traffic_gb_per_day * loc.days), 0
    );
  };

  const handleCheckout = () => {
    if (selectedLocations.length === 0) {
      toast({
        title: '⚠️ Выберите локации',
        description: 'Добавьте хотя бы одну страну в подписку',
        variant: 'destructive'
      });
      return;
    }

    navigate('/payment', { 
      state: { 
        customPlan: {
          name: 'Собранная подписка',
          price: calculateTotal(),
          days: Math.max(...selectedLocations.map(l => l.days)),
          traffic: calculateTotalTraffic(),
          locations: selectedLocations
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Конструктор подписки</h1>
            <p className="text-xl text-muted-foreground">
              Соберите свою подписку из отдельных локаций
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Доступные локации</CardTitle>
                  <CardDescription>
                    Выберите страны и укажите количество дней для каждой
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Загрузка...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {locations.map(location => {
                        const selected = selectedLocations.find(l => l.location_id === location.location_id);
                        
                        return (
                          <div 
                            key={location.location_id}
                            className={`border rounded-lg p-4 transition-all ${
                              selected ? 'border-primary bg-primary/5' : 'border-border'
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <Checkbox
                                checked={!!selected}
                                onCheckedChange={() => toggleLocation(location)}
                              />
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-2xl">{location.flag}</span>
                                  <h3 className="font-semibold text-lg">{location.name}</h3>
                                  <Badge variant="outline" className="ml-auto">
                                    {location.price_per_day}₽/день
                                  </Badge>
                                </div>
                                
                                <p className="text-sm text-muted-foreground mb-3">
                                  {location.traffic_gb_per_day} ГБ трафика в день
                                </p>

                                {selected && (
                                  <div className="flex items-center gap-4">
                                    <label className="text-sm font-medium">Дней:</label>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => updateDays(location.location_id, Math.max(1, selected.days - 1))}
                                      >
                                        <Icon name="Minus" className="w-4 h-4" />
                                      </Button>
                                      <input
                                        type="number"
                                        min="1"
                                        max="365"
                                        value={selected.days}
                                        onChange={(e) => updateDays(location.location_id, parseInt(e.target.value) || 1)}
                                        className="w-20 px-3 py-1 text-center border rounded-md"
                                      />
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => updateDays(location.location_id, Math.min(365, selected.days + 1))}
                                      >
                                        <Icon name="Plus" className="w-4 h-4" />
                                      </Button>
                                    </div>
                                    <span className="text-sm font-semibold ml-auto">
                                      = {(selected.price_per_day * selected.days).toFixed(0)}₽
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Итого</CardTitle>
                  <CardDescription>
                    {selectedLocations.length} {selectedLocations.length === 1 ? 'локация' : 'локаций'} выбрано
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedLocations.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Выберите локации
                    </p>
                  ) : (
                    <>
                      <div className="space-y-2">
                        {selectedLocations.map(loc => (
                          <div key={loc.location_id} className="flex items-center justify-between text-sm">
                            <span>
                              {loc.flag} {loc.name}
                            </span>
                            <span className="font-medium">
                              {loc.days} дн. × {loc.price_per_day}₽
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Трафик:</span>
                          <span className="font-medium">{calculateTotalTraffic()} ГБ</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold">
                          <span>Итого:</span>
                          <span>{calculateTotal()}₽</span>
                        </div>
                      </div>

                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={handleCheckout}
                      >
                        <Icon name="ShoppingCart" className="w-4 h-4 mr-2" />
                        Оформить подписку
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionBuilder;
