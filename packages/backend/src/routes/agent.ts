import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../db/database';
import { AIMessage } from '../types';

const router = Router();

// Get conversation history
router.get('/conversations/:projectId', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const messages = db.prepare(`
      SELECT * FROM ai_conversations 
      WHERE project_id = ?
      ORDER BY created_at ASC
    `).all(req.params.projectId) as any[];

    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Send message to AI agent
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { projectId, message } = req.body;

    if (!projectId || !message) {
      return res.status(400).json({ error: 'Missing projectId or message' });
    }

    const db = getDatabase();
    const messageId = uuidv4();

    // Store user message
    db.prepare(`
      INSERT INTO ai_conversations (id, project_id, role, content)
      VALUES (?, ?, ?, ?)
    `).run(messageId, projectId, 'user', message);

    // TODO: Integrate with actual AI provider
    const response = 'AI response placeholder';
    const assistantId = uuidv4();
    db.prepare(`
      INSERT INTO ai_conversations (id, project_id, role, content)
      VALUES (?, ?, ?, ?)
    `).run(assistantId, projectId, 'assistant', response);

    res.json({ 
      userMessageId: messageId,
      assistantMessageId: assistantId,
      response 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export const agentRouter = router;
