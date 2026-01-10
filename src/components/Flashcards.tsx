import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, RotateCcw, Layers, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type Language = 'en' | 'ru' | 'hy' | 'ko';

interface Flashcard {
  front: string;
  back: string;
  confidence?: 'easy' | 'medium' | 'hard';
}

interface FlashcardsProps {
  flashcards: Flashcard[];
  language: Language;
}

const uiLabels = {
  en: {
    title: 'Flashcards',
    flip: 'Click to flip',
    card: 'Card',
    of: 'of',
    restart: 'Restart',
    noCards: 'No flashcards available',
    confidence: 'Confidence Level',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    confidenceSaved: 'Confidence level saved for spaced repetition'
  },
  ru: {
    title: 'Карточки',
    flip: 'Нажмите, чтобы перевернуть',
    card: 'Карточка',
    of: 'из',
    restart: 'Начать заново',
    noCards: 'Карточки недоступны'
  },
  hy: {
    title: 'Քարտեր',
    flip: 'Սեղմեք շրջելու համար',
    card: 'Քարտ',
    of: '-ից',
    restart: 'Վերագործարկել',
    noCards: 'Քարտեր հասանելի չեն'
  },
  ko: {
    title: '플래시카드',
    flip: '클릭하여 뒤집기',
    card: '카드',
    of: '/',
    restart: '다시 시작',
    noCards: '플래시카드가 없습니다'
  }
};

export const Flashcards = ({ flashcards, language }: FlashcardsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [confidenceLevels, setConfidenceLevels] = useState<Record<number, 'easy' | 'medium' | 'hard'>>({});
  const { toast } = useToast();
  const labels = uiLabels[language];

  const validFlashcards = useMemo(() => {
    return flashcards.filter(card => card.front && card.back);
  }, [flashcards]);

  if (validFlashcards.length === 0) {
    return (
      <Card className="border-primary/20 shadow-md">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Layers className="h-5 w-5" />
            {labels.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">{labels.noCards}</p>
        </CardContent>
      </Card>
    );
  }

  const currentCard = validFlashcards[currentIndex];

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev === 0 ? validFlashcards.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev === validFlashcards.length - 1 ? 0 : prev + 1));
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleConfidenceChange = async (value: number[]) => {
    const confidenceMap: Record<number, 'easy' | 'medium' | 'hard'> = { 0: 'easy', 1: 'medium', 2: 'hard' };
    const confidence = confidenceMap[value[0] as keyof typeof confidenceMap] || 'medium';
    
    setConfidenceLevels(prev => ({
      ...prev,
      [currentIndex]: confidence
    }));

    // Save confidence level to Supabase for spaced repetition
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && currentCard) {
        // Store flashcard confidence in user's progress tracking
        await supabase.from('flashcard_progress').upsert({
          user_id: user.id,
          flashcard_id: `${currentCard.front}-${currentCard.back}`,
          confidence_level: confidence,
          reviewed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,flashcard_id'
        });

        toast({
          title: "Progress Saved",
          description: labels.confidenceSaved || "Your confidence level has been saved",
        });
      }
    } catch (error) {
      console.error('Error saving confidence level:', error);
      // Non-critical, don't show error to user
    }
  };

  const getConfidenceValue = (): number[] => {
    const confidence = confidenceLevels[currentIndex] || 'medium';
    const map: Record<string, number> = { easy: 0, medium: 1, hard: 2 };
    return [map[confidence] || 1];
  };

  return (
    <Card className="border-primary/20 shadow-md">
      <CardHeader>
        <CardTitle className="text-primary flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            {labels.title}
          </span>
          <span className="text-sm font-normal text-muted-foreground">
            {labels.card} {currentIndex + 1} {labels.of} {validFlashcards.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Flashcard */}
        <div 
          className="relative cursor-pointer perspective-1000"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div 
            className={`relative w-full min-h-[300px] transition-transform duration-500 transform-style-preserve-3d ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front */}
            <div 
              className="absolute inset-0 backface-hidden bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20 rounded-xl p-6 flex flex-col items-center justify-center"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <p className="text-lg font-medium text-center">{currentCard.front}</p>
              <p className="text-xs text-muted-foreground mt-4">{labels.flip}</p>
            </div>
            
            {/* Back */}
            <div 
              className="absolute inset-0 backface-hidden bg-gradient-to-br from-accent/5 to-primary/5 border-2 border-accent/20 rounded-xl p-6 flex flex-col items-center justify-center"
              style={{ 
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <p className="text-lg text-center">{currentCard.back}</p>
              <p className="text-xs text-muted-foreground mt-4">{labels.flip}</p>
            </div>
          </div>
        </div>

        {/* Confidence Level Slider - Only show when card is flipped */}
        {isFlipped && (
          <div className="space-y-2 p-4 bg-muted rounded-lg">
            <Label className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              {labels.confidence || 'Confidence Level'}
            </Label>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground min-w-[40px]">{labels.easy || 'Easy'}</span>
              <Slider
                value={getConfidenceValue()}
                onValueChange={handleConfidenceChange}
                min={0}
                max={2}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground min-w-[60px] text-right">{labels.hard || 'Hard'}</span>
            </div>
            <div className="flex justify-center">
              <span className="text-xs font-medium text-primary">
                {confidenceLevels[currentIndex] === 'easy' && labels.easy}
                {confidenceLevels[currentIndex] === 'medium' && labels.medium}
                {confidenceLevels[currentIndex] === 'hard' && labels.hard}
                {!confidenceLevels[currentIndex] && labels.medium}
              </span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={handlePrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="sm" onClick={handleRestart}>
            <RotateCcw className="h-4 w-4 mr-2" />
            {labels.restart}
          </Button>
          
          <Button variant="outline" size="icon" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1 flex-wrap">
          {validFlashcards.map((_, index) => (
            <button
              key={index}
              onClick={() => { setCurrentIndex(index); setIsFlipped(false); }}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
