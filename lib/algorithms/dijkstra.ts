import { GraphElement } from '../graphGenerators';
import { Algorithm, AlgorithmConfig, AlgorithmResult, AlgorithmStep } from './types';

/**
 * Dijkstra's Shortest Path Algorithm Implementation
 */
export const dijkstraAlgorithm: Algorithm = {
  id: 'dijkstra',
  name: "Dijkstra's Algorithm",
  category: 'shortest-path',
  description: 'Finds the shortest path from a source node to all other nodes in a weighted graph',
  requiresStartNode: true,
  requiresEndNode: false,
  requiresWeights: true,
  complexity: {
    time: 'O((V + E) log V)',
    space: 'O(V)',
  },
  execute: (graph: GraphElement[], config: AlgorithmConfig): AlgorithmResult => {
    const { startNode } = config;

    if (!startNode) {
      return {
        steps: [],
        success: false,
        error: 'Start node is required for Dijkstra\'s algorithm',
      };
    }

    // Build adjacency list
    const nodes = new Set<string>();
    const adjacencyList = new Map<string, { neighbor: string; weight: number; edgeId: string }[]>();

    // Extract nodes
    graph.forEach((element) => {
      if (!element.data.source) {
        nodes.add(element.data.id);
        if (!adjacencyList.has(element.data.id)) {
          adjacencyList.set(element.data.id, []);
        }
      }
    });

    // Build edges (undirected graph)
    graph.forEach((element) => {
      if (element.data.source && element.data.target) {
        const weight = element.data.weight || 1;
        const source = element.data.source;
        const target = element.data.target;
        const edgeId = element.data.id;

        if (!adjacencyList.has(source)) adjacencyList.set(source, []);
        if (!adjacencyList.has(target)) adjacencyList.set(target, []);

        adjacencyList.get(source)!.push({ neighbor: target, weight, edgeId });
        adjacencyList.get(target)!.push({ neighbor: source, weight, edgeId });
      }
    });

    // Check if start node exists
    if (!nodes.has(startNode)) {
      return {
        steps: [],
        success: false,
        error: `Start node "${startNode}" does not exist in the graph`,
      };
    }

    // Initialize data structures
    const distances = new Map<string, number>();
    const previous = new Map<string, string | null>();
    const visited = new Set<string>();
    const steps: AlgorithmStep[] = [];

    // Initialize distances
    nodes.forEach((node) => {
      distances.set(node, node === startNode ? 0 : Infinity);
      previous.set(node, null);
    });

    // Step 1: Initialization
    steps.push({
      visitedNodes: [],
      currentNode: null,
      highlightedEdges: [],
      data: {
        distances: Object.fromEntries(distances),
        previous: Object.fromEntries(previous),
        visited: Array.from(visited),
      },
      description: `Initialize distances: ${startNode} = 0, all others = ∞`,
      codeLineNumber: 8,
    });

    // Priority queue (using array for simplicity, would use heap in production)
    const pq: { node: string; distance: number }[] = [{ node: startNode, distance: 0 }];

    while (pq.length > 0) {
      // Get node with minimum distance
      pq.sort((a, b) => a.distance - b.distance);
      const { node: currentNode, distance: currentDistance } = pq.shift()!;

      // Skip if already visited
      if (visited.has(currentNode)) continue;

      // Mark as visited
      visited.add(currentNode);

      // Step: Visit current node
      steps.push({
        visitedNodes: Array.from(visited),
        currentNode,
        highlightedEdges: [],
        data: {
          distances: Object.fromEntries(distances),
          previous: Object.fromEntries(previous),
          visited: Array.from(visited),
          currentDistance,
        },
        description: `Visit node ${currentNode} with distance ${currentDistance}`,
        codeLineNumber: 20,
      });

      // Explore neighbors
      const neighbors = adjacencyList.get(currentNode) || [];
      for (const { neighbor, weight, edgeId } of neighbors) {
        if (visited.has(neighbor)) continue;

        const newDistance = currentDistance + weight;
        const oldDistance = distances.get(neighbor)!;

        // Step: Examine edge
        steps.push({
          visitedNodes: Array.from(visited),
          currentNode,
          highlightedEdges: [edgeId],
          data: {
            distances: Object.fromEntries(distances),
            previous: Object.fromEntries(previous),
            visited: Array.from(visited),
            examiningEdge: `${currentNode} → ${neighbor} (weight: ${weight})`,
            newDistance,
            oldDistance: oldDistance === Infinity ? '∞' : oldDistance,
          },
          description: `Examine edge ${currentNode} → ${neighbor}: ${currentDistance} + ${weight} = ${newDistance} ${
            newDistance < oldDistance ? '< ' + (oldDistance === Infinity ? '∞' : oldDistance) + ' ✓ Update!' : '>= ' + oldDistance + ' ✗ Skip'
          }`,
          codeLineNumber: 26,
        });

        // Relaxation step
        if (newDistance < oldDistance) {
          distances.set(neighbor, newDistance);
          previous.set(neighbor, currentNode);
          pq.push({ node: neighbor, distance: newDistance });

          // Step: Update distance
          steps.push({
            visitedNodes: Array.from(visited),
            currentNode,
            highlightedEdges: [edgeId],
            data: {
              distances: Object.fromEntries(distances),
              previous: Object.fromEntries(previous),
              visited: Array.from(visited),
              updated: neighbor,
            },
            description: `Update: distance[${neighbor}] = ${newDistance}, previous[${neighbor}] = ${currentNode}`,
            codeLineNumber: 29,
          });
        }
      }
    }

    // Final step
    steps.push({
      visitedNodes: Array.from(visited),
      currentNode: null,
      highlightedEdges: [],
      data: {
        distances: Object.fromEntries(distances),
        previous: Object.fromEntries(previous),
        visited: Array.from(visited),
      },
      description: 'Algorithm complete! All shortest paths from source have been found.',
      codeLineNumber: 36,
    });

    return {
      steps,
      success: true,
      finalData: {
        distances: Object.fromEntries(distances),
        previous: Object.fromEntries(previous),
        startNode,
      },
    };
  },
  javaCode: `import java.util.*;

public class Dijkstra {
    // Graph representation using adjacency list
    static class Edge {
        int target;
        int weight;

        Edge(int target, int weight) {
            this.target = target;
            this.weight = weight;
        }
    }

    // Node with distance for priority queue
    static class Node implements Comparable<Node> {
        int id;
        int distance;

        Node(int id, int distance) {
            this.id = id;
            this.distance = distance;
        }

        public int compareTo(Node other) {
            return Integer.compare(this.distance, other.distance);
        }
    }

    public static int[] dijkstra(List<List<Edge>> graph, int source) {
        int n = graph.size();
        int[] distances = new int[n];
        int[] previous = new int[n];
        boolean[] visited = new boolean[n];

        // Initialize distances to infinity
        Arrays.fill(distances, Integer.MAX_VALUE);
        Arrays.fill(previous, -1);
        distances[source] = 0;

        // Priority queue to get minimum distance node
        PriorityQueue<Node> pq = new PriorityQueue<>();
        pq.offer(new Node(source, 0));

        while (!pq.isEmpty()) {
            Node current = pq.poll();
            int u = current.id;

            // Skip if already visited
            if (visited[u]) continue;

            // Mark as visited
            visited[u] = true;

            // Explore neighbors
            for (Edge edge : graph.get(u)) {
                int v = edge.target;
                int weight = edge.weight;

                // Relaxation step
                if (!visited[v] && distances[u] + weight < distances[v]) {
                    distances[v] = distances[u] + weight;
                    previous[v] = u;
                    pq.offer(new Node(v, distances[v]));
                }
            }
        }

        return distances;
    }

    // Reconstruct path from source to target
    public static List<Integer> getPath(int[] previous, int target) {
        List<Integer> path = new ArrayList<>();
        for (int at = target; at != -1; at = previous[at]) {
            path.add(at);
        }
        Collections.reverse(path);
        return path;
    }

    public static void main(String[] args) {
        // Example: 5 nodes, create adjacency list
        int n = 5;
        List<List<Edge>> graph = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            graph.add(new ArrayList<>());
        }

        // Add edges (undirected graph)
        graph.get(0).add(new Edge(1, 4));
        graph.get(0).add(new Edge(2, 1));
        graph.get(1).add(new Edge(3, 1));
        graph.get(2).add(new Edge(1, 2));
        graph.get(2).add(new Edge(3, 5));
        graph.get(3).add(new Edge(4, 3));

        // Run Dijkstra from node 0
        int[] distances = dijkstra(graph, 0);

        System.out.println("Shortest distances from node 0:");
        for (int i = 0; i < n; i++) {
            System.out.println("Node " + i + ": " + distances[i]);
        }
    }
}`,
};
