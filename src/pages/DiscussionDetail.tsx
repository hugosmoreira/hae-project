import React from 'react';
import { useParams } from 'react-router-dom';
import { DiscussionHeader } from '@/components/discussion-detail/DiscussionHeader';
import { DiscussionBody } from '@/components/discussion-detail/DiscussionBody';
import { DiscussionReplies } from '@/components/discussion-detail/DiscussionReplies';
import { DiscussionComposer } from '@/components/discussion-detail/DiscussionComposer';
import { DiscussionSidebar } from '@/components/discussion-detail/DiscussionSidebar';
import { Skeleton } from '@/components/ui/skeleton';

// Mock discussion data - would come from API
const mockDiscussion = {
  id: 1,
  slug: 'new-hud-guidelines-section-8-inspections',
  title: 'New HUD Guidelines for Section 8 Inspections',
  content: `Has anyone reviewed the updated inspection protocols? I'm seeing some changes in the UPCS standards that affect how we handle unit failures.

The key changes I've noticed include:

1. **Updated deficiency classifications** - Some items that were previously non-life threatening are now classified differently
2. **New documentation requirements** - Additional photos and descriptions required for certain deficiencies
3. **Timeline changes** - Extended timeframes for some correction categories

I'm particularly interested in how other authorities are handling the transition period and whether you've received any additional guidance from your field offices.

Any insights or experiences would be greatly appreciated!`,
  author: 'Sarah Chen',
  role: 'Inspector',
  region: 'Oregon',
  timestamp: '2024-09-26T14:30:00Z',
  category: 'Inspections',
  tags: ['Inspections', 'HUD', 'Section 8', 'UPCS'],
  upvotes: 8,
  isFollowing: false,
  views: 127,
  replyCount: 12,
  attachments: [
    { name: 'HUD_Inspection_Updates_Sept2024.pdf', size: '2.3 MB' },
    { name: 'UPCS_Changes_Summary.docx', size: '1.1 MB' }
  ],
  isMarkedHelpful: false,
  isDeleted: false
};

const mockReplies = [
  {
    id: 1,
    content: 'Thanks for sharing this, Sarah! We received similar guidance from our field office. The documentation requirements are definitely more stringent now.',
    author: 'Mike Rodriguez',
    role: 'Property Management',
    region: 'Washington',
    timestamp: '2024-09-26T15:45:00Z',
    upvotes: 3,
    reactions: [{ emoji: '👍', count: 2 }],
    parentId: null,
    isMarkedHelpful: true
  },
  {
    id: 2,
    content: 'Mike, have you updated your inspection checklists yet? We\'re struggling with the new photo requirements.',
    author: 'Jennifer Walsh',
    role: 'Inspector',
    region: 'Oregon',
    timestamp: '2024-09-26T16:20:00Z',
    upvotes: 1,
    reactions: [],
    parentId: 1,
    isMarkedHelpful: false
  }
];

export default function DiscussionDetail() {
  const { slug } = useParams();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-civic-gray/30">
        <div className="container mx-auto px-6 py-8">
          <div className="flex gap-8">
            {/* Main Content */}
            <div className="flex-1 max-w-4xl">
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-10 w-3/4 mb-6" />
              <Skeleton className="h-32 w-full mb-8" />
              <Skeleton className="h-64 w-full" />
            </div>
            
            {/* Sidebar */}
            <div className="w-80 hidden lg:block">
              <div className="space-y-6">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mockDiscussion.isDeleted) {
    return (
      <div className="min-h-screen bg-civic-gray/30 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-muted-foreground mb-4">Discussion Not Found</h1>
          <p className="text-muted-foreground mb-6">This discussion has been removed or doesn't exist.</p>
          <button 
            onClick={() => window.history.back()}
            className="text-civic-blue hover:text-civic-blue-dark"
          >
            ← Back to Discussions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-civic-gray/30">
      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 max-w-4xl space-y-8">
            <DiscussionHeader discussion={mockDiscussion} />
            <DiscussionBody discussion={mockDiscussion} />
            <DiscussionReplies 
              replies={mockReplies} 
              discussionId={mockDiscussion.id}
              totalReplies={mockDiscussion.replyCount}
            />
            <DiscussionComposer discussionId={mockDiscussion.id} />
          </div>
          
          {/* Sidebar */}
          <div className="w-80 hidden lg:block lg:sticky lg:top-8 lg:self-start">
            <DiscussionSidebar 
              discussion={mockDiscussion}
              userRole="Inspector" // Would come from auth context
            />
          </div>
        </div>
        
        {/* Mobile Sidebar */}
        <div className="lg:hidden mt-8">
          <DiscussionSidebar 
            discussion={mockDiscussion}
            userRole="Inspector"
          />
        </div>
      </div>
    </div>
  );
}