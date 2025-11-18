import { StatCard } from '../StatCard';
import { MessageSquare } from 'lucide-react';

export default function StatCardExample() {
  return (
    <div className="p-6 max-w-xs">
      <StatCard
        title="Total Messages"
        value="2,847"
        icon={MessageSquare}
        trend={{ value: "+12% from last month", isPositive: true }}
      />
    </div>
  );
}
