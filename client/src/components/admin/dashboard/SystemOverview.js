'use client';
import { FiActivity, FiAlertTriangle, FiCheckCircle, FiClock } from 'react-icons/fi';

const systemMetrics = [
  {
    title: 'System Uptime',
    value: '99.9%',
    description: 'Last 30 days',
    icon: FiActivity,
    status: 'excellent',
    trend: 'stable'
  },
  {
    title: 'Active Issues',
    value: '2',
    description: 'Requiring attention',
    icon: FiAlertTriangle,
    status: 'warning',
    trend: 'decreasing'
  },
  {
    title: 'Completed Tasks',
    value: '1,234',
    description: 'This month',
    icon: FiCheckCircle,
    status: 'good',
    trend: 'increasing'
  },
  {
    title: 'Avg. Response Time',
    value: '2.3s',
    description: 'API responses',
    icon: FiClock,
    status: 'good',
    trend: 'stable'
  }
];

const recentActivities = [
  {
    id: 1,
    action: 'New user registration',
    user: 'John Doe',
    time: '2 minutes ago',
    type: 'user'
  },
  {
    id: 2,
    action: 'Report submitted',
    user: 'Anonymous',
    time: '5 minutes ago',
    type: 'report'
  },
  {
    id: 3,
    action: 'College added',
    user: 'Admin',
    time: '1 hour ago',
    type: 'system'
  },
  {
    id: 4,
    action: 'System backup completed',
    user: 'System',
    time: '2 hours ago',
    type: 'system'
  }
];

export default function SystemOverview() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* System Metrics */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-black mb-4">System Metrics</h2>
        <div className="space-y-4">
          {systemMetrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    metric.status === 'excellent' ? 'bg-green-100' :
                    metric.status === 'warning' ? 'bg-yellow-100' :
                    'bg-blue-100'
                  }`}>
                    <IconComponent className={`text-lg ${
                      metric.status === 'excellent' ? 'text-green-600' :
                      metric.status === 'warning' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-black">{metric.title}</h3>
                    <p className="text-sm text-gray-600">{metric.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-black">{metric.value}</p>
                  <p className={`text-xs ${
                    metric.trend === 'increasing' ? 'text-green-500' :
                    metric.trend === 'decreasing' ? 'text-red-500' :
                    'text-gray-500'
                  }`}>
                    {metric.trend}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-black mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
              <div className={`w-2 h-2 mt-2 rounded-full ${
                activity.type === 'user' ? 'bg-blue-500' :
                activity.type === 'report' ? 'bg-orange-500' :
                'bg-gray-500'
              }`}></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-black">{activity.action}</p>
                <p className="text-xs text-gray-600">by {activity.user}</p>
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}