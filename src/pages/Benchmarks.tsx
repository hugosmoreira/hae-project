import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Clock, CheckCircle, Home, Users, Wrench, Upload, Plus, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';

// Mock data for metrics
const mockMetrics = [
  {
    id: 'voucher-processing',
    name: 'Voucher Processing Time',
    value: '4.3 days',
    trend: '+5%',
    trendDirection: 'up' as const,
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    sparklineData: [
      { name: 'Jan', value: 4.8 },
      { name: 'Feb', value: 4.5 },
      { name: 'Mar', value: 4.2 },
      { name: 'Apr', value: 4.3 },
      { name: 'May', value: 4.1 },
      { name: 'Jun', value: 4.3 }
    ]
  },
  {
    id: 'inspection-success',
    name: 'Average Inspection Success Rate',
    value: '92%',
    trend: '-2%',
    trendDirection: 'down' as const,
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    sparklineData: [
      { name: 'Jan', value: 94 },
      { name: 'Feb', value: 93 },
      { name: 'Mar', value: 95 },
      { name: 'Apr', value: 92 },
      { name: 'May', value: 91 },
      { name: 'Jun', value: 92 }
    ]
  },
  {
    id: 'unit-turnaround',
    name: 'Unit Turnaround (days)',
    value: '6.8',
    trend: '+3%',
    trendDirection: 'up' as const,
    icon: Home,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    sparklineData: [
      { name: 'Jan', value: 7.2 },
      { name: 'Feb', value: 6.9 },
      { name: 'Mar', value: 6.5 },
      { name: 'Apr', value: 6.8 },
      { name: 'May', value: 6.6 },
      { name: 'Jun', value: 6.8 }
    ]
  },
  {
    id: 'portability-cases',
    name: 'Tenant Portability Cases / Month',
    value: '37',
    trend: '-1%',
    trendDirection: 'down' as const,
    icon: Users,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    sparklineData: [
      { name: 'Jan', value: 35 },
      { name: 'Feb', value: 38 },
      { name: 'Mar', value: 40 },
      { name: 'Apr', value: 37 },
      { name: 'May', value: 36 },
      { name: 'Jun', value: 37 }
    ]
  },
  {
    id: 'work-order-completion',
    name: 'Work-Order Completion Time',
    value: '2.5 days',
    trend: '+4%',
    trendDirection: 'up' as const,
    icon: Wrench,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    sparklineData: [
      { name: 'Jan', value: 2.8 },
      { name: 'Feb', value: 2.6 },
      { name: 'Mar', value: 2.4 },
      { name: 'Apr', value: 2.5 },
      { name: 'May', value: 2.3 },
      { name: 'Jun', value: 2.5 }
    ]
  }
];

// Mock comparison data
const comparisonData = [
  { name: 'Your Authority', voucherProcessing: 4.3, inspectionSuccess: 92, unitTurnaround: 6.8, portabilityCases: 37, workOrderCompletion: 2.5 },
  { name: 'Regional Average', voucherProcessing: 5.1, inspectionSuccess: 89, unitTurnaround: 7.2, portabilityCases: 42, workOrderCompletion: 3.1 },
  { name: 'Top Performer', voucherProcessing: 3.8, inspectionSuccess: 96, unitTurnaround: 5.9, portabilityCases: 28, workOrderCompletion: 2.1 }
];

