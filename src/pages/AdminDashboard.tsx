import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authUtils, AuthState } from '@/lib/auth';
import { firebaseUtils } from '@/lib/firebase';
import SensorCard from '@/components/SensorCard';
import LightControl from '@/components/LightControl';
import ChangePasswordForm from '@/components/ChangePasswordForm';
import AddUserForm from '@/components/AddUserForm';
import UsersTable from '@/components/UsersTable';
import HistoryChart from '@/components/HistoryChart';
import ParkingSlotCard from '@/components/ParkingSlotCard';
import NotificationPanel from '@/components/NotificationPanel';
import SmartGardenCard from '@/components/SmartGardenCard';
import { Thermometer, Droplets, LogOut, Home, Shield, Settings, UserPlus, Users, TrendingUp, Bell, Menu, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SensorData {
  Temperature: number;
  Humidity: number;
}

const AdminDashboard = () => {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [sensorData, setSensorData] = useState<SensorData>({ Temperature: 0, Humidity: 0 });
  const [refreshUsers, setRefreshUsers] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const auth = authUtils.loadAuthState();
    setAuthState(auth);

    if (!auth.isAuthenticated || auth.user?.role !== 'admin') {
      navigate('/login');
      return;
    }

    // Subscribe to DHT11 sensor data
    const sensorRef = firebaseUtils.subscribe('DHT11', (data) => {
      console.log('AdminDashboard - DHT11 data received:', data);
      if (data) {
        console.log('AdminDashboard - Temperature:', data.Temperature, 'Humidity:', data.Humidity);
        setSensorData({
          Temperature: data.Temperature || 0,
          Humidity: data.Humidity || 0
        });
      }
    });

    return () => {
      firebaseUtils.unsubscribe(sensorRef);
    };
  }, [navigate]);

  const handleLogout = () => {
    authUtils.clearAuthState();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    navigate('/login');
  };

  const handleUserAdded = () => {
    setRefreshUsers(prev => prev + 1);
  };

  if (!authState?.isAuthenticated || authState.user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 shadow-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-full">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white font-orbitron tracking-wide">SmartNest Admin</h1>
                <div className="flex items-center space-x-2 hidden sm:flex">
                  <Shield className="w-4 h-4 text-accent animate-pulse" />
                  <p className="text-sm text-white/80 font-space">Welcome, {authState.user?.name}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 hidden sm:flex"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
              <Button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                variant="outline"
                size="icon"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 sm:hidden"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-white/95 backdrop-blur-lg border-b border-white/20 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full bg-white/10 border-white/30 text-gray-800 hover:bg-white/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white/10 backdrop-blur-sm border-white/20 hidden sm:grid">
            <TabsTrigger value="dashboard" className="text-white data-[state=active]:text-foreground data-[state=active]:bg-white">
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-white data-[state=active]:text-foreground data-[state=active]:bg-white">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="password" className="text-white data-[state=active]:text-foreground data-[state=active]:bg-white">
              <Settings className="w-4 h-4 mr-2" />
              Change Password
            </TabsTrigger>
            <TabsTrigger value="add-user" className="text-white data-[state=active]:text-foreground data-[state=active]:bg-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Add New User
            </TabsTrigger>
            <TabsTrigger value="admin-management" className="text-white data-[state=active]:text-foreground data-[state=active]:bg-white">
              <Users className="w-4 h-4 mr-2" />
              Admin Management
            </TabsTrigger>
            <TabsTrigger value="history" className="text-white data-[state=active]:text-foreground data-[state=active]:bg-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>
          
          {/* Mobile Navigation Tabs */}
          <div className="sm:hidden">
            <TabsList className="flex flex-col w-full bg-white/10 backdrop-blur-sm border-white/20 space-y-2 p-2">
              <TabsTrigger value="dashboard" className="w-full text-white data-[state=active]:text-foreground data-[state=active]:bg-white">
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="notifications" className="w-full text-white data-[state=active]:text-foreground data-[state=active]:bg-white">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="password" className="w-full text-white data-[state=active]:text-foreground data-[state=active]:bg-white">
                <Settings className="w-4 h-4 mr-2" />
                Change Password
              </TabsTrigger>
              <TabsTrigger value="add-user" className="w-full text-white data-[state=active]:text-foreground data-[state=active]:bg-white">
                <UserPlus className="w-4 h-4 mr-2" />
                Add New User
              </TabsTrigger>
              <TabsTrigger value="admin-management" className="w-full text-white data-[state=active]:text-foreground data-[state=active]:bg-white">
                <Users className="w-4 h-4 mr-2" />
                Admin Management
              </TabsTrigger>
              <TabsTrigger value="history" className="w-full text-white data-[state=active]:text-foreground data-[state=active]:bg-white">
                <TrendingUp className="w-4 h-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="space-y-8">
            <section className="animate-fade-in-right">
              <h2 className="text-2xl font-bold text-white mb-6 font-orbitron gradient-text">Sensor Data</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SensorCard
                  title="Temperature"
                  value={sensorData.Temperature}
                  unit="°C"
                  icon={Thermometer}
                  variant="temperature"
                />
                <SensorCard
                  title="Humidity"
                  value={sensorData.Humidity}
                  unit="%"
                  icon={Droplets}
                  variant="humidity"
                />
                <SmartGardenCard />
              </div>
            </section>

            <section className="animate-fade-in-left">
              <h2 className="text-2xl font-bold text-white mb-6 font-orbitron gradient-text">Smart Parking</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="animate-scale-in" style={{animationDelay: '0.1s'}}>
                  <ParkingSlotCard slotNumber={1} />
                </div>
                <div className="animate-scale-in" style={{animationDelay: '0.2s'}}>
                  <ParkingSlotCard slotNumber={2} />
                </div>
              </div>
            </section>

            <section className="animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-6 font-orbitron gradient-text">Light Control</h2>
              <div className="animate-scale-in" style={{animationDelay: '0.3s'}}>
                <LightControl />
              </div>
            </section>
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationPanel />
          </TabsContent>

          <TabsContent value="password">
            {authState.userKey && (
              <ChangePasswordForm userKey={authState.userKey} />
            )}
          </TabsContent>

          <TabsContent value="add-user">
            <AddUserForm onUserAdded={handleUserAdded} />
          </TabsContent>

          <TabsContent value="admin-management">
            <UsersTable refreshTrigger={refreshUsers} />
          </TabsContent>

          <TabsContent value="history">
            <HistoryChart />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white/5 backdrop-blur-sm border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-white/60">SmartNest IoT Project</p>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;