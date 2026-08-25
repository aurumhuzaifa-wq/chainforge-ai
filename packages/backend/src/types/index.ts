export interface Project {
  id: string;
  name: string;
  path: string;
  type: 'smart_contract' | 'token' | 'nft' | 'defi' | 'dao' | 'dapp' | 'explorer' | 'wallet' | 'evm_chain' | 'l2_prototype';
  framework: 'foundry' | 'hardhat';
  language: 'solidity' | 'typescript';
  network: 'local' | 'ethereum' | 'bnb' | 'polygon' | 'base' | 'arbitrum' | 'optimism';
  createdAt: Date;
  updatedAt: Date;
}

export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  content?: string;
  size?: number;
  modified?: Date;
}

export interface TerminalCommand {
  id: string;
  command: string;
  workingDirectory: string;
  status: 'running' | 'completed' | 'failed';
  exitCode?: number;
  stdout: string;
  stderr: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface AIMessage {
  id: string;
  projectId: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: ToolCall[];
  createdAt: Date;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
  result?: any;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
}

export interface AIProvider {
  type: 'openai' | 'anthropic' | 'google' | 'local';
  model: string;
  apiKey?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface DeploymentConfig {
  network: string;
  contractAddress?: string;
  transactionHash?: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
}
