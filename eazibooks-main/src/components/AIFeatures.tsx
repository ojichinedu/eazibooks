import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Sparkles, Loader2, Tag, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface AIFeaturesProps {
  type: 'categorization' | 'insights' | 'suggestions';
  data?: any;
}

export function AIFeatures({ type, data }: AIFeaturesProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCategorization = async (description: string, amount?: number, vendor?: string) => {
    setIsProcessing(true);
    setResult(null);

    try {
      // Note: AI Categorization requires Supabase Edge Functions to be deployed
      toast.error('AI Categorization requires Edge Functions with OpenAI API to be deployed.');
      throw new Error('Edge Functions not deployed');
    } catch (error) {
      console.error('Categorization error:', error);
      toast.error('AI Features unavailable. Please deploy Supabase Edge Functions.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (type === 'categorization') {
    return (
      <Card className="p-4 border-blue-200 bg-blue-50/50">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h4 className="font-medium mb-1 text-sm">AI-Powered Categorization</h4>
              <p className="text-xs text-muted-foreground">
                Get smart category suggestions based on transaction details
              </p>
            </div>

            {result && (
              <div className="space-y-2 p-3 bg-white rounded-lg border">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Suggested Category</Label>
                  <Badge 
                    variant={result.confidence === 'high' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {result.confidence} confidence
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">{result.category}</span>
                  {result.subcategory && (
                    <>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-muted-foreground">{result.subcategory}</span>
                    </>
                  )}
                </div>
                {result.taxDeductible !== undefined && (
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className="text-xs">
                      {result.taxDeductible ? 'Tax Deductible' : 'Not Tax Deductible'}
                    </Badge>
                  </div>
                )}
              </div>
            )}

            <Button 
              size="sm" 
              onClick={() => handleCategorization(data?.description || 'Sample expense', data?.amount, data?.vendor)}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 mr-2" />
                  Get AI Suggestion
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return null;
}

// Inline AI suggestion component for forms
export function InlineAISuggestion({ 
  description, 
  onSuggestion 
}: { 
  description: string; 
  onSuggestion: (category: string, subcategory?: string) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<any>(null);

  const getSuggestion = async () => {
    if (!description) return;
    
    setIsLoading(true);
    try {
      // Note: AI Categorization requires Supabase Edge Functions to be deployed
      toast.error('AI Features require Edge Functions to be deployed.');
    } catch (error) {
      console.error('Failed to get suggestion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applySuggestion = () => {
    if (suggestion) {
      onSuggestion(suggestion.category, suggestion.subcategory);
      toast.success('Category applied!');
    }
  };

  return (
    <div className="space-y-2">
      {!suggestion ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={getSuggestion}
          disabled={isLoading || !description}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
              Getting AI suggestion...
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3 mr-2" />
              Get AI Category Suggestion
            </>
          )}
        </Button>
      ) : (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-blue-900">AI Suggestion</span>
            <Badge variant="secondary" className="text-xs">
              {suggestion.confidence}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {suggestion.category}
              {suggestion.subcategory && ` / ${suggestion.subcategory}`}
            </span>
            <Button
              type="button"
              size="sm"
              onClick={applySuggestion}
              className="h-7 text-xs"
            >
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// AI Insights Card for dashboard
export function AIInsightsCard() {
  return (
    <Card className="p-6 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-medium">AI Insights</h3>
              <p className="text-xs text-muted-foreground">Powered by OpenAI</p>
            </div>
          </div>
          <Badge className="bg-purple-600">AI</Badge>
        </div>

        <div className="space-y-3">
          <div className="flex gap-3 p-3 bg-white rounded-lg border">
            <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Revenue Trend</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your revenue is up 15% compared to last month. Consider increasing inventory for high-demand items.
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-3 bg-white rounded-lg border">
            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Payment Reminder</p>
              <p className="text-xs text-muted-foreground mt-1">
                5 invoices are pending payment for more than 30 days. Consider sending payment reminders.
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-3 bg-white rounded-lg border">
            <Tag className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Cost Optimization</p>
              <p className="text-xs text-muted-foreground mt-1">
                Office supplies expenses increased by 25%. Review vendor pricing for potential savings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
