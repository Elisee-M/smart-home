import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { firebaseUtils } from '@/lib/firebase';
import { Droplets, AlertTriangle } from 'lucide-react';

interface WaterSensorData {
  level: number;
  status: 'NORMAL' | 'ALERT';
}

const WaterSensorStatusCard = () => {
  const [waterData, setWaterData] = useState<WaterSensorData>({ level: 0, status: 'NORMAL' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to water sensor data
    const waterRef = firebaseUtils.subscribe('Water', (data) => {
      if (data) {
        // Convert Firebase status to level for consistency
        const level = data.status === 'ALERT' ? 85 : 45;
        setWaterData({
          level,
          status: data.status || 'NORMAL'
        });
      }
      setLoading(false);
    });

    return () => {
      firebaseUtils.unsubscribe(waterRef);
    };
  }, []);

  const isAlert = waterData.status === 'ALERT' || waterData.level > 80;

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
      isAlert 
        ? 'bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-200/30 shadow-glow' 
        : 'bg-gradient-card shadow-card border-0'
    }`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-full transition-colors ${
              isAlert 
                ? 'bg-red-500/20 text-red-400' 
                : 'bg-blue-500/20 text-blue-400'
            }`}>
              {isAlert ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <Droplets className="w-6 h-6" />
              )}
            </div>
            <h3 className="text-lg font-bold text-foreground font-orbitron">Water Level</h3>
          </div>
          <Badge 
            variant={isAlert ? "destructive" : "default"}
            className="animate-pulse-gentle"
          >
            {waterData.status}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-center">
            <span className={`text-2xl font-bold transition-colors ${
              isAlert ? 'text-red-400' : 'text-blue-400'
            }`}>
              {waterData.status}
            </span>
          </div>

          {isAlert && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-200/30 rounded-lg">
              <p className="text-sm text-red-700 font-medium">
                ⚠️ Water level is above safe threshold - potential overflow risk
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Animated background effect for alerts */}
      {isAlert && (
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5 animate-pulse-gentle pointer-events-none" />
      )}
    </Card>
  );
};

export default WaterSensorStatusCard;