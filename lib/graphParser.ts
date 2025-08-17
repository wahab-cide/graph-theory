import { GraphElement } from './graphGenerators';

export interface ParseResult {
  success: boolean;
  graph?: GraphElement[];
  error?: string;
  suggestion?: string;
}

export const parseGraphInput = (input: string): ParseResult => {
  const trimmed = input.trim().toLowerCase();
  
  if (!trimmed) {
    return { success: false, error: 'Please enter a graph description' };
  }

  // Try different parsing methods in order of specificity
  
  // 1. Named graph patterns
  const namedResult = parseNamedGraph(trimmed);
  if (namedResult.success) return namedResult;
  
  // 2. Natural language patterns
  const nlResult = parseNaturalLanguage(trimmed);
  if (nlResult.success) return nlResult;
  
  // 3. Adjacency list format
  const adjResult = parseAdjacencyList(trimmed);
  if (adjResult.success) return adjResult;
  
  // 4. Edge list format
  const edgeResult = parseEdgeList(trimmed);
  if (edgeResult.success) return edgeResult;
  
  // 5. Matrix format
  const matrixResult = parseAdjacencyMatrix(trimmed);
  if (matrixResult.success) return matrixResult;

  return {
    success: false,
    error: 'Could not parse input',
    suggestion: 'Try: "complete graph 5", "cycle 4", "1-2, 2-3, 3-1", or "[[0,1,0],[1,0,1],[0,1,0]]"'
  };
};

function parseNamedGraph(input: string): ParseResult {
  const patterns = [
    // Complete graphs
    { regex: /(?:complete|k)[\s_-]*(\d+)/i, type: 'complete' },
    // Cycle graphs
    { regex: /(?:cycle|c)[\s_-]*(\d+)/i, type: 'cycle' },
    // Path graphs
    { regex: /(?:path|p)[\s_-]*(\d+)/i, type: 'path' },
    // Star graphs
    { regex: /(?:star|s)[\s_-]*(\d+)/i, type: 'star' },
    // Wheel graphs
    { regex: /(?:wheel|w)[\s_-]*(\d+)/i, type: 'wheel' },
    // Bipartite
    { regex: /(?:bipartite|k)[\s_-]*(\d+)[\s,_-]+(\d+)/i, type: 'bipartite' },
    // Special graphs
    { regex: /petersen/i, type: 'petersen' },
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern.regex);
    if (match) {
      const n = parseInt(match[1]) || 0;
      const m = parseInt(match[2]) || 0;
      
      if (pattern.type === 'bipartite' && n > 0 && m > 0) {
        return { success: true, graph: generateBipartiteGraph(n, m) };
      } else if (pattern.type === 'petersen') {
        return { success: true, graph: generatePetersenGraph() };
      } else if (n > 0 && n <= 20) {
        return { success: true, graph: generateGraphByType(pattern.type, n) };
      } else {
        return { success: false, error: `Invalid size: ${n}. Use 1-20 nodes.` };
      }
    }
  }

  return { success: false, error: 'Not a recognized graph name' };
}

function parseNaturalLanguage(input: string): ParseResult {
  const patterns = [
    // "5 nodes in a circle"
    { regex: /(\d+)\s+nodes?\s+in\s+a\s+(?:circle|cycle)/i, type: 'cycle' },
    // "4 nodes all connected"
    { regex: /(\d+)\s+nodes?\s+(?:all\s+)?connected/i, type: 'complete' },
    // "6 nodes in a line"
    { regex: /(\d+)\s+nodes?\s+in\s+a\s+(?:line|path)/i, type: 'path' },
    // "star with 5 points"
    { regex: /star\s+with\s+(\d+)\s+(?:points?|nodes?)/i, type: 'star' },
    // "tree with 7 nodes"
    { regex: /tree\s+with\s+(\d+)\s+nodes?/i, type: 'tree' },
    // "empty graph 5"
    { regex: /empty\s+(?:graph\s+)?(\d+)/i, type: 'empty' },
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern.regex);
    if (match) {
      const n = parseInt(match[1]);
      if (n > 0 && n <= 20) {
        return { success: true, graph: generateGraphByType(pattern.type, n) };
      } else {
        return { success: false, error: `Invalid size: ${n}. Use 1-20 nodes.` };
      }
    }
  }

  return { success: false, error: 'Not recognized as natural language' };
}

