import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import path from 'path';
import { getDatabase } from '../db/database';
import { Project } from '../types';

const router = Router();
const WORKSPACE_DIR = process.env.WORKSPACE_DIR || path.join(process.cwd(), 'workspace');

// List all projects
router.get('/', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const projects = db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all() as Project[];
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to list projects' });
  }
});

// Create new project
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, type, framework, language, network } = req.body;

    if (!name || !type || !framework || !language || !network) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const id = uuidv4();
    const projectPath = path.join(WORKSPACE_DIR, name);

    // Create project directory
    await fs.mkdir(projectPath, { recursive: true });

    // Create basic project structure
    const dirs = [
      'contracts',
      'test',
      'scripts',
      'artifacts',
      'lib'
    ];

    for (const dir of dirs) {
      await fs.mkdir(path.join(projectPath, dir), { recursive: true });
    }

    // Create .gitkeep files
    for (const dir of dirs) {
      await fs.writeFile(path.join(projectPath, dir, '.gitkeep'), '');
    }

    // Insert into database
    const db = getDatabase();
    db.prepare(`
      INSERT INTO projects (id, name, path, type, framework, language, network)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, projectPath, type, framework, language, network);

    const project: Project = {
      id,
      name,
      path: projectPath,
      type: type as any,
      framework: framework as any,
      language: language as any,
      network: network as any,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    res.status(201).json(project);
  } catch (error: any) {
    console.error('Project creation error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Get project details
router.get('/:id', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id) as Project | undefined;
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get project' });
  }
});

// Delete project
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id) as Project | undefined;

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Delete from database
    db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
    db.prepare('DELETE FROM ai_conversations WHERE project_id = ?').run(req.params.id);
    db.prepare('DELETE FROM terminal_commands WHERE project_id = ?').run(req.params.id);
    db.prepare('DELETE FROM deployments WHERE project_id = ?').run(req.params.id);

    // Delete project directory
    await fs.rm(project.path, { recursive: true, force: true });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export const projectRouter = router;
