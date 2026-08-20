import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, CalendarDays, FileText, ListChecks, Mic, Sparkles, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const inputs = [
  {
    icon: FileText,
    title: "PDFs and documents",
    description: "Upload lecture slides, textbook chapters, or handouts and get a clean, structured guide.",
  },
  {
    icon: BookOpen,
    title: "Class notes",
    description: "Paste messy notes and Aide reorganizes them into sections, key terms, and summaries.",
  },
  {
    icon: Mic,
    title: "Voice recordings",
    description: "Dictate what you remember and turn spoken review into written study material.",
  },
  {
    icon: Layers,
    title: "Images of pages",
    description: "Snap a photo of a page or whiteboard and pull the content into your guide.",
  },
];

const steps = [
  {
    title: "Add your material",
    description: "Drop in a PDF, paste notes, record your voice, or upload an image of the page.",
  },
  {
    title: "Generate the study guide",
    description: "Aide builds a structured guide with a summary, key terms, quizzes, and flashcards.",
  },
  {
    title: "Follow a 7-day plan",
    description: "Turn the guide into a day-by-day course plan so revision has a clear schedule.",
  },
];

const outputs = [
  {
    icon: ListChecks,
    title: "Structured sections",
    description: "Each guide is split into readable sections with key terms highlighted for recall.",
  },
  {
    icon: Sparkles,
    title: "Quizzes and flashcards",
    description: "Test yourself right after reading, with question counts you control.",
  },
  {
    icon: CalendarDays,
    title: "7-day study plan",
    description: "A paced course outline that spreads the material across a week of review.",
  },
];

const faqs = [
  {
    q: "What is a study guide maker?",
    a: "It is a tool that turns raw material — notes, PDFs, recordings — into an organized guide you can actually revise from, with summaries, key terms, and practice questions.",
  },
  {
    q: "Can I make a study guide from a PDF?",
    a: "Yes. Upload the PDF and Aide extracts the content, then generates a structured guide plus optional quizzes, flashcards, and a knowledge map.",
  },
  {
    q: "Is it free to try?",
    a: "Yes. The free plan includes a daily generation so you can create a study guide before deciding to upgrade.",
  },
  {
    q: "Which languages are supported?",
    a: "Aide works in English, Russian, Armenian, and Korean.",
  },
];

const StudyGuideMaker = () => {
  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,rgba(56,189,248,0.18),rgba(224,242,254,0.8)_30%,rgba(255,255,255,1)_80%)] text-slate-950 dark:bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,rgba(59,130,246,0.18),rgba(17,24,39,0.95)_55%,rgba(3,7,18,1)_90%)] dark:text-slate-50">
      <section className="container mx-auto max-w-7xl px-4 pb-16 pt-16 md:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-200/90 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-sky-700 shadow-sm backdrop-blur dark:border-sky-400/20 dark:bg-white/5 dark:text-sky-200">
              <Sparkles className="h-3.5 w-3.5" />
              AI Study Guide Maker
            </div>

            <h1 className="max-w-[14ch] text-[clamp(2.4rem,6.5vw,5rem)] font-black leading-[0.95] tracking-[-0.05em]">
              Turn any material into a study guide.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-700 md:text-lg dark:text-slate-300">
              Aide converts PDFs, class notes, and voice recordings into structured study guides — complete with key
              terms, quizzes, flashcards, and a 7-day study plan.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 rounded-full bg-sky-600 px-7 text-base text-white hover:bg-sky-500">
                <Link to="/auth">
                  Make a study guide free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-sky-300 bg-white/70 px-7 text-base text-sky-700 hover:bg-white dark:border-sky-200/30 dark:text-sky-100">
                <a href="#how-it-works">See how it works</a>
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {["PDF to study guide", "Notes to key terms", "7-day study plan"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-slate-200 bg-white/85 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <Card className="rounded-[2rem] border border-slate-200/70 bg-white/85 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">What a generated guide includes</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">From one upload, in one pass</p>

              <div className="mt-5 grid gap-3">
                {outputs.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="flex gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-950/60"
                    >
                      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-sky-600 dark:text-sky-300" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="container mx-auto max-w-7xl px-4 pb-16">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600 dark:text-sky-300">How it works</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-4xl">From raw material to revision-ready</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <Card
              key={step.title}
              className="rounded-2xl border border-slate-200/80 bg-white/88 p-5 shadow-[0_16px_36px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/50"
            >
              <span className="mb-4 inline-flex rounded-full border border-sky-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-sky-700 dark:border-white/10 dark:bg-white/5 dark:text-sky-200">
                Step {index + 1}
              </span>
              <h3 className="mb-2 text-base font-semibold text-slate-900 dark:text-white">{step.title}</h3>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{step.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-4 pb-16">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight md:text-4xl">Works with what you already have</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {inputs.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.title}
                className="rounded-2xl border border-slate-200/80 bg-white/88 p-5 shadow-[0_16px_36px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1 dark:border-white/10 dark:bg-slate-950/50"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100/90 dark:bg-sky-500/15">
                  <Icon className="h-5 w-5 text-sky-700 dark:text-sky-200" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-4 pb-20">
        <div className="rounded-[2rem] border border-slate-200/70 bg-white/85 p-6 backdrop-blur-xl md:p-10 dark:border-white/10 dark:bg-slate-950/55">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600 dark:text-sky-300">FAQ</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-4xl">Study guide questions</h2>
            </div>
            <div className="grid gap-4 lg:col-span-7">
              {faqs.map((item) => (
                <Card key={item.q} className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 dark:border-white/10 dark:bg-white/5">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">{item.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.a}</p>
                </Card>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-full bg-sky-600 text-white hover:bg-sky-500">
              <Link to="/auth">
                Start free with Aide
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-slate-300 bg-white/70 text-slate-800 hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-slate-100">
              <Link to="/homework-helper">See the homework helper</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StudyGuideMaker;
