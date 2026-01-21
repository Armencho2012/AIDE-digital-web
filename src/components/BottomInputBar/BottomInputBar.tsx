import { useState, useRef, DragEvent, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Sparkles,
  Loader2,
  MessageSquare,
  Mic,
  MicOff,
  Lock,
  Plus,
  Upload,
  Send,
  Headphones,
  GraduationCap
} from 'lucide-react';
import { useVoiceInput } from './useVoiceInput';
import { BottomInputBarProps, ActionMode, MediaFile, uiLabels } from './types';

export const BottomInputBar = ({
  language,
  onSubmit,
  isProcessing,
  isLocked
}: BottomInputBarProps) => {
  const [mode, setMode] = useState<ActionMode>('analyze');
  const [text, setText] = useState('');
  const [media, setMedia] = useState<MediaFile[] | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const labels = uiLabels[language];

  const handleTranscript = useCallback((transcript: string) => {
    setText(prev => prev ? `${prev} ${transcript}` : transcript);
  }, []);

  const { isListening, isSupported, toggleListening } = useVoiceInput({
    onTranscript: handleTranscript,
    language
  });

  const handleSubmit = () => {
    if (!text.trim() && (!media || media.length === 0)) return;
    onSubmit(text, mode, media);
    setText('');
    setMedia(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLocked) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!isLocked && e.dataTransfer.files.length > 0) {
      handleFilesAdd(e.dataTransfer.files);
    }
  };

  const handleFilesAdd = async (files: FileList) => {
    const newMedia: MediaFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      
      await new Promise<void>((resolve) => {
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          newMedia.push({
            data: base64String,
            mimeType: file.type,
            name: file.name
          });
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }
    
    setMedia(prev => prev ? [...prev, ...newMedia] : newMedia);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesAdd(e.target.files);
    }
  };

  const modeIcons = {
    analyze: <Sparkles className="h-4 w-4" />,
    chat: <MessageSquare className="h-4 w-4" />,
    podcast: <Headphones className="h-4 w-4" />,
    course: <GraduationCap className="h-4 w-4" />
  };

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-50 p-4 bg-card/90 backdrop-blur-sm border-t transition-all ${isDragging ? 'ring-2 ring-primary ring-offset-2 bg-primary/5' : ''}`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-primary/10 border-2 border-dashed border-primary">
          <div className="flex flex-col items-center gap-2 text-primary">
            <Upload className="h-10 w-10" />
            <span className="font-medium">{labels.dropFiles}</span>
          </div>
        </div>
      )}

      <div className="container max-w-5xl mx-auto">
        <div className="flex items-end gap-3">
          {/* File Picker Button */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileInputChange}
            accept="image/*,application/pdf"
            multiple
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLocked}
            className="shrink-0 h-10 w-10"
            title={labels.attachFile}
          >
            <Plus className="h-5 w-5" />
          </Button>

          {/* Mode Selector */}
          <ToggleGroup
            type="single"
            value={mode}
            onValueChange={(value) => value && setMode(value as ActionMode)}
            className="shrink-0 bg-muted/50 rounded-lg p-1"
          >
            {(['analyze', 'chat', 'podcast', 'course'] as const).map((m) => (
              <ToggleGroupItem
                key={m}
                value={m}
                aria-label={labels.tooltips[m]}
                className="gap-1.5 px-2 sm:px-3 text-xs sm:text-sm data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                disabled={isLocked}
              >
                {modeIcons[m]}
                <span className="hidden sm:inline">{labels.modes[m]}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          {/* Text Input Area */}
          <div className="flex-1 relative">
            {media && media.length > 0 && (
              <Badge variant="secondary" className="absolute -top-6 left-0 gap-1 text-xs">
                {media.length} {media.length === 1 ? labels.fileAttached : labels.filesAttached}
              </Badge>
            )}
            <Textarea
              placeholder={isLocked ? labels.upgradeTooltip : labels.placeholder[mode]}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[44px] max-h-[120px] resize-none py-2.5 pr-12"
              disabled={isLocked}
              rows={1}
            />
            
            {/* Voice Input Button (inside textarea) */}
            {isSupported && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleListening}
                disabled={isLocked}
                className={`absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 ${isListening ? 'text-destructive animate-pulse' : 'text-muted-foreground hover:text-foreground'}`}
                title={isListening ? labels.listening : labels.voiceInput}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSubmit}
            disabled={isProcessing || (!text.trim() && (!media || media.length === 0)) || isLocked}
            className="shrink-0 h-10 w-10 sm:w-auto sm:px-4 bg-gradient-to-r from-primary to-accent hover:opacity-90"
            size="icon"
          >
            {isLocked ? (
              <Lock className="h-5 w-5" />
            ) : isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Send className="h-5 w-5 sm:mr-2" />
                <span className="hidden sm:inline">{labels.submit}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
