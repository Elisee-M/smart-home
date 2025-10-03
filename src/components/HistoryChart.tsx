import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { firebaseUtils } from '@/lib/firebase';
import { Clock, TrendingUp, Trash2, RefreshCw, Thermometer, Droplets, Radar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface DHTData {
  Temperature: number;
  Humidity: number;
  timestamp: number;
  formattedTime: string;
  formattedDate: string;
}

interface UltrasonicData {
  distance: number;
  timestamp: number;
  formattedTime: string;
  formattedDate: string;
}

interface CombinedHistoryData {
  timestamp: number;
  formattedTime: string;
  formattedDate: string;
  Temperature?: number;
  Humidity?: number;
}

interface CurrentData {
  Temperature: number;
  Humidity: number;
}

const HistoryChart = () => {
  const [historyData, setHistoryData] = useState<CombinedHistoryData[]>([]);
  const [currentData, setCurrentData] = useState<CurrentData>({ Temperature: 0, Humidity: 0 });
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const formatTimestamp = (timestamp: number) => {
    // Convert to local timezone
    const date = new Date(timestamp);
    return {
      formattedTime: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }),
      formattedDate: date.toLocaleDateString('en-US', {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      })
    };
  };

  const loadHistoryData = async () => {
    try {
      setLoading(true);
      
      // Load DHT history from Firebase
      const dhtHistory = await firebaseUtils.readOnce('DHT11/history');

      const combinedData = new Map<number, CombinedHistoryData>();

      // Process DHT data - keys are timestamps
      if (dhtHistory) {
        Object.entries(dhtHistory).forEach(([timestamp, item]: [string, any]) => {
          const timestampNum = parseInt(timestamp) * 1000; // Convert to milliseconds
          const { formattedTime, formattedDate } = formatTimestamp(timestampNum);
          combinedData.set(timestampNum, {
            timestamp: timestampNum,
            formattedTime,
            formattedDate,
            Temperature: item.Temperature,
            Humidity: item.Humidity
          });
        });
      }

      // Convert to array and sort
      const historyArray = Array.from(combinedData.values());
      historyArray.sort((a, b) => a.timestamp - b.timestamp);
      setHistoryData(historyArray.slice(-100));
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading history:', error);
      setLoading(false);
      toast({
        title: "Error",
        description: "Failed to load history data",
        variant: "destructive"
      });
    }
  };

  const handleDeleteHistory = async () => {
    try {
      setDeleting(true);
      await firebaseUtils.write('DHT11/history', null);
      setHistoryData([]);
      toast({
        title: "Success",
        description: "All history data has been deleted",
      });
    } catch (error) {
      console.error('Error deleting history:', error);
      toast({
        title: "Error",
        description: "Failed to delete history data",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    loadHistoryData();

    // Subscribe to current DHT data for real-time updates
    const dhtDataRef = firebaseUtils.subscribe('DHT11', (data) => {
      if (data) {
        setCurrentData({ Temperature: data.Temperature, Humidity: data.Humidity });
      }
    });

    // Subscribe to history changes for real-time chart updates
    const dhtHistoryRef = firebaseUtils.subscribe('DHT11/history', () => {
      loadHistoryData(); // Reload all data when history changes
    });

    return () => {
      firebaseUtils.unsubscribe(dhtDataRef);
      firebaseUtils.unsubscribe(dhtHistoryRef);
    };
  }, []);

  if (loading) {
    return (
      <Card className="bg-gradient-card shadow-card border-0 p-4 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Data Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-200/30 p-4 sm:p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-500/20 text-orange-600 rounded-full">
              <Thermometer className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-lg font-bold text-orange-600">Temperature</h3>
              <p className="text-xl sm:text-2xl font-bold text-orange-700">{currentData.Temperature}°C</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-200/30 p-4 sm:p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-500/20 text-blue-600 rounded-full">
              <Droplets className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-lg font-bold text-blue-600">Humidity</h3>
              <p className="text-xl sm:text-2xl font-bold text-blue-700">{currentData.Humidity}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* History Chart */}
      <Card className="bg-gradient-card shadow-card border-0 p-4 sm:p-6 animate-slide-up">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-600 rounded-full">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground">Sensor History</h3>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <p className="text-sm">Real-time sensor data trends</p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={loadHistoryData}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/30 text-foreground hover:bg-white/20"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deleting || historyData.length === 0}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete History
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete History Data</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete all history data? This action cannot be undone.
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
            </div>
          </div>

          {historyData.length === 0 ? (
            <div className="h-80 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="p-4 bg-muted/20 rounded-full w-fit mx-auto">
                  <TrendingUp className="w-8 h-8 text-muted-foreground" />
                </div>
                <h4 className="text-lg font-medium text-muted-foreground">No History Data</h4>
                <p className="text-sm text-muted-foreground">Data will appear here once sensors start recording</p>
              </div>
            </div>
          ) : (
            <div className="h-80 sm:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="formattedTime" 
                    className="text-muted-foreground text-xs"
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    className="text-muted-foreground text-xs" 
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))',
                      fontSize: '12px'
                    }}
                    labelFormatter={(value, payload) => {
                      if (payload && payload.length > 0) {
                        const data = payload[0].payload as CombinedHistoryData;
                        return `${data.formattedDate} at ${value}`;
                      }
                      return value;
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ 
                      fontSize: '12px',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Temperature" 
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, stroke: '#ef4444', strokeWidth: 2, fill: '#ef4444' }}
                    name="Temperature (°C)"
                    connectNulls={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Humidity" 
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2, fill: '#3b82f6' }}
                    name="Humidity (%)"
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Summary Stats */}
          {historyData.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {historyData.some(d => d.Temperature !== undefined) && (
                <>
                  <div className="bg-orange-500/10 p-3 sm:p-4 rounded-lg border border-orange-200/30">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-xs sm:text-sm font-medium text-foreground">Avg Temp</span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      {(historyData.filter(d => d.Temperature !== undefined).reduce((sum, d) => sum + (d.Temperature || 0), 0) / historyData.filter(d => d.Temperature !== undefined).length).toFixed(1)}°C
                    </p>
                  </div>
                  <div className="bg-red-500/10 p-3 sm:p-4 rounded-lg border border-red-200/30">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-xs sm:text-sm font-medium text-foreground">Max Temp</span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      {Math.max(...historyData.filter(d => d.Temperature !== undefined).map(d => d.Temperature || 0)).toFixed(1)}°C
                    </p>
                  </div>
                </>
              )}
              {historyData.some(d => d.Humidity !== undefined) && (
                <>
                  <div className="bg-blue-500/10 p-3 sm:p-4 rounded-lg border border-blue-200/30">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-xs sm:text-sm font-medium text-foreground">Avg Humidity</span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      {(historyData.filter(d => d.Humidity !== undefined).reduce((sum, d) => sum + (d.Humidity || 0), 0) / historyData.filter(d => d.Humidity !== undefined).length).toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-cyan-500/10 p-3 sm:p-4 rounded-lg border border-cyan-200/30">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                      <span className="text-xs sm:text-sm font-medium text-foreground">Max Humidity</span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      {Math.max(...historyData.filter(d => d.Humidity !== undefined).map(d => d.Humidity || 0)).toFixed(1)}%
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default HistoryChart;
