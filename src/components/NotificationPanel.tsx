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

interface WaterReading {
  level: number;
  timestamp: number;
  id: string;
}

const NotificationPanel = () => {
  const [waterHistory, setWaterHistory] = useState<WaterReading[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(0);
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

  const isWaterAlert = (level: number) => {
    // Alert if water level is above 80% - potential overflow
    return level > 80;
  };

  const loadWaterHistory = async () => {
    try {
      setLoading(true);
      const history = await firebaseUtils.readOnce('history/Water');
      
      if (history) {
        const readings: WaterReading[] = Object.entries(history).map(([id, data]: [string, any]) => ({
          id,
          level: data.level,
          timestamp: data.timestamp
        }));
        
        // Sort by timestamp (newest first)
        readings.sort((a, b) => b.timestamp - a.timestamp);
        setWaterHistory(readings.slice(0, 50)); // Show latest 50 readings
      } else {
        setWaterHistory([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading water sensor history:', error);
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
      await firebaseUtils.write('history/Water', null);
      setWaterHistory([]);
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
    loadWaterHistory();

    // Subscribe to current water sensor data
    const waterDataRef = firebaseUtils.subscribe('Water', (data) => {
      if (data) {
        setCurrentLevel(data.status === 'ALERT' ? 85 : 45); // Mock level based on status
      }
    });

    // Subscribe to water sensor history changes
    const historyRef = firebaseUtils.subscribe('history/Water', () => {
      loadWaterHistory();
    });

    return () => {
      firebaseUtils.unsubscribe(waterDataRef);
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

  const alertReadings = waterHistory.filter(reading => isWaterAlert(reading.level));

  return (
    <div className="space-y-6">
      {/* Current Status Card */}
      <Card className={`p-6 ${isWaterAlert(currentLevel) 
        ? 'bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-200/30' 
        : 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-200/30'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${isWaterAlert(currentLevel) 
              ? 'bg-red-500/20 text-red-600' 
              : 'bg-blue-500/20 text-blue-600'
            }`}>
              {isWaterAlert(currentLevel) ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <Droplets className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Current Water Level</h3>
              <p className="text-3xl font-bold">{currentLevel.toFixed(1)}%</p>
            </div>
          </div>
          <Badge variant={isWaterAlert(currentLevel) ? "destructive" : "default"} className="text-sm">
            {isWaterAlert(currentLevel) ? "ALERT" : "NORMAL"}
          </Badge>
        </div>
        {isWaterAlert(currentLevel) && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-200/30 rounded-lg">
            <p className="text-red-700 font-medium">⚠️ Water level is too high! Level is above 80% threshold - potential overflow risk.</p>
          </div>
        )}
      </Card>

      {/* Notifications History */}
      <Card className="bg-gradient-card shadow-card border-0 p-6">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-600 rounded-full">
                <Droplets className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Water Level Notifications</h3>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <p className="text-sm">Real-time water level monitoring alerts</p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={loadWaterHistory}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/30 text-foreground hover:bg-white/20"
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
                      disabled={deleting || waterHistory.length === 0}
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
            <div className="bg-red-500/10 p-4 rounded-lg border border-red-200/30">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className="font-medium text-foreground">Alert Readings</span>
              </div>
              <p className="text-2xl font-bold text-red-600 mt-2">{alertReadings.length}</p>
            </div>
          </div>

          {/* History List */}
          {waterHistory.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="p-4 bg-muted/20 rounded-full w-fit mx-auto">
                  <Droplets className="w-8 h-8 text-muted-foreground" />
                </div>
                <h4 className="text-lg font-medium text-muted-foreground">No Notifications</h4>
                <p className="text-sm text-muted-foreground">Water level readings will appear here as they are recorded</p>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {waterHistory.map((reading) => (
                  <div
                    key={reading.id}
                    className={`p-4 rounded-lg border ${
                      isWaterAlert(reading.level)
                        ? 'bg-red-500/10 border-red-200/30'
                        : 'bg-blue-500/10 border-blue-200/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          isWaterAlert(reading.level)
                            ? 'bg-red-500/20 text-red-600'
                            : 'bg-blue-500/20 text-blue-600'
                        }`}>
                          {isWaterAlert(reading.level) ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : (
                            <Droplets className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            Water Level: {reading.level.toFixed(1)}%
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatTimestamp(reading.timestamp)}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant={isWaterAlert(reading.level) ? "destructive" : "default"}
                        className="text-xs"
                      >
                        {isWaterAlert(reading.level) ? "ALERT" : "NORMAL"}
                      </Badge>
                    </div>
                    {isWaterAlert(reading.level) && (
                      <div className="mt-2 text-sm text-red-700">
                        ⚠️ Water level exceeds safe threshold (&gt; 80%) - overflow risk
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