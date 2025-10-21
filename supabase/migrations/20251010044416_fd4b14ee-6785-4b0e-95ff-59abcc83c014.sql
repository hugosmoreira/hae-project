-- Create knowledge_articles table
CREATE TABLE public.knowledge_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  author_id UUID NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.knowledge_articles ENABLE ROW LEVEL SECURITY;

-- Create policies for knowledge articles
CREATE POLICY "Articles are viewable by everyone"
ON public.knowledge_articles
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create articles"
ON public.knowledge_articles
FOR INSERT
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own articles"
ON public.knowledge_articles
FOR UPDATE
USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own articles"
ON public.knowledge_articles
FOR DELETE
USING (auth.uid() = author_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_knowledge_articles_updated_at
BEFORE UPDATE ON public.knowledge_articles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample articles for demonstration
INSERT INTO public.knowledge_articles (title, description, content, category, author_id, slug) VALUES
('HUD Compliance Checklist 2025', 'Complete guide to HUD compliance requirements for housing authorities in 2025', 'Full article content here...', 'compliance', (SELECT id FROM public.profiles LIMIT 1), 'hud-compliance-checklist-2025'),
('Annual Inspection Best Practices', 'Step-by-step guide for conducting thorough and efficient annual inspections', 'Full article content here...', 'inspections', (SELECT id FROM public.profiles LIMIT 1), 'annual-inspection-best-practices'),
('Yardi Voyager Tips & Tricks', 'Essential shortcuts and workflows to maximize efficiency in Yardi Voyager', 'Full article content here...', 'it-yardi', (SELECT id FROM public.profiles LIMIT 1), 'yardi-voyager-tips-tricks'),
('Section 8 Payment Standards Update', 'Latest changes to Section 8 payment standards and how they affect your authority', 'Full article content here...', 'finance', (SELECT id FROM public.profiles LIMIT 1), 'section-8-payment-standards-update'),
('VASH Program Implementation Guide', 'Comprehensive guide to implementing the Veterans Affairs Supportive Housing program', 'Full article content here...', 'programs', (SELECT id FROM public.profiles LIMIT 1), 'vash-program-implementation-guide'),
('Fair Housing Policy Templates', 'Ready-to-use policy templates that comply with Fair Housing requirements', 'Full article content here...', 'policies', (SELECT id FROM public.profiles LIMIT 1), 'fair-housing-policy-templates');