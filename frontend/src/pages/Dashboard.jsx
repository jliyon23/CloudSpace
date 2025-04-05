import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from "../store/authStore";
import api from '../axiosInstance';
import { Bell } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalSize, setTotalSize] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  // New state for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    show: false,
    fileId: null,
    fileName: ''
  });

  const logout = useAuthStore((state) => state.logout);
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      try {
        const response = await api.post('/file/list', { token });

        if (response.data && response.data.files) {
          const totalSizeBytes = response.data.files.reduce((acc, file) => acc + (file.size || 0), 0);
          setTotalSize(totalSizeBytes);
          setFiles(response.data.files);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching files:', err);
        setError('Failed to load files. Please try again later.');
        setLoading(false);
      }
    };

    const fetchNotifications = async () => {
      try {
        const response = await api.post('/file/fetch-notifications', { token });
        if (response.data && response.data.notifications) {
          setNotifications(response.data.notifications);
          console.log('Notifications:', response.data.notifications);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    }

    if (token) {
      fetchFiles();
      fetchNotifications();
    } else {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredFiles = files.filter(file =>
    file.name && file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Show delete confirmation dialog
  const showDeleteConfirmation = (id, name) => {
    setDeleteConfirmation({
      show: true,
      fileId: id,
      fileName: name
    });
  };

  // Hide delete confirmation dialog
  const hideDeleteConfirmation = () => {
    setDeleteConfirmation({
      show: false,
      fileId: null,
      fileName: ''
    });
  };

  // Perform the actual deletion
  const confirmDelete = async () => {
    try {
      console.log('Deleting file:', deleteConfirmation.fileId);
      const response = await api.post('/file/delete', { token, id: deleteConfirmation.fileId });
      if (response.data) {
        setFiles(files.filter(file => file._id !== deleteConfirmation.fileId));
      }
      hideDeleteConfirmation();
    } catch (error) {
      console.error('Error deleting file:', error);
      hideDeleteConfirmation();
    }
  };

  return (
    <div className="bg-zinc-950 text-white min-h-screen flex overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 min-w-0 lg:ml-20 transition-all duration-300">
        <header className="bg-zinc-900 shadow-md border-b border-zinc-800 sticky top-0 z-40">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center space-x-4">
              <button
                id="openSidebar"
                className="p-2 rounded-md hover:bg-zinc-800 lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <i className="ph ph-list text-xl"></i>
              </button>
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            <div className="relative">
              {/* Bell Icon with notification indicator */}
              <button
                className="p-2 rounded-full hover:bg-zinc-800 transition-colors duration-200 relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="text-zinc-200" size={20} />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
                )}
              </button>

              {/* Glassmorphic Notification Popup */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 backdrop-blur-md bg-zinc-900/80 text-zinc-200 rounded-xl border border-zinc-500/50 shadow-xl overflow-hidden z-50">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-zinc-800/50">
                    <h3 className="text-sm font-medium">Notifications</h3>
                    <span className="text-xs text-zinc-400">{notifications.length} new</span>
                  </div>
                  
                  {/* Notification List */}
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? (
                      <ul className="divide-y divide-zinc-800/50">
                        {notifications.map((notification) => (
                          <li key={notification.id} className="p-3 hover:bg-zinc-800/40 transition-colors duration-200">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 p-1 bg-zinc-800/70 rounded-full">
                                <Bell size={14} className="text-zinc-300" />
                              </div>
                              <div className="flex-1">
                                <p className={`text-sm ${notification.status === "success"? "text-green-500" : "text-red-500"}`}>{notification.message}</p>
                                <p className="text-xs text-zinc-400 mt-1">{notification.date}</p>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-4 text-center text-zinc-400 text-sm">
                        No new notifications
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-zinc-900 p-4 rounded-xl shadow-md border border-zinc-800 transition-all hover:border-zinc-700 h-28">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Total Files</p>
                  <h3 className="text-2xl font-bold mt-1">{files.length}</h3>
                </div>
                <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                  <i className="ph ph-files text-xl text-indigo-400"></i>
                </div>
              </div>
            </div>
            <div className="bg-zinc-900 p-4 rounded-xl shadow-md border border-zinc-800 transition-all hover:border-zinc-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Storage Used</p>
                  <h3 className="text-2xl font-bold mt-1">{formatFileSize(totalSize)} </h3>
                </div>
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <i className="ph ph-database text-xl text-blue-400"></i>
                </div>
              </div>
            </div>
            <div className="bg-zinc-900 p-4 rounded-xl shadow-md border border-zinc-800 transition-all hover:border-zinc-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Cloud Services</p>
                  <h3 className="text-2xl font-bold mt-1">3</h3>
                </div>
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <i className="ph ph-cloud text-xl text-purple-400"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-xl shadow-md border border-zinc-800 overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-lg font-semibold">Recent Files</h2>
              <div className="flex space-x-2 w-full md:w-auto">
                <div className="relative flex-grow md:flex-grow-0">
                  <input
                    type="text"
                    placeholder="Search files..."
                    className="w-full px-4 py-2 bg-zinc-800 rounded-md border border-zinc-700 focus:outline-none focus:border-zinc-600 text-sm"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                  <i className="ph ph-magnifying-glass absolute right-3 top-2.5 text-zinc-400"></i>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-full divide-y divide-zinc-800">
                <thead className="bg-zinc-800/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">S. No</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Filename</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Size</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Format</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Cloud Platform</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 bg-zinc-900">
                  {filteredFiles.map((file, index) => (
                    <tr key={file.id || index} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{file.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{formatFileSize(file.size || 0)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 text-xs rounded-md bg-red-500/10 text-red-400">
                          {file.format || 'PDF'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                        {new Date(file.uploadDate || Date.now()).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="flex items-center">
                          <i className="ph ph-cloud text-amber-500 mr-2"></i>
                          {file.platform || 'AWS'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <a href={file.url && file.url.replace('pdf', 'jpg')} target="_blank" className="p-1 hover:bg-zinc-800 rounded hover:scale-110 duration-300">
                            <i className="ph ph-eye text-blue-400"></i>
                          </a>
                          
                          <button 
                            onClick={() => showDeleteConfirmation(file._id, file.name)} 
                            className="p-1 hover:bg-zinc-800 rounded hover:scale-110 duration-300"
                          >
                            <i className="ph ph-trash text-red-400"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md shadow-xl animate-fadeIn">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/10">
                <i className="ph ph-warning text-2xl text-red-500"></i>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Delete Confirmation</h3>
              <p className="text-zinc-300 text-center mb-6">
                Are you sure you want to delete the file <span className="font-semibold text-zinc-100">"{deleteConfirmation.fileName}"</span>? This action cannot be undone.
              </p>
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={hideDeleteConfirmation}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;