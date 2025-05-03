import { useState, useEffect } from 'react';
import axios from 'axios'; // You'll need to npm install axios
import { 
  Book, 
  Users, 
  Clock, 
  CheckSquare, 
  Bell, 
  Upload, 
  Search, 
  LogIn, 
  UserPlus, 
  User,
  LogOut,
  ChevronDown,
  Plus,
  Star,
  FileText,
  Calendar,
  Award,
  Download,
  X
} from 'lucide-react';

// API base URL
const API_URL = 'http://localhost:3001/api';

// Create API service
const api = {
  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
  },
  register: async (username, email, password) => {
    const response = await axios.post(`${API_URL}/register`, { username, email, password });
    return response.data;
  },
  getResources: async (search = '') => {
    const response = await axios.get(`${API_URL}/resources`, { 
      params: { search }
    });
    return response.data;
  },
  uploadResource: async (formData) => {
    const response = await axios.post(`${API_URL}/resources`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  rateResource: async (resourceId, userId, rating, comment) => {
    const response = await axios.post(`${API_URL}/resources/${resourceId}/rate`, {
      userId, rating, comment
    });
    return response.data;
  },
  getStudyGroups: async () => {
    const response = await axios.get(`${API_URL}/study-groups`);
    return response.data;
  },
  createStudyGroup: async (name, courseId, userId) => {
    const response = await axios.post(`${API_URL}/study-groups`, {
      name, courseId, userId
    });
    return response.data;
  },
  joinStudyGroup: async (groupId, userId) => {
    const response = await axios.post(`${API_URL}/study-groups/${groupId}/join`, { userId });
    return response.data;
  },
  leaveStudyGroup: async (groupId, userId) => {
    const response = await axios.post(`${API_URL}/study-groups/${groupId}/leave`, { userId });
    return response.data;
  },
  getTasks: async (userId) => {
    const response = await axios.get(`${API_URL}/tasks`, {
      params: { userId }
    });
    return response.data;
  },
  createTask: async (userId, title, dueDate, priority) => {
    const response = await axios.post(`${API_URL}/tasks`, {
      userId, title, dueDate, priority
    });
    return response.data;
  },
  updateTaskCompletion: async (taskId, userId, completed) => {
    const response = await axios.put(`${API_URL}/tasks/${taskId}/complete`, {
      userId, completed
    });
    return response.data;
  }
};

// Add this helper function near the top of your file, before the StudySyncApp component
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function StudySyncApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [pomodoroMode, setPomodoroMode] = useState('focus');
  const [searchQuery, setSearchQuery] = useState('');
  const [resources, setResources] = useState([]);
  const [studyGroups, setStudyGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', due: '', priority: 'Medium' });
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: '', courseId: 1, description: '', file: null });
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingResource, setRatingResource] = useState(null);
  const [ratingForm, setRatingForm] = useState({ rating: 5, comment: '' });
  const [isLoading, setIsLoading] = useState(false);

  // Load data when the app starts or user logs in
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Always load resources, they're public
        const resourcesData = await api.getResources(searchQuery);
        setResources(resourcesData);
        
        // Load study groups
        const groupsData = await api.getStudyGroups();
        setStudyGroups(groupsData);
        
        // Load user-specific data if logged in
        if (isLoggedIn && user) {
          const tasksData = await api.getTasks(user.id);
          setTasks(tasksData);
          
          // Get joined groups from the group members data
          const joinedGroupIds = groupsData
            .filter(group => group.members?.some(member => member.userId === user.id))
            .map(group => group.id);
            
          setJoinedGroups(joinedGroupIds);
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
        showToast('Failed to load data. Please try again later.', 'error');
      }
    };
    
    loadInitialData();
  }, [isLoggedIn, user, searchQuery]);

  // Handle login
  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const { email, password } = loginForm;
      
      if (!email || !password) {
        showToast('Please enter both email and password', 'error');
        return;
      }
      
      const result = await api.login(email, password);
      setUser(result.user);
      setIsLoggedIn(true);
      setShowLoginModal(false);
      showToast(`Welcome back, ${result.user.username}!`, 'success');
    } catch (error) {
      console.error("Login error:", error);
      showToast('Login failed: ' + (error.response?.data?.error || 'Unknown error'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle registration
  const handleRegister = async () => {
    try {
      setIsLoading(true);
      const { username, email, password, confirmPassword } = registerForm;
      
      if (!username || !email || !password) {
        showToast('Please fill in all required fields', 'error');
        return;
      }
      
      if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
      }
      
      const user = await api.register(username, email, password);
      setUser(user);
      setIsLoggedIn(true);
      setShowRegisterModal(false);
      showToast('Registration successful!', 'success');
    } catch (error) {
      console.error("Registration error:", error);
      showToast('Registration failed: ' + (error.response?.data?.error || 'Unknown error'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setActiveTab('dashboard');
    setJoinedGroups([]);
    setTasks([]);
    showToast('You have been logged out successfully', 'success');
  };

  // Handle joining a study group
  const joinGroup = async (groupId) => {
    if (!isLoggedIn) {
      showToast('Please log in to join study groups', 'error');
      setShowLoginModal(true);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Check if already joined
      if (joinedGroups.includes(groupId)) {
        // Leave the group
        await api.leaveStudyGroup(groupId, user.id);
        setJoinedGroups(joinedGroups.filter(id => id !== groupId));
        showToast('You have left the study group', 'success');
      } else {
        // Join the group
        await api.joinStudyGroup(groupId, user.id);
        setJoinedGroups([...joinedGroups, groupId]);
        showToast('You have joined the study group!', 'success');
      }
      
      // Refresh study groups
      const groupsData = await api.getStudyGroups();
      setStudyGroups(groupsData);
    } catch (error) {
      console.error("Error joining/leaving group:", error);
      showToast('Failed to update group membership', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding a task
  const addTask = async () => {
    if (!isLoggedIn) {
      showToast('Please log in to manage tasks', 'error');
      setShowLoginModal(true);
      return;
    }
    
    if (newTask.title.trim() === '') {
      showToast('Please enter a task title', 'error');
      return;
    }
    
    try {
      setIsLoading(true);
      
      await api.createTask(
        user.id, 
        newTask.title, 
        newTask.due || new Date().toISOString().split('T')[0], 
        newTask.priority
      );
      
      // Refresh tasks
      const tasksData = await api.getTasks(user.id);
      setTasks(tasksData);
      
      setNewTask({ title: '', due: '', priority: 'Medium' });
      showToast('Task added successfully!', 'success');
    } catch (error) {
      console.error("Error adding task:", error);
      showToast('Failed to add task', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle task completion toggle
  const toggleTaskCompletion = async (taskId) => {
    if (!isLoggedIn) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      const taskToUpdate = tasks.find(task => task.id === taskId);
      const newCompletionStatus = !taskToUpdate.completed;
      
      await api.updateTaskCompletion(taskId, user.id, newCompletionStatus);
      
      // Refresh tasks
      const tasksData = await api.getTasks(user.id);
      setTasks(tasksData);
      
      if (newCompletionStatus) {
        showToast(`Task "${taskToUpdate.title}" completed!`, 'success');
      }
    } catch (error) {
      console.error("Error updating task:", error);
      showToast('Failed to update task', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resource upload
  const handleUploadResource = async () => {
    if (!isLoggedIn) {
      showToast('Please log in to upload resources', 'error');
      setShowLoginModal(true);
      return;
    }
    
    if (!uploadForm.title || !uploadForm.file) {
      showToast('Please provide a title and file', 'error');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('courseId', uploadForm.courseId);
      formData.append('description', uploadForm.description);
      formData.append('userId', user.id);
      formData.append('file', uploadForm.file);
      
      await api.uploadResource(formData);
      
      // Refresh resources
      const resourcesData = await api.getResources(searchQuery);
      setResources(resourcesData);
      
      setShowUploadModal(false);
      setUploadForm({ title: '', courseId: 1, description: '', file: null });
      showToast('Resource uploaded successfully!', 'success');
    } catch (error) {
      console.error("Error uploading resource:", error);
      showToast('Failed to upload resource', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resource rating
  const submitRating = async () => {
    if (!isLoggedIn) {
      showToast('Please log in to rate resources', 'error');
      setShowLoginModal(true);
      return;
    }
    
    try {
      setIsLoading(true);
      
      await api.rateResource(
        ratingResource.id, 
        user.id, 
        ratingForm.rating, 
        ratingForm.comment
      );
      
      // Refresh resources
      const resourcesData = await api.getResources(searchQuery);
      setResources(resourcesData);
      
      setShowRatingModal(false);
      setRatingForm({ rating: 5, comment: '' });
      showToast(`Thank you for rating "${ratingResource.title}"!`, 'success');
    } catch (error) {
      console.error("Error submitting rating:", error);
      showToast('Failed to submit rating', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resource download
  const downloadResource = async (resourceId) => {
    if (!isLoggedIn) {
      showToast('Please log in to download resources', 'error');
      setShowLoginModal(true);
      return;
    }
    
    try {
      // Find resource to get the download URL
      const resource = resources.find(r => r.id === resourceId);
      if (!resource) {
        showToast('Resource not found', 'error');
        return;
      }
      
      // In a real app, you would handle download logic here
      // For now, just show a success message
      showToast('Resource downloaded successfully!', 'success');
    } catch (error) {
      console.error("Error downloading resource:", error);
      showToast('Failed to download resource', 'error');
    }
  };

  // Update toast notification
  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setShowNotification(true);
  };

  // Open rating modal
  const openRatingModal = (resource) => {
    if (!isLoggedIn) {
      showToast('Please log in to rate resources', 'error');
      setShowLoginModal(true);
      return;
    }
    
    setRatingResource(resource);
    setRatingForm({ rating: 5, comment: '' });
    setShowRatingModal(true);
  };

  // Update LoginModal to use form state
  const LoginModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4">Log In</h2>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input 
            type="email" 
            className="w-full p-2 border rounded" 
            placeholder="your@email.com"
            value={loginForm.email}
            onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Password</label>
          <input 
            type="password" 
            className="w-full p-2 border rounded" 
            placeholder="********"
            value={loginForm.password}
            onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
          />
        </div>
        <div className="flex justify-between">
          <button 
            onClick={() => setShowLoginModal(false)} 
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            onClick={handleLogin} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </div>
      </div>
    </div>
  );

  // Update RegisterModal to use form state
  const RegisterModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Username</label>
          <input 
            type="text" 
            className="w-full p-2 border rounded" 
            placeholder="username"
            value={registerForm.username}
            onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input 
            type="email" 
            className="w-full p-2 border rounded" 
            placeholder="your@email.com"
            value={registerForm.email}
            onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Password</label>
          <input 
            type="password" 
            className="w-full p-2 border rounded" 
            placeholder="********"
            value={registerForm.password}
            onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Confirm Password</label>
          <input 
            type="password" 
            className="w-full p-2 border rounded" 
            placeholder="********"
            value={registerForm.confirmPassword}
            onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
          />
        </div>
        <div className="flex justify-between">
          <button 
            onClick={() => setShowRegisterModal(false)} 
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            onClick={handleRegister} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </div>
      </div>
    </div>
  );

  // Update UploadModal to use form state
  const UploadModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4">Upload Resource</h2>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Title</label>
          <input 
            type="text" 
            className="w-full p-2 border rounded" 
            placeholder="Resource title"
            value={uploadForm.title}
            onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Course</label>
          <select 
            className="w-full p-2 border rounded"
            value={uploadForm.courseId}
            onChange={(e) => setUploadForm({...uploadForm, courseId: e.target.value})}
          >
            {studyGroups.map(course => (
              <option key={course.id} value={course.id}>{course.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">File</label>
          <div 
            className="border-2 border-dashed border-gray-300 rounded p-4 text-center cursor-pointer hover:bg-gray-50"
            onClick={() => document.getElementById('file-upload').click()}
          >
            <Upload size={24} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">
              {uploadForm.file ? uploadForm.file.name : 'Click to browse or drag and drop'}
            </p>
            <p className="text-xs text-gray-400 mt-1">PDF, DOCX, PPTX (max 10MB)</p>
            <input 
              id="file-upload" 
              type="file" 
              className="hidden"
              onChange={(e) => setUploadForm({...uploadForm, file: e.target.files[0]})}
            />
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Description (optional)</label>
          <textarea 
            className="w-full p-2 border rounded" 
            rows="3" 
            placeholder="Brief description of the resource"
            value={uploadForm.description}
            onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
          ></textarea>
        </div>
        <div className="flex justify-between">
          <button 
            onClick={() => setShowUploadModal(false)} 
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            onClick={handleUploadResource} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={isLoading}
          >
            {isLoading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );

  // Update StudyGroups to use database data
  const StudyGroups = () => (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Study Groups</h2>
        <button 
          onClick={() => {
            if (!isLoggedIn) {
              showToast('Please log in to create study groups', 'error');
              setShowLoginModal(true);
              return;
            }
            showToast('Study group creation feature coming soon!', 'info');
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center"
          disabled={isLoading}
        >
          <Plus size={18} className="mr-1" />
          Create Group
        </button>
      </div>
      
      {isLoading ? (
        <div className="text-center py-10">Loading study groups...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studyGroups.map(group => {
            const isJoined = joinedGroups.includes(group.id);
            return (
              <div key={group.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold">{group.name}</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {group.course_name}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <Users size={16} className="mr-1" />
                  <span>{group.member_count} members</span>
                  {isJoined && (
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                      Joined
                    </span>
                  )}
                </div>
                
                <div className="border-t pt-4 mt-2">
                  <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start space-x-2">
                      <div className="bg-green-100 p-1 rounded mt-0.5">
                        <Upload size={12} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs">Created by {group.created_by_user}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(group.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
                
                <div className="flex justify-between mt-4 pt-4 border-t">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View Details</button>
                  <button 
                    onClick={() => joinGroup(group.id)} 
                    className={`${
                      isJoined ? 'bg-gray-500 hover:bg-gray-600' : 'bg-blue-500 hover:bg-blue-600'
                    } text-white px-3 py-1 rounded text-sm`}
                    disabled={isLoading}
                  >
                    {isJoined ? 'Leave Group' : 'Join Group'}
                  </button>
                </div>
              </div>
            );
          })}
          
          {studyGroups.length === 0 && (
            <div className="col-span-3 text-center py-10 text-gray-500">
              No study groups available
            </div>
          )}
        </div>
      )}
    </div>
  );

  const Pomodoro = () => (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Pomodoro Timer</h2>
      
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
        <div className="flex flex-col items-center">
          <div className={`w-64 h-64 rounded-full border-8 flex items-center justify-center mb-6 ${
            pomodoroMode === 'focus' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-green-500 bg-green-50'
          }`}>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">
                {pomodoroMode === 'focus' ? 'Focus Time' : 'Break Time'}
              </h3>
              <span className="text-4xl font-bold block">
                {formatTime(pomodoroTime)}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-4 mb-6">
            {pomodoroActive ? (
              <>
                <button 
                  onClick={() => setPomodoroActive(false)} 
                  className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600"
                >
                  Pause
                </button>
                <button 
                  onClick={() => {
                    setPomodoroMode('focus');
                    setPomodoroTime(25 * 60);
                    setPomodoroActive(false);
                  }} 
                  className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-400"
                >
                  Reset
                </button>
              </>
            ) : (
              <button 
                onClick={() => setPomodoroActive(true)} 
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
              >
                {pomodoroTime < 25 * 60 ? 'Resume' : 'Start'}
              </button>
            )}
          </div>
          
          <div className="w-full">
            <h4 className="text-lg font-medium mb-3">Session History</h4>
            <div className="bg-gray-50 p-4 rounded border">
              <ul className="space-y-2">
                <li className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium">Focus Session</span>
                    <span className="text-xs text-gray-500 block">Today, 10:30 AM</span>
                  </div>
                  <span className="text-sm">25:00</span>
                </li>
                <li className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium">Break</span>
                    <span className="text-xs text-gray-500 block">Today, 10:55 AM</span>
                  </div>
                  <span className="text-sm">05:00</span>
                </li>
                <li className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium">Focus Session</span>
                    <span className="text-xs text-gray-500 block">Today, 11:00 AM</span>
                  </div>
                  <span className="text-sm">25:00</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const Todos = () => (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">To-Do List</h2>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-end space-x-2 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Task</label>
            <input 
              type="text" 
              value={newTask.title} 
              onChange={(e) => setNewTask({...newTask, title: e.target.value})} 
              placeholder="Add a new task..." 
              className="w-full p-2 border rounded" 
            />
          </div>
          <div className="w-36">
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input 
              type="date" 
              value={newTask.due} 
              onChange={(e) => setNewTask({...newTask, due: e.target.value})} 
              className="w-full p-2 border rounded" 
            />
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select 
              value={newTask.priority} 
              onChange={(e) => setNewTask({...newTask, priority: e.target.value})} 
              className="w-full p-2 border rounded"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <button 
            onClick={addTask}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Task
          </button>
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Your Tasks</h3>
          
          {tasks.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No tasks yet. Add one above!</p>
          ) : (
            <div>
              {/* Incomplete Tasks */}
              <h4 className="text-md font-medium mb-2">To Do</h4>
              <ul className="space-y-2 mb-6">
                {tasks.filter(task => !task.completed).map(task => (
                  <li key={task.id} className="flex items-center p-3 border rounded hover:bg-gray-50">
                    <input 
                      type="checkbox" 
                      checked={task.completed}
                      onChange={() => toggleTaskCompletion(task.id)}
                      className="h-4 w-4 text-blue-600 rounded mr-3" 
                    />
                    <div className="flex-1">
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-gray-500">Due: {task.due}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.priority === 'High' ? 'bg-red-100 text-red-800' :
                      task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.priority}
                    </span>
                  </li>
                ))}
              </ul>
              
              {/* Completed Tasks */}
              {tasks.some(task => task.completed) && (
                <>
                  <h4 className="text-md font-medium mb-2">Completed</h4>
                  <ul className="space-y-2">
                    {tasks.filter(task => task.completed).map(task => (
                      <li key={task.id} className="flex items-center p-3 border rounded bg-gray-50">
                        <input 
                          type="checkbox" 
                          checked={task.completed}
                          onChange={() => toggleTaskCompletion(task.id)}
                          className="h-4 w-4 text-blue-600 rounded mr-3" 
                        />
                        <div className="flex-1">
                          <p className="font-medium line-through text-gray-500">{task.title}</p>
                          <p className="text-sm text-gray-400">Completed</p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">
                          {task.priority}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Header component
  const Header = () => (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center">
          <Book size={24} className="text-blue-600 mr-2" />
          <h1 className="text-xl font-bold text-gray-800">StudySync</h1>
        </div>
        
        <div className="relative">
          <div className="flex items-center space-x-2 relative">
            <div className="relative">
              <button 
                onClick={() => setShowNotification(!showNotification)} 
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
            
            {isLoggedIn ? (
              <div className="relative">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)} 
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                    <User size={16} />
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{user.username}</span>
                  <ChevronDown size={16} className="text-gray-600" />
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    <div className="py-1">
                      <a href="#profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
                      <a href="#settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-2">
                <button 
                  onClick={() => setShowLoginModal(true)} 
                  className="flex items-center px-3 py-2 rounded text-sm font-medium text-blue-600 hover:bg-blue-50"
                >
                  <LogIn size={16} className="mr-1" />
                  Log In
                </button>
                
                <button 
                  onClick={() => setShowRegisterModal(true)} 
                  className="flex items-center px-3 py-2 bg-blue-600 rounded text-sm font-medium text-white hover:bg-blue-700"
                >
                  <UserPlus size={16} className="mr-1" />
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );

  // Navbar component
  const Navbar = () => (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex space-x-8">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`flex items-center px-4 py-4 text-sm font-medium border-b-2 ${
              activeTab === 'dashboard' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Book size={18} className="mr-2" />
            Dashboard
          </button>
          
          <button 
            onClick={() => setActiveTab('resources')} 
            className={`flex items-center px-4 py-4 text-sm font-medium border-b-2 ${
              activeTab === 'resources' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText size={18} className="mr-2" />
            Resources
          </button>
          
          <button 
            onClick={() => setActiveTab('studygroups')} 
            className={`flex items-center px-4 py-4 text-sm font-medium border-b-2 ${
              activeTab === 'studygroups' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users size={18} className="mr-2" />
            Study Groups
          </button>
          
          <button 
            onClick={() => setActiveTab('pomodoro')} 
            className={`flex items-center px-4 py-4 text-sm font-medium border-b-2 ${
              activeTab === 'pomodoro' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Clock size={18} className="mr-2" />
            Pomodoro
          </button>
          
          <button 
            onClick={() => setActiveTab('todos')} 
            className={`flex items-center px-4 py-4 text-sm font-medium border-b-2 ${
              activeTab === 'todos' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CheckSquare size={18} className="mr-2" />
            To-Dos
          </button>
        </div>
      </div>
    </nav>
  );

  // Dashboard component
  const Dashboard = () => (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-2 rounded">
              <FileText size={20} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold ml-3">Resources</h3>
          </div>
          <p className="text-3xl font-bold">{resources.length}</p>
          <p className="text-sm text-gray-600 mt-1">Available study materials</p>
        </div>
        
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 p-2 rounded">
              <Users size={20} className="text-green-600" />
            </div>
            <h3 className="text-lg font-semibold ml-3">Study Groups</h3>
          </div>
          <p className="text-3xl font-bold">{studyGroups.length}</p>
          <p className="text-sm text-gray-600 mt-1">Active study groups</p>
        </div>
        
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 p-2 rounded">
              <CheckSquare size={20} className="text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold ml-3">Tasks</h3>
          </div>
          <p className="text-3xl font-bold">{tasks.filter(t => !t.completed).length}</p>
          <p className="text-sm text-gray-600 mt-1">Tasks remaining</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-5 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Recent Resources</h3>
          <div className="overflow-hidden">
            <table className="min-w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left text-sm font-medium text-gray-500 px-2 py-3">Title</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-2 py-3">Course</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-2 py-3">Rating</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-2 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {resources.slice(0, 5).map((resource, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="px-2 py-3 text-sm">{resource.title}</td>
                    <td className="px-2 py-3 text-sm">{resource.course}</td>
                    <td className="px-2 py-3">
                      <div className="flex items-center">
                        <Star size={16} className="text-yellow-400 fill-current" />
                        <span className="text-sm ml-1">{resource.rating}</span>
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <button 
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        onClick={() => downloadResource(resource.id)}
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <button 
              onClick={() => setActiveTab('resources')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View all resources
            </button>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Upcoming Tasks</h3>
          <ul className="divide-y">
            {tasks.filter(t => !t.completed).slice(0, 5).map((task, index) => (
              <li key={index} className="py-3 flex items-center">
                <input 
                  type="checkbox" 
                  className="h-4 w-4 text-blue-600 rounded mr-3" 
                  checked={false}
                  onChange={() => toggleTaskCompletion(task.id)}
                />
                <div className="flex-1">
                  <p className="font-medium">{task.title}</p>
                  <p className="text-xs text-gray-500">Due: {task.due}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  task.priority === 'High' ? 'bg-red-100 text-red-800' :
                  task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {task.priority}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <button 
              onClick={() => setActiveTab('todos')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View all tasks
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Resources component
  const Resources = () => (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Study Resources</h2>
        <button 
          onClick={() => {
            if (!isLoggedIn) {
              showToast('Please log in to upload resources', 'error');
              setShowLoginModal(true);
              return;
            }
            setShowUploadModal(true);
          }} 
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center"
        >
          <Upload size={18} className="mr-1" />
          Upload Resource
        </button>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 pl-10 border rounded-lg"
          />
          <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center py-10">Loading resources...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource, index) => (
            <div key={index} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold">{resource.title}</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {resource.course}
                  </span>
                </div>
                
                <div className="flex items-center mb-3">
                  <div className="flex items-center mr-4">
                    <Star size={16} className="text-yellow-400 fill-current" />
                    <span className="text-sm ml-1">{resource.rating}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    Uploaded by {resource.author}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  {resource.description || "No description available for this resource."}
                </p>
                
                <div className="flex justify-between">
                  <button 
                    onClick={() => openRatingModal(resource)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Rate Resource
                  </button>
                  <button 
                    onClick={() => downloadResource(resource.id)}
                    className="flex items-center text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    <Download size={14} className="mr-1" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {resources.length === 0 && (
            <div className="col-span-3 text-center py-10 text-gray-500">
              No resources found. Try a different search or upload a new resource!
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Notification component
  const Notification = () => (
    <div className={`fixed bottom-4 right-4 bg-${notification.type === 'success' ? 'green' : notification.type === 'error' ? 'red' : 'blue'}-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center z-50`}>
      <span>{notification.message}</span>
      <button 
        onClick={() => setShowNotification(false)}
        className="ml-3"
      >
        <X size={16} />
      </button>
    </div>
  );

  // RatingModal component
  const RatingModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4">Rate Resource</h2>
        <p className="mb-4">{ratingResource?.title}</p>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Rating</label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map(rating => (
              <button 
                key={rating} 
                onClick={() => setRatingForm({...ratingForm, rating})}
                className="text-2xl text-yellow-400 hover:text-yellow-500 focus:outline-none"
              >
                <Star 
                  size={24} 
                  fill={ratingForm.rating >= rating ? "#FBBF24" : "none"} 
                />
              </button>
            ))}
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Comment (optional)</label>
          <textarea 
            value={ratingForm.comment}
            onChange={(e) => setRatingForm({...ratingForm, comment: e.target.value})}
            className="w-full p-2 border rounded" 
            rows="3" 
            placeholder="Share your thoughts about this resource"
          ></textarea>
        </div>
        
        <div className="flex justify-between">
          <button 
            onClick={() => setShowRatingModal(false)} 
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button 
            onClick={submitRating} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Submit Rating
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <Navbar />
      
      <main className="flex-grow">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'resources' && <Resources />}
        {activeTab === 'studygroups' && <StudyGroups />}
        {activeTab === 'pomodoro' && <Pomodoro />}
        {activeTab === 'todos' && <Todos />}
      </main>
      
      <footer className="bg-gray-800 text-white p-4">
        <div className="container mx-auto text-center">
          <p>&copy; 2025 Study Sync Platform. All rights reserved.</p>
        </div>
      </footer>
      
      {showLoginModal && <LoginModal />}
      {showRegisterModal && <RegisterModal />}
      {showUploadModal && <UploadModal />}
      {showRatingModal && <RatingModal />}
      {showNotification && <Notification />}
    </div>
  );
}