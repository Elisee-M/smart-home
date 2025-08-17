import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { firebaseUtils } from '@/lib/firebase';
import { Car, CarFront, CheckCircle, AlertCircle } from 'lucide-react';

interface ParkingSlotData {
  occupied: boolean;
  timestamp?: number;
}

interface ParkingSlotCardProps {
  slotNumber: 1 | 2;
}

const ParkingSlotCard = ({ slotNumber }: ParkingSlotCardProps) => {
  const [slotData, setSlotData] = useState<ParkingSlotData>({ occupied: false });

  useEffect(() => {
    // Subscribe to parking slot data
    const slotRef = firebaseUtils.subscribe(`parking/slot${slotNumber}`, (data) => {
      if (data) {
        setSlotData(data);
      }
    });

    return () => {
      firebaseUtils.unsubscribe(slotRef);
    };
  }, [slotNumber]);

  const isOccupied = slotData.occupied;

  return (
    <Card className={`bg-gradient-card shadow-card border-0 p-6 animate-slide-up transition-all duration-300 ${
      isOccupied ? 'ring-2 ring-destructive/50' : 'ring-2 ring-green-500/50'
    }`}>
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-full ${
            isOccupied ? 'bg-destructive/20 text-destructive' : 'bg-green-500/20 text-green-600'
          }`}>
            <CarFront className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground font-orbitron tracking-wide">Parking Slot {slotNumber}</h3>
            <p className="text-muted-foreground font-space">Vehicle detection</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <div className={`text-6xl ${
              isOccupied ? 'text-destructive' : 'text-green-600'
            } float-animation`}>
              <Car className="w-16 h-16 mx-auto" />
            </div>
            <div className={`text-2xl font-bold mt-2 font-orbitron tracking-wider ${
              isOccupied ? 'text-destructive' : 'text-green-600'
            }`}>
              {isOccupied ? 'OCCUPIED' : 'AVAILABLE'}
            </div>
          </div>

          <div className={`p-4 rounded-lg border-2 flex items-center space-x-3 ${
            isOccupied 
              ? 'bg-destructive/10 border-destructive/30' 
              : 'bg-green-500/10 border-green-500/30'
          }`}>
            {isOccupied ? (
              <AlertCircle className="w-5 h-5 text-destructive" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-600" />
            )}
            <span className={`font-medium font-space ${
              isOccupied ? 'text-destructive' : 'text-green-600'
            }`}>
              {isOccupied ? 'Slot is occupied' : 'Slot is available'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ParkingSlotCard;