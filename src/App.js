import { useState, useEffect } from 'react';
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
  Award
} from 'lucide-react';

// Mock data
const mockCourses = [
  { id: 1, name: "Mathematics", description: "Advanced calculus and algebra" },
  { id: 2, name: "Computer Science", description: "Programming fundamentals and algorithms" },
  { id: 3, name: "Physics", description: "Classical mechanics and thermodynamics" },
];

const mockResources = [
  { id: 1, title: "Calculus Notes", courseId: 1, user: "john_doe", date: "2025-04-28", type: "PDF", rating: 4.5 },
  { id: 2, title: "Algorithm Design", courseId: 2, user: "jane_smith", date: "2025-04-26", type: "DOCX", rating: 5.0 },
  { id: 3, title: "Thermodynamics Cheat Sheet", courseId: 3, user: "sam_wilson", date: "2025-04-25", type: "PDF", rating: 4.2 },
];

const mockStudyGroups = [
  { id: 1, name: "Calculus Study Group", members: 8, course: "Mathematics" },
  { id: 2, name: "Algorithm Design Team", members: 5, course: "Computer Science" },
  { id: 3, name: "Physics Lab Partners", members: 4, course: "Physics" },
];

const mockTasks = [
  { id: 1, title: "Complete calculus homework", due: "2025-05-05", priority: "High", completed: false },
  { id: 2, title: "Review algorithm notes", due: "2025-05-06", priority: "Medium", completed: false },
  { id: 3, title: "Submit physics lab report", due: "2025-05-04", priority: "High", completed: true },
];

