import { useState, useEffect } from 'react';
import { Lightbulb, LightbulbOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { firebaseUtils } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

const LightControl = () => {
  const [lightStatus, setLightStatus] = useState<string>('OFF');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Subscribe to light status changes
    const lightRef = firebaseUtils.subscribe('LightStatus', (status) => {
      setLightStatus(status || 'OFF');
    });

    return () => {
      firebaseUtils.unsubscribe(lightRef);
    };
  }, []);

  const toggleLight = async (newStatus: 'ON' | 'OFF') => {
    setLoading(true);
    try {
      await firebaseUtils.write('LightStatus', newStatus);
      toast({
        title: "Light Control",
        description: `Light turned ${newStatus.toLowerCase()}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to control light",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-card shadow-card border-0 p-6 animate-slide-up">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-foreground">Light Control</h3>
            <p className="text-muted-foreground">Current Status: 
              <span className={`ml-2 font-semibold ${lightStatus === 'ON' ? 'text-lightOn' : 'text-lightOff'}`}>
                {lightStatus}
              </span>
            </p>
          </div>
          <div className={`p-3 rounded-full ${lightStatus === 'ON' ? 'bg-lightOn/20 text-lightOn' : 'bg-muted text-muted-foreground'}`}>
            {lightStatus === 'ON' ? <Lightbulb className="w-8 h-8" /> : <LightbulbOff className="w-8 h-8" />}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => toggleLight('ON')}
            disabled={loading || lightStatus === 'ON'}
            className={`h-16 text-lg font-bold transition-all duration-300 ${
              lightStatus === 'ON' 
                ? 'bg-lightOn text-white shadow-button' 
                : 'bg-lightOn/20 text-lightOn border-2 border-lightOn hover:bg-lightOn hover:text-white'
            } animate-bounce-light`}
          >
            <Lightbulb className="w-6 h-6 mr-2" />
            ON
          </Button>
          
          <Button
            onClick={() => toggleLight('OFF')}
            disabled={loading || lightStatus === 'OFF'}
            className={`h-16 text-lg font-bold transition-all duration-300 ${
              lightStatus === 'OFF'
                ? 'bg-lightOff text-white shadow-button'
                : 'bg-lightOff/20 text-lightOff border-2 border-lightOff hover:bg-lightOff hover:text-white'
            } animate-bounce-light`}
          >
            <LightbulbOff className="w-6 h-6 mr-2" />
            OFF
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default LightControl;