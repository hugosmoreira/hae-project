import { UserPlus, Search, Users } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Sign Up",
    description: "Create your account and verify your housing authority affiliation to join our professional community."
  },
  {
    icon: Search,
    title: "Ask or Search",
    description: "Post questions about your challenges or search existing discussions to find solutions others have shared."
  },
  {
    icon: Users,
    title: "Learn and Share",
    description: "Engage with fellow professionals, share your expertise, and build lasting professional connections."
  }
];

const HowItWorksSection = () => {
  return (
    <section className="bg-gradient-to-b from-background to-primary/5 px-4 py-16 md:py-24">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            How It Works
          </h2>
          <p className="text-lg">
            Getting started is simple and straightforward
          </p>
        </div>
        <div className="grid gap-12 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary shadow-lg">
                  <step.icon className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="mb-2 text-lg font-bold text-gradient">
                Step {index + 1}
              </div>
              <h3 className="mb-3 text-xl font-semibold">
                {step.title}
              </h3>
              <p className="text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;