'use client';
import { useState } from 'react';
import { 
  FiBarChart2, 
  FiUsers, 
  FiFileText, 
  FiTrendingUp,
  FiPieChart,
  FiActivity,
  FiCalendar
} from 'react-icons/fi';

const analyticsData = {
  overview: {
    totalReports: 156,
    resolvedReports: 120,
    activeUsers: 1234,
    avgResolutionTime: '2.3 days'
  },
  trends: [
    { month: 'Jan', reports: 45, resolved: 38 },
    { month: 'Feb', reports: 52, resolved: 45 },
    { month: 'Mar', reports: 48, resolved: 42 },
    { month: 'Apr', reports: 61, resolved: 55 },
    { month: 'May', reports: 56, resolved: 50 },
    { month: 'Jun', reports: 65, resolved: 58 }
  ],
  categories: [
    { name: 'Verbal Abuse', count: 45, percentage: 28.8 },
    { name: 'Physical Harassment', count: 32, percentage: 20.5 },
    { name: 'Cyber Bullying', count: 28, percentage: 17.9 },
    { name: 'Mental Harassment', count: 25, percentage: 16.0 },
    { name: 'Other', count: 26, percentage: 16.7 }
  ],
  colleges: [
    { name: 'Demo College', reports: 45, resolved: 40 },
    { name: 'Tech College', reports: 38, resolved: 35 },
    { name: 'Medical College', reports: 32, resolved: 28 },
    { name: 'Arts College', reports: 25, resolved: 22 },
    { name: 'Science College', reports: 16, resolved: 15 }
  ]
};

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('6months');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-black">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive platform analytics and insights
          </p>
        </div>
        <select 
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="1year">Last Year</option>
        </select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
          <FiBarChart2 className="text-3xl text-orange-500 mx-auto mb-3" />
          <div className="text-2xl font-bold text-black">{analyticsData.overview.totalReports}</div>
          <div className="text-sm text-gray-600">Total Reports</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
          <FiTrendingUp className="text-3xl text-green-500 mx-auto mb-3" />
          <div className="text-2xl font-bold text-black">{analyticsData.overview.resolvedReports}</div>
          <div className="text-sm text-gray-600">Resolved</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
          <FiUsers className="text-3xl text-blue-500 mx-auto mb-3" />
          <div className="text-2xl font-bold text-black">{analyticsData.overview.activeUsers}</div>
          <div className="text-sm text-gray-600">Active Users</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
          <FiActivity className="text-3xl text-purple-500 mx-auto mb-3" />
          <div className="text-2xl font-bold text-black">{analyticsData.overview.avgResolutionTime}</div>
          <div className="text-sm text-gray-600">Avg. Resolution</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reports Trend */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-black">Reports Trend</h2>
            <FiBarChart2 className="text-orange-500" />
          </div>
          <div className="space-y-4">
            {analyticsData.trends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-black">{trend.month}</span>
                <div className="flex-1 mx-4">
                  <div className="flex space-x-1">
                    <div 
                      className="h-6 bg-orange-500 rounded-l"
                      style={{ width: `${(trend.reports / 65) * 100}%` }}
                    ></div>
                    <div 
                      className="h-6 bg-green-500 rounded-r"
                      style={{ width: `${(trend.resolved / 65) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <div className="text-black">{trend.reports} reports</div>
                  <div className="text-green-600">{trend.resolved} resolved</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Incident Categories */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-black">Incident Categories</h2>
            <FiPieChart className="text-orange-500" />
          </div>
          <div className="space-y-3">
            {analyticsData.categories.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-black">{category.name}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {category.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* College Performance */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-black">College Performance</h2>
            <FiUsers className="text-orange-500" />
          </div>
          <div className="space-y-4">
            {analyticsData.colleges.map((college, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <span className="font-medium text-black">{college.name}</span>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm text-black">{college.reports} reports</div>
                    <div className="text-xs text-green-600">{college.resolved} resolved</div>
                  </div>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(college.resolved / college.reports) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12">
                    {Math.round((college.resolved / college.reports) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
          <h3 className="font-semibold text-orange-800 mb-2">Highest Reports</h3>
          <p className="text-2xl font-bold text-orange-800">Demo College</p>
          <p className="text-sm text-orange-600">45 reports this period</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h3 className="font-semibold text-green-800 mb-2">Best Resolution</h3>
          <p className="text-2xl font-bold text-green-800">Tech College</p>
          <p className="text-sm text-green-600">92% resolution rate</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-800 mb-2">Fastest Response</h3>
          <p className="text-2xl font-bold text-blue-800">Medical College</p>
          <p className="text-sm text-blue-600">1.2 days average</p>
        </div>
      </div>
    </div>
  );
}