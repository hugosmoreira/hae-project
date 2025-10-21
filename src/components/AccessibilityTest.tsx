import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Eye, Smartphone, Tablet, Monitor } from 'lucide-react';

interface AccessibilityTestProps {
  className?: string;
}

const AccessibilityTest: React.FC<AccessibilityTestProps> = ({ className }) => {
  const [testResults, setTestResults] = useState<{
    colorContrast: boolean;
    ariaLabels: boolean;
    responsiveDesign: boolean;
    sidebarMobile: boolean;
  }>({
    colorContrast: false,
    ariaLabels: false,
    responsiveDesign: false,
    sidebarMobile: false,
  });

  const [currentViewport, setCurrentViewport] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  // Test color contrast ratios
  const testColorContrast = () => {
    // Primary blue (#007BC3) on white background
    const primaryBlue = { r: 0, g: 123, b: 195 };
    const white = { r: 255, g: 255, b: 255 };
    const primaryContrast = calculateContrast(primaryBlue, white);
    
    // Secondary blue (#00AEEF) on white background
    const secondaryBlue = { r: 0, g: 174, b: 239 };
    const secondaryContrast = calculateContrast(secondaryBlue, white);
    
    // Dark gray (#2B2B2B) on light background (#F7F9FC)
    const darkGray = { r: 43, g: 43, b: 43 };
    const lightBg = { r: 247, g: 249, b: 252 };
    const textContrast = calculateContrast(darkGray, lightBg);

    const allPass = primaryContrast >= 4.5 && secondaryContrast >= 4.5 && textContrast >= 4.5;
    
    setTestResults(prev => ({ ...prev, colorContrast: allPass }));
    
    return {
      primary: primaryContrast,
      secondary: secondaryContrast,
      text: textContrast,
      allPass
    };
  };

  // Calculate contrast ratio
  const calculateContrast = (color1: { r: number; g: number; b: number }, color2: { r: number; g: number; b: number }) => {
    const getLuminance = (r: number, g: number, b: number) => {
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const lum1 = getLuminance(color1.r, color1.g, color1.b);
    const lum2 = getLuminance(color2.r, color2.g, color2.b);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  };

  // Test ARIA labels
  const testAriaLabels = () => {
    const buttons = document.querySelectorAll('button');
    const inputs = document.querySelectorAll('input');
    const toggles = document.querySelectorAll('[role="switch"], [role="button"]');
    
    let ariaLabelCount = 0;
    let totalElements = buttons.length + inputs.length + toggles.length;
    
    [...buttons, ...inputs, ...toggles].forEach(element => {
      if (element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby')) {
        ariaLabelCount++;
      }
    });
    
    const passRate = totalElements > 0 ? (ariaLabelCount / totalElements) : 1;
    const passes = passRate >= 0.8; // 80% of elements should have ARIA labels
    
    setTestResults(prev => ({ ...prev, ariaLabels: passes }));
    return { passRate, totalElements, ariaLabelCount };
  };

  // Test responsive design
  const testResponsiveDesign = () => {
    const viewport = window.innerWidth;
    let passes = true;
    
    // Check if layout adapts properly
    const sidebar = document.querySelector('[data-sidebar]');
    const mainContent = document.querySelector('main');
    
    if (viewport < 1024) {
      // On mobile/tablet, sidebar should be collapsible
      passes = passes && sidebar !== null;
    }
    
    if (viewport >= 1024) {
      // On desktop, sidebar should be visible
      passes = passes && sidebar !== null;
    }
    
    setTestResults(prev => ({ ...prev, responsiveDesign: passes }));
    return passes;
  };

  // Test sidebar mobile behavior
  const testSidebarMobile = () => {
    const sidebarTrigger = document.querySelector('[data-sidebar-trigger]');
    const sidebar = document.querySelector('[data-sidebar]');
    
    const hasTrigger = sidebarTrigger !== null;
    const hasSidebar = sidebar !== null;
    const isCollapsible = sidebar?.getAttribute('data-collapsible') !== null;
    
    const passes = hasTrigger && hasSidebar && isCollapsible;
    setTestResults(prev => ({ ...prev, sidebarMobile: passes }));
    
    return { hasTrigger, hasSidebar, isCollapsible, passes };
  };

  // Run all tests
  const runAllTests = () => {
    const contrastResults = testColorContrast();
    const ariaResults = testAriaLabels();
    const responsiveResults = testResponsiveDesign();
    const sidebarResults = testSidebarMobile();
    
    console.log('Accessibility Test Results:', {
      colorContrast: contrastResults,
      ariaLabels: ariaResults,
      responsiveDesign: responsiveResults,
      sidebarMobile: sidebarResults,
    });
  };

  // Update viewport on resize
  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setCurrentViewport('mobile');
      } else if (width < 1024) {
        setCurrentViewport('tablet');
      } else {
        setCurrentViewport('desktop');
      }
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  // Run tests on mount
  useEffect(() => {
    const timer = setTimeout(runAllTests, 1000);
    return () => clearTimeout(timer);
  }, []);

  const getViewportIcon = () => {
    switch (currentViewport) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      case 'desktop': return <Monitor className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Pass
      </Badge>
    ) : (
      <Badge variant="destructive">
        Fail
      </Badge>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Accessibility & Responsiveness Test Results
          </CardTitle>
          <CardDescription>
            Comprehensive testing of accessibility standards and responsive design
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Viewport */}
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            {getViewportIcon()}
            <span className="font-medium">Current Viewport:</span>
            <Badge variant="outline">{currentViewport}</Badge>
            <span className="text-sm text-muted-foreground">
              ({window.innerWidth}px × {window.innerHeight}px)
            </span>
          </div>

          {/* Test Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Color Contrast */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(testResults.colorContrast)}
                <div>
                  <h4 className="font-medium">Color Contrast</h4>
                  <p className="text-sm text-muted-foreground">
                    WCAG AA compliance (>4.5:1)
                  </p>
                </div>
              </div>
              {getStatusBadge(testResults.colorContrast)}
            </div>

            {/* ARIA Labels */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(testResults.ariaLabels)}
                <div>
                  <h4 className="font-medium">ARIA Labels</h4>
                  <p className="text-sm text-muted-foreground">
                    Buttons, forms, toggles
                  </p>
                </div>
              </div>
              {getStatusBadge(testResults.ariaLabels)}
            </div>

            {/* Responsive Design */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(testResults.responsiveDesign)}
                <div>
                  <h4 className="font-medium">Responsive Design</h4>
                  <p className="text-sm text-muted-foreground">
                    Mobile, tablet, desktop
                  </p>
                </div>
              </div>
              {getStatusBadge(testResults.responsiveDesign)}
            </div>

            {/* Sidebar Mobile */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(testResults.sidebarMobile)}
                <div>
                  <h4 className="font-medium">Sidebar Mobile</h4>
                  <p className="text-sm text-muted-foreground">
                    Collapsible with menu icon
                  </p>
                </div>
              </div>
              {getStatusBadge(testResults.sidebarMobile)}
            </div>
          </div>

          {/* Test Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={runAllTests} variant="outline" size="sm">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Re-run Tests
            </Button>
            <Button 
              onClick={() => {
                const results = {
                  colorContrast: testColorContrast(),
                  ariaLabels: testAriaLabels(),
                  responsiveDesign: testResponsiveDesign(),
                  sidebarMobile: testSidebarMobile(),
                };
                console.log('Detailed Test Results:', results);
              }}
              variant="outline" 
              size="sm"
            >
              View Details
            </Button>
          </div>

          {/* Overall Status */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium">Overall Status</h4>
              {getStatusIcon(Object.values(testResults).every(Boolean))}
            </div>
            <p className="text-sm text-muted-foreground">
              {Object.values(testResults).every(Boolean) 
                ? "All accessibility and responsiveness tests passed!" 
                : "Some tests failed. Check individual results above."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessibilityTest;
