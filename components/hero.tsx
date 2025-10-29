"use client";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import GraphCanvas from "./GraphCanvas";
import { generateGraph, GraphElement } from "@/lib/graphGenerators";

const features = [
  {
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "15+ Graph Algorithms",
    description: "Visualize Dijkstra, A*, Prim's, Kruskal's, Ford-Fulkerson, and more with step-by-step execution"
  },
  {
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Algorithmic Generators",
    description: "Generate Complete, Cycle, Bipartite, and Petersen graphs with customizable parameters"
  },
  {
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    title: "Interactive Editing",
    description: "Create nodes and edges, modify weights, and build custom graphs with intuitive controls"
  },
  {
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
      </svg>
    ),
    title: "Undo/Redo Support",
    description: "Full history tracking with keyboard shortcuts (Ctrl+Z / Ctrl+Y) for seamless editing"
  },
  {
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    title: "Responsive Design",
    description: "Works seamlessly on desktop and mobile devices with touch-optimized controls"
  },
  {
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M12 14l9-5-9-5-9 5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
      </svg>
    ),
    title: "Educational Focus",
    description: "Used by 200+ CS students to improve algorithm comprehension by 85%"
  }
];

const algorithms = [
  { name: "Dijkstra's", category: "Shortest Path" },
  { name: "A* Search", category: "Shortest Path" },
  { name: "Prim's", category: "Minimum Spanning Tree" },
  { name: "Kruskal's", category: "Minimum Spanning Tree" },
  { name: "Ford-Fulkerson", category: "Max Flow" },
  { name: "Topological Sort", category: "Graph Traversal" },
  { name: "DFS / BFS", category: "Graph Traversal" },
  { name: "Cycle Detection", category: "Graph Analysis" }
];

const graphExamples = [
  { type: 'petersen', name: 'Petersen Graph', description: 'A famous non-planar graph' },
  { type: 'complete-5', name: 'Complete Graph K₅', description: 'Every node connects to every other' },
  { type: 'bipartite-3-3', name: 'Bipartite Graph', description: 'Two disjoint sets of vertices' },
  { type: 'cycle-8', name: 'Cycle Graph C₈', description: 'Nodes form a circular loop' },
];

export function Hero() {
  const [demoGraph, setDemoGraph] = useState<GraphElement[]>([]);
  const [currentGraphIndex, setCurrentGraphIndex] = useState(0);

  useEffect(() => {
    // Start with first graph
    setDemoGraph(generateGraph(graphExamples[0].type));

    // Rotate through different graph types
    const interval = setInterval(() => {
      setCurrentGraphIndex((prev) => {
        const nextIndex = (prev + 1) % graphExamples.length;
        setDemoGraph(generateGraph(graphExamples[nextIndex].type));
        return nextIndex;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-4 py-20">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-black to-black"></div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <span className="inline-block px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-6">
              Interactive Graph Algorithm Visualizer
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Visualize, Learn, and<br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Explore Graph Theory
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto"
          >
            An educational platform for understanding graph algorithms through interactive visualization.
            Build custom graphs, run algorithms step-by-step, and see how they work in real-time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Link href="/visualizer">
              <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 group">
                Start Visualizing
                <svg className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </Link>
            <a href="https://wahabcide.xyz/blog/graph-visualization-cytoscape" target="_blank" rel="noopener noreferrer">
              <button className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all duration-200 border border-gray-700">
                Read the Blog Post
              </button>
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap gap-8 justify-center text-center"
          >
            <div>
              <div className="text-3xl font-bold text-white">200+</div>
              <div className="text-sm text-gray-400">Students Using</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">15+</div>
              <div className="text-sm text-gray-400">Algorithms</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">85%</div>
              <div className="text-sm text-gray-400">Improved Comprehension</div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <span className="text-sm">Scroll to explore</span>
            <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </motion.div>
      </section>

      {/* Interactive Preview Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              See It In Action
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Interactive graph visualization with real-time algorithm execution
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Preview Container */}
            <div className="relative h-[500px] bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
              {/* Graph Preview */}
              <div className="absolute inset-0 pointer-events-none">
                <GraphCanvas
                  elements={demoGraph}
                  onGraphChange={() => {}}
                  className="h-full opacity-80"
                />
              </div>

              {/* Overlay Badge */}
              <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-blue-500/30">
                <div className="text-white font-semibold">{graphExamples[currentGraphIndex].name}</div>
                <div className="text-xs text-blue-400 mt-1">
                  {graphExamples[currentGraphIndex].description}
                </div>
              </div>

              {/* Try It Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px] hover:bg-black/30 transition-all">
                <Link href="/visualizer">
                  <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:scale-105">
                    Try It Yourself →
                  </button>
                </Link>
              </div>
            </div>

            {/* Graph Type Indicators */}
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {graphExamples.map((graph, idx) => (
                <div
                  key={graph.type}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all duration-300 ${
                    idx === currentGraphIndex
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {graph.name}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-black to-gray-950">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to understand graph algorithms
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="h-full bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Algorithm Showcase */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Supported Algorithms
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Comprehensive coverage of fundamental graph algorithms
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {algorithms.map((algo) => (
              <div
                key={algo.name}
                className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 hover:border-blue-500/50 transition-all duration-300"
              >
                <div className="text-sm text-blue-400 mb-1">{algo.category}</div>
                <div className="text-white font-semibold">{algo.name}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 bg-gradient-to-t from-black to-gray-950">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Start Learning?
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Join 200+ students using this tool to master graph algorithms through interactive visualization.
            </p>
            <Link href="/visualizer">
              <button className="px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 hover:scale-105">
                Launch Visualizer →
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