function parseAdjacencyList(input: string): ParseResult {
  try {
    // Format: "1: 2,3; 2: 1,4; 3: 1; 4: 2"
    const lines = input.split(/[;\n]/);
    const adjacencies: Record<string, string[]> = {};
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      const colonMatch = trimmedLine.match(/^(\w+)\s*:\s*(.*)$/);
      if (!colonMatch) continue;
      
      const node = colonMatch[1];
      const neighborsStr = colonMatch[2].trim();
      
      if (neighborsStr) {
        adjacencies[node] = neighborsStr.split(/[,\s]+/).filter(n => n);
      } else {
        adjacencies[node] = [];
      }
    }

    if (Object.keys(adjacencies).length === 0) {
      return { success: false, error: 'No valid adjacency list found' };
    }

    return { success: true, graph: convertAdjacencyListToGraph(adjacencies) };
  } catch (error) {
    return { success: false, error: 'Invalid adjacency list format' };
  }
}

function parseEdgeList(input: string): ParseResult {
  try {
    // Format: "1-2, 2-3, 3-4, 1-4" or "1 2; 2 3; 3 4; 1 4"
    const edges = input
      .split(/[,;\n]/)
      .map(edge => edge.trim())
      .filter(edge => edge)
      .map(edge => {
        const match = edge.match(/^(\w+)[\s\-–—](\w+)$/);
        return match ? [match[1], match[2]] : null;
      })
      .filter(edge => edge !== null) as [string, string][];

    if (edges.length === 0) {
      return { success: false, error: 'No valid edges found' };
    }

    return { success: true, graph: convertEdgeListToGraph(edges) };
  } catch (error) {
    return { success: false, error: 'Invalid edge list format' };
  }
}

function parseAdjacencyMatrix(input: string): ParseResult {
  try {
    // Remove brackets and split by rows
    const cleaned = input.replace(/[\[\]]/g, '');
    const rows = cleaned.split(/[,;\n]/).map(row => 
      row.trim().split(/\s+/).map(val => parseInt(val.trim())).filter(n => !isNaN(n))
    ).filter(row => row.length > 0);

    if (rows.length === 0 || !rows.every(row => row.length === rows[0].length)) {
      return { success: false, error: 'Invalid matrix format' };
    }

    const n = rows.length;
    if (n !== rows[0].length) {
      return { success: false, error: 'Matrix must be square' };
    }

    return { success: true, graph: convertMatrixToGraph(rows) };
  } catch (error) {
    return { success: false, error: 'Invalid matrix format' };
  }
}

// Helper functions to generate graphs
function generateGraphByType(type: string, n: number): GraphElement[] {
  switch (type) {
    case 'complete': return generateComplete(n);
    case 'cycle': return generateCycle(n);
    case 'path': return generatePath(n);
    case 'star': return generateStar(n);
    case 'wheel': return generateWheel(n);
    case 'tree': return generateRandomTree(n);
    case 'empty': return generateEmpty(n);
    default: return generateComplete(n);
  }
}

function generateComplete(n: number): GraphElement[] {
  const elements: GraphElement[] = [];
  
  // Create nodes in circle
  for (let i = 1; i <= n; i++) {
    const angle = (2 * Math.PI * (i - 1)) / n;
    elements.push({
      data: { id: i.toString(), label: i.toString() },
      position: {
        x: 120 * Math.cos(angle),
        y: 120 * Math.sin(angle)
      }
    });
  }

  // Create all edges
  for (let i = 1; i <= n; i++) {
    for (let j = i + 1; j <= n; j++) {
      elements.push({
        data: { id: `e${i}-${j}`, source: i.toString(), target: j.toString() }
      });
    }
  }

  return elements;
}

