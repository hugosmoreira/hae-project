import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Bug } from 'lucide-react';

/**
 * Test component to demonstrate ErrorBoundary functionality
 * This component can be used to test error handling in development
 */
export const ErrorTestComponent: React.FC = () => {
  const [shouldError, setShouldError] = useState(false);

  // This will trigger an error when shouldError is true
  if (shouldError) {
    throw new Error('This is a test error to demonstrate ErrorBoundary functionality');
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bug className="h-5 w-5 text-orange-500" />
          <CardTitle className="text-lg">Error Boundary Test</CardTitle>
        </div>
        <CardDescription>
          Click the button below to test the ErrorBoundary component
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Development Only</span>
            </div>
            <p className="text-sm text-orange-700 mt-1">
              This component is for testing purposes only and should not be used in production.
            </p>
          </div>
          
          <Button 
            onClick={() => setShouldError(true)}
            variant="destructive"
            className="w-full"
          >
            Trigger Test Error
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            This will cause the ErrorBoundary to catch the error and display the fallback UI.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ErrorTestComponent;
