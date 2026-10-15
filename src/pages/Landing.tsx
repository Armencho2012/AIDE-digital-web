import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SettingsModal } from "@/components/SettingsModal";
import { useSettings } from "@/hooks/useSettings";
import {
  ArrowRight,
  Bot,
  Brain,
  Check,
  FileText,
  HelpCircle,
  Library,
  Mail,
  Map,
  MessageSquare,
  Mic,
  Settings,
  Sparkles,
  Upload,
  WandSparkles,
  Youtube,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Language } from "@/lib/settings";

interface FeatureCard {
  icon: LucideIcon;
  title: string;
  description: string;
  chips: string[];
}

interface LandingCopy {
  contact: string;
  help: string;
  signIn: string;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  startNow: string;
  seeFlow: string;
  freeBadge: string;
  langBadge: string;
  uploadBadge: string;
  previewTitle: string;
  previewSubtitle: string;
  previewTab1: string;
  previewTab2: string;
  previewTab3: string;
  previewStream: string;
  previewWidgetQuizNotes: string;
  previewWidgetPodcast: string;
  flowTitle: string;
  flowSubtitle: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  featuresSubtitle: string;
  readGuide: string;
  featureCards: FeatureCard[];
}

const languageSwitch = [
  { code: "en" as Language, label: "EN" },
  { code: "ru" as Language, label: "RU" },
  { code: "hy" as Language, label: "HY" },
  { code: "ko" as Language, label: "KO" },
];

