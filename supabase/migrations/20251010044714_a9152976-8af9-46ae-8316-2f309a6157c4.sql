-- Insert demo knowledge base articles
INSERT INTO public.knowledge_articles (title, description, content, category, author_id, slug, helpful_count)
VALUES
  (
    'Understanding HUD UPCS Inspection Updates 2025',
    'Comprehensive guide to the latest updates in HUD''s Uniform Physical Condition Standards for 2025, including new inspection protocols and compliance requirements.',
    'Full article content covering UPCS updates, new requirements, inspection checklists, and implementation timeline...',
    'inspections',
    (SELECT id FROM public.profiles WHERE username = 'hugosmoreira' LIMIT 1),
    'understanding-hud-upcs-inspection-updates-2025',
    15
  ),
  (
    'Simplifying Rent Reasonableness Calculations',
    'Step-by-step methodology for conducting accurate rent reasonableness determinations, including market analysis tools and documentation best practices.',
    'Full article content on rent reasonableness calculations, market surveys, comparable unit analysis, and documentation requirements...',
    'finance',
    (SELECT id FROM public.profiles WHERE username = 'hugosmoreira' LIMIT 1),
    'simplifying-rent-reasonableness-calculations',
    23
  ),
  (
    'Best Practices for Yardi Role Management',
    'Essential strategies for setting up and maintaining user roles in Yardi Voyager, ensuring security while maximizing team efficiency.',
    'Full article content on Yardi role configuration, security best practices, permission hierarchies, and troubleshooting common issues...',
    'it-yardi',
    (SELECT id FROM public.profiles WHERE username = 'hugosmoreira' LIMIT 1),
    'best-practices-for-yardi-role-management',
    31
  );