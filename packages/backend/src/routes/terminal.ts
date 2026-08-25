import { Router, Request, Response } from 'express';
import { exec, spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../db/database';
import { TerminalCommand } from '../types';

const router = Router();

// Execute command
router.post('/exec', async (req: Request, res: Response) => {
  try {
    const { command, cwd = process.cwd() } = req.body;

    if (!command) {
      return res.status(400).json({ error: 'Missing command' });
    }

    const id = uuidv4();
    const db = getDatabase();

    // Insert into database
    db.prepare(`
      INSERT INTO terminal_commands (id, project_id, command, working_directory, status, stdout, stderr)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, 'default', command, cwd, 'running', '', '');

    // Execute command
    exec(command, { cwd, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      const exitCode = error ? error.code || 1 : 0;
      
      db.prepare(`
        UPDATE terminal_commands 
        SET status = ?, exit_code = ?, stdout = ?, stderr = ?, completed_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(error ? 'failed' : 'completed', exitCode, stdout, stderr, id);
    });

    res.json({ commandId: id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get command status
router.get('/:commandId', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const cmd = db.prepare('SELECT * FROM terminal_commands WHERE id = ?').get(req.params.commandId) as any;

    if (!cmd) {
      return res.status(404).json({ error: 'Command not found' });
    }

    res.json(cmd);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export const terminalRouter = router;
