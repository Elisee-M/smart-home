import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface SensorCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: LucideIcon;
  variant: 'temperature' | 'humidity';
}

const SensorCard = ({ title, value, unit, icon: Icon, variant }: SensorCardProps) => {
  const gradientClass = variant === 'temperature' ? 'bg-gradient-temperature' : 'bg-gradient-humidity';
  const shadowClass = 'shadow-card hover:shadow-glow';

  return (
    <Card className={`${gradientClass} ${shadowClass} transition-all duration-300 hover:scale-105 animate-slide-up border-0 p-6`}>
      <div className="flex items-center justify-between text-white">
        <div className="space-y-2">
          <p className="text-sm font-medium opacity-90">{title}</p>
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-bold">{value}</span>
            <span className="text-lg font-medium opacity-80">{unit}</span>
          </div>
        </div>
        <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </Card>
  );
};

export default SensorCard;