export default function StudySyncApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [pomodoroMode, setPomodoroMode] = useState('focus'); // focus or break
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResources, setFilteredResources] = useState(mockResources);
  const [tasks, setTasks] = useState(mockTasks);
  const [newTask, setNewTask] = useState({ title: '', due: '', priority: 'Medium' });
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Filter resources based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredResources(mockResources);
    } else {
      const filtered = mockResources.filter(resource => 
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mockCourses.find(c => c.id === resource.courseId)?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredResources(filtered);
    }
  }, [searchQuery]);

  // Pomodoro timer effect
  useEffect(() => {
    let interval;
    if (pomodoroActive && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime(prevTime => prevTime - 1);
      }, 1000);
    } else if (pomodoroTime === 0) {
      // Switch between focus and break
      if (pomodoroMode === 'focus') {
        setPomodoroMode('break');
        setPomodoroTime(5 * 60); // 5 minute break
      } else {
        setPomodoroMode('focus');
        setPomodoroTime(25 * 60); // 25 minute focus
      }
    }
    return () => clearInterval(interval);
  }, [pomodoroActive, pomodoroTime, pomodoroMode]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('dashboard');
  };

  const addTask = () => {
    if (newTask.title.trim() !== '') {
      setTasks([
        ...tasks,
        {
          id: tasks.length + 1,
          title: newTask.title,
          due: newTask.due || '2025-05-10',
          priority: newTask.priority,
          completed: false
        }
      ]);
      setNewTask({ title: '', due: '', priority: 'Medium' });
    }
  };

  const toggleTaskCompletion = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  // Components
  const LoginModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4">Log In</h2>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input type="email" className="w-full p-2 border rounded" placeholder="your@email.com" />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Password</label>
          <input type="password" className="w-full p-2 border rounded" placeholder="********" />
        </div>
        <div className="flex justify-between">
          <button 
            onClick={() => setShowLoginModal(false)} 
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button 
            onClick={handleLogin} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );

  const RegisterModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Username</label>
          <input type="text" className="w-full p-2 border rounded" placeholder="username" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input type="email" className="w-full p-2 border rounded" placeholder="your@email.com" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Password</label>
          <input type="password" className="w-full p-2 border rounded" placeholder="********" />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Confirm Password</label>
          <input type="password" className="w-full p-2 border rounded" placeholder="********" />
        </div>
        <div className="flex justify-between">
          <button 
            onClick={() => setShowRegisterModal(false)} 
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              setIsLoggedIn(true);
              setShowRegisterModal(false);
            }} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );

  const Header = () => (
    <header className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Book size={24} />
          <h1 className="text-2xl font-bold">Study Sync</h1>
        </div>
        <div className="flex space-x-4 items-center">
          {isLoggedIn ? (
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 bg-blue-700 p-2 rounded-md hover:bg-blue-800"
              >
                <User size={18} />
                <span>John Doe</span>
                <ChevronDown size={18} />
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 text-gray-800 z-10">
                  <a href="#" className="block px-4 py-2 hover:bg-gray-100">Profile</a>
                  <a href="#" className="block px-4 py-2 hover:bg-gray-100">Settings</a>
                  <a href="#" onClick={handleLogout} className="block px-4 py-2 hover:bg-gray-100">Logout</a>
                </div>
              )}
            </div>
          ) : (
            <>
              <button 
                onClick={() => setShowLoginModal(true)} 
                className="flex items-center space-x-1 hover:underline"
              >
                <LogIn size={18} />
                <span>Login</span>
              </button>
              <button 
                onClick={() => setShowRegisterModal(true)} 
                className="flex items-center space-x-1 hover:underline"
              >
                <UserPlus size={18} />
                <span>Register</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );

  const Navbar = () => (
    <nav className="bg-gray-100 border-b">
      <div className="container mx-auto">
        <ul className="flex">
          <li>
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`px-4 py-3 ${activeTab === 'dashboard' ? 'bg-white border-b-2 border-blue-500' : 'hover:bg-gray-200'}`}
            >
              Dashboard
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('resources')} 
              className={`px-4 py-3 ${activeTab === 'resources' ? 'bg-white border-b-2 border-blue-500' : 'hover:bg-gray-200'}`}
            >
              Resources
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('studygroups')} 
              className={`px-4 py-3 ${activeTab === 'studygroups' ? 'bg-white border-b-2 border-blue-500' : 'hover:bg-gray-200'}`}
            >
              Study Groups
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('pomodoro')} 
              className={`px-4 py-3 ${activeTab === 'pomodoro' ? 'bg-white border-b-2 border-blue-500' : 'hover:bg-gray-200'}`}
            >
              Pomodoro
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('todos')} 
              className={`px-4 py-3 ${activeTab === 'todos' ? 'bg-white border-b-2 border-blue-500' : 'hover:bg-gray-200'}`}
            >
              To-Dos
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );

  const Dashboard = () => (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <ul className="space-y-3">
            <li className="flex items-start space-x-2">
              <div className="bg-blue-100 p-1 rounded">
                <Upload size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm">You uploaded <span className="font-medium">Physics Notes</span></p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </li>
            <li className="flex items-start space-x-2">
              <div className="bg-green-100 p-1 rounded">
                <Users size={16} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm">You joined <span className="font-medium">Algorithm Design Team</span></p>
                <p className="text-xs text-gray-500">Yesterday</p>
              </div>
            </li>
            <li className="flex items-start space-x-2">
              <div className="bg-purple-100 p-1 rounded">
                <CheckSquare size={16} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm">You completed <span className="font-medium">Physics Lab Report</span></p>
                <p className="text-xs text-gray-500">2 days ago</p>
              </div>
            </li>
          </ul>
        </div>
        
        {/* Upcoming Tasks */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Upcoming Tasks</h3>
          <ul className="space-y-3">
            {tasks.filter(task => !task.completed).slice(0, 3).map(task => (
              <li key={task.id} className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={task.completed}
                  onChange={() => toggleTaskCompletion(task.id)}
                  className="h-4 w-4 text-blue-600 rounded" 
                />
                <div>
                  <p className="text-sm font-medium">{task.title}</p>
                  <p className="text-xs text-gray-500">Due: {task.due} • {task.priority}</p>
                </div>
              </li>
            ))}
            {tasks.filter(task => !task.completed).length === 0 && (
              <p className="text-sm text-gray-500">No upcoming tasks</p>
            )}
          </ul>
        </div>
        
        {/* Pomodoro Status */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Pomodoro Status</h3>
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full border-4 border-blue-500 flex items-center justify-center mb-4">
              <span className="text-2xl font-bold">{formatTime(pomodoroTime)}</span>
            </div>
            <p className="mb-2 text-center">
              {pomodoroActive ? 
                `${pomodoroMode === 'focus' ? 'Focus' : 'Break'} time remaining` : 
                'Start a Pomodoro session'
              }
            </p>
            {!pomodoroActive && (
              <button 
                onClick={() => {
                  setPomodoroActive(true);
                  setActiveTab('pomodoro');
                }} 
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Start Session
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const Resources = () => (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Resources</h2>
        <div className="flex space-x-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search resources..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md w-64" 
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center">
            <Upload size={18} className="mr-1" />
            Upload Resource
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResources.map(resource => (
                <tr key={resource.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText size={18} className="text-gray-500 mr-2" />
                      <div className="text-sm font-medium text-gray-900">{resource.title}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {mockCourses.find(c => c.id === resource.courseId)?.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{resource.user}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{resource.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {resource.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star size={16} className="text-yellow-500 mr-1" />
                      <span className="text-sm text-gray-900">{resource.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <a href="#" className="text-blue-600 hover:text-blue-900 mr-3">Download</a>
                    <a href="#" className="text-green-600 hover:text-green-900">Rate</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const StudyGroups = () => (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Study Groups</h2>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center">
          <Plus size={18} className="mr-1" />
          Create Group
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockStudyGroups.map(group => (
          <div key={group.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">{group.name}</h3>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {group.course}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-600 mb-4">
              <Users size={16} className="mr-1" />
              <span>{group.members} members</span>
            </div>
            
            <div className="border-t pt-4 mt-2">
              <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <div className="bg-green-100 p-1 rounded mt-0.5">
                    <Upload size={12} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs">Jane shared <span className="font-medium">Midterm Notes</span></p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="bg-purple-100 p-1 rounded mt-0.5">
                    <Calendar size={12} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs">Study session scheduled for <span className="font-medium">May 5th</span></p>
                    <p className="text-xs text-gray-500">Yesterday</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="flex justify-between mt-4 pt-4 border-t">
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View Details</button>
              <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">Join Group</button>
            </div>
          </div>
        ))}
      </div>
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
    </div>
  );
}