const copy: Record<Language, LandingCopy> = {
  en: {
    contact: "Contact",
    help: "Help",
    signIn: "Log In",
    heroEyebrow: "AI-Powered Study Assistant",
    heroTitle: "Stop Rewriting. Start Remembering.",
    heroSubtitle: "Aide turns your messy notes into neural maps, practice tests, and AI podcasts. Spend 10 minutes studying, not 2 hours preparing.",
    startNow: "Start Speedrunning",
    seeFlow: "See How It Works",
    freeBadge: "Daily Free Analysis",
    langBadge: "4 Languages",
    uploadBadge: "PDF + Image + Voice",
    previewTitle: "Your Study Dashboard",
    previewSubtitle: "Everything you need in one view",
    previewTab1: "Deep Summary",
    previewTab2: "Neural Map",
    previewTab3: "AI Tutor",
    previewStream: "Analyzing...",
    previewWidgetQuizNotes: "Quiz & Notes",
    previewWidgetPodcast: "Podcast",
    flowTitle: "Study Smarter",
    flowSubtitle: "Three steps to total control.",
    step1Title: "Upload",
    step1Desc: "Drop a PDF, paste text, or just talk. Aide handles the rest.",
    step2Title: "Customize",
    step2Desc: "Pick what you need: Maps, flashcards, or a podcast episode.",
    step3Title: "Master",
    step3Desc: "Ace your exams with active recall and your own personal AI tutor.",
    featuresSubtitle: "Everything you need to dominate your syllabus.",
    readGuide: "How to Prompt",
    featureCards: [
      {
        icon: Sparkles,
        title: "Smart Summaries",
        description: "Get the big picture without reading 50 pages.",
        chips: ["PDFs", "Images", "OCR"]
      },
      {
        icon: FileText,
        title: "Practice Tests",
        description: "Quizzes and flashcards built from your own notes.",
        chips: ["Active Recall", "Explanations"]
      },
      {
        icon: Map,
        title: "Neural Maps",
        description: "See your subjects as a visual web of ideas.",
        chips: ["Visual Learning", "Gap Scan"]
      },
      {
        icon: MessageSquare,
        title: "AI Tutor",
        description: "A tutor that's always awake and knows your notes.",
        chips: ["24/7 Chat", "Homework Help"]
      },
      {
        icon: Mic,
        title: "Study Podcasts",
        description: "Turn your syllabus into an easy-to-listen podcast.",
        chips: ["Listen & Learn", "TTS"]
      },
      {
        icon: Youtube,
        title: "YouTube Video Summarizer",
        description: "Paste a YouTube link and turn lectures into study notes.",
        chips: ["Video", "Summaries", "Lecture Notes"]
      },
      {
        icon: Library,
        title: "Easy Exports",
        description: "Move your notes to Notion or PDF instantly.",
        chips: ["Notion", "Markdown", "PDF"]
      },
    ],
  },
  ko: {
    contact: "문의",
    help: "도움말",
    signIn: "로그인",
    heroEyebrow: "AI 기반 학습 비서",
    heroTitle: "받아쓰기는 끝. 이제는 기억할 시간.",
    heroSubtitle: "Aide는 복잡한 노트를 신경망 맵, 모의고사, AI 팟캐스트로 바꿔줍니다. 2시간 준비할 내용을 10분 만에 끝내세요.",
    startNow: "지금 바로 시작",
    seeFlow: "작동 방식 보기",
    freeBadge: "매일 무료 분석 제공",
    langBadge: "4개 언어 지원",
    uploadBadge: "PDF + 이미지 + 음성",
    previewTitle: "나의 학습 대시보드",
    previewSubtitle: "공부에 필요한 모든 것을 한눈에",
    previewTab1: "핵심 요약",
    previewTab2: "지식 맵",
    previewTab3: "AI 튜터",
    previewStream: "분석 중...",
    previewWidgetQuizNotes: "퀴즈 및 노트",
    previewWidgetPodcast: "팟캐스트",
    flowTitle: "더 스마트한 학습",
    flowSubtitle: "완벽한 이해를 위한 3단계.",
    step1Title: "업로드",
    step1Desc: "PDF를 올리거나 텍스트를 붙여넣으세요. 음성 입력도 가능합니다.",
    step2Title: "맞춤 설정",
    step2Desc: "맵, 플래시카드, 팟캐스트 중 필요한 것을 선택하세요.",
    step3Title: "마스터",
    step3Desc: "나만의 AI 튜터와 함께 시험을 완벽하게 대비하세요.",
    featuresSubtitle: "모든 과목을 정복하기 위한 필수 기능.",
    readGuide: "사용 가이드",
    featureCards: [
      {
        icon: Sparkles,
        title: "스마트 요약",
        description: "50페이지를 다 읽지 않아도 핵심을 파악합니다.",
        chips: ["PDF", "이미지", "OCR"]
      },
      {
        icon: FileText,
        title: "실전 테스트",
        description: "내 노트를 바탕으로 만들어지는 퀴즈와 카드.",
        chips: ["능동 회상", "해설 제공"]
      },
      {
        icon: Map,
        title: "신경망 맵",
        description: "개념들이 어떻게 연결되는지 한눈에 확인하세요.",
        chips: ["시각적 학습", "갭 스캔"]
      },
      {
        icon: MessageSquare,
        title: "AI 튜터",
        description: "내 강의 내용을 완벽히 이해하는 전담 튜터.",
        chips: ["24/7 채팅", "과제 지원"]
      },
      {
        icon: Mic,
        title: "학습 팟캐스트",
        description: "교재 내용을 듣기 편한 팟캐스트로 변환.",
        chips: ["듣는 공부", "TTS"]
      },
      {
        icon: Youtube,
        title: "YouTube Video Summarizer",
        description: "유튜브 링크를 넣고 강의 내용을 학습 노트로 바꾸세요.",
        chips: ["비디오", "요약", "강의 노트"]
      },
      {
        icon: Library,
        title: "간편한 내보내기",
        description: "공부한 내용을 즉시 Notion이나 PDF로 전송.",
        chips: ["Notion", "Markdown", "PDF"]
      },
    ],
  },
  ru: {
    contact: "Контакт",
    help: "Помощь",
    signIn: "Войти",
    heroEyebrow: "Ваш AI-помощник в учебе",
    heroTitle: "Хватит переписывать. Пора запоминать.",
    heroSubtitle: "Aide превращает гору заметок в тесты, карты знаний и подкасты. Учись за 10 минут, а не за 2 часа.",
    startNow: "Начать учиться",
    seeFlow: "Как это работает",
    freeBadge: "Бесплатно каждый день",
    langBadge: "4 языка",
    uploadBadge: "PDF + Фото + Голос",
    previewTitle: "Твой кабинет",
    previewSubtitle: "Все инструменты под рукой",
    previewTab1: "Разбор",
    previewTab2: "Карта знаний",
    previewTab3: "AI-Тьютор",
    previewStream: "Анализирую...",
    previewWidgetQuizNotes: "Тесты и заметки",
    previewWidgetPodcast: "Подкаст",
    flowTitle: "Учись проще",
    flowSubtitle: "Три шага к успеху.",
    step1Title: "Загрузи",
    step1Desc: "PDF, текст или просто наговори голосом. Остальное за Aide.",
    step2Title: "Настрой",
    step2Desc: "Выбери: карта, карточки или аудио-подкаст.",
    step3Title: "Выучи",
    step3Desc: "Сдавай экзамены на отлично с личным AI-наставником.",
    featuresSubtitle: "Инструменты для победы над любым предметом.",
    readGuide: "Как пользоваться",
    featureCards: [
      {
        icon: Sparkles,
        title: "Умные итоги",
        description: "Пойми суть темы без чтения 50 страниц.",
        chips: ["PDF", "Фото", "OCR"]
      },
      {
        icon: FileText,
        title: "Тесты для практики",
        description: "Вопросы по твоим же конспектам.",
        chips: ["Запоминание", "Объяснения"]
      },
      {
        icon: Map,
        title: "Карты знаний",
        description: "Визуализируй связи между идеями.",
        chips: ["Карты", "Пробелы"]
      },
      {
        icon: MessageSquare,
        title: "AI-Тьютор",
        description: "Наставник, который знает твои лекции лучше всех.",
        chips: ["Чат 24/7", "Помощь"]
      },
      {
        icon: Mic,
        title: "Подкасты",
        description: "Твои конспекты в формате аудио.",
        chips: ["Слушай", "TTS"]
      },
      {
        icon: Youtube,
        title: "Суммаризатор YouTube",
        description: "Вставьте ссылку на видео и превратите лекции в конспект.",
        chips: ["Видео", "Кратко", "Лекции"]
      },
      {
        icon: Library,
        title: "Экспорт",
        description: "Мгновенно переноси всё в Notion или PDF.",
        chips: ["Notion", "Markdown", "PDF"]
      },
    ],
  },
  hy: {
    contact: "Կապ",
    help: "Օգնություն",
    signIn: "Մուտք",
    heroEyebrow: "AI ուսումնական օգնական",
    heroTitle: "Մի՛ արտագրիր: Սկսի՛ հիշել:",
    heroSubtitle: "Aide-ը քո նշումները վերածում է թեստերի, քարտեզների և պոդկաստների: Սովորիր 10 րոպեում, ոչ թե 2 ժամում:",
    startNow: "Սկսել հիմա",
    seeFlow: "Ինչպես է աշխատում",
    freeBadge: "Անվճար վերլուծություն ամեն օր",
    langBadge: "4 լեզու",
    uploadBadge: "PDF + Նկար + Ձայն",
    previewTitle: "Քո աշխատասեղանը",
    previewSubtitle: "Այն ամենը, ինչ պետք է սովորելու համար",
    previewTab1: "Ամփոփում",
    previewTab2: "Գիտելիքի քարտեզ",
    previewTab3: "AI ուսուցիչ",
    previewStream: "Վերլուծում եմ...",
    previewWidgetQuizNotes: "Թեստեր և նշումներ",
    previewWidgetPodcast: "Պոդկաստ",
    flowTitle: "Սովորիր ավելի հեշտ",
    flowSubtitle: "3 քայլ դեպի հաջողություն:",
    step1Title: "Վերբեռնիր",
    step1Desc: "PDF, տեքստ կամ պարզապես ձայնագրիր քո խոսքը: Aide-ին կանի մնացածը:",
    step2Title: "Ընտրիր",
    step2Desc: "Ի՞նչ է պետք՝ թեստե՞ր, քարտեզնե՞ր, թե՞ աուդիո պոդկաստ:",
    step3Title: "Յուրացրու",
    step3Desc: "Պատրաստվիր քննություններին քո անձնական AI ուսուցչի հետ:",
    featuresSubtitle: "Այն ամենը, ինչ պետք է ցանկացած առարկա հաղթահարելու համար:",
    readGuide: "Ինչպես օգտվել",
    featureCards: [
      {
        icon: Sparkles,
        title: "Խելացի ամփոփում",
        description: "Հասկացիր թեման՝ առանց 50 էջ կարդալու:",
        chips: ["PDF", "Նկար", "OCR"]
      },
      {
        icon: FileText,
        title: "Թեստեր",
        description: "Հարցեր հենց քո դասախոսություններից:",
        chips: ["Հիշողություն", "Բացատրություն"]
      },
      {
        icon: Map,
        title: "Գիտելիքի քարտեզ",
        description: "Տես կապը գաղափարների միջև:",
        chips: ["Վիզուալ", "Բացթողումներ"]
      },
      {
        icon: MessageSquare,
        title: "AI ուսուցիչ",
        description: "Օգնական, որը երբեք չի քնում և գիտի քո դասերը:",
        chips: ["Չատ 24/7", "Օգնություն"]
      },
      {
        icon: Mic,
        title: "Պոդկաստներ",
        description: "Քո նշումները՝ աուդիո ձևաչափով:",
        chips: ["Լսիր", "TTS"]
      },
      {
        icon: Youtube,
        title: "YouTube ամփոփիչ",
        description: "Տեղադրիր YouTube հղումը և վերածիր դասախոսությունները նշումների:",
        chips: ["Տեսանյութ", "Ամփոփում", "Դասախոսություն"]
      },
      {
        icon: Library,
        title: "Արտահանում",
        description: "Տեղափոխիր ամեն ինչ Notion կամ PDF վայրկյանների ընթացքում:",
        chips: ["Notion", "Markdown", "PDF"]
      },
    ],
  },
};

