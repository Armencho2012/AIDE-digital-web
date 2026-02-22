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
  previewNodeCore: string;
  previewNodeQuiz: string;
  previewNodeChat: string;
  flowTitle: string;
  flowSubtitle: string;
  transitionTitle: string;
  transitionSubtitle: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  featuresTitle: string;
  featuresSubtitle: string;
  capabilitiesTitle: string;
  capabilitiesSubtitle: string;
  capabilityItems: string[];
  ctaTitle: string;
  ctaSubtitle: string;
  readGuide: string;
  footer: string;
  plans: string;
  shipped: string;
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
    signIn: "Sign In",
    heroEyebrow: "Next-Gen Study OS",
    heroTitle: "Stop Reading. Start Retaining.",
    heroSubtitle:
      "Aide engineers your notes into active-recall systems. Neural maps, flashcards, and AI-tutor voice—built for the 2026 academic elite.",
    startNow: "Deploy Analysis",
    seeFlow: "Watch the Transition",
    freeBadge: "Daily Free Credits",
    langBadge: "Global i18n",
    uploadBadge: "Multimodal Input",
    previewTitle: "The Workspace",
    previewSubtitle: "Aide: Professional Mode",
    previewTab1: "Core Analysis",
    previewTab2: "Knowledge Graph",
    previewTab3: "Tutor Console",
    previewStream: "Live Synthesis...",
    previewWidgetQuizNotes: "Evaluation Layer",
    previewWidgetPodcast: "Audio Briefing",
    previewNodeCore: "Source Node",
    previewNodeQuiz: "Quiz Vector",
    previewNodeChat: "Context Node",
    flowTitle: "Engineered Flow",
    flowSubtitle: "From raw data to mastery in three cycles.",
    transitionTitle: "Phase Into Deep Study",
    transitionSubtitle: "Mascot-led scroll inversion: Moving from daylight focus to the midnight blue study zone.",
    step1Title: "Ingestion",
    step1Desc: "Drop PDFs, raw text, or voice memos. Aide parses the logic instantly.",
    step2Title: "Synthesis",
    step2Desc: "Configure your output: Radial maps, podcast audio, or high-density quizzes.",
    step3Title: "Execution",
    step3Desc: "Attack the syllabus with active recall and real-time AI gap scanning.",
    featuresTitle: "Core Capabilities",
    featuresSubtitle: "No bloat. Just the tools that move the needle.",
    capabilitiesTitle: "Technical Matrix",
    capabilitiesSubtitle: "Everything currently shipped in the Aide ecosystem.",
    capabilityItems: [
      "Multimodal ingestion: Drag-and-drop PDF, text, and image OCR.",
      "Real-time Voice-to-Study synthesis via Web Speech API.",
      "Custom generation parameters: Quiz, flashcards, radial maps, and audio briefs.",
      "Granular control over question volume and flashcard density.",
      "7-day hyper-structured lesson plans and lesson segmentation.",
      "Adaptive quiz engine with logical feedback loops.",
      "Spaced-repetition flashcard decks with confidence-weighted review.",
      "Context-aware Streaming Tutor Chat for specialized or general sessions.",
      "Force-directed Neural Maps with dynamic edge filtering and 'Zen' focus.",
      "Gap Scan: AI-driven discovery of missing knowledge nodes.",
      "Pro Exports: Notion-ready markdown, high-res PNG maps, and PDF briefs.",
      "Unified Library with deep-search filters and asset regeneration.",
      "Dual-speaker AI Podcast generation with full playback controls.",
      "Native Multilingual UI: English, Russian, Armenian, Korean."
    ],
    ctaTitle: "Claim Your Advantage",
    ctaSubtitle: "The traditional way is broken. Upgrade to AI-native studying.",
    readGuide: "Prompting Logic",
    footer: "© 2026 Aide. High-signal study architecture.",
    plans: "Pricing",
    shipped: "v2.0 LIVE",
    featureCards: [
      {
        icon: Sparkles,
        title: "Synthesis Engine",
        description: "High-density summaries and key-term extraction across 4 languages.",
        chips: ["Logic Parsing", "OCR Support", "i18n"]
      },
      {
        icon: FileText,
        title: "Active Recall",
        description: "Adaptive testing and flashcard systems with explanation layers.",
        chips: ["Quiz Engine", "Feedback Loops", "Tracking"]
      },
      {
        icon: Map,
        title: "Neural Graphs",
        description: "Visualize the logic. 3D force-directed maps and gap-scan technology.",
        chips: ["Radial Layout", "Gap Scanning", "Export"]
      },
      {
        icon: MessageSquare,
        title: "Tutor Console",
        description: "Streaming LLM-tutor sessions with context memory and math support.",
        chips: ["Streaming", "Contextual", "24/7 Support"]
      },
      {
        icon: Mic,
        title: "Podcast Studio",
        description: "Turn your notes into high-fidelity two-speaker audio briefings.",
        chips: ["TTS", "Audio Brief", "Mobile Ready"]
      },
      {
        icon: Library,
        title: "Library OS",
        description: "Searchable, filterable archive of your entire academic history.",
        chips: ["MD Export", "Regenerate", "Archive"]
      },
    ],
  },
  ru: {
    contact: "Контакт",
    help: "Помощь",
    signIn: "Войти",
    heroEyebrow: "Учебная ОС нового поколения",
    heroTitle: "Хватит читать. Пора запоминать.",
    heroSubtitle: "Aide превращает ваши заметки в системы активного повторения. Нейрокарты, карточки и AI-тьютор — создано для академической элиты 2026 года.",
    startNow: "Запустить анализ",
    seeFlow: "Посмотреть процесс",
    freeBadge: "Ежедневные кредиты",
    langBadge: "Глобальный i18n",
    uploadBadge: "Мультимодальный ввод",
    previewTitle: "Рабочее пространство",
    previewSubtitle: "Aide: Профессиональный режим",
    previewTab1: "Анализ логики",
    previewTab2: "Граф знаний",
    previewTab3: "Консоль тьютора",
    previewStream: "Синтез данных...",
    previewWidgetQuizNotes: "Слой оценки",
    previewWidgetPodcast: "Аудио-брифинг",
    previewNodeCore: "Исходный узел",
    previewNodeQuiz: "Вектор теста",
    previewNodeChat: "Узел контекста",
    flowTitle: "Инженерный поток",
    flowSubtitle: "От сырых данных к мастерству за три цикла.",
    transitionTitle: "Фаза глубокого обучения",
    transitionSubtitle: "Инверсия скролла: переход от дневного фокуса к полночному синему режиму.",
    step1Title: "Загрузка",
    step1Desc: "PDF, текст или голос. Aide мгновенно парсит логику контента.",
    step2Title: "Синтез",
    step2Desc: "Конфигурация вывода: радиальные карты, подкасты или тесты высокой плотности.",
    step3Title: "Исполнение",
    step3Desc: "Штурмуйте программу с помощью активного повторения и AI-сканирования пробелов.",
    featuresTitle: "Базовые возможности",
    featuresSubtitle: "Никакого лишнего шума. Только инструменты, которые работают.",
    capabilitiesTitle: "Техническая матрица",
    capabilitiesSubtitle: "Все функции, развернутые в экосистеме Aide.",
    capabilityItems: [
      "Мультимодальная загрузка: Drag-and-drop PDF, текст и OCR изображений.",
      "Синтез голоса в реальном времени через Web Speech API.",
      "Настройка параметров: тесты, карточки, карты и аудио-брифинги.",
      "Контроль объема вопросов и плотности карточек.",
      "7-дневные структурированные планы и сегментация уроков.",
      "Адаптивный движок тестов с логической обратной связью.",
      "Интервальные повторения с учетом уверенности в знаниях.",
      "Контекстный потоковый чат-тьютор для спец-сессий.",
      "Нейрокарты с радиальными макетами и фильтрацией связей.",
      "Gap Scan: AI-поиск пропущенных узлов знаний.",
      "Экспорт: Markdown для Notion, PNG-карты и PDF-брифинги.",
      "Единая библиотека с глубоким поиском и регенерацией активов.",
      "AI-подкасты с двумя спикерами и полным управлением.",
      "Нативный мультиязычный UI: EN, RU, HY, KO."
    ],
    ctaTitle: "Заберите свое преимущество",
    ctaSubtitle: "Старые методы не работают. Переходите на AI-native обучение.",
    readGuide: "Логика промптов",
    footer: "© 2026 Aide. Архитектура знаний высокого уровня.",
    plans: "Тарифы",
    shipped: "v2.0 LIVE",
    featureCards: [
      {
        icon: Sparkles,
        title: "Движок синтеза",
        description: "Конспекты высокой плотности на 4 языках.",
        chips: ["Парсинг", "OCR", "i18n"]
      },
      {
        icon: FileText,
        title: "Активное повторение",
        description: "Адаптивное тестирование и системы объяснений.",
        chips: ["Тесты", "Фидбек", "Трекинг"]
      },
      {
        icon: Map,
        title: "Нейрографы",
        description: "Визуализация логики. 3D карты и технология Gap Scan.",
        chips: ["Radial", "Gap Scan", "Экспорт"]
      },
      {
        icon: MessageSquare,
        title: "Консоль тьютора",
        description: "Потоковый чат с памятью контекста и поддержкой формул.",
        chips: ["Streaming", "Контекст", "24/7"]
      },
      {
        icon: Mic,
        title: "Студия подкастов",
        description: "Ваши заметки в формате качественных аудио-брифингов.",
        chips: ["TTS", "Audio Brief", "Mobile"]
      },
      {
        icon: Library,
        title: "Библиотека OS",
        description: "Архив вашей академической истории с фильтрами.",
        chips: ["MD Export", "Regen", "Архив"]
      },
    ],
  },
  hy: {
    contact: "Կապ",
    help: "Օգնություն",
    signIn: "Մուտք",
    heroEyebrow: "Next-Gen Ուսումնական OS",
    heroTitle: "Դադարեք կարդալ: Սկսեք հիշել:",
    heroSubtitle: "Aide-ը վերածում է ձեր նշումները ակտիվ հիշողության համակարգերի: Նեյրոնային քարտեզներ և AI-թյուտոր՝ 2026-ի էլիտայի համար:",
    startNow: "Գործարկել",
    seeFlow: "Տեսնել հոսքը",
    freeBadge: "Օրական կրեդիտներ",
    langBadge: "Global i18n",
    uploadBadge: "Multimodal մուտք",
    previewTitle: "Աշխատանքային տարածք",
    previewSubtitle: "Aide: Professional Mode",
    previewTab1: "Վերլուծություն",
    previewTab2: "Գիտելիքի գրաֆ",
    previewTab3: "Թյուտորի կոնսոլ",
    previewStream: "Սինթեզ...",
    previewWidgetQuizNotes: "Գնահատման շերտ",
    previewWidgetPodcast: "Աուդիո բրիֆինգ",
    previewNodeCore: "Source Node",
    previewNodeQuiz: "Quiz Vector",
    previewNodeChat: "Context Node",
    flowTitle: "Ինժեներական հոսք",
    flowSubtitle: "Տվյալներից մինչև վարպետություն 3 ցիկլով:",
    transitionTitle: "Խորը ուսուցման փուլ",
    transitionSubtitle: "Սքրոլի ինվերսիա. անցում ցերեկային ֆոկուսից դեպի midnight blue գոտի:",
    step1Title: "Ներբեռնում",
    step1Desc: "PDF, տեքստ կամ ձայն: Aide-ը վայրկենական վերլուծում է տրամաբանությունը:",
    step2Title: "Սինթեզ",
    step2Desc: "Կոնֆիգուրացրեք ելքը. ռադիալ քարտեզներ կամ բարձր խտության թեստեր:",
    step3Title: "Կատարում",
    step3Desc: "Հարձակվեք ծրագրի վրա ակտիվ հիշողության և AI gap scan-ի միջոցով:",
    featuresTitle: "Հիմնական գործառույթներ",
    featuresSubtitle: "Ոչ մի ավելորդ բան: Միայն արդյունավետ գործիքներ:",
    capabilitiesTitle: "Տեխնիկական մատրիցա",
    capabilitiesSubtitle: "Այն ամենը, ինչ առկա է Aide էկոհամակարգում:",
    capabilityItems: [
      "Multimodal ներբեռնում. PDF, տեքստ և պատկերների OCR:",
      "Իրական ժամանակի Voice-to-Study սինթեզ:",
      "Սերնդման պարամետրեր. թեստեր, քարտեր, քարտեզներ և աուդիո:",
      "Հարցերի քանակի և խտության վերահսկում:",
      "7-օրյա կառուցվածքային դասի պլաններ:",
      "Ադապտիվ թեստային շարժիչ տրամաբանական հետադարձ կապով:",
      "Spaced-repetition քարտեր վստահության մակարդակով:",
      "Context-aware Streaming Tutor Chat մասնագիտացված սեսիաների համար:",
      "Radial/Force Neural Maps դինամիկ զտիչներով:",
      "Gap Scan. AI-ով բացթողումների հայտնաբերում:",
      "Pro արտահանում. Notion-ready MD, PNG քարտեզներ և PDF:",
      "Միասնական գրադարան խորը որոնման ֆիլտրերով:",
      "Dual-speaker AI Podcast լիարժեք վերահսկմամբ:",
      "Native Multilingual UI: EN, RU, HY, KO."
    ],
    ctaTitle: "Վերցրեք ձեր առավելությունը",
    ctaSubtitle: "Հին մեթոդները չեն աշխատում: Անցեք AI-native ուսուցման:",
    readGuide: "Prompt Logic",
    footer: "© 2026 Aide. Բարձր մակարդակի ուսումնական ճարտարապետություն:",
    plans: "Գներ",
    shipped: "v2.0 LIVE",
    featureCards: [
      {
        icon: Sparkles,
        title: "Սինթեզի շարժիչ",
        description: "Բարձր խտության ամփոփումներ 4 լեզուներով:",
        chips: ["Logic Parsing", "OCR", "i18n"]
      },
      {
        icon: FileText,
        title: "Ակտիվ հիշողություն",
        description: "Ադապտիվ թեստավորման և բացատրությունների համակարգեր:",
        chips: ["Quiz Engine", "Feedback", "Tracking"]
      },
      {
        icon: Map,
        title: "Նեյրոնային գրաֆներ",
        description: "Տեսողական տրամաբանություն. 3D քարտեզներ և Gap Scan:",
        chips: ["Radial", "Gap Scan", "Export"]
      },
      {
        icon: MessageSquare,
        title: "Թյուտորի կոնսոլ",
        description: "Streaming չատ կոնտեքստի հիշողությամբ և մաթեմատիկական աջակցությամբ:",
        chips: ["Streaming", "Context", "24/7"]
      },
      {
        icon: Mic,
        title: "Պոդկաստ ստուդիա",
        description: "Նշումները վերածեք որակյալ աուդիո բրիֆինգների:",
        chips: ["TTS", "Audio Brief", "Mobile"]
      },
      {
        icon: Library,
        title: "Գրադարան OS",
        description: "Ձեր ողջ ուսումնական պատմության արխիվը:",
        chips: ["MD Export", "Regen", "Archive"]
      },
    ],
  },
  ko: {
    contact: "문의",
    help: "도움말",
    signIn: "로그인",
    heroEyebrow: "차세대 학습 OS",
    heroTitle: "읽지 말고, 각인시키세요.",
    heroSubtitle: "Aide는 노트를 능동적 회상 시스템으로 설계합니다. 2026년 학업 엘리트를 위한 신경망 맵과 AI 튜터.",
    startNow: "분석 배포",
    seeFlow: "워크플로우 확인",
    freeBadge: "일일 무료 크레딧",
    langBadge: "글로벌 i18n",
    uploadBadge: "멀티모달 입력",
    previewTitle: "워크스페이스",
    previewSubtitle: "Aide: 전문가 모드",
    previewTab1: "로직 분석",
    previewTab2: "지식 그래프",
    previewTab3: "튜터 콘솔",
    previewStream: "라이브 합성 중...",
    previewWidgetQuizNotes: "평가 레이어",
    previewWidgetPodcast: "오디오 브리핑",
    previewNodeCore: "소스 노드",
    previewNodeQuiz: "퀴즈 벡터",
    previewNodeChat: "컨텍스트 노드",
    flowTitle: "엔지니어링 플로우",
    flowSubtitle: "데이터에서 마스터리까지, 단 3단계.",
    transitionTitle: "딥 스터디 페이즈",
    transitionSubtitle: "스크롤 인버전: 데이라이트 포커스에서 미드나잇 블루 모드로의 전환.",
    step1Title: "수집",
    step1Desc: "PDF, 텍스트, 음성. Aide가 즉시 로직을 파싱합니다.",
    step2Title: "합성",
    step2Desc: "출력 구성: 신경망 맵, 팟캐스트 오디오 또는 고밀도 퀴즈.",
    step3Title: "실행",
    step3Desc: "능동 회상과 실시간 AI 갭 스캔으로 커리큘럼을 공략하세요.",
    featuresTitle: "핵심 기능",
    featuresSubtitle: "불필요한 기능 제거. 성과를 만드는 도구에 집중.",
    capabilitiesTitle: "기술 매트릭스",
    capabilitiesSubtitle: "Aide 에코시스템에 배포된 모든 기능.",
    capabilityItems: [
      "멀티모달 수집: PDF, 텍스트 및 이미지 OCR 드래그 앤 드롭.",
      "Web Speech API 기반 실시간 음성-학습 합성.",
      "사용자 정의 파라미터: 퀴즈, 카드, 맵, 오디오 브리프.",
      "문항 수 및 카드 밀도의 정밀 제어.",
      "7일 단위 구조화 레슨 플랜 및 섹션 분할.",
      "논리적 피드백 루프를 갖춘 적응형 퀴즈 엔진.",
      "자신감 가중치 기반 간격 반복 플래시카드.",
      "전문화된 세션을 위한 문맥 인식 스트리밍 튜터 채팅.",
      "동적 필터링을 지원하는 포스 디렉티드 신경망 맵.",
      "Gap Scan: 누락된 지식 노드의 AI 기반 발견.",
      "프로 내보내기: Notion 마크다운, 고해상도 PNG, PDF.",
      "딥 서치 필터 및 자산 재생성을 지원하는 통합 라이브러리.",
      "전체 제어가 가능한 2인 대화형 AI 팟캐스트.",
      "네이티브 다국어 UI: EN, RU, HY, KO."
    ],
    ctaTitle: "학업 우위를 점하세요",
    ctaSubtitle: "전통적인 학습은 끝났습니다. AI-native 학습으로 업그레이드하세요.",
    readGuide: "프롬프트 로직",
    footer: "© 2026 Aide. 고신호 학습 아키텍처.",
    plans: "요금제",
    shipped: "v2.0 LIVE",
    featureCards: [
      {
        icon: Sparkles,
        title: "합성 엔진",
        description: "4개 언어를 지원하는 고밀도 요약 및 용어 추출.",
        chips: ["Logic Parsing", "OCR", "i18n"]
      },
      {
        icon: FileText,
        title: "능동 회상",
        description: "설명 레이어를 포함한 적응형 테스트 시스템.",
        chips: ["Quiz Engine", "Feedback", "Tracking"]
      },
      {
        icon: Map,
        title: "신경망 그래프",
        description: "로직 시각화. 3D 맵 및 Gap Scan 기술.",
        chips: ["Radial", "Gap Scan", "Export"]
      },
      {
        icon: MessageSquare,
        title: "튜터 콘솔",
        description: "문맥 기억과 수식 지원을 포함한 스트리밍 채팅.",
        chips: ["Streaming", "Context", "24/7"]
      },
      {
        icon: Mic,
        title: "팟캐스트 스튜디오",
        description: "노트를 고음질 2인 대화형 오디오로 변환.",
        chips: ["TTS", "Audio Brief", "Mobile"]
      },
      {
        icon: Library,
        title: "라이브러리 OS",
        description: "필터링 가능한 전체 학업 기록 아카이브.",
        chips: ["MD Export", "Regen", "Archive"]
      },
    ],
  },
};

