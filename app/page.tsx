import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/layout/Hero";
import Features from "@/components/sections/Features";
import Workflow from "@/components/sections/Workflow";
import BuiltFor from "@/components/sections/BuiltFor";
import CTA from "@/components/sections/CTA";
import Footer from "@/components/sections/Footer";

export default function Home() {

  return (
    <main className="hide-scrollbar h-screen  overflow-auto bg-white">
      <Navbar />
      <Hero />
      <Features />
      <Workflow />
      <BuiltFor />
      <CTA />
      <Footer />
    </main>
  );
}