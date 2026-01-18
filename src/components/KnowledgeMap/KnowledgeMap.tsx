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
import { Trash2, Download, Maximize2, Minimize2, Map, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import ConceptNodeComponent from './ConceptNodeComponent';
import { initialNodes, initialEdges } from './mockData';
import { ConceptNode, ConceptEdge, KnowledgeMapData, categoryColors, NodeCategory } from './types';

// ... (previous imports)

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
    knowledgeMap: 'Գիտելիքների Քարտեզ',
    clearMap: 'Մաքրել Քարտեզը',
    clear: 'Մաքրել',
    export: 'Արտահանել',
    save: 'Պահպանել',
    mapCleared: 'Քարտեզը մաքրված է',
    mapClearedDesc: 'Գիտելիքների քարտեզը վերականգնվել է:',
    exportSuccess: 'Արտահանումը հաջողվեց',
    exportSuccessDesc: 'Ձեր գիտելիքների քարտեզը արտահանվել է որպես պատկեր:',
    exportFail: 'Արտահանումը ձախողվեց',
    exportFailDesc: 'Չհաջողվեց արտահանել քարտեզը: Խնդրում ենք կրկին փորձել:'
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

// ... (nodeTypes and helper functions remain unchanged)

export const KnowledgeMap = ({ onNodeClick, activeNodeId, data, highlightedNodes, language = 'en' }: KnowledgeMapProps) => {
  const { toast } = useToast();
  const flowRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const labels = uiLabels[language] || uiLabels.en;

  // ... (rest of the component logic until return statement)

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

  // ... (rest of the functions)

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
                <Map className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
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
    </div>
  );
};

export default KnowledgeMap;
