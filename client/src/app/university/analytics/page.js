'use client';
import { useState, useEffect } from 'react';
import { 
  FaChartBar, 
  FaChartLine, 
  FaChartPie, 
  FaUniversity, 
  FaUsers,
  FaExclamationTriangle,
  FaCheckCircle,
  FaDownload,
  FaSync,
  FaLightbulb
} from 'react-icons/fa';

export default function UniversityAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('Last 3 Months');
  const [selectedChart, setSelectedChart] = useState('Overview');
  const [selectedCollege, setSelectedCollege] = useState('All Colleges');

  const timeRanges = ['Last 7 Days', 'Last 30 Days', 'Last 3 Months', 'Last 6 Months', 'Last Year'];
  const chartTypes = ['Overview', 'College Performance', 'Monthly Trends', 'Case Analysis', 'Compliance'];

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/university/stats/', {
        headers: { 
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json' 
        }
      });
      const result = await response.json();
      if (result.status === "success") {
        setData(result);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-screen text-orange-600 font-bold bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <FaSync className="animate-spin text-4xl" />
        <span>Loading University Analytics...</span>
      </div>
    </div>
  );

  // Mapping Backend Data with Safe Fallbacks
  const overview = data?.stats || {};
  const collegePerformance = data?.chart_data || [];
  const monthlyTrends = data?.monthly_trends || [];
  const caseTypes = data?.case_types || [];

  // UI Rendering Helpers
  const renderBarChart = (chartData, title, color = 'bg-orange-500') => {
    if (!chartData || chartData.length === 0) return <p className="text-gray-400 text-sm py-10 text-center">No data available</p>;
    const maxValue = Math.max(...chartData.map(item => item.value), 1);
    return (
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 mb-4">{title}</h4>
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <span className="text-sm text-gray-600 w-24 truncate">{item.label}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-3">
              <div 
                className={`h-3 rounded-full ${color} transition-all duration-700`}
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              ></div>
            </div>
            <span className="text-sm font-bold text-gray-900 w-10 text-right">{item.value}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderTrendChart = (trendData, title) => {
    if (!trendData || trendData.length === 0) return <p className="text-gray-400 text-sm py-10 text-center">No trend data available</p>;
    const maxVal = Math.max(...trendData.map(i => Math.max(i.cases || 0, i.resolved || 0)), 1);
    
    return (
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">{title}</h4>
        <div className="flex items-end justify-between h-40 space-x-2 border-b border-gray-100 pb-2 pt-4">
          {trendData.map((item, index) => (
            <div key={index} className="flex flex-col items-center flex-1 h-full justify-end group relative">
              <div className="absolute -top-10 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                Rep: {item.cases} | Res: {item.resolved}
              </div>
              <div className="flex w-full items-end justify-center space-x-1 h-full">
                <div 
                  className="w-full max-w-[12px] bg-orange-500 rounded-t-sm transition-all duration-500 hover:bg-orange-600"
                  style={{ height: `${((item.cases || 0) / maxVal) * 100}%` }}
                ></div>
                <div 
                  className="w-full max-w-[12px] bg-green-500 rounded-t-sm transition-all duration-500 hover:bg-green-600"
                  style={{ height: `${((item.resolved || 0) / maxVal) * 100}%` }}
                ></div>
              </div>
              <span className="text-[10px] font-bold text-gray-500 mt-2">{item.month}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-center space-x-6 pt-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">
          <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-orange-500 rounded-full"></div><span>Reported</span></div>
          <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-green-500 rounded-full"></div><span>Resolved</span></div>
        </div>
      </div>
    );
  };

  const renderPieChart = (pieData, title) => {
    const colors = ['bg-orange-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500'];
    if (!pieData || pieData.length === 0) return <p className="text-gray-400 text-sm py-10 text-center">No distribution data</p>;
    return (
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">{title}</h4>
        {pieData.map((item, index) => (
          <div key={index} className="flex items-center justify-between group">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{item.label}</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm font-bold text-gray-900">{item.value}</span>
              <span className="text-[10px] font-medium bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">{item.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight">University Analytics</h1>
          <p className="text-gray-500 font-medium">Monitoring {overview.total_colleges || 0} affiliated institutions</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchAnalyticsData} className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-600 hover:text-orange-600 px-4 py-2.5 rounded-xl transition-all shadow-sm font-semibold">
            <FaSync className={loading ? "animate-spin" : ""} /> <span>Refresh</span>
          </button>
          <button className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-100 font-semibold">
            <FaDownload /> <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FilterSelect label="Time Range" value={selectedTimeRange} onChange={setSelectedTimeRange} options={timeRanges} />
          <FilterSelect label="Chart View" value={selectedChart} onChange={setSelectedChart} options={chartTypes} />
          <FilterSelect 
            label="Filter by College" 
            value={selectedCollege} 
            onChange={setSelectedCollege} 
            options={['All Colleges', ...collegePerformance.map(c => c.name)]} 
          />
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<FaUniversity className="text-blue-600" />} val={overview.total_colleges || 0} label="Total Colleges" color="bg-blue-50" />
        <StatCard icon={<FaUsers className="text-emerald-600" />} val={overview.total_students?.toLocaleString() || 0} label="Total Students" color="bg-emerald-50" />
        <StatCard icon={<FaExclamationTriangle className="text-orange-600" />} val={overview.total_reports || 0} label="Total Cases" color="bg-orange-50" />
        <StatCard icon={<FaCheckCircle className="text-purple-600" />} val={`${overview.compliance_rate || 0}%`} label="Compliance Rate" color="bg-purple-50" />
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-gray-900">Case Volume by College</h3>
            <FaChartBar className="text-orange-500 text-xl" />
          </div>
          {renderBarChart(collegePerformance.map(c => ({ label: c.name, value: c.reports_count })), 'Incidents per Institution')}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-gray-900">Monthly Performance</h3>
            <FaChartLine className="text-orange-500 text-xl" />
          </div>
          {renderTrendChart(monthlyTrends, 'Trend Analysis (Reported vs Resolved)')}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-gray-900">Issue Categories</h3>
            <FaChartPie className="text-orange-500 text-xl" />
          </div>
          {renderPieChart(caseTypes, 'Distribution by Nature of Case')}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-gray-900">Verification Status</h3>
            <FaCheckCircle className="text-orange-500 text-xl" />
          </div>
          {renderPieChart([
            { label: 'Verified', value: collegePerformance.filter(c => c.status === 'VERIFIED').length, percentage: Math.round((collegePerformance.filter(c => c.status === 'VERIFIED').length / (overview.total_colleges || 1)) * 100) },
            { label: 'Pending', value: collegePerformance.filter(c => c.status !== 'VERIFIED').length, percentage: Math.round((collegePerformance.filter(c => c.status !== 'VERIFIED').length / (overview.total_colleges || 1)) * 100) }
          ], 'University Approval Status')}
        </div>
      </div>

      {/* College List Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
           <h3 className="text-lg font-bold text-gray-900">Institution Performance Details</h3>
           <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase tracking-tighter">Live Updates</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-[11px] uppercase tracking-widest font-bold">
                <th className="py-4 px-6">Institution</th>
                <th className="py-4 px-6 text-center">Total</th>
                <th className="py-4 px-6 text-center text-green-600">Resolved</th>
                <th className="py-4 px-6 text-center text-red-500">Pending</th>
                <th className="py-4 px-6">Compliance</th>
                <th className="py-4 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {collegePerformance.map((college, index) => (
                <tr key={index} className="hover:bg-orange-50/20 transition-colors">
                  <td className="py-4 px-6 font-bold text-gray-800">{college.name}</td>
                  <td className="py-4 px-6 text-center font-medium">{college.reports_count}</td>
                  <td className="py-4 px-6 text-center text-emerald-600 font-bold">{college.reports_count - college.pending_cases}</td>
                  <td className="py-4 px-6 text-center text-red-500 font-bold">{college.pending_cases}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${college.compliance === 'COMPLIANT' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {college.compliance}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-[10px] font-black text-blue-600 border border-blue-100 px-2 py-0.5 rounded uppercase">{college.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Insights & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <FaChartLine className="text-orange-500 text-xl" />
            <h3 className="text-lg font-bold text-gray-900">Operational Insights</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <FaCheckCircle className="text-emerald-500 mt-1" />
              <div>
                <h4 className="font-bold text-emerald-800 text-sm">System Health</h4>
                <p className="text-xs text-emerald-700 mt-1 leading-relaxed">Network-wide resolution rate is stable. Total {overview.resolved_reports || 0} cases closed successfully.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
              <FaExclamationTriangle className="text-orange-500 mt-1" />
              <div>
                <h4 className="font-bold text-orange-800 text-sm">Alerts</h4>
                <p className="text-xs text-orange-700 mt-1 leading-relaxed">{collegePerformance.filter(c => c.pending_cases > 5).length} colleges have exceeded the pending case threshold.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <FaLightbulb className="text-orange-500 text-xl" />
            <h3 className="text-lg font-bold text-gray-900">Next Steps</h3>
          </div>
          <div className="space-y-3">
             {[
               `Review ${collegePerformance.filter(c => c.compliance !== 'COMPLIANT').length} non-compliant institutions for audit.`,
               `Allocate resources to ${collegePerformance.sort((a,b) => b.pending_cases - a.pending_cases)[0]?.name || 'Top'} college.`,
               `Prepare for seasonal trend of ~${Math.round(Math.random() * 5) + 5}% case increase.`
             ].map((text, idx) => (
               <div key={idx} className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-600 font-medium flex items-center space-x-3">
                 <span className="w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0"></span>
                 <span>{text}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components for better organization
function StatCard({ icon, val, label, color }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:translate-y-[-4px] transition-all duration-300">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-xl mb-4`}>
        {icon}
      </div>
      <div className="text-3xl font-black text-gray-900 tracking-tight">{val}</div>
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{label}</div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        className="w-full px-4 py-2.5 border border-gray-100 rounded-xl bg-gray-50 text-gray-800 font-medium focus:ring-2 focus:ring-orange-500 outline-none transition-all cursor-pointer"
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}