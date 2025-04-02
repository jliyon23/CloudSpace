import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../axiosInstance'
import useAuthStore from '../store/authStore';
import { 
  CloudUpload, 
  PackageOpen, 
  Server, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Check, 
  X, 
  Info,
  SaveIcon
} from "lucide-react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState('cloudinary');
  const [preferredPlatform, setPreferredPlatform] = useState('cloudinary');
  const [credentials, setCredentials] = useState({
    cloudinary: {
      cloud_name: '',
      api_key: '',
      api_secret: ''
    },
    dropbox: {
      access_token: ''
    },
    mega: {
      email: '',
      password: ''
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingPreference, setIsUpdatingPreference] = useState(false);
  const [showSecrets, setShowSecrets] = useState({
    cloudinary: false,
    dropbox: false,
    mega: false
  });
  const [notification, setNotification] = useState({ 
    show: false, 
    type: '', 
    message: '' 
  });
  
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    async function fetchCredentials() {
      try {
        const response = await api.post('/file/fetch-credentials', {token});
        setCredentials(response.data.credentials);
        // Set preferred platform from response if available
        if (response.data.preferredPlatform) {
          setPreferredPlatform(response.data.preferredPlatform);
        }
      } catch (error) {
        console.error("Error fetching credentials:", error);
      }
    }

    async function fetchPreferredPlatform() {
      try {
        const response = await api.post('/file/fetch-preferred-platform', {token});
        setPreferredPlatform(response.data.preferredPlatform);
      } catch (error) {
        console.error("Error fetching preferred platform:", error);
      }
    };

    fetchCredentials();
    fetchPreferredPlatform();
  }, [token]);

  const handleChange = (platform) => (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [name]: value
      }
    }));
  };

  const handlePreferredPlatformChange = async (e) => {
    const newPreferredPlatform = e.target.value;
    setPreferredPlatform(newPreferredPlatform);
    setIsUpdatingPreference(true);
    
    try {
      await api.post('/file/update-preferred-platform', {
        token,
        preferredPlatform: newPreferredPlatform
      });
      
      setNotification({
        show: true,
        type: 'success',
        message: `Default storage changed to ${newPreferredPlatform.charAt(0).toUpperCase() + newPreferredPlatform.slice(1)}`
      });
      
      // Also update the active tab to match the selected platform
      setActiveTab(newPreferredPlatform);
    } catch (error) {
      console.error("Error updating preferred platform:", error);
      setNotification({
        show: true,
        type: 'error',
        message: error.response.data.message
      });
      // Revert selection on error
      setPreferredPlatform(preferredPlatform);
    } finally {
      setIsUpdatingPreference(false);
      setTimeout(() => {
        setNotification({ show: false, type: '', message: '' });
      }, 3000);
    }
  };

  const handleSubmit = async (platform) => {
    setIsSaving(true);
    
    try {
      const response = await api.post('/file/add-credentials', {
        token,
        credentials: credentials[platform],
        platform
      });

      setNotification({
        show: true,
        type: 'success',
        message: `${platform.charAt(0).toUpperCase() + platform.slice(1)} credentials saved successfully!`
      });
      
      setTimeout(() => {
        setNotification({ show: false, type: '', message: '' });
      }, 3000);
    } catch (error) {
      console.error(`Error saving ${platform} credentials:`, error);
      setNotification({
        show: true,
        type: 'error',
        message: `Failed to save ${platform} credentials. Please try again.`
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async (platform) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const success = Math.random() > 0.3;
      
      if (success) {
        setNotification({
          show: true,
          type: 'success',
          message: `Connection to ${platform.charAt(0).toUpperCase() + platform.slice(1)} successful!`
        });
      } else {
        setNotification({
          show: true,
          type: 'error',
          message: `Failed to connect to ${platform.charAt(0).toUpperCase() + platform.slice(1)}. Please check your credentials.`
        });
      }
    } catch (error) {
      setNotification({
        show: true,
        type: 'error',
        message: `Connection test failed. Please check your ${platform} credentials.`
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setNotification({ show: false, type: '', message: '' });
      }, 3000);
    }
  };

  const clearCredentials = (platform) => {
    if (window.confirm(`Are you sure you want to clear all ${platform.charAt(0).toUpperCase() + platform.slice(1)} credentials?`)) {
      setCredentials(prev => ({
        ...prev,
        [platform]: platform === 'cloudinary' 
          ? { cloud_name: '', api_key: '', api_secret: '' }
          : platform === 'dropbox'
          ? { access_token: '' }
          : { email: '', password: '' }
      }));
      
      setNotification({
        show: true,
        type: 'success',
        message: `${platform.charAt(0).toUpperCase() + platform.slice(1)} credentials cleared successfully`
      });
      
      setTimeout(() => {
        setNotification({ show: false, type: '', message: '' });
      }, 3000);
    }
  };

  const renderCredentialForm = (platform) => {
    const platformConfig = {
      cloudinary: [
        { name: 'cloud_name', label: 'Cloud Name', placeholder: 'your-cloud-name' },
        { name: 'api_key', label: 'API Key', placeholder: '123456789012345' },
        { name: 'api_secret', label: 'API Secret', placeholder: '••••••••••••••••' }
      ],
      dropbox: [
        { name: 'access_token', label: 'Access Token', placeholder: 'your-access-token' }
      ],
      mega: [
        { name: 'email', label: 'Mega Email', placeholder: 'sample@gmail.com' },
        { name: 'password', label: 'Mega Password', placeholder: '••••••••••••••••' }
      ]
    };

    return (
      <form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(platform);
      }}>
        <div className="space-y-6">
          {platformConfig[platform].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                {field.label}
              </label>
              {field.type === 'select' ? (
                <select
                  name={field.name}
                  value={credentials[platform][field.name]}
                  onChange={handleChange(platform)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Region</option>
                  {field.options.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <div className="relative">
                  <input
                    type={showSecrets[platform] ? "text" : 
                      field.name.includes('secret') || field.name.includes('token') || field.name === 'password' ? "password" : "text"}
                    name={field.name}
                    value={credentials[platform][field.name]}
                    onChange={handleChange(platform)}
                    placeholder={field.placeholder}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    required
                  />
                  {(field.name.includes('secret') || field.name.includes('token') || field.name === 'password') && (
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                      onClick={() => setShowSecrets(prev => ({
                        ...prev,
                        [platform]: !prev[platform]
                      }))}
                    >
                      {showSecrets[platform] ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  )}
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">{field.placeholder}</p>
            </div>
          ))}
          
          <div className="pt-4 mt-6 border-t border-zinc-800 flex flex-wrap gap-3 justify-between">
            <div>
              <button
                type="button"
                onClick={() => clearCredentials(platform)}
                className="px-4 py-2 bg-red-900/30 text-red-200 hover:bg-red-800/50 rounded-md text-sm transition-colors"
                disabled={isSaving}
              >
                Clear Credentials
              </button>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleTestConnection(platform)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-sm transition-colors"
                disabled={isSaving || Object.values(credentials[platform]).some(val => !val)}
              >
                Test Connection
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-white text-zinc-950 hover:bg-blue-700 rounded-md text-sm transition-colors flex items-center"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : "Save Credentials"}
              </button>
            </div>
          </div>
        </div>
      </form>
    );
  };

  return (
    <div className='bg-zinc-950 text-white min-h-screen flex overflow-x-hidden'>
      <Sidebar />
      <div className="flex-1 p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 border-b border-zinc-800 pb-4">
            Cloud Storage Settings
          </h1>
          
          {notification.show && (
            <div className={`mb-6 p-4 rounded-md flex items-center ${
              notification.type === 'success' 
                ? 'bg-green-900/50 border border-green-700 text-green-200' 
                : 'bg-red-900/50 border border-red-700 text-red-200'
            }`}>
              {notification.type === 'success' 
                ? <Check className="mr-2 h-5 w-5 text-green-400" /> 
                : <X className="mr-2 h-5 w-5 text-red-400" />
              }
              <p className="text-sm">{notification.message}</p>
            </div>
          )}

          {/* Default Cloud Platform Selector */}
          <div className="mb-8 bg-gradient-to-r from-zinc-900 to-zinc-800 p-4 rounded-lg border border-zinc-700 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold mb-1 text-blue-100">Default Storage</h2>
                <p className="text-sm text-gray-400">Select your preferred cloud storage platform for uploads</p>
              </div>
              <div className="flex items-center">
                <div className="relative w-64">
                  <select
                    value={preferredPlatform}
                    onChange={handlePreferredPlatformChange}
                    className="w-full bg-zinc-800 border border-zinc-600 rounded-md py-2.5 pl-4 pr-10 text-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                    disabled={isUpdatingPreference}
                  >
                    <option value="cloudinary">Cloudinary</option>
                    <option value="dropbox">Dropbox</option>
                    <option value="mega">Mega</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
                {isUpdatingPreference && (
                  <RefreshCw className="ml-2 h-5 w-5 animate-spin text-blue-400" />
                )}
              </div>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex border-b border-zinc-800 mb-6">
            {[
              { key: 'cloudinary', icon: CloudUpload, label: 'Cloudinary' },
              { key: 'dropbox', icon: PackageOpen, label: 'Dropbox' },
              { key: 'mega', icon: Server, label: 'Mega' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex items-center gap-2 px-4 py-3 border-b-2 transition-colors
                  ${activeTab === tab.key 
                    ? 'border-blue-500 text-white' 
                    : 'border-transparent text-gray-400 hover:text-white'
                  }
                  ${tab.key === preferredPlatform ? 'relative' : ''}
                `}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
                {tab.key === preferredPlatform && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-xs text-white px-1.5 py-0.5 rounded-full">
                    Default
                  </span>
                )}
              </button>
            ))}
          </div>
          
          {/* Credential Forms */}
          <div className="bg-zinc-900 rounded-lg shadow-xl overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/10 rounded-lg">
                  {activeTab === 'cloudinary' && <CloudUpload className="w-6 h-6 text-white" />}
                  {activeTab === 'dropbox' && <PackageOpen className="w-6 h-6 text-white" />}
                  {activeTab === 'mega' && <Server className="w-6 h-6 text-white" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold capitalize">{activeTab} Integration</h2>
                  <p className="text-blue-200 text-sm">
                    Configure your {activeTab} credentials for media uploads
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : (
                renderCredentialForm(activeTab)
              )}
            </div>
          </div>
          
          {/* Help Section */}
          <div className="bg-zinc-900 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Info className="w-5 h-5 mr-2 text-blue-400" />
                How to get your {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} credentials
              </h3>
              <div className="text-gray-300 text-sm space-y-4">
                {activeTab === 'cloudinary' && (
                  <>
                    <p>To use Cloudinary for media uploads, you'll need the following credentials:</p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Log in to your <a href="https://cloudinary.com/console" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Cloudinary dashboard</a></li>
                      <li>Navigate to the Dashboard section</li>
                      <li>Look for the "Account Details" section</li>
                      <li>Copy your Cloud name, API key, and API secret</li>
                    </ol>
                  </>
                )}
                
                {activeTab === 'dropbox' && (
                  <>
                    <p>To use Dropbox for media uploads, you'll need an access token:</p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Go to the <a href="https://www.dropbox.com/developers" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Dropbox Developer Console</a></li>
                      <li>Create a new app or select an existing one</li>
                      <li>Generate an access token in the "OAuth 2" section</li>
                      <li>Copy and paste the access token here</li>
                    </ol>
                  </>
                )}
                
                {activeTab === 'mega' && (
                  <>
                    <p>To use Mega for media uploads, you'll need your account credentials:</p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Create an account on <a href="https://mega.io" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Mega.io</a> if you don't have one</li>
                      <li>Enter the email address associated with your Mega account</li>
                      <li>Enter your Mega account password</li>
                      <li>These credentials will be used to authenticate and upload files to your Mega storage</li>
                    </ol>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;