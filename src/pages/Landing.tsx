import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SettingsModal } from "@/components/SettingsModal";
import { useSettings } from "@/hooks/useSettings";
import {
  ArrowRight,
  BookOpenCheck,
  Bot,
  Brain,
  CheckCircle2,
  Download,
  FileText,
  HelpCircle,
  Languages,
  Layers,
  Library,
  Mail,
  Map,
  MessageSquare,
  Mic,
  ScanSearch,
  Shield,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Upload,
  Volume2,
  WandSparkles
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface FeatureGroup {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  points: string[];
}

const featureGroups: FeatureGroup[] = [
  {
    title: "Core AI Analysis",
    subtitle: "Turn raw notes into structured learning assets",
    icon: Sparkles,
    points: [
      "3-bullet smart summaries",
      "Key terms with definitions and importance levels",
      "Lesson sections with focused takeaways",
      "Language-aware output (English, Russian, Armenian, Korean)"
    ]
  },
  {
    title: "Quiz + Flashcards",
    subtitle: "Active recall without manual setup",
    icon: Layers,
    points: [
      "Auto-generated quizzes with answer explanations",
      "Adjustable quiz counts by plan (up to 50)",
      "Flip-style flashcards with confidence tracking",
      "Adjustable flashcard counts by plan (up to 40)"
    ]
  },
  {
    title: "Interactive Knowledge Map",
    subtitle: "Visual understanding, not just text blocks",
    icon: Map,
    points: [
      "AI-generated concept graph with typed relationships",
      "Radial and force layouts, edge filters, label toggles",
      "Scan for knowledge gaps with ghost-node suggestions",
      "Zen mode, fullscreen, editable node labels, undo/reset"
    ]
  },
  {
    title: "Chat Tutor",
    subtitle: "Ask follow-up questions in context",
    icon: MessageSquare,
    points: [
      "Content-aware AI chat with streaming responses",
      "General chat mode for open questions",
      "Markdown-ready answers with math support",
      "Chat history-aware responses for better continuity"
    ]
  },
  {
    title: "Podcast + Audio",
    subtitle: "Study while walking, commuting, or training",
    icon: Mic,
    points: [
      "AI-generated two-speaker educational podcasts",
      "Playback controls, seek, mute, and download",
      "Auto-save podcast to your content item",
      "Generate podcasts on demand from analyzed content"
    ]
  },
  {
    title: "Course Mode",
    subtitle: "From one source into a study roadmap",
    icon: BookOpenCheck,
    points: [
      "Course preview and syllabus/module structure",
      "Course detail page with quick actions",
      "One-click jump to quiz, flashcards, and tutor chat",
      "Course assets stored inside your library"
    ]
  },
  {
    title: "Input Flexibility",
    subtitle: "Use the format you already have",
    icon: Upload,
    points: [
      "Paste text or drag/drop files",
      "Attach PDF and image files",
      "Voice input with language-aware transcription",
      "Per-request generation toggles (quiz/map/flashcards/course/podcast)"
    ]
  },
  {
    title: "Library + Export",
    subtitle: "Everything is saved and easy to reuse",
    icon: Library,
    points: [
      "Search and filter by analyses, chats, and courses",
      "Regenerate missing assets for older content",
      "Export full analysis to PDF",
      "Knowledge map export as image and markdown outline"
    ]
  },
  {
    title: "Account + Personalization",
    subtitle: "Control language, theme, limits, and security",
    icon: Shield,
    points: [
      "Email sign up/sign in and password reset flow",
      "Profile settings with plan status and account details",
      "Language and theme switching across the interface",
      "Free/Pro/Class limits with in-app upgrade flow"
    ]
  }
];

const flowSteps = [
  { title: "Paste Text or Upload PDF/Image", icon: Upload },
  { title: "Aide Analyzes + Builds Assets", icon: Bot },
  { title: "Practice with Quiz, Cards, Chat, Map, Podcast", icon: WandSparkles }
];

const includedTools = [
  "Summaries",
  "Key Terms",
  "Lesson Sections",
  "Practice Quizzes",
  "Flashcards",
  "AI Chat",
  "Knowledge Map",
  "Gap Scanner",
  "Course Builder",
  "Podcast Generator",
  "PDF Export",
  "Map Export",
  "Voice Input",
  "File Upload",
  "Library Search"
];

const Landing = () => {
  const { language, theme, setLanguage, setTheme } = useSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/60">
        <div className="container max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Aide
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="hidden sm:flex gap-1.5">
              <a href="mailto:myaide.study@gmail.com">
                <Mail className="h-4 w-4" />
                Contact
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild className="hidden sm:flex gap-1.5">
              <Link to="/help">
                <HelpCircle className="h-4 w-4" />
                Help
              </Link>
            </Button>
            <Button variant="outline" size="icon" onClick={() => setSettingsOpen(true)}>
              <Settings className="h-4 w-4" />
            </Button>
            <Button asChild size="sm">
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        </div>
      </nav>

      <section className="relative pt-24 md:pt-32 pb-12 md:pb-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
          <motion.div
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/20 blur-3xl"
            animate={{ scale: [1, 1.1, 1], x: [0, 40, 0], y: [0, 20, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-32 -right-20 w-[28rem] h-[28rem] rounded-full bg-accent/20 blur-3xl"
            animate={{ scale: [1, 1.15, 1], x: [0, -30, 0], y: [0, -20, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="container max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            <motion.div
              className="lg:col-span-7"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-7 md:p-10 bg-card/85 border-primary/20 shadow-xl">
                <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase mb-4 px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/30">
                  <Brain className="h-3.5 w-3.5" />
                  AI Study Engine
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                  Turn Your Notes into Smart Study Guides in Seconds
                </h1>
                <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-2xl">
                  Generate quizzes, flashcards, knowledge maps, chat tutoring, course plans, and podcasts from your notes, PDFs, and images in one workflow.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mb-5">
                  <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-base">
                    <Link to="/auth">
                      Start Your Free AI Analysis
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="text-base">
                    <a href="#how-it-works">See How It Works</a>
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground border border-border">
                    1 free analysis/day
                  </span>
                  <span className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground border border-border">
                    4 languages supported
                  </span>
                  <span className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground border border-border">
                    PDF + image uploads
                  </span>
                </div>
              </Card>
            </motion.div>

            <motion.div
              className="lg:col-span-5"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <Card className="p-6 bg-card/85 border-accent/30 shadow-xl">
                <p className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  20-second learning flow
                </p>
                <div className="space-y-3">
                  {flowSteps.map((step, idx) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.title}>
                        <div className="rounded-xl border border-border bg-background/80 p-3 flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <p className="text-sm font-medium">{step.title}</p>
                        </div>
                        {idx < flowSteps.length - 1 && (
                          <div className="flex justify-center py-1.5">
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Included Outputs
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {includedTools.map((tool) => (
                      <span key={tool} className="text-[11px] px-2 py-1 rounded-md bg-background/80 border border-border">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="features" className="container max-w-7xl mx-auto px-4 py-14 md:py-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Everything In Aide Today</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Every capability below is already implemented in this codebase and available in your product flow.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {featureGroups.map((group, idx) => {
            const Icon = group.icon;
            return (
              <motion.div
                key={group.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="h-full p-5 md:p-6 border-border/80 hover:border-primary/40 hover:shadow-lg transition-all">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{group.title}</h3>
                      <p className="text-sm text-muted-foreground">{group.subtitle}</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {group.points.map((point) => (
                      <li key={point} className="text-sm flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section id="how-it-works" className="container max-w-7xl mx-auto px-4 py-14 md:py-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Short workflow. No setup friction. Start learning immediately.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          <Card className="p-6 border-primary/30 bg-gradient-to-br from-primary/10 to-background">
            <div className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mb-4">1</div>
            <h3 className="text-lg font-bold mb-2">Input Your Material</h3>
            <p className="text-sm text-muted-foreground">Paste notes, upload PDFs/images, or use voice input to start.</p>
          </Card>
          <Card className="p-6 border-accent/30 bg-gradient-to-br from-accent/10 to-background">
            <div className="w-11 h-11 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold mb-4">2</div>
            <h3 className="text-lg font-bold mb-2">Choose Outputs</h3>
            <p className="text-sm text-muted-foreground">Enable quizzes, flashcards, map, course, and podcast with adjustable counts.</p>
          </Card>
          <Card className="p-6 border-primary/30 bg-gradient-to-br from-primary/10 to-background">
            <div className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mb-4">3</div>
            <h3 className="text-lg font-bold mb-2">Study + Retain Faster</h3>
            <p className="text-sm text-muted-foreground">Practice with quizzes/cards, ask the AI tutor, scan map gaps, and export results.</p>
          </Card>
        </div>
      </section>

      <section className="container max-w-7xl mx-auto px-4 pb-14 md:pb-20">
        <Card className="p-7 md:p-10 border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">Try Aide Free, Then Scale When Needed</h2>
              <p className="text-muted-foreground mb-4">
                Free plan includes 1 analysis/day. Upgrade to Pro or Class for higher limits, larger output ranges, and heavier daily usage.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1.5 rounded-full border border-border bg-background/80">Free: 1 analysis/day</span>
                <span className="px-3 py-1.5 rounded-full border border-border bg-background/80">Pro: 50 analyses/day</span>
                <span className="px-3 py-1.5 rounded-full border border-border bg-background/80">Class: unlimited analyses</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="rounded-xl border border-border bg-background/80 p-4 flex items-center gap-3">
                <Languages className="h-5 w-5 text-primary" />
                <p className="text-sm">Multilingual interface + generation in 4 languages</p>
              </div>
              <div className="rounded-xl border border-border bg-background/80 p-4 flex items-center gap-3">
                <ScanSearch className="h-5 w-5 text-primary" />
                <p className="text-sm">Regenerate missing assets anytime from the library</p>
              </div>
              <div className="rounded-xl border border-border bg-background/80 p-4 flex items-center gap-3">
                <Volume2 className="h-5 w-5 text-primary" />
                <p className="text-sm">Listen, download, and review AI-generated podcast lessons</p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="container max-w-7xl mx-auto px-4 pb-16 md:pb-24">
        <Card className="p-8 md:p-12 text-center border-2 border-accent/30 bg-gradient-to-br from-accent/10 via-primary/10 to-background">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Study Smarter, Not Harder</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Start with your first analysis now and see your notes become a complete learning system in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-base">
              <Link to="/auth">
                Start Your Free AI Analysis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base">
              <Link to="/help">
                <FileText className="mr-2 h-5 w-5" />
                Read Prompting Guide
              </Link>
            </Button>
          </div>
        </Card>
      </section>

      <footer className="container max-w-6xl mx-auto px-4 py-8 border-t border-border/60">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            © 2026 Aide. AI-powered study workflows for summaries, practice, and retention.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="mailto:myaide.study@gmail.com"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <Mail className="h-4 w-4" />
              Contact
            </a>
            <Link
              to="/help"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <HelpCircle className="h-4 w-4" />
              Help
            </Link>
            <Link
              to="/billing"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <Download className="h-4 w-4" />
              Plans
            </Link>
          </div>
        </div>
      </footer>

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
