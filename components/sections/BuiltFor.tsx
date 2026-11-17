"use client";
import Image from "next/image";

const cardsData = [
  {
    title: "For Designers",
    description: "Everything you need to design, organize, and ship your best work.",
    image: "/images/designers.png",
  },
  {
    title: "For Teams",
    description: "Collaborate, manage projects, and keep everyone in sync.",
    image: "/images/teams.png",
  },
  {
    title: "For Agencies",
    description: "Manage clients, projects, and creative teams in one professional hub.",
    image: "/images/agencies.png",
  },
  {
    title: "For Freelancers",
    description: "Stay organized, deliver on time, and grow your business.",
    image: "/images/freelancers.png",
  },
];

export default function BuiltFor() {
  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-12 gap-8 items-start">
          
          {/* LEFT CONTENT */}
          <div className="col-span-12 lg:col-span-4 pt-2">
            <span className="inline-block text-[11px] font-bold tracking-[0.2em] text-[#635BFF] uppercase">
              BUILT FOR EVERYTHING YOU DO
            </span>

            <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-[#0D0D18] leading-[1.15]">
              One workspace.
              <br />
              Infinite possibilities.
            </h2>

            <p className="mt-5 text-sm sm:text-base leading-relaxed text-gray-500 max-w-xs">
              Whether you're a solo designer, part of a team, or an agency — DesignHub adapts to the way you work.
            </p>

            <button className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#635BFF] hover:gap-3 transition-all">
              View all solutions
              <span>→</span>
            </button>
          </div>

          {/* RIGHT CARDS */}
          <div className="col-span-12 lg:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {cardsData.map((card, index) => (
                <div
                  key={index}
                  className="group flex flex-col justify-between overflow-hidden rounded-[24px] bg-[#F8F9FC] p-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Image container */}
                  <div className="relative w-full h-44 overflow-hidden rounded-[18px]">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Card content */}
                  <div className="p-4 flex flex-col justify-between flex-1 mt-2">
                    <div>
                      <h3 className="text-base font-bold text-[#0D0D18]">
                        {card.title}
                      </h3>

                      <p className="mt-2 text-[12px] leading-relaxed text-gray-500">
                        {card.description}
                      </p>
                    </div>

                    <button className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#635BFF] hover:gap-2.5 transition-all w-max">
                      Learn more
                      <span>→</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}