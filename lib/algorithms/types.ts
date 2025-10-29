/* eslint-disable @typescript-eslint/no-explicit-any */
import { GraphElement } from '../graphGenerators';

/**
 * Represents a single step in an algorithm's execution
 */
export interface AlgorithmStep {
  /** Nodes that have been visited/processed */
  visitedNodes: string[];

  /** The node currently being processed */
  currentNode: string | null;

  /** Edges being highlighted in this step */
  highlightedEdges: string[];

  /** Algorithm-specific data (distances, parents, flow values, etc.) */
  data: Record<string, any>;

  /** Human-readable description of what's happening */
  description: string;

  /** Line number in the Java code to highlight (1-indexed) */
  codeLineNumber: number;
}

/**
 * Configuration for running an algorithm
 */
export interface AlgorithmConfig {
  /** Starting node ID (for shortest path, traversal algorithms) */
  startNode?: string;

  /** Ending node ID (for shortest path algorithms) */
  endNode?: string;

  /** Whether to use edge weights (defaults to 1 if not specified) */
  useWeights?: boolean;

  /** Additional algorithm-specific configuration */
  [key: string]: any;
}

/**
 * Result of executing an algorithm
 */
export interface AlgorithmResult {
  /** All steps of the algorithm execution */
  steps: AlgorithmStep[];

  /** Whether the algorithm completed successfully */
  success: boolean;

  /** Error message if the algorithm failed */
  error?: string;

  /** Final result data (total cost, max flow, path, etc.) */
  finalData?: Record<string, any>;
}

/**
 * Algorithm category
 */
export type AlgorithmCategory =
  | 'shortest-path'
  | 'mst'
  | 'traversal'
  | 'flow'
  | 'connectivity';

/**
 * Complete algorithm definition
 */
export interface Algorithm {
  /** Unique identifier for the algorithm */
  id: string;

  /** Display name */
  name: string;

  /** Algorithm category */
  category: AlgorithmCategory;

  /** Short description */
  description: string;

  /** Whether this algorithm requires a starting node */
  requiresStartNode: boolean;

  /** Whether this algorithm requires an ending node */
  requiresEndNode: boolean;

  /** Whether this algorithm requires weighted edges */
  requiresWeights: boolean;

  /** Execute the algorithm and return all steps */
  execute: (graph: GraphElement[], config: AlgorithmConfig) => AlgorithmResult;

  /** Java implementation code as a string */
  javaCode: string;

  /** Complexity information */
  complexity: {
    time: string;
    space: string;
  };
}

/**
 * Helper type for visualization state
 */
export interface VisualizationState {
  /** Current step index */
  currentStepIndex: number;

  /** Whether the algorithm is playing */
  isPlaying: boolean;

  /** Playback speed multiplier */
  speed: number;

  /** Whether the algorithm has finished */
  isFinished: boolean;
}
