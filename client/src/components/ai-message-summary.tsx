import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  TrendingUp, 
  Clock, 
  Target, 
  Brain,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Download,
  Share
} from "lucide-react";
import { aiService, type MessageSummary, type ConversationInsights } from "@/lib/ai-service";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface MessageSummaryProps {
  conversationId: number;
  messageCount?: number;
  className?: string;
}

export function AIMessageSummary({ 
  conversationId, 
  messageCount = 10, 
  className 
}: MessageSummaryProps) {
  const [summary, setSummary] = useState<MessageSummary | null>(null);
  const [insights, setInsights] = useState<ConversationInsights | null>(null);
  const [isLoading, setSummaryLoading] = useState(false);
  const [isInsightsLoading, setInsightsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (aiService.isAIEnabled()) {
      generateSummary();
    }
  }, [conversationId, messageCount]);

  const generateSummary = async () => {
    setSummaryLoading(true);
    try {
      const summaryData = await aiService.summarizeMessages(conversationId, messageCount);
      setSummary(summaryData);
    } catch (error) {
      console.error("Failed to generate summary:", error);
      toast({
        title: "AI Summary",
        description: "Unable to generate message summary",
        variant: "destructive"
      });
    } finally {
      setSummaryLoading(false);
    }
  };

  const generateInsights = async () => {
    setInsightsLoading(true);
    try {
      const insightsData = await aiService.getConversationInsights(conversationId);
      setInsights(insightsData);
      setShowInsights(true);
    } catch (error) {
      console.error("Failed to generate insights:", error);
      toast({
        title: "AI Insights",
        description: "Unable to generate conversation insights",
        variant: "destructive"
      });
    } finally {
      setInsightsLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'negative':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'neutral':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😟';
      case 'neutral': return '😐';
      default: return '🤔';
    }
  };

  const handleExport = () => {
    if (!summary) return;
    
    const exportData = {
      summary: summary.summary,
      keyPoints: summary.keyPoints,
      actionItems: summary.actionItems,
      sentiment: summary.sentiment,
      generatedAt: new Date().toISOString(),
      conversationId
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-summary-${conversationId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Summary Exported",
      description: "Conversation summary downloaded successfully"
    });
  };

  if (!aiService.isAIEnabled()) {
    return null;
  }

  return (
    <Card className={cn("border-blue-200 dark:border-blue-800", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center space-x-2">
            <Brain className="h-4 w-4 text-blue-500" />
            <span>AI Conversation Summary</span>
            {isLoading && (
              <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
            )}
          </CardTitle>
          <div className="flex items-center space-x-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={generateSummary}
              disabled={isLoading}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleExport}
              disabled={!summary}
              className="h-6 w-6 p-0"
            >
              <Download className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center space-x-3 py-4">
            <div className="animate-pulse">
              <FileText className="h-4 w-4 text-blue-500" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              AI is analyzing {messageCount} recent messages...
            </span>
          </div>
        )}

        {/* Summary Content */}
        {summary && !isLoading && (
          <>
            {/* Quick Summary */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Summary</span>
                <Badge 
                  variant="outline" 
                  className={getSentimentColor(summary.sentiment)}
                >
                  {getSentimentIcon(summary.sentiment)} {summary.sentiment}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {Math.round(summary.confidenceScore * 100)}% confidence
                </Badge>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                {summary.summary}
              </p>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <>
                {/* Key Points */}
                {summary.keyPoints.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Key Points</span>
                    </div>
                    <ScrollArea className="max-h-32">
                      <ul className="space-y-1">
                        {summary.keyPoints.map((point, index) => (
                          <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start space-x-2">
                            <span className="text-green-500 mt-1">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </div>
                )}

                {/* Action Items */}
                {summary.actionItems.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">Action Items</span>
                    </div>
                    <ScrollArea className="max-h-32">
                      <ul className="space-y-1">
                        {summary.actionItems.map((item, index) => (
                          <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start space-x-2">
                            <span className="text-orange-500 mt-1">→</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </div>
                )}

                {/* Conversation Insights Button */}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={generateInsights}
                    disabled={isInsightsLoading}
                    className="w-full"
                  >
                    {isInsightsLoading ? (
                      <>
                        <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                        Analyzing Conversation...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-3 w-3 mr-2" />
                        View Conversation Insights
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </>
        )}

        {/* Conversation Insights */}
        {showInsights && insights && (
          <Card className="border-purple-200 dark:border-purple-800 mt-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs flex items-center space-x-2">
                <TrendingUp className="h-3 w-3 text-purple-500" />
                <span>Conversation Analytics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-gray-500">Total Messages</span>
                  <p className="font-medium">{insights.totalMessages}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-500">Avg Response Time</span>
                  <p className="font-medium">{insights.averageResponseTime}min</p>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-gray-500">Communication Pattern</span>
                <p className="font-medium">{insights.communicationPattern}</p>
              </div>
              {insights.topicsDiscussed.length > 0 && (
                <div className="space-y-1">
                  <span className="text-gray-500">Topics Discussed</span>
                  <div className="flex flex-wrap gap-1">
                    {insights.topicsDiscussed.slice(0, 3).map((topic, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!summary && !isLoading && (
          <div className="text-center py-4">
            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No messages to summarize</p>
            <Button
              size="sm"
              variant="outline"
              onClick={generateSummary}
              className="mt-2"
            >
              Generate Summary
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}