import React, { useState, useEffect } from 'react';
import { Plus, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

type PollOption = {
  id: string;
  option_text: string;
  vote_count: number;
};

type Poll = {
  id: string;
  question: string;
  description: string;
  total_votes: number;
  expires_at: string;
  options: PollOption[];
};

const Polls = () => {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [votedPolls, setVotedPolls] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: polls, isLoading } = useQuery({
    queryKey: ['polls'],
    queryFn: async () => {
      const { data: pollsData, error: pollsError } = await supabase
        .from('polls')
        .select('*')
        .order('created_at', { ascending: false });

      if (pollsError) throw pollsError;

      const { data: { user } } = await supabase.auth.getUser();

      const pollsWithOptions = await Promise.all(
        pollsData.map(async (poll) => {
          const { data: options } = await supabase
            .from('poll_options')
            .select('*')
            .eq('poll_id', poll.id)
            .order('vote_count', { ascending: false });

          // Check if user has voted
          let hasVoted = false;
          if (user) {
            const { data: userVote } = await supabase
              .from('poll_votes')
              .select('option_id')
              .eq('poll_id', poll.id)
              .eq('user_id', user.id)
              .maybeSingle();

            hasVoted = !!userVote;
          }

          return { ...poll, options: options || [], hasVoted };
        })
      );

      return pollsWithOptions as (Poll & { hasVoted: boolean })[];
    },
  });

  // Update votedPolls state when polls data changes
  useEffect(() => {
    if (polls) {
      const voted = new Set(polls.filter(p => p.hasVoted).map(p => p.id));
      setVotedPolls(voted);
    }
  }, [polls]);

  const voteMutation = useMutation({
    mutationFn: async ({ pollId, optionId }: { pollId: string; optionId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('poll_votes')
        .insert({ poll_id: pollId, option_id: optionId, user_id: user.id });

      if (error) throw error;

      // Update vote count
      const { data: option } = await supabase
        .from('poll_options')
        .select('vote_count')
        .eq('id', optionId)
        .single();

      await supabase
        .from('poll_options')
        .update({ vote_count: (option?.vote_count || 0) + 1 })
        .eq('id', optionId);

      // Update total votes
      const poll = polls?.find((p) => p.id === pollId);
      await supabase
        .from('polls')
        .update({ total_votes: (poll?.total_votes || 0) + 1 })
        .eq('id', pollId);
    },
    onSuccess: (_, { pollId }) => {
      setVotedPolls((prev) => new Set(prev).add(pollId));
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      toast({
        title: 'Vote recorded',
        description: 'Thank you for participating!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message.includes('duplicate') 
          ? 'You have already voted on this poll'
          : 'Failed to submit vote',
        variant: 'destructive',
      });
    },
  });

  const handleVote = (pollId: string) => {
    const optionId = selectedOptions[pollId];
    if (!optionId) {
      toast({
        title: 'Please select an option',
        description: 'Choose an answer before voting',
        variant: 'destructive',
      });
      return;
    }
    voteMutation.mutate({ pollId, optionId });
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    if (expiry < now) return 'Closed';
    return formatDistanceToNow(expiry, { addSuffix: true }).replace('in ', '') + ' left';
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Community Polls</h1>
          <p className="text-muted-foreground">
            See what other housing professionals are doing and share your input.
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Poll
        </Button>
      </div>

      {/* Polls List */}
      {isLoading ? (
        <div className="text-center text-muted-foreground">Loading polls...</div>
      ) : (
        <div className="space-y-6">
          {polls?.map((poll) => {
            const hasVoted = poll.hasVoted || votedPolls.has(poll.id);
            const selectedOption = selectedOptions[poll.id];

            return (
              <Card key={poll.id} className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-2xl">{poll.question}</CardTitle>
                  {poll.description && (
                    <CardDescription className="text-base">
                      {poll.description}
                    </CardDescription>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{poll.total_votes} votes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{getTimeRemaining(poll.expires_at)}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {!hasVoted ? (
                    <div className="space-y-4">
                      <RadioGroup
                        value={selectedOption}
                        onValueChange={(value) =>
                          setSelectedOptions((prev) => ({ ...prev, [poll.id]: value }))
                        }
                      >
                        {poll.options.map((option) => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.id} id={option.id} />
                            <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                              {option.option_text}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                      <Button onClick={() => handleVote(poll.id)} className="w-full">
                        Vote
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {poll.options.map((option) => {
                        const percentage =
                          poll.total_votes > 0
                            ? Math.round((option.vote_count / poll.total_votes) * 100)
                            : 0;

                        return (
                          <div key={option.id} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">{option.option_text}</span>
                              <span className="text-muted-foreground">
                                {percentage}% ({option.vote_count})
                              </span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                      <p className="text-sm text-muted-foreground pt-2">
                        You have already voted on this poll
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {polls && polls.length === 0 && !isLoading && (
        <div className="text-center text-muted-foreground py-12">
          No polls available. Create the first one!
        </div>
      )}
    </div>
  );
};

export default Polls;