const bentoClasses = [
  "lg:col-span-5 lg:row-span-2",
  "lg:col-span-4",
  "lg:col-span-3",
  "lg:col-span-4",
  "lg:col-span-3",
  "lg:col-span-5",
];

const Landing = () => {
  const { language, theme, setLanguage, setTheme } = useSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const stickySectionRef = useRef<HTMLElement | null>(null);
  const stickyPinRef = useRef<HTMLDivElement | null>(null);
  const stickyTrackRef = useRef<HTMLDivElement | null>(null);
  const t = copy[language] || copy.en;
  const heroWords = t.heroTitle.split(" ").filter(Boolean);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || typeof window === "undefined") return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    const initMotion = async () => {
      const [{ gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("lenis"),
      ]);

      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const lenis = new Lenis({
        duration: 1.05,
        smoothWheel: true,
        smoothTouch: false,
        lerp: 0.09,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.1,
        anchors: true,
      });

      const onLenisScroll = () => ScrollTrigger.update();
      const onTick = (time: number) => {
        lenis.raf(time * 1000);
      };

      lenis.on("scroll", onLenisScroll);
      gsap.ticker.add(onTick);
      gsap.ticker.lagSmoothing(500, 33);
      const media = ScrollTrigger.matchMedia();
      const isDarkTheme = theme === "dark";
      const baseBodyBackground = isDarkTheme ? "#05070b" : "#ffffff";
      const baseBodyColor = isDarkTheme ? "#f4f4f5" : "#0f172a";
      const targetBodyBackground = isDarkTheme ? "#0e3cc8" : "#1459ff";
      const targetBodyColor = "#eef4ff";
      const previousBodyBackground = document.body.style.backgroundColor;
      const previousBodyColor = document.body.style.color;
      const previousRootColor = root.style.color;

      gsap.set(document.body, { backgroundColor: baseBodyBackground, color: baseBodyColor });
      gsap.set(root, { color: baseBodyColor });
      const blueSection = root.querySelector<HTMLElement>("#blue-section");
      const transitionTarget = blueSection || root;

      const ctx = gsap.context(() => {
        if (prefersReducedMotion) {
          gsap.set("[data-hero-word], [data-hero-subtitle], [data-hero-cta], [data-hero-badges], [data-preview-panel], [data-reveal], [data-sticky-card], [data-bento-card], [data-mascot-shell]", {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            clearProps: "all",
          });
          gsap.set("[data-mascot-glow]", { autoAlpha: 0 });
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

        gsap.to("[data-depth='panel']", {
          yPercent: -9,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom top",
            scrub: 0.5,
          },
        });

        gsap.to("[data-depth='halo']", {
          yPercent: -14,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom top",
            scrub: 0.6,
          },
        });

        if (blueSection) {
          gsap.to("body", {
            backgroundColor: targetBodyBackground,
            color: targetBodyColor,
            ease: "none",
            scrollTrigger: {
              trigger: blueSection,
              start: "top 88%",
              end: "top 12%",
              scrub: true,
            },
          });

          gsap.to("#transition-zone [data-invert]", {
            color: "#f8fbff",
            ease: "none",
            scrollTrigger: {
              trigger: transitionTarget,
              start: "top 88%",
              end: "top 18%",
              scrub: true,
            },
          });

          gsap.to("[data-nav]", {
            backgroundColor: isDarkTheme ? "rgba(7, 26, 74, 0.7)" : "rgba(7, 26, 74, 0.58)",
            borderColor: "rgba(255,255,255,0.22)",
            ease: "none",
            scrollTrigger: {
              trigger: blueSection,
              start: "top 90%",
              end: "top 15%",
              scrub: true,
            },
          });

          gsap.to("[data-nav-muted]", {
            color: "#d6e4ff",
            ease: "none",
            scrollTrigger: {
              trigger: blueSection,
              start: "top 90%",
              end: "top 15%",
              scrub: true,
            },
          });

          gsap.to("[data-nav-strong]", {
            color: "#ffffff",
            ease: "none",
            scrollTrigger: {
              trigger: blueSection,
              start: "top 90%",
              end: "top 15%",
              scrub: true,
            },
          });

          gsap.to("[data-mascot-glow]", {
            autoAlpha: 1,
            scale: 1.08,
            ease: "none",
            scrollTrigger: {
              trigger: blueSection,
              start: "top 86%",
              end: "top 24%",
              scrub: true,
            },
          });

          gsap.to("[data-mascot-shell]", {
            filter: "drop-shadow(0 0 42px rgba(63,150,255,0.68)) saturate(1.28)",
            scale: 1.035,
            ease: "none",
            scrollTrigger: {
              trigger: blueSection,
              start: "top 86%",
              end: "top 24%",
              scrub: true,
            },
          });
        }

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

          gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((el) => {
            const speed = Number(el.dataset.speed || "1");
            const amplitude = (speed - 1) * 420;
            gsap.to(el, {
              y: amplitude,
              ease: "none",
              scrollTrigger: {
                trigger: root,
                start: "top top",
                end: "bottom bottom",
                scrub: true,
              },
            });
          });

          if (!stickySectionRef.current || !stickyPinRef.current || !stickyTrackRef.current) {
            return;
          }

          const stickyPinTrigger = ScrollTrigger.create({
            trigger: stickySectionRef.current,
            start: "top top+=110",
            end: () =>
              `+=${Math.max(
                stickyTrackRef.current!.offsetHeight -
                  stickyPinRef.current!.offsetHeight +
                  140,
                420
              )}`,
            pin: stickyPinRef.current,
            pinSpacing: false,
            invalidateOnRefresh: true,
          });

          return () => {
            stickyPinTrigger.kill();
          };
        });

        gsap.utils.toArray<HTMLElement>("[data-sticky-card]").forEach((card) => {
          gsap.fromTo(
            card,
            { autoAlpha: 0, x: 20, y: 44, scale: 0.985 },
            {
              autoAlpha: 1,
              x: 0,
              y: 0,
              scale: 1,
              duration: 0.9,
              ease: "power3.out",
              scrollTrigger: {
                trigger: card,
                start: "top 82%",
                end: "top 58%",
                toggleActions: "play none none reverse",
              },
            }
          );
        });
      }, root);

      const handleResize = () => ScrollTrigger.refresh();
      window.addEventListener("resize", handleResize);
      ScrollTrigger.refresh();

      cleanup = () => {
        window.removeEventListener("resize", handleResize);
        ctx.revert();
        lenis.off("scroll", onLenisScroll);
        lenis.destroy();
        media.kill();
        gsap.ticker.remove(onTick);
        document.body.style.backgroundColor = previousBodyBackground;
        document.body.style.color = previousBodyColor;
        root.style.color = previousRootColor;
      };
    };

    void initMotion().catch((error) => {
      console.error("Failed to initialize landing motion runtime:", error);
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [language, theme]);

  return (
    <div
      ref={rootRef}
      className="min-h-screen overflow-x-hidden text-slate-900 dark:text-zinc-100"
    >
      <div
        data-depth="halo"
        className="pointer-events-none fixed inset-x-0 top-[-10vh] -z-10 h-[56vh] bg-[radial-gradient(circle_at_50%_40%,rgba(59,130,246,0.26),transparent_58%)]"
      />

      <nav
        data-nav
        className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/78 backdrop-blur-xl dark:border-white/10 dark:bg-black/45"
      >
        <div className="container mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/25">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span data-nav-strong className="text-lg font-semibold tracking-tight text-slate-950 dark:text-zinc-50">
              Aide
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-full border border-slate-300/90 bg-white/90 p-1 dark:border-white/10 dark:bg-white/5">
              {languageSwitch.map((item) => (
                <button
                  key={item.code}
                  onClick={() => setLanguage(item.code)}
                  data-nav-muted={language !== item.code ? "true" : undefined}
                  data-nav-strong={language === item.code ? "true" : undefined}
                  className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
                    language === item.code
                      ? "bg-slate-900 text-white dark:bg-white/20 dark:text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hidden text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white sm:flex"
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
              className="hidden text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white sm:flex"
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
              className="border-slate-300/90 bg-white/85 text-slate-700 hover:bg-slate-100 dark:border-white/20 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/12"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button asChild size="sm" className="bg-blue-600 text-white hover:bg-blue-500 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
              <Link data-nav-strong to="/auth">{t.signIn}</Link>
            </Button>
          </div>
        </div>
      </nav>

      <section className="container mx-auto max-w-7xl px-4 pb-14 pt-16 md:pt-20">
        <div className="relative overflow-hidden rounded-[2.2rem] border border-slate-200/90 bg-[linear-gradient(120deg,#d8ecff_0%,#eff6ff_45%,#f7f2db_100%)] p-6 shadow-[0_24px_70px_rgba(59,130,246,0.16)] md:p-10 dark:border-white/12 dark:bg-[radial-gradient(circle_at_76%_25%,rgba(56,189,248,0.2),transparent_45%),radial-gradient(circle_at_18%_16%,rgba(59,130,246,0.22),transparent_40%),linear-gradient(145deg,#041024_0%,#081c3f_56%,#0d2a59_100%)] dark:shadow-[0_24px_70px_rgba(2,6,23,0.65)]">
          <div className="pointer-events-none absolute inset-0 opacity-45 [background-image:linear-gradient(to_right,rgba(15,23,42,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.07)_1px,transparent_1px)] [background-size:72px_72px] dark:opacity-55 dark:[background-image:linear-gradient(to_right,rgba(191,219,254,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(191,219,254,0.15)_1px,transparent_1px)]" />
          <div className="pointer-events-none absolute -left-24 top-16 h-64 w-64 rounded-full bg-cyan-300/28 blur-3xl dark:bg-cyan-300/18" />
          <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-amber-300/26 blur-3xl dark:bg-blue-400/18" />

          <div className="relative grid items-center gap-8 lg:grid-cols-12 xl:gap-10">
            <div className="lg:col-span-6 xl:col-span-7">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-300/70 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm shadow-blue-100/60 dark:border-cyan-300/35 dark:bg-slate-900/85 dark:text-cyan-50 dark:shadow-black/30">
                <Brain className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-200" />
                {t.heroEyebrow}
              </div>

              <h1 className="max-w-[14ch] text-[clamp(2.4rem,7vw,5.5rem)] font-black leading-[0.93] tracking-[-0.042em] text-slate-900 dark:text-slate-50">
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
                className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg dark:text-blue-100/88"
              >
                {t.heroSubtitle}
              </p>

              <div data-hero-cta className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-full bg-blue-600 px-7 text-base text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-500 hover:shadow-blue-400/35 dark:bg-cyan-300 dark:text-slate-950 dark:hover:bg-cyan-200"
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
                  className="h-12 rounded-full border-blue-500/65 bg-white/65 px-7 text-base text-blue-700 transition-colors hover:bg-white/90 dark:border-cyan-200/45 dark:bg-slate-900/65 dark:text-cyan-100 dark:hover:bg-slate-900/90"
                >
                  <a href="#flow">{t.seeFlow}</a>
                </Button>
              </div>

              <div data-hero-badges className="mt-6 flex flex-wrap gap-2.5">
                {[t.freeBadge, t.langBadge, t.uploadBadge].map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full border border-slate-300/80 bg-white/75 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm shadow-slate-200/75 dark:border-blue-200/25 dark:bg-slate-900/72 dark:text-blue-50/95"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            <div data-preview-panel data-depth="panel" className="lg:col-span-6 xl:col-span-5">
              <div className="relative mx-auto w-full max-w-[27rem]">
                <div
                  data-mascot-glow
                  className="pointer-events-none absolute inset-x-12 top-10 h-44 rounded-full bg-[radial-gradient(circle,rgba(84,169,255,0.82)_0%,rgba(66,124,255,0.52)_42%,rgba(35,56,145,0)_78%)] opacity-0 blur-3xl"
                />
                <Card className="relative overflow-hidden rounded-[1.85rem] border-slate-200/80 bg-white/72 p-5 shadow-2xl shadow-blue-200/70 backdrop-blur-2xl dark:border-white/16 dark:bg-slate-950/72 dark:shadow-black/55">
                  <div className="pointer-events-none absolute -top-20 right-[-5.5rem] h-44 w-44 rounded-full bg-cyan-300/20 blur-3xl dark:bg-cyan-300/22" />
                  <div className="pointer-events-none absolute bottom-0 left-[-5rem] h-40 w-40 rounded-full bg-blue-300/22 blur-3xl dark:bg-blue-400/24" />

                  <div className="relative mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100">{t.previewTitle}</p>
                      <p className="text-xs text-slate-500 dark:text-blue-100/80">{t.previewSubtitle}</p>
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-200">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                      {t.previewStream}
                    </div>
                  </div>

                  <img
                    data-mascot-shell
                    src="/aide-mascot.svg"
                    alt="Aide mascot"
                    className="relative mx-auto w-full max-w-[16.5rem] drop-shadow-[0_24px_40px_rgba(15,23,42,0.24)] dark:drop-shadow-[0_24px_44px_rgba(2,6,23,0.7)] md:max-w-[18rem]"
                  />

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {[t.previewTab1, t.previewTab2, t.previewTab3].map((tab, idx) => (
                      <div
                        key={tab}
                        className={`rounded-xl px-2 py-1.5 text-center text-[11px] font-medium ${
                          idx === 0
                            ? "bg-blue-600 text-white dark:bg-blue-500/35 dark:text-blue-50"
                            : "bg-white/85 text-slate-600 dark:bg-slate-900/80 dark:text-zinc-200"
                        }`}
                      >
                        {tab}
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/86 p-2 text-[11px] text-slate-700 dark:border-white/12 dark:bg-slate-900/76 dark:text-zinc-200">
                      <FileText className="h-3.5 w-3.5 text-blue-500 dark:text-cyan-300" />
                      {t.previewWidgetQuizNotes}
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/86 p-2 text-[11px] text-slate-700 dark:border-white/12 dark:bg-slate-900/76 dark:text-zinc-200">
                      <Mic className="h-3.5 w-3.5 text-cyan-500" />
                      {t.previewWidgetPodcast}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="flow" className="container mx-auto max-w-7xl px-4 pb-14">
        <div data-reveal className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl dark:text-zinc-50">{t.flowTitle}</h2>
          <p className="mt-2 text-slate-600 dark:text-zinc-300">{t.flowSubtitle}</p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
            {[
              { icon: Upload, title: t.step1Title, desc: t.step1Desc },
              { icon: WandSparkles, title: t.step2Title, desc: t.step2Desc },
              { icon: Bot, title: t.step3Title, desc: t.step3Desc },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.title}
                  data-reveal
                  className="h-full rounded-2xl border border-slate-200 bg-white/82 p-5 shadow-sm backdrop-blur-xl transition-transform duration-500 hover:scale-[1.02] hover:shadow-lg dark:border-white/12 dark:bg-white/[0.06] dark:hover:bg-white/[0.1]"
                >
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/12">
                  <Icon className="h-4.5 w-4.5 text-blue-500" />
                </div>
                <p className="mb-2 text-sm font-medium text-slate-900 dark:text-zinc-100">{item.title}</p>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-zinc-300">{item.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      <section id="transition-zone" className="container mx-auto max-w-7xl px-4 pb-16">
        <div
          data-reveal
          className="rounded-[2rem] border border-slate-300/70 bg-white/78 p-8 shadow-xl shadow-slate-200/80 backdrop-blur-xl md:p-10 dark:border-white/16 dark:bg-white/[0.06] dark:shadow-none"
        >
          <p data-invert className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-zinc-300/75">
            Aide Transition System
          </p>
          <h2 data-invert className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl dark:text-zinc-50">
            {t.transitionTitle}
          </h2>
          <p data-invert className="mt-3 max-w-3xl text-base text-slate-600 md:text-lg dark:text-zinc-300">
            {t.transitionSubtitle}
          </p>
        </div>
      </section>

      <section id="blue-section" className="relative pb-16 pt-12 text-slate-50">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.22),transparent_48%),radial-gradient(circle_at_85%_16%,rgba(122,190,255,0.3),transparent_42%),linear-gradient(180deg,rgba(9,29,80,0.42)_0%,rgba(7,22,63,0.74)_100%)]" />

        <section className="container mx-auto max-w-7xl px-4 pb-16">
          <div data-reveal className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-50 md:text-3xl">{t.featuresTitle}</h2>
            <p className="mt-2 text-blue-100/80">{t.featuresSubtitle}</p>
          </div>

          <div className="grid auto-rows-[minmax(220px,1fr)] gap-3 md:grid-cols-2 lg:grid-cols-12">
            {t.featureCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <article
                  key={card.title}
                  data-bento-card
                  className={`group ${bentoClasses[idx % bentoClasses.length]}`}
                >
                  <Card className="h-full rounded-2xl border-white/20 bg-white/[0.08] p-5 backdrop-blur-xl transition-all duration-500 hover:scale-[1.02] hover:border-cyan-200/60 hover:bg-white/[0.14]">
                    <div className="mb-3 flex items-start justify-between gap-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                        <Icon className="h-4.5 w-4.5 text-blue-100" />
                      </div>
                      <div className="inline-flex items-center text-[10px] uppercase tracking-wider text-blue-100/75">
                        <Check className="mr-1 h-3 w-3" />
                        {t.shipped}
                      </div>
                    </div>
                    <h3 className="mb-2 text-sm font-semibold text-slate-50">{card.title}</h3>
                    <p className="mb-4 text-sm leading-relaxed text-blue-100/85">{card.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {card.chips.map((chip) => (
                        <span
                          key={chip}
                          className="rounded-md border border-white/18 bg-black/20 px-2 py-1 text-[11px] text-blue-50/90"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  </Card>
                </article>
              );
            })}
          </div>
        </section>

        <section
          ref={stickySectionRef}
          className="container mx-auto max-w-7xl px-4 pb-16"
        >
          <div className="grid items-start gap-6 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div
                ref={stickyPinRef}
                className="rounded-3xl border border-white/24 bg-gradient-to-b from-white/[0.22] via-white/[0.12] to-white/[0.07] p-6 shadow-[0_18px_42px_rgba(2,12,37,0.35)] backdrop-blur-2xl lg:top-28 lg:p-7"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100/75">
                  Live Capability Stack
                </p>
                <h3 className="mt-3 max-w-[18ch] break-words text-[clamp(1.85rem,3vw,2.6rem)] font-semibold leading-[1.08] tracking-tight text-slate-50">
                  {t.capabilitiesTitle}
                </h3>
                <p className="mt-4 max-w-[28ch] text-sm leading-relaxed text-blue-100/90 md:text-[15px]">
                  {t.capabilitiesSubtitle}
                </p>
              </div>
            </div>

            <div ref={stickyTrackRef} className="space-y-3 lg:col-span-7">
              {t.capabilityItems.map((item, index) => (
                <div
                  key={item}
                  data-sticky-card
                  className="flex items-start gap-3 rounded-2xl border border-white/20 bg-slate-950/35 px-4 py-4 shadow-[0_10px_28px_rgba(2,12,37,0.24)] backdrop-blur-xl transition-all duration-300 hover:border-cyan-200/65 hover:bg-slate-900/48"
                >
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-cyan-200/45 bg-cyan-300/16 text-[11px] font-semibold text-cyan-100">
                    {index + 1}
                  </span>
                  <p className="break-words text-sm leading-7 text-blue-50/95 md:text-[15px] md:leading-7">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto max-w-7xl px-4 pb-16">
          <div
            data-reveal
            className="rounded-3xl border border-white/18 bg-white/[0.08] p-7 backdrop-blur-xl md:p-10"
          >
            <div className="max-w-3xl">
              <h3 className="text-2xl font-semibold tracking-tight text-slate-50 md:text-4xl">
                {t.ctaTitle}
              </h3>
              <p className="mt-4 text-base text-blue-100/85">{t.ctaSubtitle}</p>
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
                <Link to="/auth">
                  {t.startNow}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/28 bg-white/5 text-slate-50 hover:bg-white/16"
              >
                <Link to="/help">
                  <HelpCircle className="mr-2 h-5 w-5" />
                  {t.readGuide}
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <footer className="container mx-auto max-w-7xl px-4 pb-10">
          <div className="rounded-3xl border-t border-[rgba(255,255,255,0.1)] bg-gradient-to-b from-slate-950/88 via-slate-950/92 to-blue-950/92 px-6 py-8 shadow-[0_-18px_45px_rgba(2,6,23,0.28)] md:px-8 md:py-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/90">Product</h4>
                <div className="mt-4 flex flex-col gap-2.5 text-sm font-medium">
                  <Link to="/help" className="text-white/60 transition-colors duration-300 hover:text-white">
                    About Page
                  </Link>
                  <a href="#flow" className="text-white/60 transition-colors duration-300 hover:text-white">
                    How it Works
                  </a>
                  <a href="#blue-section" className="text-white/60 transition-colors duration-300 hover:text-white">
                    Success Stories
                  </a>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/90">Support</h4>
                <div className="mt-4 flex flex-col gap-2.5 text-sm font-medium">
                  <Link to="/help" className="text-white/60 transition-colors duration-300 hover:text-white">
                    Help Center
                  </Link>
                  <a
                    href="mailto:myaide.study@gmail.com?subject=Aide%20Support"
                    className="text-white/60 transition-colors duration-300 hover:text-white"
                  >
                    Support
                  </a>
                  <a
                    href="mailto:myaide.study@gmail.com"
                    className="text-white/60 transition-colors duration-300 hover:text-white"
                  >
                    Contact Us
                  </a>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/90">Legal</h4>
                <div className="mt-4 flex flex-col gap-2.5 text-sm font-medium">
                  <Link to="/help#privacy-policy" className="text-white/60 transition-colors duration-300 hover:text-white">
                    Privacy Policy
                  </Link>
                  <Link to="/help#terms-of-service" className="text-white/60 transition-colors duration-300 hover:text-white">
                    Terms of Service
                  </Link>
                  <Link to="/help#community-guidelines" className="text-white/60 transition-colors duration-300 hover:text-white">
                    Community Guidelines
                  </Link>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/90">Social</h4>
                <div className="mt-4 flex flex-col gap-2.5 text-sm font-medium">
                  <a
                    href="https://www.instagram.com/myaide.study/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-white/60 transition-colors duration-300 hover:text-white"
                  >
                    Instagram
                  </a>
                  <a
                    href="https://www.facebook.com/profile.php?id=61587146428880"
                    target="_blank"
                    rel="noreferrer"
                    className="text-white/60 transition-colors duration-300 hover:text-white"
                  >
                    Facebook
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-white/10 pt-4 text-xs tracking-wide text-white/70">
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
