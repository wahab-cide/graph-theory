export interface GraphElement {
  data: {
    id: string;
    label?: string;
    source?: string;
    target?: string;
  };
  position?: { x: number; y: number };
}

export const generateGraph = (type: string): GraphElement[] => {
  switch (type) {
    case 'complete4':
      return generateCompleteGraph(4);
    case 'complete5':
      return generateCompleteGraph(5);
    case 'cycle5':
      return generateCycleGraph(5);
    case 'path5':
      return generatePathGraph(5);
    case 'star5':
      return generateStarGraph(5);
    case 'wheel5':
      return generateWheelGraph(5);
    case 'bipartite':
      return generateBipartiteGraph(2, 3);
    case 'petersen':
      return generatePetersenGraph();
    default:
      return getDefaultGraph();
  }
};

function generateCompleteGraph(n: number): GraphElement[] {
  const elements: GraphElement[] = [];
  const radius = 120;
  const centerX = 0;
  const centerY = 0;

  // Create nodes
  for (let i = 1; i <= n; i++) {
    const angle = (2 * Math.PI * (i - 1)) / n;
    elements.push({
      data: { id: i.toString(), label: i.toString() },
      position: {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      }
    });
  }

  // Create edges (all pairs)
  for (let i = 1; i <= n; i++) {
    for (let j = i + 1; j <= n; j++) {
      elements.push({
        data: {
          id: `e${i}-${j}`,
          source: i.toString(),
          target: j.toString()
        }
      });
    }
  }

  return elements;
}

function generateCycleGraph(n: number): GraphElement[] {
  const elements: GraphElement[] = [];
  const radius = 120;
  const centerX = 0;
  const centerY = 0;

  // Create nodes
  for (let i = 1; i <= n; i++) {
    const angle = (2 * Math.PI * (i - 1)) / n;
    elements.push({
      data: { id: i.toString(), label: i.toString() },
      position: {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      }
    });
  }

  // Create cycle edges
  for (let i = 1; i <= n; i++) {
    const next = i === n ? 1 : i + 1;
    elements.push({
      data: {
        id: `e${i}-${next}`,
        source: i.toString(),
        target: next.toString()
      }
    });
  }

  return elements;
}

function generatePathGraph(n: number): GraphElement[] {
  const elements: GraphElement[] = [];
  const spacing = 100;

  // Create nodes in a line
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
      data: {
        id: `e${i}-${i + 1}`,
        source: i.toString(),
        target: (i + 1).toString()
      }
    });
  }

  return elements;
}

function generateStarGraph(n: number): GraphElement[] {
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

    // Edge from center to outer node
    elements.push({
      data: {
        id: `e1-${i}`,
        source: '1',
        target: i.toString()
      }
    });
  }

  return elements;
}

function generateWheelGraph(n: number): GraphElement[] {
  const elements = generateCycleGraph(n - 1);
  
  // Add center node
  elements.push({
    data: { id: n.toString(), label: n.toString() },
    position: { x: 0, y: 0 }
  });

  // Add spokes
  for (let i = 1; i < n; i++) {
    elements.push({
      data: {
        id: `e${n}-${i}`,
        source: n.toString(),
        target: i.toString()
      }
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
        data: {
          id: `e${i}-${target}`,
          source: i.toString(),
          target: target
        }
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

  // Inner pentagram edges (skip 1)
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

function getDefaultGraph(): GraphElement[] {
  // Return the original sample graph
  return [
    { data: { id: '1', label: '1' }, position: { x: 0, y: -120 } },
    { data: { id: '2', label: '2' }, position: { x: 114, y: -37 } },
    { data: { id: '3', label: '3' }, position: { x: 71, y: 97 } },
    { data: { id: '4', label: '4' }, position: { x: -71, y: 97 } },
    { data: { id: '5', label: '5' }, position: { x: -114, y: -37 } },
    { data: { id: 'e1', source: '1', target: '2' } },
    { data: { id: 'e2', source: '2', target: '3' } },
    { data: { id: 'e3', source: '3', target: '4' } },
    { data: { id: 'e4', source: '4', target: '1' } },
    { data: { id: 'e5', source: '1', target: '5' } },
    { data: { id: 'e6', source: '3', target: '5' } },
  ];
}