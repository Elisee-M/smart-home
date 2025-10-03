import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { firebaseUtils } from '@/lib/firebase';
import { authUtils } from '@/lib/auth';
import { AlertTriangle, Clock, RefreshCw, Trash2, Droplets, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface SoilReading {
  moisture: number;
  timestamp: number;
  id: string;
}

const NotificationPanel = () => {
  const [soilHistory, setSoilHistory] = useState<SoilReading[]>([]);
  const [currentMoisture, setCurrentMoisture] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  // Get current user's role for admin check
  const authState = authUtils.loadAuthState();
  const isAdmin = authState.user?.role === 'admin';

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toUTCString();
  };

  const isSoilAlert = (moisture: number) => {
    // Alert if soil moisture is below 30% - needs watering
    return moisture < 30;
  };

  const loadSoilHistory = async () => {
    try {
      setLoading(true);
      const history = await firebaseUtils.readOnce('soilhistory');
      
      if (history) {
        const readings: SoilReading[] = Object.entries(history).map(([id, data]: [string, any]) => ({
          id,
          moisture: typeof data.soilmoisture === 'number' ? data.soilmoisture : 0,
          timestamp: Date.now() // Using current time as fallback since timestamp might not be stored
        }));
        
        // Sort by ID (newest entries typically have later IDs)
        readings.reverse();
        setSoilHistory(readings.slice(0, 50)); // Show latest 50 readings
      } else {
        setSoilHistory([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading soil moisture history:', error);
      setLoading(false);
      toast({
        title: "Error",
        description: "Failed to load notification data",
        variant: "destructive"
      });
    }
  };

  const handleDeleteHistory = async () => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can delete notification history",
        variant: "destructive"
      });
      return;
    }

    try {
      setDeleting(true);
      await firebaseUtils.write('soilhistory', null);
      setSoilHistory([]);
      toast({
        title: "Success",
        description: "All notification history has been deleted",
      });
    } catch (error) {
      console.error('Error deleting history:', error);
      toast({
        title: "Error",
        description: "Failed to delete notification history",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    loadSoilHistory();

    // Subscribe to current soil moisture data
    const soilDataRef = firebaseUtils.subscribe('soilmoisture', (data) => {
      if (data) {
        setCurrentMoisture(data.value || data.moisture || 0);
      }
    });

    // Subscribe to soil moisture history changes
    const historyRef = firebaseUtils.subscribe('soilhistory', () => {
      loadSoilHistory();
    });

    return () => {
      firebaseUtils.unsubscribe(soilDataRef);
      firebaseUtils.unsubscribe(historyRef);
    };
  }, []);

  if (loading) {
    return (
      <Card className="bg-gradient-card shadow-card border-0 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  const alertReadings = soilHistory.filter(reading => isSoilAlert(reading.moisture));

  return (
    <div className="space-y-6">
      {/* Current Status Card */}
      <Card className={`p-6 transition-all duration-300 ${isSoilAlert(currentMoisture) 
        ? 'bg-destructive/10 border-destructive/30' 
        : 'bg-primary/10 border-primary/30'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${isSoilAlert(currentMoisture) 
              ? 'bg-destructive/20 text-destructive' 
              : 'bg-primary/20 text-primary'
            }`}>
              {isSoilAlert(currentMoisture) ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <Droplets className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground font-orbitron">Smart Garden Status</h3>
              <p className="text-3xl font-bold text-foreground">{currentMoisture.toFixed(1)}%</p>
            </div>
          </div>
          <Badge variant={isSoilAlert(currentMoisture) ? "destructive" : "default"} className="text-sm">
            {isSoilAlert(currentMoisture) ? "NEEDS WATER" : "HEALTHY"}
          </Badge>
        </div>
        {isSoilAlert(currentMoisture) && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
            <p className="text-destructive font-medium">⚠️ Soil moisture is too low! Moisture is below 30% threshold - plants need watering.</p>
          </div>
        )}
      </Card>

      {/* Notifications History */}
      <Card className="bg-gradient-card shadow-card border-0 p-6">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary/20 text-primary rounded-full">
                <Droplets className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground font-orbitron">Smart Garden Notifications</h3>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <p className="text-sm">Real-time soil moisture monitoring alerts</p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={loadSoilHistory}
                variant="outline"
                size="sm"
                className="bg-card/50 border-border text-foreground hover:bg-card/80"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              
              {isAdmin && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deleting || soilHistory.length === 0}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete History
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Notification History</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete all notification history? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteHistory} disabled={deleting}>
                        {deleting ? 'Deleting...' : 'Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/30">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <span className="font-medium text-foreground">Alert Readings</span>
              </div>
              <p className="text-2xl font-bold text-destructive mt-2">{alertReadings.length}</p>
            </div>
          </div>

          {/* History List */}
          {soilHistory.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="p-4 bg-muted/20 rounded-full w-fit mx-auto">
                  <Droplets className="w-8 h-8 text-muted-foreground" />
                </div>
                <h4 className="text-lg font-medium text-muted-foreground">No Notifications</h4>
                <p className="text-sm text-muted-foreground">Soil moisture readings will appear here as they are recorded</p>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {soilHistory.map((reading) => (
                  <div
                    key={reading.id}
                    className={`p-4 rounded-lg border transition-all duration-300 ${
                      isSoilAlert(reading.moisture)
                        ? 'bg-destructive/10 border-destructive/30'
                        : 'bg-primary/10 border-primary/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          isSoilAlert(reading.moisture)
                            ? 'bg-destructive/20 text-destructive'
                            : 'bg-primary/20 text-primary'
                        }`}>
                          {isSoilAlert(reading.moisture) ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : (
                            <Droplets className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            Soil Moisture: {reading.moisture.toFixed(1)}%
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatTimestamp(reading.timestamp)}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant={isSoilAlert(reading.moisture) ? "destructive" : "default"}
                        className="text-xs"
                      >
                        {isSoilAlert(reading.moisture) ? "NEEDS WATER" : "HEALTHY"}
                      </Badge>
                    </div>
                    {isSoilAlert(reading.moisture) && (
                      <div className="mt-2 text-sm text-destructive">
                        ⚠️ Soil moisture below safe threshold (&lt; 30%) - plants need watering
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </Card>
    </div>
  );
};

export default NotificationPanel;