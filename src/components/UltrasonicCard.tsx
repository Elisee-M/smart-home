import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { firebaseUtils } from '@/lib/firebase';
import { Radar, AlertTriangle, CheckCircle } from 'lucide-react';

interface UltrasonicData {
  distance: number;
  status: string;
}

const UltrasonicCard = () => {
  const [ultrasonicData, setUltrasonicData] = useState<UltrasonicData>({ distance: 0, status: 'No data' });

  useEffect(() => {
    // Subscribe to ultrasonic sensor data
    const ultrasonicRef = firebaseUtils.subscribe('Ultrasonic', (data) => {
      if (data) {
        setUltrasonicData(data);
      }
    });

    return () => {
      firebaseUtils.unsubscribe(ultrasonicRef);
    };
  }, []);

  const isAlert = ultrasonicData.distance <= 2;

  return (
    <Card className={`bg-gradient-card shadow-card border-0 p-6 animate-slide-up transition-all duration-300 ${
      isAlert ? 'ring-2 ring-destructive/50' : ''
    }`}>
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-full ${
            isAlert ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'
          }`}>
            <Radar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Ultrasonic Sensor</h3>
            <p className="text-muted-foreground">Distance monitoring</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <div className={`text-4xl font-bold ${
              isAlert ? 'text-destructive' : 'text-primary'
            }`}>
              {ultrasonicData.distance.toFixed(1)}
            </div>
            <div className="text-muted-foreground font-medium">meters</div>
          </div>

          <div className={`p-4 rounded-lg border-2 flex items-center space-x-3 ${
            isAlert 
              ? 'bg-destructive/10 border-destructive/30' 
              : 'bg-primary/10 border-primary/30'
          }`}>
            {isAlert ? (
              <AlertTriangle className="w-5 h-5 text-destructive" />
            ) : (
              <CheckCircle className="w-5 h-5 text-primary" />
            )}
            <span className={`font-medium ${
              isAlert ? 'text-destructive' : 'text-primary'
            }`}>
              {ultrasonicData.status}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default UltrasonicCard;