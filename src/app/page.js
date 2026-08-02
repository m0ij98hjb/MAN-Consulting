import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Vision from "@/components/sections/Vision";
import Services from "@/components/sections/Services";
import Projects from "@/components/sections/Projects";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import ViewAllProjectsCTA from "@/components/sections/ViewAllProjectsCTA";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <About />
      <Vision />
      <Projects />
      <Services />
      <WhyChooseUs />
      <ViewAllProjectsCTA />
    </main>
  );
}