const Benchmarks = () => {
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('voucher-processing');

  const MetricCard: React.FC<{ metric: typeof mockMetrics[0] }> = ({ metric }) => {
    const Icon = metric.icon;
    
        return (
          <Card className={cn(
            'card-elevated group hover:scale-105 transition-all duration-300 cursor-pointer',
            metric.borderColor
          )}>
            <CardHeader className="card-spacing pb-3">
              <div className="flex items-center justify-between">
                <div className={cn('p-2 rounded-lg', metric.bgColor)}>
                  <Icon className={cn('h-5 w-5', metric.color)} />
                </div>
                <div className="flex items-center gap-1">
                  {metric.trendDirection === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={cn(
                    'text-sm font-medium',
                    metric.trendDirection === 'up' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {metric.trend}
                  </span>
                </div>
              </div>
              <CardTitle className="text-heading text-lg">
                {metric.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="card-spacing pt-0">
              <div className="space-y-4">
                <div className="text-3xl font-bold text-foreground">
                  {metric.value}
                </div>
            
            {/* Mini sparkline chart */}
            <div className="h-16 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metric.sparklineData}>
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={metric.color.replace('text-', '#')} 
                    fill={metric.bgColor.replace('bg-', '#')}
                    strokeWidth={2}
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <SEO
        title="Benchmarks & Metrics"
        description="Compare key operational data across housing authorities. Track performance metrics, analyze trends, and benchmark your housing authority against peers nationwide."
        keywords="housing authority benchmarks, performance metrics, housing data, operational metrics, housing statistics, public housing performance"
        url="/benchmarks"
      />
      <div className="container mx-auto max-w-7xl section-spacing page-transition">
        <PageHeader
          title="Benchmarks & Metrics"
          description="Compare key operational data across housing authorities."
        />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 fade-in-up stagger-1">
        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Select region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            <SelectItem value="northwest">Northwest</SelectItem>
            <SelectItem value="southwest">Southwest</SelectItem>
            <SelectItem value="northeast">Northeast</SelectItem>
            <SelectItem value="southeast">Southeast</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedMetric} onValueChange={setSelectedMetric}>
          <SelectTrigger className="w-full sm:w-[250px]">
            <SelectValue placeholder="Select metric" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="voucher-processing">Voucher Processing Time</SelectItem>
            <SelectItem value="inspection-success">Inspection Success Rate</SelectItem>
            <SelectItem value="unit-turnaround">Unit Turnaround</SelectItem>
            <SelectItem value="portability-cases">Portability Cases</SelectItem>
            <SelectItem value="work-order-completion">Work Order Completion</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" className="btn-outline w-full sm:w-auto">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 fade-in-up stagger-2">
        {mockMetrics.map((metric, index) => (
          <div key={metric.id} className={`fade-in-up stagger-${index + 3}`}>
            <MetricCard metric={metric} />
          </div>
        ))}
      </div>

          {/* Comparison Chart */}
          <Card className="card-base mb-8 fade-in-up stagger-3">
            <CardHeader className="card-spacing">
              <CardTitle className="text-heading text-2xl">
                Authority Comparison
              </CardTitle>
              <CardDescription className="text-body">
                Compare your performance against regional averages and top performers
              </CardDescription>
            </CardHeader>
            <CardContent className="card-spacing">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="voucherProcessing" fill="#007BC3" name="Voucher Processing (days)" />
                <Bar dataKey="inspectionSuccess" fill="#00AEEF" name="Inspection Success (%)" />
                <Bar dataKey="unitTurnaround" fill="#8B5CF6" name="Unit Turnaround (days)" />
                <Bar dataKey="portabilityCases" fill="#F59E0B" name="Portability Cases" />
                <Bar dataKey="workOrderCompletion" fill="#6366F1" name="Work Order Completion (days)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

          {/* Future Expansion Actions */}
          <Card className="card-base fade-in-up stagger-4">
            <CardHeader className="card-spacing">
              <CardTitle className="text-heading text-xl">
                Additional Features
              </CardTitle>
              <CardDescription className="text-body">
                Coming soon - enhanced benchmarking capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="card-spacing">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button variant="outline" className="btn-outline h-20 flex flex-col items-center justify-center gap-2">
                  <Plus className="h-6 w-6" />
                  <span className="font-medium">Add Custom Metric</span>
                </Button>
                
                <Button variant="outline" className="btn-outline h-20 flex flex-col items-center justify-center gap-2">
                  <Upload className="h-6 w-6" />
                  <span className="font-medium">Upload CSV Data</span>
                </Button>
                
                <Button variant="outline" className="btn-outline h-20 flex flex-col items-center justify-center gap-2">
                  <Filter className="h-6 w-6" />
                  <span className="font-medium">Compare by Region</span>
                </Button>
              </div>
            </CardContent>
          </Card>
      </div>
    </>
  );
};

export default Benchmarks;