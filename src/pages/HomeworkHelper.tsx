import { Link } from "react-router-dom";
import { ArrowRight, Bot, CheckCircle2, FileText, Headphones, Lightbulb, PenTool, Sparkles, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const highlights = [
  {
    icon: Lightbulb,
    title: "Step-by-step help",
    description: "Breaks messy prompts and questions into small, readable steps you can follow.",
  },
  {
    icon: PenTool,
    title: "Write better answers",
    description: "Use guided explanations to improve structure, clarity, and reasoning in your work.",
  },
  {
    icon: FileText,
    title: "Works with your notes",
    description: "Paste class notes, textbook excerpts, or assignment prompts and get context-aware support.",
  },
  {
    icon: Headphones,
    title: "Study out loud",
    description: "Turn difficult topics into audio-friendly review sessions for commutes or quick refreshes.",
  },
];

const steps = [
  {
    title: "Paste the homework prompt",
    description: "Drop in the assignment question, rubric, or topic you are stuck on.",
  },
  {
    title: "Ask for the type of help you want",
    description: "Choose a full explanation, hints only, or a clean final-answer check.",
  },
  {
    title: "Review and apply the explanation",
    description: "Use the guided breakdown to finish the task and learn the concept faster next time.",
  },
];

const faqs = [
  {
    q: "Is this only for homework?",
    a: "No. You can use it for exam prep, concept review, writing support, and problem solving.",
  },
  {
    q: "Will it give me the answer directly?",
    a: "It can, but the better use case is showing the reasoning so you can actually learn the material.",
  },
  {
    q: "What subjects does it work for?",
    a: "It is useful for math, science, language arts, history, and most prompt-based assignments.",
  },
];

const HomeworkHelper = () => {
  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,rgba(56,189,248,0.18),rgba(224,242,254,0.8)_30%,rgba(255,255,255,1)_80%)] text-slate-950 dark:bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,rgba(59,130,246,0.18),rgba(17,24,39,0.95)_55%,rgba(3,7,18,1)_90%)] dark:text-slate-50">
      <section className="container mx-auto max-w-7xl px-4 pb-16 pt-16 md:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-200/90 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-sky-700 shadow-sm backdrop-blur dark:border-sky-400/20 dark:bg-white/5 dark:text-sky-200">
              <Sparkles className="h-3.5 w-3.5" />
              AI Homework Helper
            </div>

            <h1 className="max-w-[12ch] text-[clamp(2.6rem,7vw,5.6rem)] font-black leading-[0.93] tracking-[-0.05em]">
              Get unstuck on homework fast.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-700 md:text-lg dark:text-slate-300">
              Aide explains assignments step by step, helps you understand the reasoning, and turns confusion into a
              cleaner study session.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 rounded-full bg-sky-600 px-7 text-base text-white hover:bg-sky-500">
                <Link to="/auth">
                  Start with Aide
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-sky-300 bg-white/70 px-7 text-base text-sky-700 hover:bg-white dark:border-sky-200/30 dark:text-sky-100">
                <a href="#how-it-works">See how it works</a>
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {["Step-by-step explanations", "Works with notes", "Better study habits"].map((item) => (
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Homework Help Preview</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">A calm workspace for hard questions</p>
                </div>
                <div className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-700 dark:text-sky-200">
                  Live guidance
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Example prompt
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                  "Explain how to solve this algebra problem without skipping steps, and show me where I should check my work."
                </p>
              </div>

              <div className="mt-4 grid gap-3">
                {[
                  "Identify what the question is asking",
                  "Show the core method",
                  "Check the answer against the prompt",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl bg-[linear-gradient(135deg,hsl(210,90%,48%),hsl(195,85%,55%),hsl(35,95%,55%))] p-4 text-white">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Bot className="h-4 w-4" />
                  Built for better understanding
                </div>
                <p className="mt-2 text-sm text-white/90">
                  Use it to study, not just to finish one assignment faster.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="container mx-auto max-w-7xl px-4 pb-16">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600 dark:text-sky-300">
            How it works
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-4xl">Three steps from stuck to solved</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300">
            The page is intentionally simple: fast entry, useful explanation, clear next action.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <Card
              key={step.title}
              className="rounded-2xl border border-slate-200/80 bg-white/88 p-5 shadow-[0_16px_36px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/50"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-200">
                  <WandSparkles className="h-4.5 w-4.5" />
                </div>
                <span className="rounded-full border border-sky-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-sky-700 dark:border-white/10 dark:bg-white/5 dark:text-sky-200">
                  Step {index + 1}
                </span>
              </div>
              <h3 className="mb-2 text-base font-semibold text-slate-900 dark:text-white">{step.title}</h3>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{step.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-4 pb-16">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {highlights.map((item) => {
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
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600 dark:text-sky-300">
                FAQ
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-4xl">Common homework questions</h2>
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
                Try Aide now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-slate-300 bg-white/70 text-slate-800 hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-slate-100">
              <Link to="/help">Read study tips</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeworkHelper;
