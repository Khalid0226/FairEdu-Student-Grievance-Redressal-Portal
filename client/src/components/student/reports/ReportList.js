'use client';
import { useState, useEffect } from 'react';
import ReportCard from './ReportCard';

const statusFilters = [
  { value: 'all', label: 'All Reports' },
  { value: 'pending', label: 'Pending' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' }
];

const severityFilters = [
  { value: 'all', label: 'All Severity' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' }
];

export default function ReportList() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://127.0.0.1:8000/api/student/reports/', {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          }
        });

        const data = await response.json();
        if (data.status === "success") {
          setReports(data.reports);
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const filteredReports = reports.filter(report => {
    const reportStatus = report.status?.toLowerCase() || 'pending';
    const matchesStatus = statusFilter === 'all' || reportStatus === statusFilter.toLowerCase();
    const matchesSeverity = severityFilter === 'all' || report.severity?.toLowerCase() === severityFilter.toLowerCase();
    const searchStr = searchTerm.toLowerCase();
    const matchesSearch = 
      report.incident_type?.toLowerCase().includes(searchStr) ||
      report.description?.toLowerCase().includes(searchStr) ||
      report.location?.toLowerCase().includes(searchStr);
    
    return matchesStatus && matchesSeverity && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const getActiveCount = () => reports.filter(r => {
    const s = r.status?.toLowerCase();
    return ['pending', 'investigating', 'under_review', 'in_progress'].includes(s);
  }).length;

  const getResolvedCount = () => reports.filter(r => r.status?.toLowerCase() === 'resolved').length;

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Reports</label>
            <input
              type="text"
              placeholder="Search by type, description, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {statusFilters.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Severity</label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {severityFilters.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No reports found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReports.map((report, index) => (
            /* 🆕 index + 1 pass kiya taaki gap na aaye */
            <ReportCard 
              key={report.id} 
              report={report} 
              displayId={filteredReports.length - index} 
            />
          ))}
        </div>
      )}

      {/* Stats Section */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{reports.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Reports</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-500">{getActiveCount()}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Cases</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-500">{getResolvedCount()}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Resolved</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-500">
              {reports.length > 0 ? Math.round((getResolvedCount() / reports.length) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Resolution Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}