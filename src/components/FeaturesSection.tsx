import { Users, MessageCircle, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Users,
    title: "Knowledge Sharing",
    description: "Connect with housing professionals across the country to share experiences and best practices."
  },
  {
    icon: MessageCircle,
    title: "Practical Answers",
    description: "Get real-world solutions to everyday challenges from colleagues who've faced similar situations."
  },
  {
    icon: MapPin,
    title: "Regional Insights",
    description: "Learn about local policies, regulations, and approaches from housing authorities in your region."
  }
];

const FeaturesSection = () => {
  return (
    <section className="px-4 py-16 md:py-24">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Why Housing Authority Exchange?
          </h2>
          <p className="text-lg">
            Built by housing professionals, for housing professionals
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-8">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-gradient-primary p-4">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="mb-3 text-xl font-semibold">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;