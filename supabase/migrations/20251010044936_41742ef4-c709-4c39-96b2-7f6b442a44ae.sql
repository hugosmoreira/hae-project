-- Create polls table
CREATE TABLE public.polls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  description TEXT,
  author_id UUID NOT NULL,
  total_votes INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create poll_options table
CREATE TABLE public.poll_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  vote_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create poll_votes table to track user votes
CREATE TABLE public.poll_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES public.poll_options(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for polls
CREATE POLICY "Polls are viewable by everyone"
ON public.polls FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create polls"
ON public.polls FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own polls"
ON public.polls FOR UPDATE USING (auth.uid() = author_id);

-- RLS Policies for poll_options
CREATE POLICY "Poll options are viewable by everyone"
ON public.poll_options FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create poll options"
ON public.poll_options FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for poll_votes
CREATE POLICY "Users can view all votes"
ON public.poll_votes FOR SELECT USING (true);

CREATE POLICY "Users can create their own votes"
ON public.poll_votes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates on polls
CREATE TRIGGER update_polls_updated_at
BEFORE UPDATE ON public.polls
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();