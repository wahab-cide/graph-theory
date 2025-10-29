import { Algorithm } from './types';
import { dijkstraAlgorithm } from './dijkstra';

/**
 * Registry of all available algorithms
 */
export const algorithms: Algorithm[] = [
  dijkstraAlgorithm,
  // More algorithms will be added here (BFS, DFS, Prim's, etc.)
];

/**
 * Get algorithm by ID
 */
export function getAlgorithmById(id: string): Algorithm | undefined {
  return algorithms.find((algo) => algo.id === id);
}

/**
 * Get algorithms by category
 */
export function getAlgorithmsByCategory(category: string): Algorithm[] {
  return algorithms.filter((algo) => algo.category === category);
}

// Re-export types
export * from './types';
