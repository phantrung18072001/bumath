import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import ClassGrid from "@/components/landing/ClassGrid";
import IntensiveSection from "@/components/landing/IntensiveSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import ConsultationForm from "@/components/landing/ConsultationForm";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/20">
      <Header />
      <main>
        <HeroSection />
        <ClassGrid />
        <IntensiveSection />
        <TestimonialsSection />
        <ConsultationForm />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
