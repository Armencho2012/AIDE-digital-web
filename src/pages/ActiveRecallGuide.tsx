import { Link } from "react-router-dom";
import { ArrowRight, Brain, ListChecks, RefreshCw, Sparkles, Network, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const steps = [
  {
    title: "Strip your notes down to questions",
    description:
      "Read a page of notes and rewrite each fact as a question. 'The mitochondrion produces ATP' becomes 'Which organelle produces ATP?'. Questions force retrieval; highlighted sentences do not.",
  },
  {
    title: "Close the notes and answer from memory",
    description:
      "Write or say the answer before checking. The effort of pulling the answer out — even when you fail — is what strengthens the memory. Struggling for a few seconds is the point.",
  },
  {
    title: "Check, correct, and mark the misses",
    description:
      "Compare your answer to the source. Anything you got wrong or half-right goes into a 'weak' pile that you review sooner and more often.",
  },
  {
    title: "Space the repeats",
    description:
      "Revisit weak items the next day, then after three days, then after a week. Spacing plus retrieval beats rereading by a wide margin for long-term retention.",
  },
  {
    title: "Explain it without looking",
    description:
      "Finish a session by explaining the topic out loud in plain language. Gaps in your explanation show you exactly which questions to write next.",
  },
];

const aideSteps = [
  {
    icon: Sparkles,
    title: "1. Upload the notes",
    description:
      "Paste your notes, drop in a lecture PDF, upload a photo of a page, or dictate what you remember. Aide reads all four.",
  },
  {
    icon: ListChecks,
    title: "2. Generate quizzes and flashcards",
    description:
      "Tick Quiz and Flashcards before you analyse. Aide writes retrieval questions straight from your material, so you are tested on your syllabus, not a generic bank.",
  },
  {
    icon: Network,
    title: "3. Use the neural map for free recall",
    description:
      "Open the map, look at a single node, and say everything connected to it before expanding. It turns the map into a free-recall drill instead of a diagram.",
  },
  {
    icon: CalendarDays,
    title: "4. Space it with a 7-day plan",
    description:
      "Generate a course plan and Aide spreads the same material across a week, so each retrieval session lands after a useful delay.",
  },
  {
    icon: RefreshCw,
    title: "5. Re-test the items you missed",
    description:
      "Rerun the quiz on the topics you got wrong, or ask the tutor chat to quiz you harder on one section until you can answer it cold.",
  },
];

const mistakes = [
  {
    title: "Rereading and calling it revision",
    description:
      "Familiarity feels like knowledge. If your eyes are on the answer, you are not doing active recall.",
  },
  {
    title: "Writing questions that copy the wording",
    description:
      "Questions phrased exactly like the note test your memory of the sentence, not the idea. Reword them.",
  },
  {
    title: "Only testing what you already know",
    description:
      "Easy cards feel great and teach nothing. Weight your sessions toward the items you keep missing.",
  },
  {
    title: "Cramming every question into one night",
    description:
      "Retrieval works best spread out. Ten minutes a day for a week beats seventy minutes the night before.",
  },
];

const faqs = [
  {
    q: "What is active recall?",
    a: "Active recall is studying by retrieving information from memory instead of reviewing it. Rather than rereading notes, you close them and try to answer a question about the material, then check your answer.",
  },
  {
    q: "How do I do active recall with my own notes?",
    a: "Turn each fact in your notes into a question, cover the notes, answer from memory, then check and mark the ones you missed. Repeat the missed items on a spaced schedule over the following days.",
  },
  {
    q: "How long should an active recall session be?",
    a: "Short and frequent works better than long and rare. Sessions of 15 to 25 minutes, repeated on most days, give you more retrieval attempts spaced further apart.",
  },
  {
    q: "Can Aide turn my notes into active recall material automatically?",
    a: "Yes. Upload or paste your notes and Aide generates quizzes, flashcards, and a neural map from them, so you get retrieval questions built from your own material rather than writing every card by hand.",
  },
];

const ActiveRecallGuide = () => {
  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,rgba(56,189,248,0.18),rgba(224,242,254,0.8)_30%,rgba(255,255,255,1)_80%)] text-slate-950 dark:bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,rgba(59,130,246,0.18),rgba(17,24,39,0.95)_55%,rgba(3,7,18,1)_90%)] dark:text-slate-50">
      <article className="container mx-auto max-w-4xl px-4 pb-20 pt-16 md:pt-20">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-200/90 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-sky-700 shadow-sm backdrop-blur dark:border-sky-400/20 dark:bg-white/5 dark:text-sky-200">
          <Brain className="h-3.5 w-3.5" />
          Study methods guide
        </div>

        <h1 className="text-[clamp(2.1rem,5.5vw,3.6rem)] font-black leading-[1.02] tracking-[-0.04em]">
          How to do active recall with notes
        </h1>

        <p className="mt-5 text-base leading-relaxed text-slate-700 md:text-lg dark:text-slate-300">
          Active recall means answering from memory instead of rereading. This guide walks through turning a page of
          ordinary class notes into retrieval practice — by hand, and then automatically with Aide.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-12 rounded-full bg-sky-600 px-7 text-base text-white hover:bg-sky-500">
            <Link to="/auth">
              Turn your notes into a quiz
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 rounded-full border-sky-300 bg-white/70 px-7 text-base text-sky-700 hover:bg-white dark:border-sky-200/30 dark:text-sky-100"
          >
            <a href="#method">Read the method</a>
          </Button>
        </div>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">What active recall actually is</h2>
          <p className="mt-4 text-base leading-relaxed text-slate-700 dark:text-slate-300">
            When you reread a page, your brain recognises the words and reports back that you know them. That feeling is
            fluency, not memory. Active recall removes the page: you are asked a question and have to reconstruct the
            answer. The reconstruction is the learning — it strengthens the path you will need again in the exam hall,
            where the notes are not in front of you.
          </p>
          <p className="mt-4 text-base leading-relaxed text-slate-700 dark:text-slate-300">
            Two things make it work: retrieval (answering without looking) and spacing (leaving a gap before you try
            again). Everything below is a practical way of getting more of both out of notes you already have.
          </p>
        </section>

        <section id="method" className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">The five-step method</h2>
          <div className="mt-6 grid gap-4">
            {steps.map((step, index) => (
              <Card
                key={step.title}
                className="rounded-2xl border border-slate-200/80 bg-white/88 p-5 shadow-[0_16px_36px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/50"
              >
                <span className="mb-3 inline-flex rounded-full border border-sky-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-sky-700 dark:border-white/10 dark:bg-white/5 dark:text-sky-200">
                  Step {index + 1}
                </span>
                <h3 className="mb-2 text-base font-semibold text-slate-900 dark:text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{step.description}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Doing it in Aide, step by step</h2>
          <p className="mt-4 text-base leading-relaxed text-slate-700 dark:text-slate-300">
            Writing questions by hand is the slow part. Aide does that step for you and keeps the retrieval practice in
            one place.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {aideSteps.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.title}
                  className="rounded-2xl border border-slate-200/80 bg-white/88 p-5 shadow-[0_16px_36px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/50"
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
          <p className="mt-6 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Aide works in English, Russian, Armenian, and Korean, so your questions come back in the language you study
            in. The free plan includes a daily generation — enough to try the loop on one topic before upgrading.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Mistakes that quietly waste the session</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {mistakes.map((item) => (
              <Card
                key={item.title}
                className="rounded-2xl border border-slate-200/80 bg-white/88 p-5 dark:border-white/10 dark:bg-slate-950/50"
              >
                <h3 className="mb-2 text-base font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.description}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">A one-week active recall schedule</h2>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/88 dark:border-white/10 dark:bg-slate-950/50">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-white/10 dark:text-slate-400">
                <tr>
                  <th scope="col" className="px-5 py-3">Day</th>
                  <th scope="col" className="px-5 py-3">What you do</th>
                </tr>
              </thead>
              <tbody className="text-slate-700 dark:text-slate-300">
                {[
                  ["Day 1", "Upload the notes, generate the quiz and flashcards, take the first pass cold."],
                  ["Day 2", "Redo only the questions you missed, then explain the topic out loud."],
                  ["Day 4", "Full quiz again, no notes. Add any new gaps to the weak pile."],
                  ["Day 5", "Use the neural map: name everything connected to each node before expanding it."],
                  ["Day 7", "Final mixed pass across the whole topic, plus one written summary from memory."],
                ].map(([day, task]) => (
                  <tr key={day} className="border-b border-slate-100 last:border-0 dark:border-white/5">
                    <th scope="row" className="whitespace-nowrap px-5 py-3 font-semibold text-slate-900 dark:text-white">
                      {day}
                    </th>
                    <td className="px-5 py-3 leading-relaxed">{task}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">FAQ</h2>
          <div className="mt-6 grid gap-4">
            {faqs.map((item) => (
              <Card
                key={item.q}
                className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 dark:border-white/10 dark:bg-white/5"
              >
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">{item.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.a}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-[2rem] border border-slate-200/70 bg-white/85 p-6 backdrop-blur-xl md:p-10 dark:border-white/10 dark:bg-slate-950/55">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Start with one page of notes</h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
            Pick the topic you feel least sure about, paste it into Aide, and let it write the first set of questions.
            The method only works once you are answering, so make the first retrieval attempt today.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-full bg-sky-600 text-white hover:bg-sky-500">
              <Link to="/auth">
                Start free with Aide
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-slate-300 bg-white/70 text-slate-800 hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-slate-100"
            >
              <Link to="/study-guide-maker">Make a study guide</Link>
            </Button>
          </div>
        </section>
      </article>
    </div>
  );
};

export default ActiveRecallGuide;
