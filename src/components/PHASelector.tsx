import React, { useState } from 'react';
import { Check, ChevronsUpDown, Building2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useHousingAuthorities } from '@/hooks/useHousingAuthorities';
import { cn } from '@/lib/utils';
import type { HousingAuthority } from '@/contexts/PHAContext';

interface PHASelectorProps {
  value?: string;
  onSelect: (pha: HousingAuthority) => void;
  className?: string;
}

export function PHASelector({ value, onSelect, className }: PHASelectorProps) {
  const [open, setOpen] = useState(false);
  const { phas, phasByRegion, isLoading } = useHousingAuthorities();

  const selectedPHA = phas.find((pha) => pha.id === value);

  if (isLoading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="h-10 bg-muted rounded-md" />
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
        >
          {selectedPHA ? (
            <div className="flex items-center gap-2 truncate">
              <Building2 className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{selectedPHA.name}</span>
              {selectedPHA.region && (
                <Badge variant="outline" className="text-xs">
                  {selectedPHA.region}
                </Badge>
              )}
            </div>
          ) : (
            <>
              <span className="text-muted-foreground">Select housing authority...</span>
            </>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search housing authorities..." />
          <CommandEmpty>No housing authority found.</CommandEmpty>
          {Object.entries(phasByRegion).map(([region, regionPHAs]) => (
            <CommandGroup key={region} heading={region}>
              {regionPHAs.map((pha) => (
                <CommandItem
                  key={pha.id}
                  value={pha.name}
                  onSelect={() => {
                    onSelect(pha);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === pha.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{pha.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {pha.state && (
                        <Badge variant="outline" className="text-xs">
                          {pha.state}
                        </Badge>
                      )}
                      {pha.size_category && (
                        <Badge variant="secondary" className="text-xs">
                          {pha.size_category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </Command>
      </PopoverContent>
    </Popover>
  );
}




