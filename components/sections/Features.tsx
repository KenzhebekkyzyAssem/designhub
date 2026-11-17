import {
  Folder,
  Sparkles,
  Users,
  Layers3,
  CheckCircle2,
  Send,
} from "lucide-react";

const features = [
  {
    icon: Folder,
    title: "All Your Files",
    description:
      "Store, organize, and access all your design files in one secure place.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Tools",
    description:
      "Generate, enhance, and ideate faster with built-in AI tools.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Share, comment, and collaborate in real-time with your team.",
  },
  {
    icon: Layers3,
    title: "Design System",
    description:
      "Build and manage consistent design systems and reusable assets.",
  },
  {
    icon: CheckCircle2,
    title: "Task Management",
    description:
      "Assign tasks, set deadlines, and track progress without leaving the platform.",
  },
  {
    icon: Send,
    title: "Prototyping & Handoff",
    description:
      "Create interactive prototypes and handoff to developers with one click.",
  },
];

export default function Features() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-[1320px] px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6C5DD3]">
            DESIGNED FOR MODERN WORKFLOWS
          </p>

          <h2 className="mt-4 text-5xl font-bold tracking-[-1px] text-[#111827]">
            Everything you need,
            <br />
            nothing you don’t.
          </h2>
        </div>

        <div className="mt-20 grid gap-10 md:grid-cols-2 xl:grid-cols-6">
          {features.map((feature) => (
            <div key={feature.title}>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7F5FF]">
                <feature.icon size={28} className="text-[#6C5DD3]" />
              </div>

              <h3 className="mt-6 text-xl font-semibold text-[#111827]">
                {feature.title}
              </h3>

              <p className="mt-4 text-[15px] leading-7 text-[#6B7280]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}