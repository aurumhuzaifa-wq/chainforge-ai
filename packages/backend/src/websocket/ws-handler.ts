import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';

interface Client {
  id: string;
  ws: WebSocket;
  projectId?: string;
}

const clients: Map<string, Client> = new Map();

export function setupWebSocket(wss: WebSocketServer) {
  wss.on('connection', (ws: WebSocket) => {
    const clientId = uuidv4();
    const client: Client = { id: clientId, ws };
    clients.set(clientId, client);

    console.log(`WebSocket client connected: ${clientId}`);

    ws.on('message', async (data: string) => {
      try {
        const message = JSON.parse(data);
        handleMessage(clientId, message, wss);
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({ type: 'error', error: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      clients.delete(clientId);
      console.log(`WebSocket client disconnected: ${clientId}`);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Send welcome message
    ws.send(JSON.stringify({ type: 'connected', clientId }));
  });
}

function handleMessage(clientId: string, message: any, wss: WebSocketServer) {
  const client = clients.get(clientId);
  if (!client) return;

  switch (message.type) {
    case 'subscribe':
      client.projectId = message.projectId;
      client.ws.send(JSON.stringify({ type: 'subscribed', projectId: message.projectId }));
      break;

    case 'terminal_output':
      broadcast(wss, {
        type: 'terminal_output',
        projectId: client.projectId,
        data: message.data
      });
      break;

    case 'agent_update':
      broadcast(wss, {
        type: 'agent_update',
        projectId: client.projectId,
        data: message.data
      });
      break;

    default:
      console.log('Unknown message type:', message.type);
  }
}

function broadcast(wss: WebSocketServer, message: any) {
  const data = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // OPEN
      client.send(data);
    }
  });
}

export { clients };