function generateCycle(n: number): GraphElement[] {
  const elements: GraphElement[] = [];
  
  // Create nodes in circle
  for (let i = 1; i <= n; i++) {
    const angle = (2 * Math.PI * (i - 1)) / n;
    elements.push({
      data: { id: i.toString(), label: i.toString() },
      position: {
        x: 120 * Math.cos(angle),
        y: 120 * Math.sin(angle)
      }
    });
  }

  // Create cycle edges
  for (let i = 1; i <= n; i++) {
    const next = i === n ? 1 : i + 1;
    elements.push({
      data: { id: `e${i}-${next}`, source: i.toString(), target: next.toString() }
    });
  }

  return elements;
}

function generatePath(n: number): GraphElement[] {
  const elements: GraphElement[] = [];
  const spacing = 100;

  // Create nodes in line
  for (let i = 1; i <= n; i++) {
    elements.push({
      data: { id: i.toString(), label: i.toString() },
      position: {
        x: (i - 1) * spacing - ((n - 1) * spacing) / 2,
        y: 0
      }
    });
  }

  // Create path edges
  for (let i = 1; i < n; i++) {
    elements.push({
      data: { id: `e${i}-${i + 1}`, source: i.toString(), target: (i + 1).toString() }
    });
  }

  return elements;
}

function generateStar(n: number): GraphElement[] {
  const elements: GraphElement[] = [];
  const radius = 120;

  // Center node
  elements.push({
    data: { id: '1', label: '1' },
    position: { x: 0, y: 0 }
  });

  // Outer nodes
  for (let i = 2; i <= n; i++) {
    const angle = (2 * Math.PI * (i - 2)) / (n - 1);
    elements.push({
      data: { id: i.toString(), label: i.toString() },
      position: {
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle)
      }
    });

    // Edge from center
    elements.push({
      data: { id: `e1-${i}`, source: '1', target: i.toString() }
    });
  }

  return elements;
}

function generateWheel(n: number): GraphElement[] {
  const elements = generateCycle(n - 1);
  
  // Add center node
  elements.push({
    data: { id: n.toString(), label: n.toString() },
    position: { x: 0, y: 0 }
  });

  // Add spokes
  for (let i = 1; i < n; i++) {
    elements.push({
      data: { id: `e${n}-${i}`, source: n.toString(), target: i.toString() }
    });
  }

  return elements;
}

function generateBipartiteGraph(m: number, n: number): GraphElement[] {
  const elements: GraphElement[] = [];
  const spacing = 80;
  const separation = 200;

  // Left set
  for (let i = 1; i <= m; i++) {
    elements.push({
      data: { id: i.toString(), label: i.toString() },
      position: {
        x: -separation / 2,
        y: (i - 1) * spacing - ((m - 1) * spacing) / 2
      }
    });
  }

  // Right set
  for (let i = 1; i <= n; i++) {
    const id = (m + i).toString();
    elements.push({
      data: { id, label: id },
      position: {
        x: separation / 2,
        y: (i - 1) * spacing - ((n - 1) * spacing) / 2
      }
    });
  }

  // All cross edges
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const target = (m + j).toString();
      elements.push({
        data: { id: `e${i}-${target}`, source: i.toString(), target: target }
      });
    }
  }

  return elements;
}

function generatePetersenGraph(): GraphElement[] {
  const elements: GraphElement[] = [];
  const outerRadius = 150;
  const innerRadius = 75;

  // Outer pentagon (nodes 1-5)
  for (let i = 1; i <= 5; i++) {
    const angle = (2 * Math.PI * (i - 1)) / 5 - Math.PI / 2;
    elements.push({
      data: { id: i.toString(), label: i.toString() },
      position: {
        x: outerRadius * Math.cos(angle),
        y: outerRadius * Math.sin(angle)
      }
    });
  }

  // Inner pentagram (nodes 6-10)
  for (let i = 6; i <= 10; i++) {
    const angle = (2 * Math.PI * (i - 6)) / 5 - Math.PI / 2;
    elements.push({
      data: { id: i.toString(), label: i.toString() },
      position: {
        x: innerRadius * Math.cos(angle),
        y: innerRadius * Math.sin(angle)
      }
    });
  }

  // Outer pentagon edges
  for (let i = 1; i <= 5; i++) {
    const next = i === 5 ? 1 : i + 1;
    elements.push({
      data: {
        id: `e${i}-${next}`,
        source: i.toString(),
        target: next.toString()
      }
    });
  }

  // Spokes (outer to inner)
  for (let i = 1; i <= 5; i++) {
    elements.push({
      data: {
        id: `e${i}-${i + 5}`,
        source: i.toString(),
        target: (i + 5).toString()
      }
    });
  }

  // Inner pentagram edges (skip 1, connect every second node)
  for (let i = 6; i <= 10; i++) {
    const target = i + 2 > 10 ? i + 2 - 5 : i + 2;
    elements.push({
      data: {
        id: `e${i}-${target}`,
        source: i.toString(),
        target: target.toString()
      }
    });
  }

  return elements;
}