const accessCards: Array<{ icon: LucideIcon; title: string; description: string }> = [
  {
    icon: Library,
    title: "Desktop Deep Work",
    description: "Upload large files, build maps, and run full exam simulations in one dashboard.",
  },
  {
    icon: MessageSquare,
    title: "Mobile AI Tutor",
    description: "Ask questions and review flashcards between classes from your phone.",
  },
  {
    icon: Mic,
    title: "Audio Anywhere",
    description: "Turn notes into podcasts for gym, commute, or late-night review sessions.",
  },
];

const comparisonRows = [
  { metric: "Prep Time", aide: "Fast, focused setup", traditional: "Lengthy manual preparation" },
  { metric: "Retention", aide: "Active recall + repetition", traditional: "Passive rereading" },
  { metric: "Feedback Speed", aide: "Instant explanation loops", traditional: "Delayed grading cycles" },
  { metric: "Personalization", aide: "Per-topic adaptive quizzes", traditional: "One-size-fits-all review" },
];

const faqItems = [
  {
    q: "Can I use my own lecture notes and PDFs?",
    a: "Yes. You can upload PDFs, paste text, and use voice input. Aide adapts output to your material.",
  },
  {
    q: "Does Aide work for different subjects?",
    a: "Yes. Students use it for STEM, medicine, business, law, and language-heavy courses.",
  },
  {
    q: "How quickly can I start seeing results?",
    a: "Most learners start with summaries and quizzes in the first session, then improve retention over the first week.",
  },
  {
    q: "Is Aide available on phone and desktop?",
    a: "Yes. The experience is fully responsive and designed for both quick mobile sessions and deeper desktop study.",
  },
];

