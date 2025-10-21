import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Housing Authority Exchange has been invaluable for getting quick answers to complex regulatory questions. The community here really understands our challenges.",
    author: "Sarah Johnson",
    title: "Executive Director, Metro Housing Authority"
  },
  {
    quote: "I've learned so much from other authorities' approaches to tenant services. It's amazing to have this kind of peer-to-peer knowledge sharing platform.",
    author: "Michael Chen",
    title: "Program Manager, Regional Housing Partnership"
  },
  {
    quote: "The regional insights feature helped us implement a new maintenance tracking system based on what worked for similar-sized authorities in our area.",
    author: "Lisa Rodriguez",
    title: "Operations Director, City Housing Commission"
  }
];

const TestimonialsSection = () => {
  return (
    <section className="bg-background px-4 py-16 md:py-24">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            What Housing Professionals Say
          </h2>
          <p className="text-lg">
            Real feedback from housing authority staff across the country
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="mb-4">
                  <Quote className="h-8 w-8 text-primary" />
                </div>
                <blockquote className="mb-4">
                  "{testimonial.quote}"
                </blockquote>
                <div className="border-t pt-4">
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;