function generateRandomTree(n: number): GraphElement[] {
  const elements: GraphElement[] = [];
  
  // Simple tree generation - can be improved
  const radius = 120;
  for (let i = 1; i <= n; i++) {
    const angle = (2 * Math.PI * (i - 1)) / n;
    elements.push({
      data: { id: i.toString(), label: i.toString() },
      position: {
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle)
      }
    });
  }

  // Connect as a path for simplicity
  for (let i = 1; i < n; i++) {
    elements.push({
      data: { id: `e${i}-${i + 1}`, source: i.toString(), target: (i + 1).toString() }
    });
  }

  return elements;
}

function generateEmpty(n: number): GraphElement[] {
  const elements: GraphElement[] = [];
  const radius = 120;

  // Just nodes, no edges
  for (let i = 1; i <= n; i++) {
    const angle = (2 * Math.PI * (i - 1)) / n;
    elements.push({
      data: { id: i.toString(), label: i.toString() },
      position: {
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle)
      }
    });
  }

  return elements;
}

function convertAdjacencyListToGraph(adjacencies: Record<string, string[]>): GraphElement[] {
  const elements: GraphElement[] = [];
  const nodes = Object.keys(adjacencies);
  const addedEdges = new Set<string>();

  // Create nodes in circle
  nodes.forEach((node, index) => {
    const angle = (2 * Math.PI * index) / nodes.length;
    elements.push({
      data: { id: node, label: node },
      position: {
        x: 120 * Math.cos(angle),
        y: 120 * Math.sin(angle)
      }
    });
  });

  // Create edges
  for (const [node, neighbors] of Object.entries(adjacencies)) {
    for (const neighbor of neighbors) {
      const edgeId1 = `${node}-${neighbor}`;
      const edgeId2 = `${neighbor}-${node}`;
      
      if (!addedEdges.has(edgeId1) && !addedEdges.has(edgeId2)) {
        elements.push({
          data: { id: edgeId1, source: node, target: neighbor }
        });
        addedEdges.add(edgeId1);
        addedEdges.add(edgeId2);
      }
    }
  }

  return elements;
}

function convertEdgeListToGraph(edges: [string, string][]): GraphElement[] {
  const elements: GraphElement[] = [];
  const nodeSet = new Set<string>();

  // Collect all unique nodes
  edges.forEach(([source, target]) => {
    nodeSet.add(source);
    nodeSet.add(target);
  });

  const nodes = Array.from(nodeSet);

  // Create nodes in circle
  nodes.forEach((node, index) => {
    const angle = (2 * Math.PI * index) / nodes.length;
    elements.push({
      data: { id: node, label: node },
      position: {
        x: 120 * Math.cos(angle),
        y: 120 * Math.sin(angle)
      }
    });
  });

  // Create edges
  edges.forEach(([source, target], index) => {
    elements.push({
      data: { id: `e${index}`, source, target }
    });
  });

  return elements;
}

function convertMatrixToGraph(matrix: number[][]): GraphElement[] {
  const elements: GraphElement[] = [];
  const n = matrix.length;

  // Create nodes in circle
  for (let i = 0; i < n; i++) {
    const angle = (2 * Math.PI * i) / n;
    elements.push({
      data: { id: (i + 1).toString(), label: (i + 1).toString() },
      position: {
        x: 120 * Math.cos(angle),
        y: 120 * Math.sin(angle)
      }
    });
  }

  // Create edges from matrix
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (matrix[i][j] === 1) {
        elements.push({
          data: {
            id: `e${i + 1}-${j + 1}`,
            source: (i + 1).toString(),
            target: (j + 1).toString()
          }
        });
      }
    }
  }

  return elements;
}