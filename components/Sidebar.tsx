"use client";
import { useState } from 'react';
import { parseGraphInput } from '@/lib/graphParser';
import { GraphElement } from '@/lib/graphGenerators';

interface SidebarProps {
  onClearGraph: () => void;
  onCreateSampleGraph: (type: string, name: string) => void;
  onCreateCustomGraph: (elements: GraphElement[], name?: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ onClearGraph, onCreateSampleGraph, onCreateCustomGraph, isOpen, onToggle }: SidebarProps) {
  const [searchInput, setSearchInput] = useState('');
  const [parseError, setParseError] = useState('');
  const [showExamples, setShowExamples] = useState(false);
  const handleSearchSubmit = () => {
    if (!searchInput.trim()) return;
    
    console.log('Parsing input:', searchInput);
    const result = parseGraphInput(searchInput);
    console.log('Parse result:', result);
    
    if (result.success && result.graph) {
      setParseError('');
      // Generate a name based on the input
      const graphName = searchInput.trim().charAt(0).toUpperCase() + searchInput.trim().slice(1);
      onCreateCustomGraph(result.graph, graphName);
      setSearchInput('');
    } else {
      setParseError(result.error || 'Could not parse input');
    }
  };

  const handleClearInput = () => {
    setSearchInput('');
    setParseError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
    }
  };

  const sampleGraphs = [
    { id: 'complete4', name: 'Complete K₄', description: '4 nodes, all connected' },
    { id: 'complete5', name: 'Complete K₅', description: '5 nodes, all connected' },
    { id: 'cycle5', name: 'Cycle C₅', description: '5 nodes in a cycle' },
    { id: 'path5', name: 'Path P₅', description: '5 nodes in a line' },
    { id: 'star5', name: 'Star S₅', description: '1 center + 4 outer nodes' },
    { id: 'wheel5', name: 'Wheel W₅', description: 'Cycle + center node' },
    { id: 'bipartite', name: 'Bipartite K₂,₃', description: '2 groups of nodes' },
    { id: 'petersen', name: 'Petersen Graph', description: 'Famous example graph' },
  ];

  const examples = [
    { text: 'complete 6', desc: 'Complete graph with 6 nodes' },
    { text: 'cycle 5', desc: 'Cycle with 5 nodes' },
    { text: '6 nodes all connected', desc: 'Natural language input' },
    { text: '1-2, 2-3, 3-1', desc: 'Edge list format' },
    { text: '1: 2,3; 2: 1; 3: 1', desc: 'Adjacency list' },
    { text: 'star with 7 points', desc: 'Star graph description' },
  ];

  return (
    <>
      {/* Desktop Toggle Button */}
      <button
        onClick={onToggle}
        className="hidden lg:block fixed top-24 left-6 z-50 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white p-3 rounded-lg border border-gray-700 transition-all duration-200 shadow-lg"
      >
        <div className="w-4 h-4 flex items-center justify-center">
          {isOpen ? '←' : '→'}
        </div>
      </button>

      {/* Mobile Toggle Button */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed bottom-4 left-4 z-50 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white p-3 rounded-lg border border-gray-700 transition-all duration-200 shadow-lg"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      </button>

      {/* Desktop Sidebar */}
      <div className={`hidden lg:block fixed top-24 left-0 h-full bg-[#1A1A1A] text-white transition-transform duration-300 z-40 border-r border-gray-800 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`} style={{ width: '320px', height: 'calc(100vh - 6rem)' }}>
        <div className="p-6 pt-12 h-full flex flex-col">
          <h2 className="text-2xl font-bold mb-6 text-white">Graph Library</h2>
          
          {/* Smart Search */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Create Graph</h3>
            <div className="bg-[#0F0F0F] p-4 rounded-xl border border-gray-800">
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => {
                      setSearchInput(e.target.value);
                      setParseError('');
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Type graph description..."
                    className={`w-full bg-[#1A1A1A] text-white placeholder-gray-500 px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors ${
                      searchInput ? 'pr-24' : ''
                    }`}
                  />
                  {searchInput && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                      <button
                        onClick={handleClearInput}
                        className="bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded text-xs transition-colors"
                        title="Clear"
                      >
                        ×
                      </button>
                      <button
                        onClick={handleSearchSubmit}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Create
                      </button>
                    </div>
                  )}
                </div>
                
                {parseError && (
                  <div className="text-red-400 text-xs p-2 bg-red-900/20 rounded border border-red-800">
                    {parseError}
                  </div>
                )}
                
                <button
                  onClick={() => setShowExamples(!showExamples)}
                  className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showExamples ? 'Hide' : 'Show'} examples
                </button>
                
                {showExamples && (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {examples.map((example, index) => (
                      <button
                        key={index}
                        onClick={() => setSearchInput(example.text)}
                        className="w-full text-left p-2 rounded bg-[#1A1A1A] hover:bg-[#2A2A2A] transition-colors border border-gray-700"
                      >
                        <div className="text-xs text-blue-300 font-mono">{example.text}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{example.desc}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Graph Controls */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Controls</h3>
            <div className="bg-[#0F0F0F] p-4 rounded-xl border border-gray-800">
              <button
                onClick={onClearGraph}
                className="w-full bg-gray-600 hover:bg-gray-500 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Clear Graph
              </button>
            </div>
          </div>

          {/* Sample Graphs */}
          <div className="flex-1 overflow-hidden">
            <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Sample Graphs</h3>
            <div className="bg-[#0F0F0F] p-4 rounded-xl border border-gray-800 h-full">
              <div className="space-y-3 max-h-full overflow-y-auto pr-2" style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#4B5563 #1F2937'
              }}>
                {sampleGraphs.map((graph) => (
                  <button
                    key={graph.id}
                    onClick={() => onCreateSampleGraph(graph.id, graph.name)}
                    className="w-full text-left bg-[#1A1A1A] hover:bg-[#2A2A2A] p-4 rounded-lg transition-all duration-200 border border-gray-700 hover:border-gray-600 hover:border-blue-500/30 group hover:shadow-sm hover:transform hover:scale-[1.02]"
                  >
                    <div className="font-semibold text-sm text-white group-hover:text-blue-300 transition-colors">
                      {graph.name}
                    </div>
                    <div className="text-xs text-gray-400 mt-1.5 leading-relaxed group-hover:text-gray-300 transition-colors">
                      {graph.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed top-0 left-0 h-full bg-[#1A1A1A] text-white transition-transform duration-300 z-40 border-r border-gray-800 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`} style={{ width: '280px' }}>
        <div className="p-4 pt-20 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Graph Library</h2>
            <button
              onClick={onToggle}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Smart Search */}
          <div className="mb-4">
            <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Create Graph</h3>
            <div className="bg-[#0F0F0F] p-3 rounded-xl border border-gray-800">
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => {
                      setSearchInput(e.target.value);
                      setParseError('');
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Type graph description..."
                    className={`w-full bg-[#1A1A1A] text-white placeholder-gray-500 px-3 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors text-sm ${
                      searchInput ? 'pr-20' : ''
                    }`}
                  />
                  {searchInput && (
                    <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex gap-1">
                      <button
                        onClick={handleClearInput}
                        className="bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded text-xs transition-colors"
                        title="Clear"
                      >
                        ×
                      </button>
                      <button
                        onClick={handleSearchSubmit}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs transition-colors"
                      >
                        Create
                      </button>
                    </div>
                  )}
                </div>
                
                {parseError && (
                  <div className="text-red-400 text-xs p-2 bg-red-900/20 rounded border border-red-800">
                    {parseError}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Graph Controls */}
          <div className="mb-4">
            <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Controls</h3>
            <div className="bg-[#0F0F0F] p-3 rounded-xl border border-gray-800">
              <button
                onClick={onClearGraph}
                className="w-full bg-gray-600 hover:bg-gray-500 text-white py-2 px-3 rounded-lg font-medium transition-all duration-200 text-sm"
              >
                Clear Graph
              </button>
            </div>
          </div>

          {/* Sample Graphs */}
          <div className="flex-1 overflow-hidden">
            <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Sample Graphs</h3>
            <div className="bg-[#0F0F0F] p-3 rounded-xl border border-gray-800 h-full">
              <div className="space-y-2 max-h-full overflow-y-auto pr-2" style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#4B5563 #1F2937'
              }}>
                {sampleGraphs.map((graph) => (
                  <button
                    key={graph.id}
                    onClick={() => onCreateSampleGraph(graph.id, graph.name)}
                    className="w-full text-left bg-[#1A1A1A] hover:bg-[#2A2A2A] p-3 rounded-lg transition-all duration-200 border border-gray-700 hover:border-gray-600 hover:border-blue-500/30 group"
                  >
                    <div className="font-semibold text-sm text-white group-hover:text-blue-300 transition-colors">
                      {graph.name}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 leading-relaxed group-hover:text-gray-300 transition-colors">
                      {graph.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={onToggle}
        />
      )}
    </>
  );
}