"use client";
import { useEffect, useRef, useState, useCallback } from 'react';
import cytoscape, { Core } from 'cytoscape';
import { GraphElement } from '@/lib/graphGenerators';

interface GraphCanvasProps {
  className?: string;
  elements?: GraphElement[];
  onGraphChange?: (elements: GraphElement[]) => void;
}

export default function GraphCanvas({ className = '', elements, onGraphChange }: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [nodeCounter, setNodeCounter] = useState(6);
  const isInternalChange = useRef(false); 

  // Function to create a new node
  const createNode = useCallback((position: { x: number; y: number }) => {
    if (!cyRef.current) {
      console.log('No cytoscape instance');
      return;
    }
    
    console.log('Creating node with counter:', nodeCounter, 'at position:', position);
    
    const newNode = {
      data: { 
        id: nodeCounter.toString(), 
        label: nodeCounter.toString() 
      },
      position: position
    };
    
    cyRef.current.add(newNode);
    setNodeCounter(prev => prev + 1);
    console.log('Node created successfully');
    
    // Notify parent of graph change
    if (onGraphChange) {
      isInternalChange.current = true;
      const allElements = cyRef.current.elements().map((ele: any) => {
        const isNode = !ele.data('source');
        if (isNode) {
          return {
            data: { id: ele.id(), label: ele.data('label') },
            position: ele.position()
          };
        } else {
          return {
            data: { 
              id: ele.id(), 
              source: ele.data('source'), 
              target: ele.data('target') 
            }
          };
        }
      });
      onGraphChange(allElements);
    }
  }, [nodeCounter, onGraphChange]);

  // Function to create a new edge
  const createEdge = useCallback((sourceId: string, targetId: string) => {
    if (!cyRef.current) return;
    
    // Check if edge already exists
    const existingEdge = cyRef.current.edges().filter(edge => {
      const source = edge.source().id();
      const target = edge.target().id();
      return (source === sourceId && target === targetId) || 
             (source === targetId && target === sourceId);
    });
    
    if (existingEdge.length > 0) return; // Don't create duplicate edges
    
    const newEdge = {
      data: { 
        id: `e${sourceId}-${targetId}`, 
        source: sourceId, 
        target: targetId 
      }
    };
    
    cyRef.current.add(newEdge);
    
    // Notify parent of graph change
    if (onGraphChange) {
      isInternalChange.current = true;
      const allElements = cyRef.current.elements().map((ele: any) => {
        const isNode = !ele.data('source');
        if (isNode) {
          return {
            data: { id: ele.id(), label: ele.data('label') },
            position: ele.position()
          };
        } else {
          return {
            data: { 
              id: ele.id(), 
              source: ele.data('source'), 
              target: ele.data('target') 
            }
          };
        }
      });
      onGraphChange(allElements);
    }
  }, [onGraphChange]);

  // Function to delete selected elements
  const deleteSelected = useCallback(() => {
    if (!cyRef.current) return;
    
    const selected = cyRef.current.$(':selected');
    selected.remove();
    
    // Notify parent of graph change
    if (onGraphChange) {
      isInternalChange.current = true;
      const allElements = cyRef.current.elements().map((ele: any) => {
        const isNode = !ele.data('source');
        if (isNode) {
          return {
            data: { id: ele.id(), label: ele.data('label') },
            position: ele.position()
          };
        } else {
          return {
            data: { 
              id: ele.id(), 
              source: ele.data('source'), 
              target: ele.data('target') 
            }
          };
        }
      });
      onGraphChange(allElements);
    }
  }, [onGraphChange]);

  // Initialize Cytoscape only once
  useEffect(() => {
    if (!containerRef.current || cyRef.current) return;

    // Use provided elements or default sample
    const graphElements = elements || [
      // Default nodes
      { data: { id: '1', label: '1' } },
      { data: { id: '2', label: '2' } },
      { data: { id: '3', label: '3' } },
      { data: { id: '4', label: '4' } },
      { data: { id: '5', label: '5' } },
      
      // Default edges
      { data: { id: 'e1', source: '1', target: '2' } },
      { data: { id: 'e2', source: '2', target: '3' } },
      { data: { id: 'e3', source: '3', target: '4' } },
      { data: { id: 'e4', source: '4', target: '1' } },
      { data: { id: 'e5', source: '1', target: '5' } },
      { data: { id: 'e6', source: '3', target: '5' } },
    ];

    // Find the highest node number to set counter correctly
    const nodeIds = graphElements
      .filter(el => !el.data.source)
      .map(el => parseInt(el.data.id))
      .filter(id => !isNaN(id));
    const maxNodeId = nodeIds.length > 0 ? Math.max(...nodeIds) : 0;
    setNodeCounter(maxNodeId + 1);

    // Initialize Cytoscape
    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: graphElements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#ffffff',
            'label': 'data(label)',
            'color': '#000000',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '16px',
            'font-weight': 'bold',
            'width': '50px',
            'height': '50px',
            'border-width': '0px'
          }
        },
        {
          selector: 'node:active',
          style: {
            'width': '55px',
            'height': '55px'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#ffffff',
            'curve-style': 'straight'
          }
        },
        {
          selector: 'node:selected',
          style: {
            'background-color': '#3b82f6',
            'color': '#ffffff'
          }
        },
        {
          selector: 'edge:selected',
          style: {
            'line-color': '#3b82f6',
            'width': 4
          }
        },
        {
          selector: '.temp-edge',
          style: {
            'line-color': '#3b82f6',
            'width': 1,
            'line-style': 'dashed',
            'line-dash-pattern': [6, 3],
            'target-arrow-shape': 'none',
            'source-arrow-shape': 'none',
            'overlay-opacity': 0,
            'overlay-padding': 0,
            'overlay-color': 'transparent'
          }
        }
      ],
      layout: {
        name: 'preset'  // Use preset positions if available, otherwise circle
      },
      // Interaction options
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: true,
      selectionType: 'single'
    });

    // Node selection
    cyRef.current.on('tap', 'node', (evt) => {
      evt.stopPropagation();
      const node = evt.target;
      console.log('Selected node:', node.data());
    });

    // Edge selection
    cyRef.current.on('tap', 'edge', (evt) => {
      evt.stopPropagation();
      const edge = evt.target;
      console.log('Selected edge:', edge.data());
    });

    // Store node counter in a way accessible to event handlers
    let localNodeCounter = maxNodeId + 1;
    
    // Click empty space to create new node (right-click)
    cyRef.current.on('cxttap', (evt) => {
      // Only create node if clicking on background, not on a node or edge
      if (evt.target === cyRef.current) {
        const position = evt.position || evt.cyPosition;
        if (position) {
          console.log('Right-click creating node at:', position);
          const newNode = {
            data: { 
              id: localNodeCounter.toString(), 
              label: localNodeCounter.toString() 
            },
            position: position
          };
          cyRef.current?.add(newNode);
          localNodeCounter++;
          setNodeCounter(localNodeCounter);
          
          // Notify parent
          if (onGraphChange) {
            isInternalChange.current = true;
            const allElements = cyRef.current?.elements().map((ele: any) => {
              const isNode = !ele.data('source');
              if (isNode) {
                return {
                  data: { id: ele.id(), label: ele.data('label') },
                  position: ele.position()
                };
              } else {
                return {
                  data: { 
                    id: ele.id(), 
                    source: ele.data('source'), 
                    target: ele.data('target') 
                  }
                };
              }
            });
            onGraphChange(allElements);
          }
        }
      }
    });

    // Also support regular click on background
    cyRef.current.on('tap', (evt) => {
      // Check if we clicked on the background (not a node or edge)
      if (evt.target === cyRef.current) {
        // Check if shift key is NOT pressed (to avoid conflict with edge creation)
        if (!evt.originalEvent || !evt.originalEvent.shiftKey) {
          const position = evt.position || evt.cyPosition;
          if (position) {
            console.log('Click creating node at:', position);
            const newNode = {
              data: { 
                id: localNodeCounter.toString(), 
                label: localNodeCounter.toString() 
              },
              position: position
            };
            cyRef.current?.add(newNode);
            localNodeCounter++;
            setNodeCounter(localNodeCounter);
            
            // Notify parent
            if (onGraphChange) {
              isInternalChange.current = true;
              const allElements = cyRef.current?.elements().map((ele: any) => {
                const isNode = !ele.data('source');
                if (isNode) {
                  return {
                    data: { id: ele.id(), label: ele.data('label') },
                    position: ele.position()
                  };
                } else {
                  return {
                    data: { 
                      id: ele.id(), 
                      source: ele.data('source'), 
                      target: ele.data('target') 
                    }
                  };
                }
              });
              onGraphChange(allElements);
            }
          }
        }
      }
    });

    // Edge creation - Desktop: Shift+click, Mobile: Long press + tap
    let isCreatingEdge = false;
    let sourceNode: any = null;
    let tempEdge: any = null;
    let tempNode: any = null;
    let longPressTimer: NodeJS.Timeout | null = null;
    let isLongPress = false;
    
    // Desktop edge creation (Shift+click)
    cyRef.current.on('mousedown', 'node', (evt) => {
      if (evt.originalEvent.shiftKey) {
        isCreatingEdge = true;
        sourceNode = evt.target;
        evt.preventDefault();
        evt.stopPropagation();
        
        // Create a temporary invisible node to follow the mouse
        tempNode = cyRef.current?.add({
          data: { id: 'temp-node' },
          position: evt.position,
          style: {
            'opacity': 0,
            'events': 'no'
          }
        });
        
        // Create a temporary edge for preview
        tempEdge = cyRef.current?.add({
          data: { 
            id: 'temp-edge',
            source: sourceNode.id(),
            target: 'temp-node'
          },
          classes: 'temp-edge'
        });
      }
    });
    
    // Track mouse movement for edge preview
    cyRef.current.on('mousemove', (evt) => {
      if (isCreatingEdge && tempNode) {
        tempNode.position(evt.position);
      }
    });
    
    cyRef.current.on('mouseup', 'node', (evt) => {
      if (isCreatingEdge && sourceNode) {
        const targetNode = evt.target;
        if (sourceNode.id() !== targetNode.id()) {
          // Check if edge already exists
          const existingEdge = cyRef.current?.edges().filter(edge => {
            const source = edge.source().id();
            const target = edge.target().id();
            return (source === sourceNode.id() && target === targetNode.id()) || 
                   (source === targetNode.id() && target === sourceNode.id());
          });
          
          if (!existingEdge || existingEdge.length === 0) {
            const newEdge = {
              data: { 
                id: `e${sourceNode.id()}-${targetNode.id()}`, 
                source: sourceNode.id(), 
                target: targetNode.id() 
              }
            };
            cyRef.current?.add(newEdge);
            
            // Notify parent
            if (onGraphChange) {
              isInternalChange.current = true;
              const allElements = cyRef.current?.elements().map((ele: any) => {
                const isNode = !ele.data('source');
                if (isNode) {
                  return {
                    data: { id: ele.id(), label: ele.data('label') },
                    position: ele.position()
                  };
                } else {
                  return {
                    data: { 
                      id: ele.id(), 
                      source: ele.data('source'), 
                      target: ele.data('target') 
                    }
                  };
                }
              });
              onGraphChange(allElements);
            }
          }
        }
        // Clean up temporary elements
        if (tempEdge) {
          cyRef.current?.remove(tempEdge);
          tempEdge = null;
        }
        if (tempNode) {
          cyRef.current?.remove(tempNode);
          tempNode = null;
        }
        isCreatingEdge = false;
        sourceNode = null;
      }
    });
    
    // Mobile edge creation (Long press + tap)
    cyRef.current.on('touchstart', 'node', (evt) => {
      isLongPress = false;
      longPressTimer = setTimeout(() => {
        isLongPress = true;
        isCreatingEdge = true;
        sourceNode = evt.target;
        // Visual feedback for mobile - subtle highlight
        evt.target.style('background-color', '#e0e7ff');
        evt.target.style('border-width', '2px');
        evt.target.style('border-color', '#3b82f6');
        evt.preventDefault();
        
        // Create temporary elements for mobile too
        tempNode = cyRef.current?.add({
          data: { id: 'temp-node' },
          position: evt.position,
          style: {
            'opacity': 0,
            'events': 'no'
          }
        });
        
        tempEdge = cyRef.current?.add({
          data: { 
            id: 'temp-edge',
            source: sourceNode.id(),
            target: 'temp-node'
          },
          classes: 'temp-edge'
        });
      }, 500); // 500ms for long press
    });
    
    // Track touch movement for edge preview
    cyRef.current.on('touchmove', (evt) => {
      if (isCreatingEdge && tempNode && isLongPress) {
        tempNode.position(evt.position);
      }
    });
    
    cyRef.current.on('touchend', 'node', (evt) => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      
      if (isCreatingEdge && sourceNode && isLongPress) {
        const targetNode = evt.target;
        if (sourceNode.id() !== targetNode.id()) {
          // Check if edge already exists
          const existingEdge = cyRef.current?.edges().filter(edge => {
            const source = edge.source().id();
            const target = edge.target().id();
            return (source === sourceNode.id() && target === targetNode.id()) || 
                   (source === targetNode.id() && target === sourceNode.id());
          });
          
          if (!existingEdge || existingEdge.length === 0) {
            const newEdge = {
              data: { 
                id: `e${sourceNode.id()}-${targetNode.id()}`, 
                source: sourceNode.id(), 
                target: targetNode.id() 
              }
            };
            cyRef.current?.add(newEdge);
            
            // Notify parent
            if (onGraphChange) {
              isInternalChange.current = true;
              const allElements = cyRef.current?.elements().map((ele: any) => {
                const isNode = !ele.data('source');
                if (isNode) {
                  return {
                    data: { id: ele.id(), label: ele.data('label') },
                    position: ele.position()
                  };
                } else {
                  return {
                    data: { 
                      id: ele.id(), 
                      source: ele.data('source'), 
                      target: ele.data('target') 
                    }
                  };
                }
              });
              onGraphChange(allElements);
            }
          }
        }
        // Reset visual feedback and clean up
        sourceNode.style('background-color', '#ffffff');
        sourceNode.style('border-width', '0px');
        // Clean up temporary elements
        if (tempEdge) {
          cyRef.current?.remove(tempEdge);
          tempEdge = null;
        }
        if (tempNode) {
          cyRef.current?.remove(tempNode);
          tempNode = null;
        }
        isCreatingEdge = false;
        sourceNode = null;
        isLongPress = false;
      }
    });
    
    cyRef.current.on('mouseup', (evt) => {
      if (isCreatingEdge) {
        // Clean up temporary elements
        if (tempEdge) {
          cyRef.current?.remove(tempEdge);
          tempEdge = null;
        }
        if (tempNode) {
          cyRef.current?.remove(tempNode);
          tempNode = null;
        }
        if (sourceNode) {
          sourceNode.style('background-color', '#ffffff');
        }
        isCreatingEdge = false;
        sourceNode = null;
      }
    });

    // Fit graph to view and apply layout if no positions are set
    const hasPositions = graphElements.some(el => el.position);
    if (!hasPositions) {
      cyRef.current.layout({ name: 'circle', radius: 150 }).run();
      // Only fit on initial load when no positions are set
      setTimeout(() => {
        cyRef.current?.fit(undefined, 50);
      }, 100);
    }

    // Cleanup
    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, []); // Remove dependencies to initialize only once

  // Handle external element updates
  useEffect(() => {
    if (!cyRef.current || !elements) return;
    
    // Skip if this was an internal change
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    
    // Update the graph with new elements without recreating everything
    cyRef.current.elements().remove();
    cyRef.current.add(elements);
    
    // Update node counter based on new elements
    const nodeIds = elements
      .filter(el => !el.data.source)
      .map(el => parseInt(el.data.id))
      .filter(id => !isNaN(id));
    const maxNodeId = nodeIds.length > 0 ? Math.max(...nodeIds) : 0;
    setNodeCounter(maxNodeId + 1);
    
    // Apply layout if no positions are set
    const hasPositions = elements.some(el => el.position);
    if (!hasPositions) {
      cyRef.current.layout({ name: 'circle', radius: 150 }).run();
      // Fit only when loading a new graph without positions
      setTimeout(() => {
        cyRef.current?.fit(undefined, 50);
      }, 100);
    }
  }, [elements]);

  // Keyboard event handling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        deleteSelected();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [deleteSelected]);

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full bg-black ${className}`}
    />
  );
}