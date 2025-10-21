import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChannels } from '@/hooks/useChannels';
import { 
  Search, 
  Plus, 
  Hash, 
  Users, 
  FileText, 
  AlertTriangle, 
  Monitor, 
  DollarSign,
  MessageCircle
} from 'lucide-react';

interface ChannelListProps {
  onChannelSelect: (channelId: string) => void;
  selectedChannelId: string | null;
  userRole: string;
}

const categoryIcons = {
  general: MessageCircle,
  inspections: FileText,
  hcv: Users,
  compliance: AlertTriangle,
  it: Monitor,
  finance: DollarSign,
};

const categoryLabels = {
  general: 'General',
  inspections: 'Inspections',
  hcv: 'HCV',
  compliance: 'Compliance',
  it: 'IT',
  finance: 'Finance',
};

export function ChannelList({ onChannelSelect, selectedChannelId, userRole }: ChannelListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Use the custom useChannels hook for fetching and real-time updates
  const { channels, channelsByCategory, isLoading: loading, error } = useChannels();
  
  if (error) {
    console.error('Error loading channels:', error);
  }

  // Filter channels based on search query
  const filteredChannels = searchQuery
    ? channels.filter(channel => 
        channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (channel.description && channel.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : channels;

  // Group filtered channels by category
  const groupedChannels = searchQuery
    ? filteredChannels.reduce((acc, channel) => {
        if (!acc[channel.category]) {
          acc[channel.category] = [];
        }
        acc[channel.category].push(channel);
        return acc;
      }, {} as Record<string, typeof channels>)
    : channelsByCategory;

  const handleNewChannel = () => {
    // TODO: Implement new channel creation modal
    console.log('Create new channel');
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-10 bg-muted rounded animate-pulse" />
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Channels</h2>
          <Button 
            size="sm" 
            variant="civic" 
            onClick={handleNewChannel}
            className="h-8 px-3"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-2 border-b border-border">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="joined">Joined</TabsTrigger>
            <TabsTrigger value="public">Public</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Channel List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {Object.entries(groupedChannels).map(([category, categoryChannels]) => {
            const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons] || Hash;
            
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    {categoryLabels[category as keyof typeof categoryLabels] || category}
                  </h3>
                </div>
                <div className="space-y-1">
                  {categoryChannels.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => onChannelSelect(channel.id)}
                      className={`
                        w-full text-left p-3 rounded-lg transition-all duration-200 group
                        ${selectedChannelId === channel.id 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'hover:bg-accent hover:text-accent-foreground'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Hash className="h-4 w-4 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{channel.name}</p>
                            {channel.description && (
                              <p className={`text-xs truncate ${
                                selectedChannelId === channel.id 
                                  ? 'text-primary-foreground/70' 
                                  : 'text-muted-foreground'
                              }`}>
                                {channel.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${
                              selectedChannelId === channel.id 
                                ? 'bg-primary-foreground/20 text-primary-foreground' 
                                : ''
                            }`}
                          >
                            {channel.member_count}
                          </Badge>
                          {/* Unread badge - TODO: implement unread count */}
                          {false && (
                            <Badge 
                              variant="destructive" 
                              className="h-5 w-5 p-0 text-xs flex items-center justify-center"
                            >
                              3
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}