"use client";
import React, { useState, useEffect, useRef } from 'react';
import { GraphElement } from '@/lib/graphGenerators';
import { algorithms, AlgorithmConfig, AlgorithmResult, AlgorithmStep, VisualizationState } from '@/lib/algorithms';
import GraphCanvas from './GraphCanvas';
import CodeDisplay from './CodeDisplay';

interface AlgorithmRunnerProps {
  graph: GraphElement[];
  graphName: string;
}

export default function AlgorithmRunner({ graph, graphName }: AlgorithmRunnerProps) {
  const [selectedAlgorithmId, setSelectedAlgorithmId] = useState<string>('');
  const [config, setConfig] = useState<AlgorithmConfig>({});
  const [result, setResult] = useState<AlgorithmResult | null>(null);
  const [visualState, setVisualState] = useState<VisualizationState>({
    currentStepIndex: 0,
    isPlaying: false,
    speed: 1,
    isFinished: false,
  });
  const [viewMode, setViewMode] = useState<'state' | 'code'>('code');

  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const selectedAlgorithm = algorithms.find((algo) => algo.id === selectedAlgorithmId);

  // Get unique node IDs from graph
  const nodeIds = graph.filter((el) => !el.data.source).map((el) => el.data.id);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, []);

  // Auto-play handler
  useEffect(() => {
    if (visualState.isPlaying && result) {
      const interval = 1000 / visualState.speed;
      playIntervalRef.current = setInterval(() => {
        setVisualState((prev) => {
          if (prev.currentStepIndex >= result.steps.length - 1) {
            // Reached the end
            if (playIntervalRef.current) clearInterval(playIntervalRef.current);
            return { ...prev, isPlaying: false, isFinished: true };
          }
          return { ...prev, currentStepIndex: prev.currentStepIndex + 1 };
        });
      }, interval);

      return () => {
        if (playIntervalRef.current) clearInterval(playIntervalRef.current);
      };
    }
  }, [visualState.isPlaying, visualState.speed, result]);

  const handleRunAlgorithm = () => {
    if (!selectedAlgorithm) return;

    const algorithmResult = selectedAlgorithm.execute(graph, config);
    setResult(algorithmResult);
    setVisualState({
      currentStepIndex: 0,
      isPlaying: false,
      speed: 1,
      isFinished: false,
    });
  };

  const handlePlay = () => {
    if (!result) return;
    setVisualState((prev) => ({ ...prev, isPlaying: true }));
  };

  const handlePause = () => {
    setVisualState((prev) => ({ ...prev, isPlaying: false }));
  };

  const handleStepForward = () => {
    if (!result) return;
    setVisualState((prev) => {
      const newIndex = Math.min(prev.currentStepIndex + 1, result.steps.length - 1);
      return {
        ...prev,
        currentStepIndex: newIndex,
        isFinished: newIndex === result.steps.length - 1,
      };
    });
  };

  const handleStepBackward = () => {
    if (!result) return;
    setVisualState((prev) => ({
      ...prev,
      currentStepIndex: Math.max(prev.currentStepIndex - 1, 0),
      isFinished: false,
    }));
  };

  const handleReset = () => {
    setVisualState({
      currentStepIndex: 0,
      isPlaying: false,
      speed: 1,
      isFinished: false,
    });
  };

  const handleSpeedChange = (speed: number) => {
    setVisualState((prev) => ({ ...prev, speed }));
  };

  // Get current step
  const currentStep: AlgorithmStep | null = result ? result.steps[visualState.currentStepIndex] : null;

  // Create highlighted graph elements
  const highlightedGraph = React.useMemo(() => {
    const highlighted = graph.map((element) => {
      const isNode = !element.data.source;
      const id = element.data.id;

      if (!currentStep) {
        // No current step, return element without classes
        return { ...element, classes: '' };
      }

      if (isNode) {
        // Highlight visited nodes
        const isVisited = currentStep.visitedNodes.includes(id);
        const isCurrent = currentStep.currentNode === id;

        return {
          ...element,
          classes: isCurrent ? 'current-node' : isVisited ? 'visited-node' : '',
        };
      } else {
        // Highlight edges
        const isHighlighted = currentStep.highlightedEdges.includes(id);
        return {
          ...element,
          classes: isHighlighted ? 'highlighted-edge' : '',
        };
      }
    });

    console.log('AlgorithmRunner - Highlighted graph:', highlighted.filter(el => el.classes).map(el => ({ id: el.data.id, classes: el.classes })));
    return highlighted;
  }, [graph, currentStep]);

  if (!graph || graph.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-400">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">No Graph Available</h3>
          <p className="text-sm">Please create or select a graph from the Build Graph tab first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4">
      {/* Left side - Graph Visualization */}
      <div className="lg:w-2/3 h-1/2 lg:h-full bg-gray-950 rounded-xl border border-gray-800 overflow-hidden relative">
        <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700">
          <h2 className="text-white font-semibold text-lg">{graphName}</h2>
          {selectedAlgorithm && (
            <p className="text-sm text-gray-400 mt-1">{selectedAlgorithm.name}</p>
          )}
        </div>

        {currentStep && (
          <div className="absolute top-4 right-4 z-10 bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700 max-w-md">
            <p className="text-sm text-gray-300">{currentStep.description}</p>
            <p className="text-xs text-gray-500 mt-1">
              Step {visualState.currentStepIndex + 1} of {result?.steps.length || 0}
            </p>
          </div>
        )}

        <GraphCanvas
          key="algorithm-canvas"
          elements={highlightedGraph}
          onGraphChange={() => {}}
          className="h-full"
        />
      </div>

      {/* Right side - Controls and Code */}
      <div className="lg:w-1/3 h-1/2 lg:h-full flex flex-col gap-4">
        {/* Algorithm Selection */}
        <div className="bg-gray-950 rounded-xl border border-gray-800 p-4">
          <h3 className="text-white font-semibold mb-3">Select Algorithm</h3>
          <select
            value={selectedAlgorithmId}
            onChange={(e) => {
              setSelectedAlgorithmId(e.target.value);
              setResult(null);
              setConfig({});
            }}
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="">Choose an algorithm...</option>
            {algorithms.map((algo) => (
              <option key={algo.id} value={algo.id}>
                {algo.name}
              </option>
            ))}
          </select>

          {selectedAlgorithm && (
            <div className="mt-3 text-sm text-gray-400">
              <p>{selectedAlgorithm.description}</p>
              <div className="mt-2 flex gap-2 text-xs">
                <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded">
                  Time: {selectedAlgorithm.complexity.time}
                </span>
                <span className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded">
                  Space: {selectedAlgorithm.complexity.space}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Configuration */}
        {selectedAlgorithm && (
          <div className="bg-gray-950 rounded-xl border border-gray-800 p-4">
            <h3 className="text-white font-semibold mb-3">Configuration</h3>

            {selectedAlgorithm.requiresStartNode && (
              <div className="mb-3">
                <label className="block text-sm text-gray-400 mb-1">Start Node</label>
                <select
                  value={config.startNode || ''}
                  onChange={(e) => setConfig({ ...config, startNode: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select start node...</option>
                  {nodeIds.map((id) => (
                    <option key={id} value={id}>
                      Node {id}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedAlgorithm.requiresEndNode && (
              <div className="mb-3">
                <label className="block text-sm text-gray-400 mb-1">End Node</label>
                <select
                  value={config.endNode || ''}
                  onChange={(e) => setConfig({ ...config, endNode: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select end node...</option>
                  {nodeIds.map((id) => (
                    <option key={id} value={id}>
                      Node {id}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleRunAlgorithm}
              disabled={
                (selectedAlgorithm.requiresStartNode && !config.startNode) ||
                (selectedAlgorithm.requiresEndNode && !config.endNode)
              }
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Run Algorithm
            </button>
          </div>
        )}

        {/* Playback Controls */}
        {result && (
          <div className="bg-gray-950 rounded-xl border border-gray-800 p-4">
            <h3 className="text-white font-semibold mb-3">Playback Controls</h3>

            <div className="flex items-center justify-center gap-2 mb-3">
              <button
                onClick={handleStepBackward}
                disabled={visualState.currentStepIndex === 0}
                className="p-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                title="Step Backward"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {!visualState.isPlaying ? (
                <button
                  onClick={handlePlay}
                  disabled={visualState.isFinished}
                  className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  title="Play"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  title="Pause"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                </button>
              )}

              <button
                onClick={handleStepForward}
                disabled={visualState.currentStepIndex >= result.steps.length - 1}
                className="p-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                title="Step Forward"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={handleReset}
                className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors ml-2"
                title="Reset"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-2">
              <label className="block text-sm text-gray-400 mb-1">Speed: {visualState.speed}x</label>
              <input
                type="range"
                min="0.25"
                max="3"
                step="0.25"
                value={visualState.speed}
                onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Code and State Display */}
        {selectedAlgorithm && result && (
          <div className="bg-gray-950 rounded-xl border border-gray-800 flex-1 overflow-hidden flex flex-col">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-800">
              <button
                onClick={() => setViewMode('code')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  viewMode === 'code'
                    ? 'text-white bg-gray-900 border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Java Code
              </button>
              <button
                onClick={() => setViewMode('state')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  viewMode === 'state'
                    ? 'text-white bg-gray-900 border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Algorithm State
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
              {viewMode === 'code' ? (
                <CodeDisplay
                  code={selectedAlgorithm.javaCode}
                  language="java"
                  highlightedLine={currentStep?.codeLineNumber}
                />
              ) : (
                currentStep && (
                  <div className="text-sm text-gray-300 space-y-2">
                    {Object.entries(currentStep.data).map(([key, value]) => (
                      <div key={key} className="border-b border-gray-800 pb-2">
                        <span className="text-gray-500 font-medium">{key}:</span>{' '}
                        <span className="text-white font-mono text-xs">
                          {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
