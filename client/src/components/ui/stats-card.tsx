interface StatsCardProps {
  title: string;
  value: string;
  icon: string;
  color?: 'blue' | 'green' | 'yellow' | 'red';
  testId?: string;
}

export default function StatsCard({ title, value, icon, color = 'blue', testId }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-primary',
    green: 'bg-green-100 text-success',
    yellow: 'bg-yellow-100 text-warning',
    red: 'bg-red-100 text-red-500'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm" data-testid={testId}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
            <i className={`fas fa-${icon}`}></i>
          </div>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500" data-testid={`${testId}-title`}>{title}</p>
          <p className="text-2xl font-bold text-gray-900" data-testid={`${testId}-value`}>{value}</p>
        </div>
      </div>
    </div>
  );
}
