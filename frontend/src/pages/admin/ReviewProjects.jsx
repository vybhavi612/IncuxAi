import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import socket from '../../services/socket';
import { GitPullRequest, Check, XCircle, RefreshCw, MessageSquare, ExternalLink, Calendar } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ReviewProjects = () => {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'reviewed'
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review states map for feedback textarea
  const [feedbacks, setFeedbacks] = useState({});
  const [submitStates, setSubmitStates] = useState({});

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/projects`);
      if (res.data.success) {
        setProjects(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching admin projects list:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();

    // Socket live sync
    socket.on('project_update', (data) => {
      console.log('Project update socket event:', data);
      fetchProjects();
    });

    return () => {
      socket.off('project_update');
    };
  }, []);

  const handleFeedbackChange = (id, text) => {
    setFeedbacks(prev => ({
      ...prev,
      [id]: text
    }));
  };

  const submitReview = async (id, status) => {
    setSubmitStates(prev => ({ ...prev, [id]: true }));
    const feedback = feedbacks[id] || '';

    try {
      const res = await axios.put(`${API_URL}/projects/${id}/review`, {
        status,
        feedback
      });

      if (res.data.success) {
        // Clear locally stored input
        setFeedbacks(prev => {
          const c = { ...prev };
          delete c[id];
          return c;
        });
        fetchProjects();
      }
    } catch (error) {
      console.error('Error submitting code review:', error.message);
      alert(error.response?.data?.message || 'Code review submission failed.');
    } finally {
      setSubmitStates(prev => ({ ...prev, [id]: false }));
    }
  };

  const pendingList = projects.filter(p => p.status === 'pending');
  const reviewedList = projects.filter(p => p.status !== 'pending');

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-12">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Code Submission Reviews</h1>
            <p className="text-slate-400 mt-1">Audit pull requests, check GitHub layouts, and submit grading approvals.</p>
          </div>
          <button 
            onClick={fetchProjects}
            className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800/80 transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-indigo-400" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b border-slate-800 mb-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-4 px-2 font-bold text-sm transition-all relative ${
              activeTab === 'pending' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Pending Review ({pendingList.length})
            {activeTab === 'pending' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500"></span>}
          </button>
          <button
            onClick={() => setActiveTab('reviewed')}
            className={`pb-4 px-2 font-bold text-sm transition-all relative ${
              activeTab === 'reviewed' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Reviewed History ({reviewedList.length})
            {activeTab === 'reviewed' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500"></span>}
          </button>
        </div>

        {/* Content Listings */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">Syncing repository reviews...</div>
        ) : activeTab === 'pending' ? (
          // Pending submissions tab
          pendingList.length === 0 ? (
            <div className="py-20 text-center bg-slate-900 border border-slate-800 rounded-xl">
              <GitPullRequest className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400">All submissions have been reviewed!</p>
              <p className="text-xs text-slate-500 mt-1">New code requests will appear here dynamically via Socket.io.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingList.map((project) => {
                const intern = project.internId;
                const isSubmitting = submitStates[project._id];
                return (
                  <div key={project._id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
                    
                    {/* Top layout */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-850">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-850 rounded-full border border-slate-700 overflow-hidden flex-shrink-0">
                          {intern?.profilePhotoURL ? (
                            <img src={intern.profilePhotoURL} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">
                              {intern?.firstName?.[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-200 block">
                            {intern?.firstName} {intern?.lastName}
                          </span>
                          <span className="text-xs text-slate-450">{intern?.email}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <a 
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-mono"
                        >
                          {project.githubUrl} <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <span className="text-[10px] text-slate-500 mt-1">
                          Submitted: {new Date(project.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mt-4">
                      <h4 className="font-bold text-sm text-slate-350">Submission: {project.title}</h4>
                      <p className="text-sm text-slate-400 mt-2 whitespace-pre-wrap">{project.description}</p>
                    </div>

                    {/* Admin grading actions */}
                    <div className="mt-6 pt-6 border-t border-slate-850 space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Review Feedback</label>
                        <textarea
                          rows="2"
                          value={feedbacks[project._id] || ''}
                          onChange={(e) => handleFeedbackChange(project._id, e.target.value)}
                          placeholder="Provide grading notes, review approvals, or instructions for rework..."
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none transition-colors"
                        ></textarea>
                      </div>

                      <div className="flex justify-end gap-3">
                        <button
                          disabled={isSubmitting}
                          onClick={() => submitReview(project._id, 'rejected')}
                          className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-semibold rounded-lg text-sm transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" /> Reject Code
                        </button>
                        <button
                          disabled={isSubmitting}
                          onClick={() => submitReview(project._id, 'approved')}
                          className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-sm shadow-md transition-colors disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" /> Approve Repository
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )
        ) : (
          // Reviewed submissions tab
          reviewedList.length === 0 ? (
            <div className="py-20 text-center bg-slate-900 border border-slate-800 rounded-xl">
              <Check className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400">No reviewed projects in history.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviewedList.map((project) => {
                const intern = project.internId;
                return (
                  <div key={project._id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md hover:border-slate-750 transition-colors">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-850">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-800 rounded-full border border-slate-700 overflow-hidden flex-shrink-0">
                          {intern?.profilePhotoURL ? (
                            <img src={intern.profilePhotoURL} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 text-xs">
                              {intern?.firstName?.[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-200 block text-sm">
                            {intern?.firstName} {intern?.lastName}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                          project.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {project.status.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {new Date(project.reviewedAt || project.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <h4 className="font-semibold text-slate-200 text-sm">Title: {project.title}</h4>
                      <p className="text-xs text-slate-400 font-mono truncate mt-1">{project.githubUrl}</p>
                    </div>

                    {/* Feedback output block */}
                    <div className="mt-4 p-3 bg-slate-950 border border-slate-850 rounded-lg">
                      <div className="flex items-center gap-2 mb-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Reviewer Comments (by {project.reviewerId?.firstName || 'Admin'})
                        </span>
                      </div>
                      <p className="text-xs text-slate-350 italic">
                        {project.feedback || 'No reviewer notes provided.'}
                      </p>
                    </div>

                  </div>
                );
              })}
            </div>
          )
        )}

      </div>
    </div>
  );
};

export default ReviewProjects;
