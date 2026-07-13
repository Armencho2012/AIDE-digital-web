import { useState, useRef, useEffect, useMemo } from 'react';
import { Play, Pause, Download, Loader2, Mic, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type Language = 'en' | 'ru' | 'hy' | 'ko';

interface PodcastPlayerProps {
  podcastUrl: string | null;
  language: Language;
  onGenerate?: () => void;
  isGenerating?: boolean;
}

const labels = {
  en: {
    podcast: 'Podcast',
    generatedPodcast: 'Generated Podcast',
    clickPlay: 'Click play to listen with your browser voice.',
    download: 'Download script',
    generate: 'Generate Podcast',
    generating: 'Generating...',
    noPodcast: 'No podcast generated yet',
    generateDescription: 'Generate an AI podcast script based on your content',
    play: 'Play',
    pause: 'Pause',
    stop: 'Stop',
    unsupported: 'Your browser does not support speech synthesis.'
  },
  ru: {
    podcast: 'Подкаст',
    generatedPodcast: 'Сгенерированный подкаст',
    clickPlay: 'Нажмите воспроизведение, чтобы прослушать голосом браузера.',
    download: 'Скачать текст',
    generate: 'Создать подкаст',
    generating: 'Создание...',
    noPodcast: 'Подкаст ещё не создан',
    generateDescription: 'Создайте AI-подкаст на основе вашего контента',
    play: 'Играть',
    pause: 'Пауза',
    stop: 'Стоп',
    unsupported: 'Ваш браузер не поддерживает синтез речи.'
  },
  hy: {
    podcast: 'Պոդկաստ',
    generatedPodcast: 'Ստեղծված Պոդկաստ',
    clickPlay: 'Սեղմեք վերարտադրել՝ բրաուզերի ձայնով լսելու համար։',
    download: 'Ներբեռնել տեքստը',
    generate: 'Ստեղծել պոդկաստ',
    generating: 'Ստեղծվում է...',
    noPodcast: 'Պոդկաստ դեռ չի ստեղծվել',
    generateDescription: 'Ստեղծեք ԱԲ պոդկաստ ձեր բովանդակության հիման վրա',
    play: 'Նվագարկել',
    pause: 'Դադար',
    stop: 'Կանգնեցնել',
    unsupported: 'Ձեր բրաուզերը չի աջակցում խոսքի սինթեզ։'
  },
  ko: {
    podcast: '팟캐스트',
    generatedPodcast: '생성된 팟캐스트',
    clickPlay: '브라우저 음성으로 들으려면 재생을 클릭하세요.',
    download: '스크립트 다운로드',
    generate: '팟캐스트 생성',
    generating: '생성 중...',
    noPodcast: '아직 생성된 팟캐스트가 없습니다',
    generateDescription: '콘텐츠를 기반으로 AI 팟캐스트를 생성하세요',
    play: '재생',
    pause: '일시정지',
    stop: '정지',
    unsupported: '이 브라우저는 음성 합성을 지원하지 않습니다.'
  }
};

const LANG_TO_BCP47: Record<Language, string> = {
  en: 'en-US',
  ru: 'ru-RU',
  hy: 'hy-AM',
  ko: 'ko-KR'
};

const isRemoteUrl = (value: string) => /^https?:\/\//i.test(value);
const looksLikeStoragePath = (value: string) =>
  !isRemoteUrl(value) && /\.(mp3|wav|ogg|m4a)$/i.test(value);

export const PodcastPlayer = ({ podcastUrl, language, onGenerate, isGenerating }: PodcastPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { toast } = useToast();

  const l = labels[language] || labels.en;

  // Detect mode: script (plain text) vs audio (URL or storage path)
  const mode: 'script' | 'audio' | 'empty' = useMemo(() => {
    if (!podcastUrl) return 'empty';
    if (isRemoteUrl(podcastUrl) || looksLikeStoragePath(podcastUrl)) return 'audio';
    return 'script';
  }, [podcastUrl]);

  const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Resolve audio URL (legacy stored files)
  useEffect(() => {
    let isMounted = true;
    setPlaybackUrl(null);
    setIsPlaying(false);
    setIsPaused(false);

    if (mode !== 'audio' || !podcastUrl) return;

    if (isRemoteUrl(podcastUrl)) {
      setPlaybackUrl(podcastUrl);
      return;
    }

    supabase.storage
      .from('podcasts')
      .createSignedUrl(podcastUrl, 60 * 60)
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (error || !data?.signedUrl) {
          console.error('Failed to create signed podcast URL:', error);
          return;
        }
        setPlaybackUrl(data.signedUrl);
      });

    return () => {
      isMounted = false;
    };
  }, [podcastUrl, mode]);

  // Cancel speech on unmount / content change
  useEffect(() => {
    return () => {
      if (speechSupported) window.speechSynthesis.cancel();
    };
  }, [speechSupported, podcastUrl]);

  const handleAudioToggle = () => {
    const audio = audioRef.current;
    if (!audio || !playbackUrl) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleSpeak = () => {
    if (!speechSupported || !podcastUrl) return;
    const synth = window.speechSynthesis;

    if (isPlaying && !isPaused) {
      synth.pause();
      setIsPaused(true);
      return;
    }

    if (isPaused) {
      synth.resume();
      setIsPaused(false);
      return;
    }

    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(podcastUrl);
    utterance.lang = LANG_TO_BCP47[language] || 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };
    utteranceRef.current = utterance;
    synth.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handleStop = () => {
    if (!speechSupported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleDownloadScript = () => {
    if (!podcastUrl) return;
    const blob = new Blob([podcastUrl], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'podcast-script.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAudio = async () => {
    if (!playbackUrl) return;
    try {
      const response = await fetch(playbackUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'podcast.mp3';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      toast({ title: 'Error', description: 'Failed to download podcast', variant: 'destructive' });
    }
  };

  // Empty state
  if (mode === 'empty') {
    return (
      <Card className="border-primary/20 shadow-md bg-gradient-to-br from-card to-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-primary flex items-center gap-2 text-base sm:text-lg">
            <Mic className="h-5 w-5" />
            {l.podcast}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
            <div className="p-4 rounded-full bg-primary/10">
              <Mic className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{l.noPodcast}</p>
              <p className="text-sm text-muted-foreground mt-1">{l.generateDescription}</p>
            </div>
            {onGenerate && (
              <Button onClick={onGenerate} disabled={isGenerating} className="mt-2">
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {l.generating}
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    {l.generate}
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Script mode (browser TTS)
  if (mode === 'script') {
    return (
      <Card className="border-primary/20 shadow-lg bg-gradient-to-r from-primary/10 to-accent/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-primary flex items-center gap-2 text-base sm:text-lg">
            <Mic className="h-5 w-5" />
            {l.generatedPodcast}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!speechSupported ? (
            <p className="text-sm text-destructive">{l.unsupported}</p>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                onClick={handleSpeak}
                className="rounded-full h-12 w-12 p-0"
                aria-label={isPlaying && !isPaused ? l.pause : l.play}
              >
                {isPlaying && !isPaused ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" />
                )}
              </Button>
              {isPlaying && (
                <Button variant="outline" size="icon" onClick={handleStop} aria-label={l.stop}>
                  <Square className="h-4 w-4" />
                </Button>
              )}
              <p className="text-sm text-muted-foreground flex-1">{l.clickPlay}</p>
              <Button variant="outline" size="sm" onClick={handleDownloadScript}>
                <Download className="h-4 w-4 mr-2" />
                {l.download}
              </Button>
            </div>
          )}
          <div className="max-h-64 overflow-auto rounded-md border border-primary/20 bg-background/50 p-4 text-sm leading-relaxed whitespace-pre-wrap">
            {podcastUrl}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Legacy audio playback
  return (
    <Card className="border-primary/20 shadow-lg bg-gradient-to-r from-primary/10 to-accent/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-primary flex items-center gap-2 text-base sm:text-lg">
          <Mic className="h-5 w-5" />
          {l.generatedPodcast}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleAudioToggle}
            disabled={!playbackUrl}
            className="h-14 w-14 rounded-full bg-primary/10 hover:bg-primary/20 border-primary/30"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6 text-primary" />
            ) : (
              <Play className="h-6 w-6 text-primary ml-1" />
            )}
          </Button>
          <p className="text-sm text-muted-foreground flex-1">{l.clickPlay}</p>
          <Button variant="outline" size="sm" onClick={handleDownloadAudio} disabled={!playbackUrl}>
            <Download className="h-4 w-4 mr-2" />
            {l.download}
          </Button>
        </div>
        <audio ref={audioRef} src={playbackUrl || undefined} className="hidden" onEnded={() => setIsPlaying(false)} />
      </CardContent>
    </Card>
  );
};
