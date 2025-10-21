import React from 'react';
import { DiscussionsFeed } from '@/components/DiscussionsFeed';

interface DiscussionsProps {
  userRole?: string;
}

export default function Discussions({ userRole = 'Professional' }: DiscussionsProps) {
  return (
    <div className="container mx-auto max-w-4xl py-8 px-6">
      <DiscussionsFeed userRole={userRole} />
    </div>
  );
}