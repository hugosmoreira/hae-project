import { Button } from "@/components/ui/button";
import logo from '@/assets/logo.png';

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-b from-background via-primary/5 to-background px-4 py-20 md:py-32">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-highlight opacity-5" />
      
      <div className="container relative mx-auto max-w-4xl text-center">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <img 
            src={logo} 
            alt="Housing Authority Exchange" 
            className="h-20 w-20 md:h-24 md:w-24"
          />
        </div>
        
        <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
          A place for Housing Authority staff to{" "}
          <span className="text-gradient">share knowledge</span> and learn from each other
        </h1>
        <p className="mb-10 text-lg md:text-xl lg:text-2xl">
          Ask questions, compare processes, and swap ideas with housing professionals nationwide.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6">
          <Button size="lg" className="text-lg font-semibold" onClick={() => window.location.href = '/auth'}>
            Get Started
          </Button>
          <Button variant="secondary" size="lg" className="text-lg font-semibold">
            Browse Discussions
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;