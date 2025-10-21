import React from 'react';
import { Building2, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCurrentPHA } from '@/contexts/PHAContext';

export function PHADisplay() {
  const { currentPHA, isLoading } = useCurrentPHA();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <div className="h-4 w-4 bg-muted rounded" />
        <div className="h-4 w-24 bg-muted rounded" />
      </div>
    );
  }

  if (!currentPHA) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">
          {currentPHA.name}
        </span>
        {currentPHA.region && (
          <Badge variant="outline" className="text-xs">
            <MapPin className="h-3 w-3 mr-1" />
            {currentPHA.region}
          </Badge>
        )}
        {currentPHA.size_category && (
          <Badge variant="secondary" className="text-xs">
            {currentPHA.size_category}
          </Badge>
        )}
      </div>
    </div>
  );
}




