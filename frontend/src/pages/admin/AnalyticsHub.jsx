import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { Award, TrendingUp, AlertCircle, RefreshCw, ChevronRight, User } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AnalyticsHub = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedIntern, setSelectedIntern] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/analytics/overview`);
      if (res.data.success) {
        setData(res.data.data);
        if (res.data.data.internOverview.length > 0) {
          setSelectedIntern(res.data.data.internOverview[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching analytics overview:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const getBadgeColor = (badgeName) => {
    switch (badgeName) {
      case 'Top Performer': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25';
      case 'Consistent Intern': return 'bg-blue-500/10 text-blue-400 border border-blue-500/25';
      case 'Needs Mentorship': return 'bg-amber-500/10 text-amber-400 border border-amber-500/25';
      case 'At Risk': return 'bg-rose-500/10 text-rose-400 border border-rose-500/25';
      default: return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-12">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">AI Analytics & Performance Hub</h1>
            <p className="text-slate-400 mt-1">Aggregated statistics, badge assignments, and AI performance advice logs.</p>
          </div>
          <button 
            onClick={fetchAnalytics}
            className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800/80 transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-indigo-400" />
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400">Loading system performance metrics...</div>
        ) : !data || data.internOverview.length === 0 ? (
          <div className="py-20 text-center bg-slate-900 border border-slate-800 rounded-xl">
            <Award className="w-12 h-12 text-slate-750 mx-auto mb-4" />
            <p className="text-slate-400">No intern profiles registered to aggregate stats.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: Summary Stats & Intern List */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Workspace Punctuality Gauge */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md text-center">
                <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider mb-4">Workspace Punctuality</h3>
                
                {/* Custom circular SVG gauge */}
                <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="54" className="stroke-slate-800 fill-none" strokeWidth="8" />
                    <circle 
                      cx="64" cy="64" r="54" 
                      className="stroke-indigo-500 fill-none transition-all duration-1000" 
                      strokeWidth="8" 
                      strokeDasharray={2 * Math.PI * 54} 
                      strokeDashoffset={(2 * Math.PI * 54) * (1 - data.avgWorkspacePunctuality / 100)} 
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-2xl font-black">{data.avgWorkspacePunctuality}%</span>
                </div>
                
                <span className="text-xs text-slate-500 block mt-4">Average score for all active interns</span>
              </div>

              {/* Roster Selection Panel */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
                <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider mb-4">Intern Directory</h3>
                <div className="space-y-3">
                  {data.internOverview.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedIntern(item)}
                      className={`w-full p-3 rounded-lg flex items-center justify-between border text-left transition-all ${
                        selectedIntern?.id === item.id 
                          ? 'bg-indigo-650/10 border-indigo-500/50 text-white' 
                          : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-800 rounded-full border border-slate-700 overflow-hidden flex-shrink-0">
                          {item.profilePhotoURL ? (
                            <img src={item.profilePhotoURL} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-xs text-slate-400">
                              {item.name[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-sm block truncate max-w-[130px]">{item.name}</span>
                          <span className="text-[10px] text-slate-500 truncate max-w-[130px] block">{item.email}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Right: Selected Intern Performance Metrics Details (2 Columns) */}
            <div className="lg:col-span-2 space-y-6">
              
              {selectedIntern && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 shadow-xl space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>
                  
                  {/* profile head */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-850">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-slate-800 rounded-full border border-slate-700 overflow-hidden flex-shrink-0">
                        {selectedIntern.profilePhotoURL ? (
                          <img src={selectedIntern.profilePhotoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">
                            {selectedIntern.name[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-200">{selectedIntern.name}</h2>
                        <span className="text-xs text-slate-450 block">{selectedIntern.email}</span>
                      </div>
                    </div>

                    {/* Badge display */}
                    <div className="flex gap-2">
                      {selectedIntern.badges.map((badge, idx) => (
                        <span key={idx} className={`px-3 py-1 rounded-full text-xs font-bold ${getBadgeColor(badge.name)}`}>
                          🏆 {badge.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Grid details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Attendance Rating Card */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-sm text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-blue-400" /> Attendance Rating
                      </h4>

                      <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Punctuality Score</span>
                          <span className="font-bold text-white">{selectedIntern.punctuality}%</span>
                        </div>
                        {/* Custom visual progress bar */}
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000"
                            style={{ width: `${selectedIntern.punctuality}%` }}
                          ></div>
                        </div>
                        <p className="text-[10px] text-slate-500">Includes percentage of on-time clock actions today and historical records.</p>
                      </div>
                    </div>

                    {/* Projects submission details */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-sm text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-emerald-400" /> Project Completions
                      </h4>

                      <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Approved Submissions</span>
                          <span className="font-bold text-white">
                            {selectedIntern.projectsCompleted} / {selectedIntern.projectsTotal}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-1000"
                            style={{ width: `${selectedIntern.projectsTotal > 0 ? (selectedIntern.projectsCompleted / selectedIntern.projectsTotal) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <p className="text-[10px] text-slate-500">Represents total repositories approved by administrator reviewers.</p>
                      </div>
                    </div>

                  </div>

                  {/* AI Generated Recommendation block */}
                  <div className="p-5 bg-gradient-to-r from-indigo-900/10 via-purple-900/10 to-blue-900/10 border border-indigo-500/20 rounded-xl">
                    <h4 className="font-bold text-sm text-purple-400 flex items-center gap-2 mb-3">
                      <span>🤖</span> AI Performance Diagnosis & Recommendation
                    </h4>
                    <p className="text-sm text-slate-300 leading-relaxed italic">
                      "{selectedIntern.recommendation}"
                    </p>
                  </div>

                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default AnalyticsHub;
