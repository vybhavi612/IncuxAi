import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { GitBranch, MessageSquare, AlertCircle, CheckCircle, RefreshCw, Send } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const InternProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Submit Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    githubUrl: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/projects/my`);
      if (res.data.success) {
        setProjects(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setMsg({ type: '', text: '' });

    if (!form.title || !form.description || !form.githubUrl) {
      setMsg({ type: 'error', text: 'All fields are required.' });
      setFormLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/projects`, form);
      if (res.data.success) {
        setMsg({ type: 'success', text: 'Project submitted successfully!' });
        setForm({ title: '', description: '', githubUrl: '' });
        fetchProjects();
      }
    } catch (error) {
      setMsg({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to submit. Check GitHub URL format.' 
      });
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-12">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Project Submissions</h1>
            <p className="text-slate-400 mt-1">Submit your GitHub repositories for review and receive reviewer feedback.</p>
          </div>
          <button 
            onClick={fetchProjects}
            className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800/80 transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-indigo-400" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Submit Form (Left) */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              
              <h3 className="font-bold text-lg text-slate-200 mb-6 flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-indigo-400" /> Submit Repository
              </h3>

              {msg.text && (
                <div className={`mb-6 p-4 rounded-lg flex items-start gap-2.5 text-sm border ${
                  msg.type === 'success' 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  {msg.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  )}
                  <span>{msg.text}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Project Title</label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Intern Onboarding System"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Project Description</label>
                  <textarea
                    name="description"
                    rows="3"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe core features and tools used..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm transition-colors resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">GitHub URL</label>
                  <input
                    type="text"
                    name="githubUrl"
                    value={form.githubUrl}
                    onChange={handleChange}
                    placeholder="https://github.com/username/repo-name"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm font-mono transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full mt-2 py-3 rounded-lg bg-gradient-to-r from-blue-650 to-indigo-650 hover:from-blue-600 hover:to-indigo-600 font-bold transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  {formLoading ? 'Submitting...' : 'Submit Project'}
                </button>
              </form>
            </div>
          </div>

          {/* Submissions List (Right) */}
          <div className="lg:col-span-2 space-y-6">
            
            <h3 className="font-bold text-lg text-slate-200">Submissions History</h3>

            {loading ? (
              <div className="py-12 bg-slate-900 border border-slate-800 rounded-xl text-center text-slate-400">Loading submissions...</div>
            ) : projects.length === 0 ? (
              <div className="py-20 bg-slate-900 border border-slate-800 rounded-xl text-center">
                <GitBranch className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400">No project submissions logged yet.</p>
                <p className="text-xs text-slate-500 mt-1">Complete your submission form to request your first repository code review.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project._id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md hover:border-slate-750 transition-colors">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-850">
                      <div>
                        <h4 className="font-bold text-lg text-slate-100">{project.title}</h4>
                        <a 
                          href={project.githubUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs font-mono text-indigo-400 hover:underline mt-1 inline-block"
                        >
                          {project.githubUrl}
                        </a>
                      </div>
                      
                      <div>
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                          project.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : project.status === 'rejected'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {project.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm text-slate-400 whitespace-pre-wrap">{project.description}</p>
                    </div>

                    {/* Feedback section if reviewed */}
                    {project.status !== 'pending' && (
                      <div className="mt-6 p-4 bg-slate-950 border border-slate-850 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="w-4 h-4 text-purple-400" />
                          <span className="text-xs font-bold text-slate-300">
                            Reviewer Feedback (by {project.reviewerId?.firstName || 'Admin'})
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 italic">
                          {project.feedback || 'No comments provided.'}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default InternProjects;
