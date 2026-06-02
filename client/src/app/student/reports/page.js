'use client';
import { useState, useEffect, useCallback } from 'react';
import ReportList from '@/components/student/reports/ReportList';
import Link from 'next/link';
import { FaPlus, FaFilter, FaSearch } from 'react-icons/fa';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error("Auth token missing");
        setLoading(false);
        return;
      }

      // Backend sync URL: reports/ (Slashes are important)
      const response = await fetch('http://127.0.0.1:8000/api/student/reports/', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`, 
        }
      });

      const contentType = response.headers.get("content-type");
      
      // JSON validation to prevent "Unexpected token <"
      if (!response.ok || !contentType?.includes("application/json")) {
        const errorData = await response.text();
        console.error("API Error - Received HTML instead of JSON. Check backend URL configuration.");
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      if (data.status === "success") {
        const reportsData = data.reports || [];
        setReports(reportsData);
        setFilteredReports(reportsData);
      }
    } catch (error) {
      console.error("Network or Parsing Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Filter Logic
  useEffect(() => {
    if (filter === 'all') {
      setFilteredReports(reports);
    } else {
      setFilteredReports(reports.filter(r => r.status?.toLowerCase() === filter.toLowerCase()));
    }
  }, [filter, reports]);

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white">
            My Incident Logs
          </h1>
          <p className="text-sm font-bold text-orange-500 uppercase tracking-widest mt-1">
            Real-time tracking of your submissions
          </p>
        </div>
        
        <Link
          href="/student/reports/new"
          className="flex items-center justify-center space-x-2 bg-black dark:bg-orange-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-orange-600 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-orange-500/20"
        >
          <FaPlus />
          <span>New Report</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
          <p className="text-[10px] font-black uppercase text-gray-400">Total Filed</p>
          <p className="text-2xl font-black">{reports.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
          <p className="text-[10px] font-black uppercase text-orange-500">Active</p>
          <p className="text-2xl font-black">{reports.filter(r => r.status !== 'resolved').length}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50 dark:bg-gray-900/50 p-4 rounded-[2rem]">
        <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-700 w-full md:w-auto">
          <FaFilter className="text-gray-400 text-xs" />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-transparent text-xs font-black uppercase outline-none w-full cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Showing {filteredReports.length} results
        </p>
      </div>

      {/* Report List Display */}
      <div className="bg-white dark:bg-gray-800/50 rounded-[2.5rem] p-2 md:p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-orange-500"></div>
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Syncing database...</p>
          </div>
        ) : (
          <ReportList reports={filteredReports} />
        )}

        {!loading && filteredReports.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-gray-50 dark:bg-gray-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaSearch className="text-gray-300 text-2xl" />
            </div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">No reports found</p>
            <p className="text-xs text-gray-400 mt-1">Submit a new incident to see it here.</p>
          </div>
        )}
      </div>
    </div>
  );
}