"use client";
import GraphCanvas from '@/components/GraphCanvas';
import Sidebar from '@/components/Sidebar';
import { useState, useEffect } from 'react';
import { generateGraph, GraphElement } from '@/lib/graphGenerators';

export default function VisualizerPage() {
  const [showInstructions, setShowInstructions] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentGraph, setCurrentGraph] = useState<GraphElement[]>(generateGraph('default'));
  const [currentGraphName, setCurrentGraphName] = useState<string>('Custom Graph');
  const [history, setHistory] = useState<GraphElement[][]>([generateGraph('default')]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Close sidebar on mobile resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) { // lg breakpoint
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        handleUndo();
      } else if (((event.ctrlKey || event.metaKey) && event.key === 'y') || 
                 ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'Z')) {
        event.preventDefault();
        handleRedo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);

  // Save current state to history
  const saveToHistory = (newGraph: GraphElement[]) => {
    // Remove any future history if we're not at the end
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newGraph]);
    
    // Limit history to 50 actions
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex(prev => prev + 1);
    }
    
    setHistory(newHistory);
  };

  // Undo function
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const previousGraph = history[newIndex];
      setCurrentGraph([...previousGraph]);
      if (currentGraphName !== 'Custom Graph' && currentGraphName !== 'Empty Graph') {
        setCurrentGraphName('Custom Graph');
      }
    }
  };

  // Redo function
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextGraph = history[newIndex];
      setCurrentGraph([...nextGraph]);
      if (currentGraphName !== 'Custom Graph' && currentGraphName !== 'Empty Graph') {
        setCurrentGraphName('Custom Graph');
      }
    }
  };

  const handleClearGraph = () => {
    const newGraph: GraphElement[] = [];
    saveToHistory(newGraph);
    setCurrentGraph(newGraph);
    setCurrentGraphName('Empty Graph');
  };

  const handleCreateSampleGraph = (type: string, name: string) => {
    const newGraph = generateGraph(type);
    saveToHistory(newGraph);
    setCurrentGraph(newGraph);
    setCurrentGraphName(name);
    setSidebarOpen(false);
  };

  const handleCreateCustomGraph = (elements: GraphElement[], name?: string) => {
    saveToHistory(elements);
    setCurrentGraph(elements);
    setCurrentGraphName(name || 'Custom Graph');
    setSidebarOpen(false);
  };

  return (
    <div className="h-screen bg-black relative">
      <Sidebar
        onClearGraph={handleClearGraph}
        onCreateSampleGraph={handleCreateSampleGraph}
        onCreateCustomGraph={handleCreateCustomGraph}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      {/* Desktop Layout */}
      <div className={`hidden lg:block transition-all duration-300 h-full pt-24 ${sidebarOpen ? 'ml-80' : 'ml-0'}`}>
        <div className="h-full p-6">
          <div className="h-full bg-gray-950 rounded-xl border border-gray-800 overflow-hidden relative">
            {/* Graph Name Display */}
            <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700">
              <h2 className="text-white font-semibold text-lg">{currentGraphName}</h2>
            </div>
            <GraphCanvas 
              className="h-full" 
              elements={currentGraph}
              onGraphChange={(newGraph) => {
                saveToHistory(newGraph);
                setCurrentGraph(newGraph);
                if (currentGraphName !== 'Custom Graph' && currentGraphName !== 'Empty Graph') {
                  setCurrentGraphName('Custom Graph');
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden h-full pt-24">
        <div className="h-full p-4">
          <div className="h-full bg-gray-950 rounded-xl border border-gray-800 overflow-hidden relative">
            {/* Graph Name Display */}
            <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-700">
              <h2 className="text-white font-semibold text-base">{currentGraphName}</h2>
            </div>
            <GraphCanvas 
              className="h-full" 
              elements={currentGraph}
              onGraphChange={(newGraph) => {
                saveToHistory(newGraph);
                setCurrentGraph(newGraph);
                if (currentGraphName !== 'Custom Graph' && currentGraphName !== 'Empty Graph') {
                  setCurrentGraphName('Custom Graph');
                }
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Controls Button - Show when instructions hidden and sidebar closed */}
      {!showInstructions && !sidebarOpen && (
        <button
          onClick={() => setShowInstructions(true)}
          className="hidden lg:block absolute top-24 right-6 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white p-3 rounded-lg border border-gray-700 transition-all duration-200 shadow-lg"
          title="Show Controls"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      )}

      {/* Undo/Redo Buttons - Desktop */}
      <div className="hidden lg:flex absolute top-24 right-20 gap-2">
        <button
          onClick={handleUndo}
          disabled={historyIndex <= 0}
          className="bg-[#1A1A1A] hover:bg-[#2A2A2A] disabled:bg-gray-800 disabled:cursor-not-allowed text-white p-2 rounded-lg border border-gray-700 transition-all duration-200 shadow-lg"
          title="Undo (Ctrl+Z)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>
        <button
          onClick={handleRedo}
          disabled={historyIndex >= history.length - 1}
          className="bg-[#1A1A1A] hover:bg-[#2A2A2A] disabled:bg-gray-800 disabled:cursor-not-allowed text-white p-2 rounded-lg border border-gray-700 transition-all duration-200 shadow-lg"
          title="Redo (Ctrl+Y)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
          </svg>
        </button>
      </div>

      {/* Desktop Instructions */}
      {showInstructions && !sidebarOpen && (
        <div className="hidden lg:block absolute top-24 right-6 bg-[#1A1A1A] text-white p-6 rounded-xl border border-gray-700 max-w-xs shadow-xl">
          <button 
            onClick={() => setShowInstructions(false)}
            className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-700"
          >
            ×
          </button>
          <h3 className="font-bold text-lg mb-4 text-white">Controls</h3>
          <div className="text-sm space-y-2.5 text-gray-300">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
              Click/Right-click empty → Create node
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
              Shift+click node → Start edge
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
              Shift+click another → Create edge
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
              Select + Delete → Remove element
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
              Ctrl+Z / Ctrl+Y → Undo / Redo
            </div>
          </div>
        </div>
      )}

      {/* Mobile Controls Button */}
      {!showInstructions && (
        <button
          onClick={() => setShowInstructions(true)}
          className="lg:hidden absolute bottom-4 right-4 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white p-3 rounded-lg border border-gray-700 transition-all duration-200 shadow-lg"
          title="Show Controls"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      )}

      {/* Mobile Undo/Redo Buttons */}
      <div className="lg:hidden flex absolute bottom-4 right-20 gap-2">
        <button
          onClick={handleUndo}
          disabled={historyIndex <= 0}
          className="bg-[#1A1A1A] hover:bg-[#2A2A2A] disabled:bg-gray-800 disabled:cursor-not-allowed text-white p-2 rounded-lg border border-gray-700 transition-all duration-200 shadow-lg"
          title="Undo"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>
        <button
          onClick={handleRedo}
          disabled={historyIndex >= history.length - 1}
          className="bg-[#1A1A1A] hover:bg-[#2A2A2A] disabled:bg-gray-800 disabled:cursor-not-allowed text-white p-2 rounded-lg border border-gray-700 transition-all duration-200 shadow-lg"
          title="Redo"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
          </svg>
        </button>
      </div>

      {/* Mobile Instructions */}
      {showInstructions && (
        <div className="lg:hidden absolute bottom-4 left-4 right-4 bg-[#1A1A1A] text-white p-4 rounded-xl border border-gray-700 shadow-xl">
          <button 
            onClick={() => setShowInstructions(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-700"
          >
            ×
          </button>
          <h3 className="font-bold text-base mb-3 text-white">Touch Controls</h3>
          <div className="text-xs space-y-2 text-gray-300">
            <div className="flex items-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full mr-2 flex-shrink-0"></span>
              Tap empty space → Create node
            </div>
            <div className="flex items-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full mr-2 flex-shrink-0"></span>
              Long press node → Select for edge
            </div>
            <div className="flex items-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full mr-2 flex-shrink-0"></span>
              Tap another node → Create edge
            </div>
            <div className="flex items-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full mr-2 flex-shrink-0"></span>
              Select + backspace → Delete
            </div>
            <div className="flex items-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full mr-2 flex-shrink-0"></span>
              Undo/Redo buttons → Revert changes
            </div>
          </div>
        </div>
      )}
    </div>
  );
}