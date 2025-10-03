import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { firebaseUtils } from '@/lib/firebase';
import { Sprout, AlertTriangle } from 'lucide-react';

interface SoilMoistureData {
  value: number;
  status: 'DRY' | 'MOIST' | 'WET';
}

const SmartGardenCard = () => {
  const [soilData, setSoilData] = useState<SoilMoistureData>({ value: 0, status: 'MOIST' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to soil moisture data
    const soilRef = firebaseUtils.subscribe('soilmoisture', (data) => {
      console.log('SmartGardenCard - soilmoisture data received:', data);
      console.log('SmartGardenCard - data type:', typeof data);
      
      if (data !== null && data !== undefined) {
        // Handle both direct number and object formats
        const value = typeof data === 'number' 
          ? data 
          : (data.value || data.moisture || 0);
        
        console.log('SmartGardenCard - parsed value:', value);
        
        // Determine status based on value
        let status: 'DRY' | 'MOIST' | 'WET' = 'MOIST';
        if (value < 30) status = 'DRY';
        else if (value > 70) status = 'WET';
        
        console.log('SmartGardenCard - status:', status);
        
        setSoilData({
          value,
          status
        });
      }
      setLoading(false);
    });

    return () => {
      firebaseUtils.unsubscribe(soilRef);
    };
  }, []);

  const isDry = soilData.status === 'DRY' || soilData.value < 30;

  if (loading) {
    return (
      <Card className="bg-gradient-card shadow-card border-0 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/2"></div>
          <div className="h-16 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 ${
      isDry 
        ? 'bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border-orange-200/30 shadow-glow' 
        : 'bg-gradient-card shadow-card border-0'
    }`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-full transition-colors ${
              isDry 
                ? 'bg-orange-500/20 text-orange-400' 
                : 'bg-green-500/20 text-green-400'
            }`}>
              {isDry ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <Sprout className="w-6 h-6" />
              )}
            </div>
            <h3 className="text-lg font-bold text-foreground font-orbitron">Smart Garden</h3>
          </div>
          <Badge 
            variant={isDry ? "destructive" : "default"}
            className="animate-pulse-gentle"
          >
            {soilData.status}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-center">
            <span className={`text-2xl font-bold transition-colors ${
              isDry ? 'text-orange-400' : 'text-green-400'
            }`}>
              {soilData.value}%
            </span>
          </div>

          {isDry && (
            <div className="mt-3 p-3 bg-orange-500/10 border border-orange-200/30 rounded-lg">
              <p className="text-sm text-orange-700 font-medium">
                ⚠️ Soil moisture is low - plants may need watering
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Animated background effect for dry soil */}
      {isDry && (
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-yellow-500/5 animate-pulse-gentle pointer-events-none" />
      )}
    </Card>
  );
};

export default SmartGardenCard;
