import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, KeyRound, AlertCircle, Loader, Camera, Check } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'intern',
    profilePhotoURL: '',
    termsAccepted: false
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [mockVerificationLink, setMockVerificationLink] = useState('');
  
  const fileInputRef = useRef(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Photo size must be under 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setFormData(prev => ({
          ...prev,
          profilePhotoURL: reader.result // Save base64 string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { firstName, lastName, email, password, confirmPassword, role, termsAccepted } = formData;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!termsAccepted) {
      setError('You must accept the terms and conditions');
      return;
    }

    setError('');
    setIsSubmitting(true);

    const res = await register({
      email,
      password,
      firstName,
      lastName,
      role,
      profilePhotoURL: formData.profilePhotoURL
    });

    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg('Registration Successful! Verification instructions sent.');
      if (res.verificationLink) {
        setMockVerificationLink(res.verificationLink);
      }
      setTimeout(() => {
        navigate(role === 'admin' ? '/admin/dashboard' : '/intern/dashboard');
      }, 3000);
    } else {
      setError(res.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 font-sans relative overflow-hidden py-12 px-4">
      {/* Decorative background blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-pulse"></div>
      <div className="absolute bottom-0 right-4 w-80 h-80 bg-indigo-600 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-pulse [animation-delay:2s]"></div>

      <div className="max-w-xl w-full backdrop-blur-md bg-slate-800/80 border border-slate-700/60 p-8 rounded-2xl shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Create Account</h2>
          <p className="mt-2 text-slate-400 text-sm">
            Register to join the Intern Attendance Tracking System
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 flex flex-col gap-2 p-4 bg-success/10 border border-success/20 text-success text-sm rounded-xl">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 flex-shrink-0" />
              <span className="font-semibold">{successMsg}</span>
            </div>
            {mockVerificationLink && (
              <div className="mt-2 text-xs bg-slate-900/40 p-2 rounded border border-slate-700">
                <p className="text-slate-400 font-semibold mb-1">Local Testing Verification Link (Click to simulate email verify):</p>
                <a href={mockVerificationLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                  {mockVerificationLink}
                </a>
              </div>
            )}
            <p className="mt-2 text-slate-400 text-xs">Redirecting to your dashboard in 3 seconds...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Photo Upload */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
              <div className="w-24 h-24 rounded-full border-2 border-slate-600 bg-slate-900 flex items-center justify-center overflow-hidden hover:border-primary transition duration-200">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-slate-500 group-hover:text-primary transition" />
                )}
              </div>
              <div className="absolute bottom-0 right-0 p-1.5 bg-primary rounded-full text-white shadow-lg border border-slate-800">
                <Camera className="w-4 h-4" />
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
            />
            <span className="mt-2 text-xs text-slate-400">Upload profile photo (Max 2MB)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
                First Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="John"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
                Last Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john.doe@startup.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              </div>
            </div>
          </div>

          {/* Role selector to aid local testing */}
          <div>
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
              System Role
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer select-none transition ${formData.role === 'intern' ? 'bg-primary/10 border-primary text-primary' : 'bg-slate-900/40 border-slate-700 text-slate-400'}`}>
                <input
                  type="radio"
                  name="role"
                  value="intern"
                  checked={formData.role === 'intern'}
                  onChange={handleInputChange}
                  className="hidden"
                />
                <span className="font-semibold text-sm">Intern</span>
              </label>
              <label className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer select-none transition ${formData.role === 'admin' ? 'bg-primary/10 border-primary text-primary' : 'bg-slate-900/40 border-slate-700 text-slate-400'}`}>
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={formData.role === 'admin'}
                  onChange={handleInputChange}
                  className="hidden"
                />
                <span className="font-semibold text-sm">Admin</span>
              </label>
            </div>
          </div>

          <div>
            <label className="flex items-start text-slate-400 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleInputChange}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-primary focus:ring-primary focus:ring-offset-0 focus:ring-offset-transparent mr-2 mt-0.5 cursor-pointer"
              />
              <span>
                I agree to the{' '}
                <a href="#" className="text-primary hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary hover:underline">
                  Privacy Policy
                </a>
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white font-semibold rounded-xl shadow-lg hover:shadow-primary/30 transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Registering Account...
              </>
            ) : (
              'Register'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-700/60 text-center">
          <p className="text-slate-400 text-sm">
            Already have an account?{' '}
            <Link to="/" className="font-semibold text-primary hover:text-primary-light transition">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
