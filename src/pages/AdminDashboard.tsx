import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { authUtils, AuthState } from '@/lib/auth';
import { firebaseUtils } from '@/lib/firebase';
import { AdminSidebar } from '@/components/AdminSidebar';
import SensorCard from '@/components/SensorCard';
import LightControl from '@/components/LightControl';
import ChangePasswordForm from '@/components/ChangePasswordForm';
import AddUserForm from '@/components/AddUserForm';
import UsersTable from '@/components/UsersTable';
import HistoryChart from '@/components/HistoryChart';
import ParkingSlotCard from '@/components/ParkingSlotCard';
import NotificationPanel from '@/components/NotificationPanel';
import WaterSensorStatusCard from '@/components/WaterSensorStatusCard';
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
  const [activeTab, setActiveTab] = useState('dashboard');
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
      if (data) {
        setSensorData(data);
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
    <>
      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <SidebarProvider defaultOpen={false}>
          <div className="min-h-screen bg-gradient-hero w-full flex">
            <AdminSidebar 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
              userName={authState.user?.name}
            />
            
            <div className="flex-1 flex flex-col min-h-screen">
              {/* Mobile Header */}
              <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 shadow-card">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-3">
                      <SidebarTrigger className="text-white hover:bg-white/20" />
                      <div>
                        <h1 className="text-xl font-bold text-white font-orbitron tracking-wide">Smart Home Admin</h1>
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
                        className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Logout</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </header>

              {/* Mobile Main Content */}
              <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-auto">
                {activeTab === 'dashboard' && (
                  <div className="space-y-8">
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
                        <WaterSensorStatusCard />
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
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <NotificationPanel />
                )}

                {activeTab === 'password' && authState.userKey && (
                  <ChangePasswordForm userKey={authState.userKey} />
                )}

                {activeTab === 'add-user' && (
                  <AddUserForm onUserAdded={handleUserAdded} />
                )}

                {activeTab === 'admin-management' && (
                  <UsersTable refreshTrigger={refreshUsers} />
                )}

                {activeTab === 'history' && (
                  <HistoryChart />
                )}
              </main>

              {/* Mobile Footer */}
              <footer className="bg-white/5 backdrop-blur-sm border-t border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                  <p className="text-center text-white/60">Smart Home IoT Project</p>
                </div>
              </footer>
            </div>
          </div>
        </SidebarProvider>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block min-h-screen bg-gradient-hero">
          {/* Header */}
          <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 shadow-card">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-3">
                  <div>
                    <h1 className="text-xl font-bold text-white font-orbitron tracking-wide">Smart Home Admin</h1>
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-accent animate-pulse" />
                      <p className="text-sm text-white/80 font-space">Welcome, {authState.user?.name}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Desktop Navigation Tabs - Hidden on Mobile */}
          <div className="hidden md:block bg-white/10 backdrop-blur-lg border-b border-white/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex space-x-1 py-2">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: Home },
                  { id: 'notifications', label: 'Notifications', icon: Bell },
                  { id: 'password', label: 'Change Password', icon: Settings },
                  { id: 'add-user', label: 'Add New User', icon: UserPlus },
                  { id: 'admin-management', label: 'Admin Management', icon: Users },
                  { id: 'history', label: 'History', icon: TrendingUp },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white text-gray-900'
                        : 'text-white hover:bg-white/20'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-auto">{activeTab === 'dashboard' && (
              <div className="space-y-8">
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
                    <WaterSensorStatusCard />
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
              </div>
            )}

            {activeTab === 'notifications' && (
              <NotificationPanel />
            )}

            {activeTab === 'password' && authState.userKey && (
              <ChangePasswordForm userKey={authState.userKey} />
            )}

            {activeTab === 'add-user' && (
              <AddUserForm onUserAdded={handleUserAdded} />
            )}

            {activeTab === 'admin-management' && (
              <UsersTable refreshTrigger={refreshUsers} />
            )}

            {activeTab === 'history' && (
              <HistoryChart />
            )}
          </main>

          {/* Desktop Footer */}
          <footer className="bg-white/5 backdrop-blur-sm border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <p className="text-center text-white/60">Smart Home IoT Project</p>
            </div>
          </footer>
        </div>
      </>
    );
};

export default AdminDashboard;