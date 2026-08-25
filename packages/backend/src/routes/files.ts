import { Router, Request, Response } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { FileNode } from '../types';

const router = Router();

// Get file tree
router.get('/tree', async (req: Request, res: Response) => {
  try {
    const { projectPath } = req.query;
    
    if (!projectPath || typeof projectPath !== 'string') {
      return res.status(400).json({ error: 'Missing projectPath' });
    }

    const tree = await buildFileTree(projectPath);
    res.json(tree);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get file content
router.get('/content', async (req: Request, res: Response) => {
  try {
    const { filePath } = req.query;
    
    if (!filePath || typeof filePath !== 'string') {
      return res.status(400).json({ error: 'Missing filePath' });
    }

    const content = await fs.readFile(filePath, 'utf-8');
    res.json({ content });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Save file
router.post('/save', async (req: Request, res: Response) => {
  try {
    const { filePath, content } = req.body;
    
    if (!filePath || content === undefined) {
      return res.status(400).json({ error: 'Missing filePath or content' });
    }

    // Create directories if they don't exist
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    await fs.writeFile(filePath, content, 'utf-8');
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create file
router.post('/create', async (req: Request, res: Response) => {
  try {
    const { filePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ error: 'Missing filePath' });
    }

    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, '', 'utf-8');

    res.status(201).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete file
router.delete('/', async (req: Request, res: Response) => {
  try {
    const { filePath } = req.query;
    
    if (!filePath || typeof filePath !== 'string') {
      return res.status(400).json({ error: 'Missing filePath' });
    }

    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      await fs.rm(filePath, { recursive: true, force: true });
    } else {
      await fs.unlink(filePath);
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

async function buildFileTree(dirPath: string): Promise<FileNode> {
  try {
    const stat = await fs.stat(dirPath);
    const name = path.basename(dirPath);

    const node: FileNode = {
      id: dirPath,
      name: name || 'root',
      path: dirPath,
      type: 'file'
    };

    if (stat.isDirectory()) {
      node.type = 'directory';
      node.children = [];

      try {
        const files = await fs.readdir(dirPath);
        for (const file of files) {
          if (file.startsWith('.')) continue; // Skip hidden files
          const filePath = path.join(dirPath, file);
          const child = await buildFileTree(filePath);
          node.children!.push(child);
        }
      } catch (error) {
        console.error('Error reading directory:', dirPath, error);
      }
    } else {
      node.size = stat.size;
      node.modified = stat.mtime;
    }

    return node;
  } catch (error: any) {
    throw new Error(`Failed to read ${dirPath}: ${error.message}`);
  }
}

export const fileRouter = router;
