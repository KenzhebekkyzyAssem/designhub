import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function CTA() {
  return (
    <section className="px-6 pb-24 bg-white">
      <div className="relative mx-auto max-w-7xl rounded-[32px] bg-[linear-gradient(135deg,#070314_0%,#150633_50%,#2b0b68_100%)] border border-purple-500/10 px-8 sm:px-16 py-14 shadow-2xl overflow-hidden">
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14">

          {/* Сол жақ */}
          <div className="max-w-md text-left w-full">
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight text-white">
              Ready to design
              <br />
              better together?
            </h2>

            <p className="mt-4 text-base sm:text-lg leading-relaxed text-gray-300">
              Design smarter. Collaborate faster. Deliver exceptional digital products with DesignHub.
            </p>
          </div>

          {/* Оң жақ (ДӘЛ СУРЕТТЕГІДЕЙ БӨЛІМ) */}
          <div className="w-full max-w-xl">
            {/* Input + Button Контейнері */}
            <div className="flex flex-col sm:flex-row items-center overflow-hidden rounded-xl border border-white/10 bg-[#100826] p-1.5 focus-within:border-purple-500/50 transition">
              <input
                type="email"
                placeholder="Enter your email"
                className="h-12 sm:h-14 flex-1 bg-transparent px-5 text-white placeholder:text-gray-500 outline-none w-full text-sm sm:text-base"
              />

              {/* Күлгін Градиентті Батырма */}
              <button className="h-12 sm:h-14 w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 text-white font-semibold px-8 rounded-lg transition-all duration-300 whitespace-nowrap shadow-lg">
                Get Started Free
              </button>
            </div>

            {/* Төменгі Галочкасы бар тізім (Checkmarks) */}
            <div className="mt-5 flex flex-wrap gap-5 sm:gap-6 text-xs sm:text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-violet-500 fill-violet-500/20" />
                <span>No credit card</span>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-violet-500 fill-violet-500/20" />
                <span>Free forever plan</span>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-violet-500 fill-violet-500/20" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}