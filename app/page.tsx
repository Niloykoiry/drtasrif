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
import { LanguageProvider } from "@/lib/i18n";
import {
  getPublishedBeforeAfterCases,
  getPublishedGalleryItems,
  getPublishedSectionOverrides,
  getPublishedServices,
} from "@/lib/public-content";

export default async function Page() {
  const [initialOverrides, services, beforeAfterCases, galleryItems] = await Promise.all([
    getPublishedSectionOverrides(),
    getPublishedServices(),
    getPublishedBeforeAfterCases(),
    getPublishedGalleryItems(),
  ]);

  return (
    <LanguageProvider initialOverrides={initialOverrides}>
      <>
        <Navbar />
        <main>
          <Hero />
          <About />
          <Specializations services={services} />
          <BeforeAfter cases={beforeAfterCases} />
          <Gallery items={galleryItems} />
          <Appointment />
          <Contact />
        </main>
        <Footer />
        <FloatingChat />
      </>
    </LanguageProvider>
  );
}
