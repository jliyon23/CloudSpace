import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../axiosInstance';
import useAuthStore from '../store/authStore';

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alertType, setAlertType] = useState(null); // 'success' or 'error'
  const [showAlert, setShowAlert] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  
  const navigate = useNavigate();

  useEffect(() => {
    logout();
  }, []);

  // Handle alert display and timeout
  useEffect(() => {
    let alertTimer;
    if (showAlert) {
      alertTimer = setTimeout(() => {
        setShowAlert(false);
      }, 5000); // Show alert for 5 seconds
    }
    return () => clearTimeout(alertTimer);
  }, [showAlert]);

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!username || !email || !password) {
      setMessage('Please fill in all fields');
      setAlertType('error');
      setShowAlert(true);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', { username, email, password });
      console.log(response.data);
      setMessage(response.data.message || 'Account created successfully! Redirecting...');
      setAlertType('success');
      setShowAlert(true);
      
      // Delay navigation to show success message
      setTimeout(() => {
        navigate('/verify', { state: { email } });
      }, 2000);
    } catch (error) {
      console.error(error.message);
      setMessage(error.response?.data?.message || 'Error signing up');
      setAlertType('error');
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 min-h-screen flex flex-col justify-center items-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-white text-5xl font-extrabold tracking-tight">
          Cloud <span className="text-slate-300 bg-clip-text bg-gradient-to-r from-slate-300 to-slate-500">Space</span>
        </h1>
        <p className="text-slate-400 mt-2">cloud storage solution</p>
      </div>
      
      <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700/50 overflow-hidden">
        <div className="p-8">
          <h2 className="text-2xl text-white font-bold mb-6 flex items-center">
            <span className="mr-2">Create Account</span>
            <div className="h-px flex-grow bg-gradient-to-r from-slate-700 to-transparent ml-2"></div>
          </h2>
          
          {/* Alert notification */}
          {showAlert && (
            <div 
              className={`mb-6 p-4 rounded-md border ${
                alertType === 'success' 
                  ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              } transition-all duration-300 flex items-center`}
            >
              <div className="mr-3">
                {alertType === 'success' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <p className="text-sm">{message}</p>
            </div>
          )}
          
          <form className="space-y-5" onSubmit={handleSignup}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-400 mb-1">Username</label>
              <input
                id="username"
                type="text"
                placeholder="Username"
                className="p-3 rounded-md border border-slate-600 text-slate-200 bg-zinc-800/70 w-full focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-400 mb-1">Email</label>
              <input
                id="email"
                type="email" 
                placeholder="Email"
                className="p-3 rounded-md border border-slate-600 text-slate-200 bg-zinc-800/70 w-full focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-400 mb-1">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Password"
                className="p-3 rounded-md border border-slate-600 text-slate-200 bg-zinc-800/70 w-full focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-white to-slate-300 w-full py-3 px-4 text-black font-medium rounded-md hover:from-slate-100 hover:to-slate-200 transform hover:translate-y-px transition-all duration-200 shadow-md flex justify-center mt-6"
            >
              {isLoading ? 'Creating Account...' : 'SIGN UP'}
            </button>
            
            <div className="text-center pt-2">
              <p className="text-slate-400 text-sm">
                Already have an account?{' '}
                <a className="text-slate-300 hover:text-white font-medium transition-colors" href="/login">
                  Login here
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
      
      <div className="mt-8 text-slate-500 text-xs text-center">
        &copy; {new Date().getFullYear()} Cloud Space. All rights reserved.
      </div>
    </div>
  );
};

export default SignupPage;