import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  ConnectionLineType,
  MarkerType,
  Panel,
  NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toPng } from 'html-to-image';
import { Trash2, Download, Maximize2, Minimize2, Map as MapIcon, X, Info, Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import ConceptNodeComponent from './ConceptNodeComponent';
import { initialNodes, initialEdges, nodeDescriptions, edgeRelationships } from './mockData';
import { ConceptNode, ConceptEdge, KnowledgeMapData, categoryColors, NodeCategory } from './types';

interface KnowledgeMapProps {
  onNodeClick?: (nodeName: string, description?: string, category?: string) => void;
  activeNodeId?: string;
  data?: KnowledgeMapData | null;
  highlightedNodes?: Set<string>;
  language?: 'en' | 'ru' | 'hy' | 'ko';
}

const uiLabels = {
  en: {
    knowledgeMap: 'Knowledge Map',
    clearMap: 'Clear Map',
    clear: 'Clear',
    export: 'Export',
    save: 'Save',
    mapCleared: 'Map Cleared',
    mapClearedDesc: 'The knowledge map has been reset.',
    exportSuccess: 'Export Successful',
    exportSuccessDesc: 'Your knowledge map has been exported as an image.',
    exportFail: 'Export Failed',
    exportFailDesc: 'Could not export the map. Please try again.'
  },
  ru: {
    knowledgeMap: 'Карта Знаний',
    clearMap: 'Очистить карту',
    clear: 'Очистить',
    export: 'Экспорт',
    save: 'Сохранить',
    mapCleared: 'Карта очищена',
    mapClearedDesc: 'Карта знаний была сброшена.',
    exportSuccess: 'Экспорт выполнен успешно',
    exportSuccessDesc: 'Ваша карта знаний была экспортирована как изображение.',
    exportFail: 'Ошибка экспорта',
    exportFailDesc: 'Не удалось экспортировать карту. Попробуйте снова.'
  },
  hy: {
    knowledgeMap: 'Գdelays delays delays Քdelays delays',
    clearMap: 'Մdelays delays Delays',
    clear: 'Մdelays delays',
    export: 'Արdelays',
    save: 'Պdelays delays',
    mapCleared: 'Քdelays delays delays',
    mapClearedDesc: 'Գdelays delays քdelays delays delays է:',
    exportSuccess: 'Delays delays delays',
    exportSuccessDesc: ' Delays delays delays delays delays է delays delays:',
    exportFail: 'Delays delays delays',
    exportFailDesc: 'Չdelays delays delays: Delays delays delays delays:'
  },
  ko: {
    knowledgeMap: '지식 맵',
    clearMap: '맵 지우기',
    clear: '지우기',
    export: '내보내기',
    save: '저장',
    mapCleared: '맵이 지워졌습니다',
    mapClearedDesc: '지식 맵이 초기화되었습니다.',
    exportSuccess: '내보내기 성공',
    exportSuccessDesc: '지식 맵이 이미지로 내보내졌습니다.',
    exportFail: '내보내기 실패',
    exportFailDesc: '맵을 내보낼 수 없습니다. 다시 시도해 주세요.'
  }
};

const nodeTypes: NodeTypes = {
  conceptNode: ConceptNodeComponent,
};

const getNodeColor = (node: Node): string => {
  const category = node.data?.category as NodeCategory;
  const colors = categoryColors[category] || categoryColors.concept;
  return colors.bg;
};

interface LayoutResult {
  nodes: Node[];
  edges: Edge[];
}

const createTreeLayout = (
  conceptNodes: ConceptNode[],
  conceptEdges: ConceptEdge[],
  activeNodeId?: string,
  highlightedNodes?: Set<string>
): LayoutResult => {
  if (conceptNodes.length === 0) return { nodes: [], edges: [] };

  // 1. Build Adjacency List from original edges
  const adjacency = new globalThis.Map<string, string[]>();
  conceptNodes.forEach(node => {
    adjacency.set(node.id, []);
  });

  conceptEdges.forEach(edge => {
    if (adjacency.has(edge.source)) adjacency.get(edge.source)?.push(edge.target);
    if (adjacency.has(edge.target)) adjacency.get(edge.target)?.push(edge.source);
  });

  // 2. Identify Root (main node or highest degree)
  let rootId = conceptNodes[0]?.id;
  const mainNode = conceptNodes.find(n => n.category === 'main');
  if (mainNode) {
    rootId = mainNode.id;
  } else {
    let maxDegree = -1;
    conceptNodes.forEach(node => {
      const degree = adjacency.get(node.id)?.length || 0;
      if (degree > maxDegree) {
        maxDegree = degree;
        rootId = node.id;
      }
    });
  }

  // 3. Build Spanning Tree (BFS) - THIS IS THE KEY: tree edges NEVER cross
  const childrenMap = new globalThis.Map<string, string[]>();
  const parentMap = new globalThis.Map<string, string | null>();
  const visited = new globalThis.Set<string>();
  const queue = [rootId];
  visited.add(rootId);
  childrenMap.set(rootId, []);
  parentMap.set(rootId, null);

  // Store tree edges as we build the tree
  const treeEdges: Array<{ source: string; target: string }> = [];

  while (queue.length > 0) {
    const u = queue.shift()!;
    const neighbors = adjacency.get(u) || [];
    for (const v of neighbors) {
      if (!visited.has(v)) {
        visited.add(v);
        childrenMap.get(u)?.push(v);
        childrenMap.set(v, []);
        parentMap.set(v, u);
        queue.push(v);
        // Add tree edge (parent -> child)
        treeEdges.push({ source: u, target: v });
      }
    }
  }

  // Handle disconnected nodes - attach to root
  conceptNodes.forEach(node => {
    if (!visited.has(node.id)) {
      visited.add(node.id);
      childrenMap.get(rootId)?.push(node.id);
      childrenMap.set(node.id, []);
      parentMap.set(node.id, rootId);
      treeEdges.push({ source: rootId, target: node.id });
    }
  });

  // 4. Calculate Subtree Sizes for proportional angle allocation
  const subtreeSizes = new globalThis.Map<string, number>();
  const calcSize = (u: string): number => {
    let size = 1;
    const children = childrenMap.get(u) || [];
    for (const v of children) {
      size += calcSize(v);
    }
    subtreeSizes.set(u, size);
    return size;
  };
  calcSize(rootId);

  // 5. Calculate node depths
  const depths = new globalThis.Map<string, number>();
  const calcDepth = (u: string, depth: number) => {
    depths.set(u, depth);
    const children = childrenMap.get(u) || [];
    for (const v of children) {
      calcDepth(v, depth + 1);
    }
  };
  calcDepth(rootId, 0);

  // 6. Radial Tree Layout - MUCH more spacing, guaranteed no crossing
  const positions = new globalThis.Map<string, { x: number; y: number }>();
  const LAYER_SPACING = 400; // Much bigger spacing between layers
  const MIN_NODE_SPACING = 0.3; // Minimum angle gap between siblings (radians)

  const layoutNode = (u: string, startAngle: number, endAngle: number) => {
    const depth = depths.get(u) || 0;
    const radius = depth * LAYER_SPACING;
    const midAngle = (startAngle + endAngle) / 2;
    
    positions.set(u, {
      x: Math.cos(midAngle) * radius,
      y: Math.sin(midAngle) * radius
    });

    const children = childrenMap.get(u) || [];
    if (children.length === 0) return;

    const totalWeight = children.reduce((sum, v) => sum + (subtreeSizes.get(v) || 1), 0);
    const totalSweep = endAngle - startAngle;
    
    // Ensure minimum spacing between children
    const requiredPadding = MIN_NODE_SPACING * (children.length - 1);
    const availableSweep = Math.max(totalSweep - requiredPadding, totalSweep * 0.7);
    const actualPadding = (totalSweep - availableSweep) / Math.max(1, children.length - 1);
    
    let currentAngle = startAngle;
    
    for (let i = 0; i < children.length; i++) {
      const v = children[i];
      const weight = subtreeSizes.get(v) || 1;
      const share = weight / totalWeight;
      const angleWidth = availableSweep * share;
      
      layoutNode(v, currentAngle, currentAngle + angleWidth);
      currentAngle += angleWidth + actualPadding;
    }
  };

  // Start layout from root with full circle
  layoutNode(rootId, 0, 2 * Math.PI);

  // 7. Create Flow Nodes
  const flowNodes: Node[] = conceptNodes.map((node) => {
    const pos = positions.get(node.id) || { x: 0, y: 0 };
    const isActive = node.id === activeNodeId;
    const isHighlighted = highlightedNodes?.has(node.id);
    const isRoot = node.id === rootId;
    
    let size: number;
    if (isRoot) {
      size = 240; // Big central node
    } else {
      const baseSize = 100 + (node.label?.length || 0) * 1.5;
      size = Math.min(Math.max(baseSize, 80), 160);
    }

    return {
      id: node.id,
      type: 'conceptNode',
      position: pos,
      data: {
        label: node.label,
        category: isRoot ? 'main' : node.category,
        description: '',
        isActive,
        isHighlighted,
        size,
        isRoot,
      },
    };
  });

  // 8. Create STRAIGHT tree edges ONLY with labels - these NEVER cross in radial layout
  const flowEdges: Edge[] = treeEdges.map((edge, index) => {
    // Get relationship label from the original edge data
    const relationKey = `${edge.source}-${edge.target}`;
    const reverseKey = `${edge.target}-${edge.source}`;
    const label = edgeRelationships[relationKey] || edgeRelationships[reverseKey] || 'relates to';
    
    return {
      id: `tree-edge-${index}`,
      source: edge.source,
      target: edge.target,
      type: 'straight',
      label: label,
      labelStyle: { 
        fill: 'hsl(265, 80%, 80%)', 
        fontWeight: 600, 
        fontSize: 11,
        textShadow: '0 1px 3px hsl(0 0% 0% / 0.8)',
      },
      labelBgStyle: { 
        fill: 'hsl(265, 40%, 15%)', 
        fillOpacity: 0.9,
        rx: 4,
        ry: 4,
      },
      labelBgPadding: [6, 4] as [number, number],
      style: {
        stroke: 'hsl(265, 60%, 55%)',
        strokeWidth: 2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: 'hsl(265, 60%, 55%)',
        width: 15,
        height: 15,
      },
    };
  });

  return { nodes: flowNodes, edges: flowEdges };
};

export const KnowledgeMap = ({ onNodeClick, activeNodeId, data, highlightedNodes, language = 'en' }: KnowledgeMapProps) => {
  const { toast } = useToast();
  const flowRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<{ 
    id: string;
    label: string; 
    category: string; 
    description?: string;
    details?: string[];
    connections?: string[];
  } | null>(null);
  const labels = uiLabels[language] || uiLabels.en;

  const layoutResult = useMemo(() => {
    const sourceNodes = data?.nodes || initialNodes;
    const sourceEdges = data?.edges || initialEdges;
    return createTreeLayout(sourceNodes, sourceEdges, activeNodeId, highlightedNodes);
  }, [data, activeNodeId, highlightedNodes]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutResult.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutResult.edges);

  useEffect(() => {
    setNodes(layoutResult.nodes);
    setEdges(layoutResult.edges);
  }, [layoutResult, setNodes, setEdges]);

  // Handle node click - show comprehensive info panel
  const handleNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    const nodeData = node.data as { label: string; category: string; description?: string };
    const nodeId = node.id;
    
    // Get description and details from nodeDescriptions
    const nodeInfo = nodeDescriptions[nodeId] || { 
      description: `Learn more about "${nodeData.label}"`,
      details: []
    };
    
    // Find connected nodes
    const sourceNodes = data?.nodes || initialNodes;
    const currentNode = sourceNodes.find(n => n.id === nodeId);
    const connections = currentNode?.connectedTo || [];
    const connectionLabels = connections.map(connId => {
      const connNode = sourceNodes.find(n => n.id === connId);
      return connNode?.label || connId;
    });
    
    setSelectedNode({
      id: nodeId,
      label: nodeData.label,
      category: nodeData.category,
      description: nodeInfo.description,
      details: nodeInfo.details,
      connections: connectionLabels,
    });
    onNodeClick?.(nodeData.label, nodeInfo.description, nodeData.category);
  }, [onNodeClick, data]);

  const closeInfoPanel = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const clearState = useCallback(() => {
    setNodes([]);
    setEdges([]);
  }, [setNodes, setEdges]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const handleClearMap = useCallback(() => {
    clearState();
    toast({
      title: labels.mapCleared,
      description: labels.mapClearedDesc,
    });
  }, [clearState, toast, labels]);

  const handleExportImage = useCallback(async () => {
    if (!flowRef.current) return;

    try {
      const dataUrl = await toPng(flowRef.current, {
        backgroundColor: 'hsl(215, 30%, 12%)',
        quality: 1,
        pixelRatio: 2,
      });

      const link = document.createElement('a');
      link.download = 'knowledge-map.png';
      link.href = dataUrl;
      link.click();

      toast({
        title: labels.exportSuccess,
        description: labels.exportSuccessDesc,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: labels.exportFail,
        description: labels.exportFailDesc,
        variant: 'destructive',
      });
    }
  }, [toast, labels]);

  return (
    <div
      className={`relative transition-all duration-300 ${isFullscreen
        ? 'fixed inset-0 z-50'
        : 'h-full w-full'
        }`}
    >
      {/* Dark glassmorphism background */}
      <div
        className="absolute inset-0 rounded-xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, hsl(215 30% 12% / 0.95), hsl(215 28% 8% / 0.98))',
          backdropFilter: 'blur(20px)',
          border: '1px solid hsl(215 20% 25% / 0.5)',
        }}
      >
        <div ref={flowRef} className="w-full h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            nodeTypes={nodeTypes}
            connectionLineType={ConnectionLineType.SmoothStep}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            minZoom={0.2}
            maxZoom={3}
            proOptions={{ hideAttribution: true }}
            panOnDrag={true}
            zoomOnPinch={true}
            zoomOnScroll={true}
            preventScrolling={false}
          >
            <Background
              color="hsl(215, 20%, 30%)"
              gap={20}
              size={1}
            />
            <Controls
              className="!bg-card/80 !backdrop-blur-sm !border-border !rounded-lg !shadow-lg"
              showInteractive={false}
            />
            <MiniMap
              nodeColor={getNodeColor}
              maskColor="hsl(215, 30%, 12% / 0.8)"
              className="!bg-card/60 !backdrop-blur-sm !border-border !rounded-lg"
            />

            {/* Control Panel */}
            <Panel position="top-right" className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearMap}
                className="bg-card/90 backdrop-blur-sm border-border hover:bg-destructive/20 hover:text-destructive hover:border-destructive/50 shadow-md text-xs sm:text-sm"
              >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{labels.clearMap}</span>
                <span className="sm:hidden">{labels.clear}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportImage}
                className="bg-card/90 backdrop-blur-sm border-border hover:bg-primary/20 hover:text-primary hover:border-primary/50 shadow-md text-xs sm:text-sm"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{labels.export}</span>
                <span className="sm:hidden">{labels.save}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                className="bg-card/90 backdrop-blur-sm border-border hover:bg-secondary shadow-md"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-3 w-3 sm:h-4 sm:w-4" />
                ) : (
                  <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
              </Button>
            </Panel>

            {/* Title */}
            <Panel position="top-left">
              <div className="flex items-center gap-2 bg-card/90 backdrop-blur-sm border border-border rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 shadow-md">
                <MapIcon className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                <span className="text-xs sm:text-sm font-medium text-foreground">{labels.knowledgeMap}</span>
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </div>

      {/* Fullscreen close button */}
      {isFullscreen && (
        <Button
          variant="outline"
          size="icon"
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 z-10 bg-card/80 backdrop-blur-sm border-border"
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {/* Node Info Panel - Comprehensive Details */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-20 max-h-[70vh] overflow-y-auto">
          <div
            className="rounded-xl p-5 backdrop-blur-xl border animate-in slide-in-from-bottom-4 duration-300"
            style={{
              background: 'linear-gradient(135deg, hsl(265 70% 20% / 0.95), hsl(265 60% 15% / 0.98))',
              borderColor: 'hsl(265 60% 50% / 0.5)',
              boxShadow: '0 20px 50px -10px hsl(265 60% 30% / 0.5)',
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <span className="text-xs uppercase tracking-wider text-purple-300 font-medium px-2 py-0.5 rounded-full bg-purple-500/20">
                    {selectedNode.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">{selectedNode.label}</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeInfoPanel}
                className="h-8 w-8 text-purple-300 hover:text-white hover:bg-purple-500/20 shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Description */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-semibold text-purple-200">Description</span>
              </div>
              <p className="text-sm text-purple-100/90 leading-relaxed">{selectedNode.description}</p>
            </div>

            {/* Key Details */}
            {selectedNode.details && selectedNode.details.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-semibold text-purple-200">Key Facts</span>
                </div>
                <ul className="space-y-1.5">
                  {selectedNode.details.map((detail, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-purple-100/80">
                      <span className="text-purple-400 mt-0.5">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Connected Concepts */}
            {selectedNode.connections && selectedNode.connections.length > 0 && (
              <div className="pt-3 border-t border-purple-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowRight className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-semibold text-purple-200">Connected To</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedNode.connections.map((conn, index) => (
                    <span 
                      key={index} 
                      className="text-xs px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/30"
                    >
                      {conn}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeMap;
