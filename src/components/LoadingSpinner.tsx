import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse';
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'spinner',
  className,
  text,
  fullScreen = false
}) => {
  const spinnerClasses = cn(
    'animate-spin rounded-full border-2 border-muted border-t-primary',
    sizeClasses[size],
    className
  );

  const dotsClasses = cn(
    'flex space-x-1',
    size === 'sm' && 'space-x-0.5',
    size === 'lg' && 'space-x-2',
    size === 'xl' && 'space-x-3'
  );

  const dotClasses = cn(
    'rounded-full bg-primary animate-pulse',
    size === 'sm' && 'h-1 w-1',
    size === 'md' && 'h-2 w-2',
    size === 'lg' && 'h-3 w-3',
    size === 'xl' && 'h-4 w-4'
  );

  const pulseClasses = cn(
    'rounded-full bg-primary animate-pulse',
    sizeClasses[size]
  );

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className={dotsClasses}>
            <div className={cn(dotClasses, 'animate-bounce')} style={{ animationDelay: '0ms' }} />
            <div className={cn(dotClasses, 'animate-bounce')} style={{ animationDelay: '150ms' }} />
            <div className={cn(dotClasses, 'animate-bounce')} style={{ animationDelay: '300ms' }} />
          </div>
        );
      case 'pulse':
        return <div className={pulseClasses} />;
      default:
        return <div className={spinnerClasses} />;
    }
  };

  const content = (
    <div className="flex flex-col items-center justify-center space-y-3">
      {renderSpinner()}
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};

// Predefined loading spinner variants
export const LoadingSpinnerSmall: React.FC<Omit<LoadingSpinnerProps, 'size'>> = (props) => (
  <LoadingSpinner {...props} size="sm" />
);

export const LoadingSpinnerMedium: React.FC<Omit<LoadingSpinnerProps, 'size'>> = (props) => (
  <LoadingSpinner {...props} size="md" />
);

export const LoadingSpinnerLarge: React.FC<Omit<LoadingSpinnerProps, 'size'>> = (props) => (
  <LoadingSpinner {...props} size="lg" />
);

export const LoadingSpinnerExtraLarge: React.FC<Omit<LoadingSpinnerProps, 'size'>> = (props) => (
  <LoadingSpinner {...props} size="xl" />
);

// Loading dots variants
export const LoadingDots: React.FC<Omit<LoadingSpinnerProps, 'variant'>> = (props) => (
  <LoadingSpinner {...props} variant="dots" />
);

export const LoadingPulse: React.FC<Omit<LoadingSpinnerProps, 'variant'>> = (props) => (
  <LoadingSpinner {...props} variant="pulse" />
);

// Full screen loading overlay
export const LoadingOverlay: React.FC<Omit<LoadingSpinnerProps, 'fullScreen'>> = (props) => (
  <LoadingSpinner {...props} fullScreen />
);

export default LoadingSpinner;
