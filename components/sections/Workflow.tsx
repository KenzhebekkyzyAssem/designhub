'use client';

import React from 'react';
import { Lightbulb, PenTool, Users, Send, ArrowRight } from 'lucide-react';

const workflowSteps = [
  {
    id: 'ideate',
    title: 'Ideate',
    description: 'Capture ideas and inspiration',
    icon: Lightbulb,
    isActive: false,
  },
  {
    id: 'design',
    title: 'Design',
    description: 'Create with your favorite tools',
    icon: PenTool,
    isActive: false,
  },
  {
    id: 'organize',
    title: 'Organize',
    description: 'Keep everything in one hub',
    isCustomLogo: true,
    isActive: true,
  },
  {
    id: 'collaborate',
    title: 'Collaborate',
    description: 'Work together in real-time',
    icon: Users,
    isActive: false,
  },
  {
    id: 'deliver',
    title: 'Deliver',
    description: 'Handoff and ship with confidence',
    icon: Send,
    isActive: false,
  },
];

export default function WorkflowSection() {
  return (
    /* Төменгі блок сияқты: px-6, bg-white */
    <section className="w-full px-6 py-12 bg-white flex justify-center">
      {/* 
        Төменгі CTA блогының өлшемімен 1:1 бірдей:
        - max-w-7xl
        - rounded-[32px]
        - px-8 sm:px-16 py-14
        - background & shadow
      */}
      <div className="relative w-full max-w-7xl rounded-[32px] bg-[linear-gradient(135deg,#070314_0%,#150633_50%,#2b0b68_100%)] border border-purple-500/10 px-8 sm:px-16 py-12 sm:py-14 shadow-2xl overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10">
        
        {/* Карточкаларды қосатын артқы сызық */}
        <div className="hidden lg:block absolute top-[53%] left-[42%] right-[8%] border-t border-dashed border-purple-400/20 z-0" />

        {/* Сол жақ: Мәтін + Батырма */}
        <div className="lg:w-5/12 z-10 space-y-5 text-left w-full">
          
          <h2 className="text-3xl sm:text-4xl font-bold leading-tight text-white">
            A better way
            <br />
            to get things done.
          </h2>
          
          <p className="text-sm sm:text-base leading-relaxed text-gray-300 max-w-md">
            Connect your ideas, tools, and people. All in one seamless workflow.
          </p>
          
          <div className="pt-2">
            <button className="inline-flex items-center gap-2.5 bg-white text-gray-950 font-semibold px-6 py-3 rounded-xl hover:bg-gray-100 transition-all text-sm group shadow-md">
              Explore Features
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Оң жақ: 5 Карточка (Көлемі мен пропорциясы турыланған) */}
        <div className="lg:w-7/12 z-10 w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {workflowSteps.map((step) => {
            const IconComponent = step.icon;

            return (
              <div
                key={step.id}
                className={`rounded-2xl p-3.5 sm:p-4 flex flex-col items-center text-center justify-between h-44 sm:h-48 transition-all duration-300 ${
                  step.isActive
                    ? 'bg-gradient-to-b from-purple-600/30 to-purple-800/20 border-2 border-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.45)] backdrop-blur-md lg:-translate-y-1'
                    : 'bg-white/[0.03] border border-white/10 hover:border-purple-400/30 hover:bg-white/[0.06] backdrop-blur-md'
                }`}
              >
                {/* Иконка / Белгіше */}
                <div className="mt-2 flex items-center justify-center">
                  {step.isCustomLogo ? (
                    <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-black text-xl shadow-inner">
                      D
                    </div>
                  ) : (
                    IconComponent && <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-purple-300 stroke-[1.5]" />
                  )}
                </div>

                {/* Төменгі мәтін */}
                <div>
                  <h3 className="font-semibold text-white text-xs sm:text-sm mb-1">
                    {step.title}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-gray-400 leading-tight">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}