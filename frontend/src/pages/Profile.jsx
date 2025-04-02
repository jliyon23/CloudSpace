import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import useAuthStore from '../store/authStore';
import { Clipboard, ClipboardCheck } from "lucide-react";

const Profile = () => {
  const user = useAuthStore((state) => state.user);

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // The critical fix: use user.agentToken instead of undefined agentToken
    if (user?.agentToken) {
      navigator.clipboard.writeText(user.agentToken);
      setCopied(true);

      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    }
  };

  useEffect(() => {
    if (user) {
      // You can add any initialization logic here if needed
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // This method was incomplete, likely for future form updates
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would submit the updated data to your API
    console.log('Updating profile with:', formData);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="bg-zinc-950 text-white min-h-screen flex overflow-x-hidden">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="mt-4">Loading user data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 text-white min-h-screen flex overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 border-b border-zinc-800 pb-4">Profile</h1>

          <div className="bg-zinc-900 rounded-lg shadow-xl overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center text-3xl font-bold">
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{user.username}</h2>
                  <p className="text-indigo-200">{user.email}</p>
                  <div className="mt-2 flex items-center">
                    <div className="bg-green-500 rounded-full w-3 h-3 mr-2"></div>
                    <span className="text-sm text-indigo-100">Active Account</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-6">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">Account Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-400">Username</p>
                    <p className="font-medium">{user.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Account ID</p>
                    <p className="font-medium text-gray-300">{user._id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Verification Status</p>
                    <p className="font-medium">
                      {user.isVerified ? (
                        <span className="text-green-500">Verified</span>
                      ) : (
                        <span className="text-yellow-500">Not Verified</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Last Login</p>
                    <p className="font-medium">{formatDate(user.lastLogin)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Account Created</p>
                    <p className="font-medium">{formatDate(user.createdAt)}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800 mt-6">
                  <h3 className="text-xl font-semibold mb-4">Security</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Password</p>
                        <p className="text-sm text-gray-400">Last changed: Unknown</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-zinc-800 p-3 rounded-lg">
                      <div>
                        <p className="font-medium">Agent Token</p>
                        <p className="text-sm text-gray-500 max-w-xs truncate">{user.agentToken || "No token available"}</p>
                      </div>
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-200 transition"
                      >
                        {copied ? (
                          <>
                            <ClipboardCheck className="w-4 h-4 text-green-500" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Clipboard className="w-4 h-4" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;