const Landing = () => {
  const { language, theme, setLanguage, setTheme } = useSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const t = copy[language] || copy.en;
  const heroWords = t.heroTitle.split(" ").filter(Boolean);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || typeof window === "undefined") return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    const initMotion = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const onScroll = () => ScrollTrigger.update();
      window.addEventListener("scroll", onScroll);
      gsap.ticker.lagSmoothing(500, 33);
      const media = gsap.matchMedia();
      const blueSection = root.querySelector<HTMLElement>("#blue-section");
      const ctx = gsap.context(() => {
        if (prefersReducedMotion) {
          gsap.set("[data-hero-word], [data-hero-subtitle], [data-hero-cta], [data-hero-badges], [data-preview-panel], [data-reveal], [data-bento-card]", {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            clearProps: "all",
          });
          return;
        }

        gsap.fromTo(
          "[data-hero-word]",
          { autoAlpha: 0, yPercent: 110, filter: "blur(10px)" },
          {
            autoAlpha: 1,
            yPercent: 0,
            filter: "blur(0px)",
            duration: 0.9,
            stagger: 0.045,
            ease: "power4.out",
          }
        );

        gsap.fromTo(
          "[data-hero-subtitle], [data-hero-cta], [data-hero-badges], [data-preview-panel]",
          { autoAlpha: 0, y: 26 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            delay: 0.22,
            stagger: 0.08,
            ease: "power3.out",
          }
        );

        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el, index) => {
          gsap.fromTo(
            el,
            { autoAlpha: 0, y: 34 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.85,
              delay: Math.min(index * 0.02, 0.2),
              ease: "power3.out",
              scrollTrigger: {
                trigger: el,
                start: "top 88%",
                end: "top 65%",
                toggleActions: "play none none reverse",
              },
            }
          );
        });

        media.add("(max-width: 1023px)", () => {
          gsap.utils.toArray<HTMLElement>("[data-bento-card]").forEach((card, index) => {
            gsap.fromTo(
              card,
              { autoAlpha: 0, y: 36, scale: 0.985 },
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 0.8,
                delay: Math.min(index * 0.03, 0.2),
                ease: "power3.out",
                scrollTrigger: {
                  trigger: card,
                  start: "top 88%",
                  end: "top 60%",
                  toggleActions: "play none none reverse",
                },
              }
            );
          });
        });

        media.add("(min-width: 1024px)", () => {
          const bentoCards = gsap.utils.toArray<HTMLElement>("[data-bento-card]");
          if (bentoCards.length > 0 && blueSection) {
            gsap.fromTo(
              bentoCards,
              { autoAlpha: 0, y: 46, scale: 0.96 },
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 0.82,
                ease: "power3.out",
                stagger: 0.11,
                scrollTrigger: {
                  trigger: blueSection,
                  start: "top 76%",
                  end: "top 44%",
                  toggleActions: "play none none reverse",
                },
              }
            );
          }

        });
      }, root);

      ScrollTrigger.refresh();

      cleanup = () => {
        window.removeEventListener("scroll", onScroll);
        ctx.revert();
        media.kill();
      };
    };

    void initMotion().catch((error) => {
      console.error("Failed to initialize landing motion runtime:", error);
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [language]);

  return (
    <div
      ref={rootRef}
      className="landing-page min-h-screen overflow-x-hidden bg-background text-foreground"
    >
      <nav
        data-nav
        className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl"
      >
        <div className="container mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Aide AI study assistant logo" className="h-8 w-8 rounded-full object-contain" />

            <span data-nav-strong className="text-lg font-semibold text-foreground">
              Aide
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex items-center rounded-full border border-border bg-card p-1">
              {languageSwitch.map((item) => (
                <Button
                  variant="ghost"
                  size="sm"
                  key={item.code}
                  type="button"
                  onClick={() => setLanguage(item.code)}
                  aria-pressed={language === item.code}
                  aria-label={`Switch language to ${item.label}`}
                  data-nav-muted={language !== item.code ? "true" : undefined}
                  data-nav-strong={language === item.code ? "true" : undefined}
                  className={`h-8 rounded-full px-2.5 py-1 text-xs hover:scale-100 ${
                    language === item.code
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Button>
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hidden text-muted-foreground hover:bg-secondary hover:text-foreground sm:flex"
            >
              <a data-nav-muted href="mailto:myaide.study@gmail.com">
                <Mail className="h-4 w-4" />
                {t.contact}
              </a>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hidden text-muted-foreground hover:bg-secondary hover:text-foreground sm:flex"
            >
              <Link data-nav-muted to="/help">
                <HelpCircle className="h-4 w-4" />
                {t.help}
              </Link>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSettingsOpen(true)}
              aria-label="Open settings"
              className="rounded-full border-border bg-card text-muted-foreground hover:bg-secondary"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button asChild size="sm" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
              <Link data-nav-strong to="/auth">{t.signIn}</Link>
            </Button>
          </div>
        </div>
      </nav>

      <section className="container mx-auto max-w-7xl px-4 pb-14 pt-16 md:pt-20">
        <div className="relative">

          <div className="relative grid items-center gap-8 lg:grid-cols-12 xl:gap-10">
            <div className="lg:col-span-6 xl:col-span-7">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-xl">
                <Brain className="h-3.5 w-3.5 text-primary" />
                {t.heroEyebrow}
              </div>

              <h1 className="max-w-[16ch] text-[40px] font-black leading-[1.05] text-foreground sm:text-5xl lg:text-7xl">
                {heroWords.map((word, index) => (
                  <span
                    key={`${word}-${index}`}
                    data-hero-word
                    className="mr-[0.17em] inline-block last:mr-0"
                  >
                    {word}
                  </span>
                ))}
              </h1>

              <p
                data-hero-subtitle
                className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg"
              >
                {t.heroSubtitle}
              </p>

              <div data-hero-cta className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-full bg-primary px-7 text-base text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-sm"
                >
                  <Link to="/auth">
                    {t.startNow}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full border-border bg-card px-7 text-base text-primary transition-colors hover:bg-muted"
                >
                  <a href="#how-it-works">{t.seeFlow}</a>
                </Button>
              </div>

              <div data-hero-badges className="mt-6 flex flex-wrap gap-2.5">
                {[t.freeBadge, t.langBadge, t.uploadBadge].map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-xl"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            <div data-preview-panel className="lg:col-span-6 xl:col-span-5">
              <div className="relative mx-auto w-full max-w-[34rem]">
                <Card className="relative overflow-hidden rounded-lg border border-border bg-card p-5 sm:p-7 shadow-sm backdrop-blur-xl">

                  <div className="relative mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-foreground">{t.previewTitle}</p>
                      <p className="text-sm text-muted-foreground">{t.previewSubtitle}</p>
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-primary px-3 py-1.5 text-xs font-medium text-foreground">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                      {t.previewStream}
                    </div>
                  </div>

                  <img
                    data-mascot-shell
                    src="/Aido.png"
                    alt="Aido mascot — Aide AI study assistant"
                    width={352}
                    height={352}
                    fetchPriority="high"
                    decoding="async"
                    className="relative mx-auto w-full max-w-[22rem] landing-mascot"
                  />

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {[t.previewTab1, t.previewTab2, t.previewTab3].map((tab, idx) => (
                      <div
                        key={tab}
                        className={`rounded-lg px-2 py-2 text-center text-xs font-medium ${
                          idx === 0
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {tab}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-2.5 text-xs text-muted-foreground">
                      <FileText className="h-4 w-4 text-primary" />
                      {t.previewWidgetQuizNotes}
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-2.5 text-xs text-muted-foreground">
                      <Mic className="h-4 w-4 text-primary" />
                      {t.previewWidgetPodcast}
                    </div>
                  </div>

                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="container mx-auto max-w-7xl px-4 pb-16">
        <div data-reveal className="mb-8">
          <p className="text-xs font-semibold uppercase text-primary">
            How it works
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground md:text-4xl">
            {t.flowTitle}
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">{t.flowSubtitle}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Upload, title: t.step1Title, desc: t.step1Desc },
            { icon: WandSparkles, title: t.step2Title, desc: t.step2Desc },
            { icon: Bot, title: t.step3Title, desc: t.step3Desc },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.title}
                data-reveal
                className="h-full rounded-lg border border-border bg-card p-5 shadow-sm backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-primary">
                    <Icon className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <span className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-primary">
                    Step {index + 1}
                  </span>
                </div>
                <p className="mb-2 text-sm font-semibold text-foreground">{item.title}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* TODO: INSERT REAL TESTIMONIALS HERE — requires verified student data */}

<section id="blue-section" className="relative pb-16 pt-6 text-foreground">

        <section id="what-you-can-do" className="container mx-auto max-w-7xl px-4 pb-16">
          <div data-reveal className="mb-8 max-w-3xl">
            <h2 className="text-2xl font-semibold text-foreground md:text-4xl">What you can do with Aide</h2>
            <p className="mt-3 text-muted-foreground">{t.featuresSubtitle}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {t.featureCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card
                  key={card.title}
                  data-bento-card
                  className="h-full rounded-lg border border-border bg-card p-5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-border hover:bg-secondary"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-foreground">{card.title}</h3>
                  <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{card.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {card.chips.map((chip) => (
                      <span key={chip} className="rounded-full border border-border bg-secondary px-2.5 py-1 text-[11px] text-muted-foreground">
                        {chip}
                      </span>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <section id="access-anywhere" className="container mx-auto max-w-7xl px-4 pb-16">
          <div
            data-reveal
            className="relative py-6 md:py-10"
          >
            <h2 className="text-2xl font-semibold text-foreground md:text-4xl">
              Access the Aide AI Study Tool Anywhere, Anytime
            </h2>
            <p className="mt-3 max-w-3xl text-muted-foreground">
              Start on desktop, continue on mobile, and keep your progress synced across every study session.
            </p>

            <div className="mt-7 grid gap-3 md:grid-cols-3">
              {accessCards.map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.title} className="h-full rounded-lg border border-border bg-card p-4 backdrop-blur-xl">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <p className="mb-1.5 text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </Card>
                );
              })}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-card text-primary hover:bg-muted">
                <Link to="/auth">
                  {t.startNow}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-border bg-card text-primary hover:bg-muted"
              >
                <Link to="/help">
                  <HelpCircle className="mr-2 h-5 w-5" />
                  {t.readGuide}
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="transition-zone" className="container mx-auto max-w-7xl px-4 pb-16">
          <div
            data-reveal
            className="py-6 md:py-10"
          >
            <h2 data-invert className="text-2xl font-bold text-foreground md:text-4xl">
              Why Our AI Study Tool Outperforms Traditional Methods
            </h2>
            <p data-invert className="mt-3 max-w-4xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Experience the advantages of AI-powered studying compared to conventional methods. Our approach is
              designed to save you time, boost retention, and make learning more effective.
            </p>

            <div className="mt-7 overflow-hidden rounded-lg border border-border">
              <div className="hidden grid-cols-3 bg-secondary text-xs font-semibold uppercase text-muted-foreground md:grid">
                <div className="px-4 py-3">Category</div>
                <div className="px-4 py-3">Aide AI</div>
                <div className="px-4 py-3">Traditional Methods</div>
              </div>
              {comparisonRows.map((row) => (
                <div key={row.metric} className="grid border-t border-border md:grid-cols-3 md:items-center">
                  <div className="px-4 pt-4 text-sm font-semibold text-foreground md:py-4">{row.metric}</div>
                  <div className="px-4 py-2 text-sm text-muted-foreground md:py-4">
                    <span className="inline-flex items-center gap-1.5">
                      <Check className="h-4 w-4 text-muted-foreground" />
                      {row.aide}
                    </span>
                  </div>
                  <div className="px-4 pb-4 text-sm text-muted-foreground md:py-4">{row.traditional}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="container mx-auto max-w-7xl px-4 pb-16">
          <div data-reveal className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground md:text-4xl">FAQ</h2>
          </div>
          <div className="space-y-3">
            {faqItems.map((item) => (
              <details
                key={item.q}
                data-reveal
                className="group rounded-lg border border-border bg-card"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm font-medium text-foreground transition-colors duration-300 hover:text-foreground">
                  <span>{item.q}</span>
                  <span className="text-lg leading-none text-foreground transition-transform duration-300 group-open:rotate-45">+</span>
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <footer className="container mx-auto max-w-7xl px-4 pb-10">
          <div className="border-t border-border py-8 md:py-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <h4 className="text-xs font-semibold uppercase text-foreground">Product</h4>
                <div className="mt-4 flex flex-col gap-2.5 text-sm font-medium">
                  <Link to="/homework-helper" className="text-muted-foreground transition-colors duration-300 hover:text-foreground">
                    AI Homework Helper
                  </Link>
                  <Link to="/study-guide-maker" className="text-muted-foreground transition-colors duration-300 hover:text-foreground">
                    Study Guide Maker
                  </Link>
                  <Link to="/blog/how-to-do-active-recall-with-notes" className="text-muted-foreground transition-colors duration-300 hover:text-foreground">
                    How to Do Active Recall with Notes
                  </Link>
                  <Link to="/help" className="text-muted-foreground transition-colors duration-300 hover:text-foreground">
                    About Page
                  </Link>
                  <a href="#how-it-works" className="text-muted-foreground transition-colors duration-300 hover:text-foreground">
                    How it Works
                  </a>
                  <a href="#what-you-can-do" className="text-muted-foreground transition-colors duration-300 hover:text-foreground">
                    What You Can Do
                  </a>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase text-foreground">Support</h4>
                <div className="mt-4 flex flex-col gap-2.5 text-sm font-medium">
                  <Link to="/help" className="text-muted-foreground transition-colors duration-300 hover:text-foreground">
                    Help Center
                  </Link>
                  <a
                    href="mailto:myaide.study@gmail.com?subject=Aide%20Support"
                    className="text-muted-foreground transition-colors duration-300 hover:text-foreground"
                  >
                    Support
                  </a>
                  <a
                    href="mailto:myaide.study@gmail.com"
                    className="text-muted-foreground transition-colors duration-300 hover:text-foreground"
                  >
                    Contact Us
                  </a>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase text-foreground">Legal</h4>
                <div className="mt-4 flex flex-col gap-2.5 text-sm font-medium">
                  <Link to="/help#privacy-policy" className="text-muted-foreground transition-colors duration-300 hover:text-foreground">
                    Privacy Policy
                  </Link>
                  <Link to="/help#terms-of-service" className="text-muted-foreground transition-colors duration-300 hover:text-foreground">
                    Terms of Service
                  </Link>
                  <Link to="/help#community-guidelines" className="text-muted-foreground transition-colors duration-300 hover:text-foreground">
                    Community Guidelines
                  </Link>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase text-foreground">Social</h4>
                <div className="mt-4 flex flex-col gap-2.5 text-sm font-medium">
                  <a
                    href="https://www.instagram.com/myaide.study/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground transition-colors duration-300 hover:text-foreground"
                  >
                    Instagram
                  </a>
                  <a
                    href="https://www.facebook.com/profile.php?id=61587146428880"
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground transition-colors duration-300 hover:text-foreground"
                  >
                    Facebook
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-border pt-4 text-xs text-muted-foreground">
              © 2026 Aide. All rights reserved.
            </div>
          </div>
        </footer>
      </section>

      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        language={language}
        onLanguageChange={setLanguage}
        theme={theme}
        onThemeChange={setTheme}
        showPlanStatus={false}
        showDeleteAccount={false}
      />
    </div>
  );
};

export default Landing;
