import React, { useState } from 'react';
import { Search, ThumbsUp, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

const KnowledgeBase = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: articles, isLoading } = useQuery({
    queryKey: ['knowledge-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_articles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Fetch author profiles separately
      const articlesWithAuthors = await Promise.all(
        data.map(async (article) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', article.author_id)
            .single();
          
          return { ...article, author: profile };
        })
      );
      
      return articlesWithAuthors;
    },
  });

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      compliance: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      inspections: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      finance: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'it-yardi': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      programs: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      policies: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    };
    return colors[cat] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      'it-yardi': 'IT/Yardi',
      compliance: 'Compliance',
      inspections: 'Inspections',
      finance: 'Finance',
      programs: 'Programs',
      policies: 'Policies',
    };
    return labels[cat] || cat;
  };

  const filteredArticles = articles?.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === 'all' || article.category === category;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'popular') {
      return b.helpful_count - a.helpful_count;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Knowledge Base</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Article
        </Button>
      </div>
      
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search knowledge articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Dropdown */}
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="compliance">Compliance</SelectItem>
            <SelectItem value="inspections">Inspections</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="it-yardi">IT/Yardi</SelectItem>
            <SelectItem value="programs">Programs</SelectItem>
            <SelectItem value="policies">Policies</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Dropdown */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Articles Grid */}
      {isLoading ? (
        <div className="text-center text-muted-foreground">Loading articles...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles?.map((article) => (
            <Card key={article.id} className="hover:shadow-lg transition-shadow cursor-pointer border-border bg-card">
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge className={getCategoryColor(article.category)}>
                    {getCategoryLabel(article.category)}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{article.helpful_count}</span>
                  </div>
                </div>
                <CardTitle className="text-xl leading-tight hover:text-primary transition-colors">
                  {article.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {article.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>By {article.author?.username || 'Unknown'}</span>
                  <span>{formatDistanceToNow(new Date(article.updated_at), { addSuffix: true })}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredArticles && filteredArticles.length === 0 && !isLoading && (
        <div className="text-center text-muted-foreground py-12">
          No articles found. Try adjusting your search or filters.
        </div>
      )}
      
      {/* Add Article Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Article</DialogTitle>
            <DialogDescription>
              Coming soon: Add new article feature.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 text-center text-muted-foreground">
            This feature will allow you to create and publish new knowledge base articles.
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KnowledgeBase;