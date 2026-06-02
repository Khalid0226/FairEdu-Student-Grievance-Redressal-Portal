'use client';
import { useState } from 'react';
import { FiSearch, FiFilter, FiAlertTriangle, FiCheckCircle, FiClock, FiEye } from 'react-icons/fi';

const reportsData = [
  {
    id: 'AR-2024-00123',
    title: 'Verbal harassment in library',
    student: 'Anonymous',
    college: 'Demo College',
    type: 'Verbal Abuse',
    date: '2024-01-15',
    status: 'under_review',
    severity: 'medium',
    assignedTo: 'Anti-Ragging Committee'
  },
  {
    id: 'AR-2024-00119',
    title: 'Physical intimidation incident',
    student: 'Anonymous',
    college: 'Tech College',
    type: 'Physical Harassment',
    date: '2024-01-12',
    status: 'resolved',
    severity: 'high',
    assignedTo: 'College Security'
  },
  {
    id: 'AR-2024-00115',
    title: 'Cyber bullying case',
    student: 'Anonymous',
    college: 'Demo College',
    type: 'Cyber Bullying',
    date: '2024-01-10',
    status: 'in_progress',
    severity: 'medium',
    assignedTo: 'IT Committee'
  }
];

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  under_review: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-orange-100 text-orange-800',
  resolved: 'bg-green-100 text-green-800'
};

const severityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
};

export default function AdminReportsPage() {
  const [reports] = useState(reportsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [collegeFilter, setCollegeFilter] = useState('all');

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.college.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesCollege = collegeFilter === 'all' || report.college === collegeFilter;
    
    return matchesSearch && matchesStatus && matchesCollege;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-black">All Reports</h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage all incident reports across the platform
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Reports
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="search"
                placeholder="Search by title, report ID, or college..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <FiAlertTriangle className="text-orange-500 w-5 h-5" />
                  <h3 className="font-semibold text-black">{report.title}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {report.college} • {new Date(report.date).toLocaleDateString()}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[report.status]}`}>
                    {report.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severityColors[report.severity]}`}>
                    {report.severity.charAt(0).toUpperCase() + report.severity.slice(1)} Severity
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {report.type}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-2">ID: {report.id}</p>
                <button className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">
                  <FiEye className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Assigned to: <span className="font-medium text-black">{report.assignedTo}</span>
              </div>
              <div className="text-sm text-gray-500">
                Student: {report.student}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <FiAlertTriangle className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-black mb-2">No reports found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-black">{reports.length}</div>
          <div className="text-sm text-gray-600">Total Reports</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-500">{reports.filter(r => r.status === 'under_review' || r.status === 'in_progress').length}</div>
          <div className="text-sm text-gray-600">Active Cases</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-500">{reports.filter(r => r.status === 'resolved').length}</div>
          <div className="text-sm text-gray-600">Resolved</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-500">{reports.filter(r => r.severity === 'high' || r.severity === 'critical').length}</div>
          <div className="text-sm text-gray-600">High Priority</div>
        </div>
      </div>
    </div>
  );
}