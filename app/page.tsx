import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Specializations from "@/components/Specializations";
import BeforeAfter from "@/components/BeforeAfter";
import Gallery from "@/components/Gallery";
import Appointment from "@/components/Appointment";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import FloatingChat from "@/components/FloatingChat";

export default function Page() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Specializations />
        <BeforeAfter />
        <Gallery />
        <Appointment />
        <Contact />
      </main>
      <Footer />
      <FloatingChat />
    </>
  );
}
