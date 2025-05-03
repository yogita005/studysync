import express from 'express';
import cors from 'cors';
import { registerUser, loginUser } from '../services/userService.js';
import { getResources, uploadResource, rateResource } from '../services/resourceService.js';
import { getStudyGroups, createStudyGroup, joinStudyGroup, leaveStudyGroup } from '../services/studyGroupService.js';
import { getTasks, createTask, updateTaskCompletion } from '../services/taskService.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { testConnection } from '../database/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configure file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Test database connection on startup
app.listen(3001, async () => {
  const connected = await testConnection();
  if (connected) {
    console.log('Server running on http://localhost:3001');
  } else {
    console.error('Server started but database connection failed');
  }
});

// Auth routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await registerUser(username, email, password);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    
    if (!result.success) {
      return res.status(401).json({ error: result.message });
    }
    
    res.json({ user: result.user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Resources routes
app.get('/api/resources', async (req, res) => {
  try {
    const { search } = req.query;
    const resources = await getResources(search);
    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/resources', upload.single('file'), async (req, res) => {
  try {
    const { title, courseId, description } = req.body;
    const userId = req.body.userId; // In production, get from auth token
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const filePath = req.file.path;
    const fileType = path.extname(req.file.originalname).substring(1).toUpperCase();
    
    const resource = await uploadResource(title, courseId, userId, filePath, fileType, description);
    res.json(resource);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/resources/:id/rate', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, rating, comment } = req.body;
    
    const result = await rateResource(id, userId, rating, comment);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Study groups routes
app.get('/api/study-groups', async (req, res) => {
  try {
    const groups = await getStudyGroups();
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/study-groups', async (req, res) => {
  try {
    const { name, courseId, userId } = req.body;
    const group = await createStudyGroup(name, courseId, userId);
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/study-groups/:id/join', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    const result = await joinStudyGroup(id, userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/study-groups/:id/leave', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    const result = await leaveStudyGroup(id, userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tasks routes
app.get('/api/tasks', async (req, res) => {
  try {
    const { userId } = req.query;
    const tasks = await getTasks(userId);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { userId, title, dueDate, priority } = req.body;
    const task = await createTask(userId, title, dueDate, priority);
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tasks/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, completed } = req.body;
    
    const result = await updateTaskCompletion(id, userId, completed);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default app;