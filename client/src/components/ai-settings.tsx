import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Brain, 
  Sparkles, 
  MessageSquare, 
  TrendingUp, 
  Languages,
  Settings,
  Zap,
  Eye
} from "lucide-react";
import { aiService } from "@/lib/ai-service";
import { useToast } from "@/hooks/use-toast";

interface AISettingsProps {
  className?: string;
}

export function AISettings({ className }: AISettingsProps) {
  const [isAIEnabled, setIsAIEnabled] = useState(aiService.isAIEnabled());
  const [smartRepliesEnabled, setSmartRepliesEnabled] = useState(true);
  const [summaryEnabled, setSummaryEnabled] = useState(true);
  const [insightsEnabled, setInsightsEnabled] = useState(true);
  const [translationEnabled, setTranslationEnabled] = useState(false);
  const { toast } = useToast();

  const handleAIToggle = (enabled: boolean) => {
    setIsAIEnabled(enabled);
    aiService.setEnabled(enabled);
    
    toast({
      title: enabled ? "AI Assistant Enabled" : "AI Assistant Disabled",
      description: enabled ? 
        "Smart replies, summaries, and insights are now active" :
        "All AI features have been disabled",
    });
  };

  const handleFeatureToggle = (feature: string, enabled: boolean) => {
    switch (feature) {
      case 'smartReplies':
        setSmartRepliesEnabled(enabled);
        break;
      case 'summary':
        setSummaryEnabled(enabled);
        break;
      case 'insights':
        setInsightsEnabled(enabled);
        break;
      case 'translation':
        setTranslationEnabled(enabled);
        break;
    }
    
    toast({
      title: `${feature} ${enabled ? 'Enabled' : 'Disabled'}`,
      description: `AI ${feature} feature is now ${enabled ? 'active' : 'disabled'}`,
    });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-purple-500" />
          <span>AI Assistant Settings</span>
          <Badge variant="secondary" className="text-xs">
            WizSpeek® AI
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Master AI Toggle */}
        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-1">
            <Label htmlFor="ai-master" className="text-base font-medium flex items-center space-x-2">
              <Zap className="h-4 w-4 text-purple-500" />
              <span>AI Assistant</span>
            </Label>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enable or disable all AI-powered features
            </p>
          </div>
          <Switch
            id="ai-master"
            checked={isAIEnabled}
            onCheckedChange={handleAIToggle}
          />
        </div>

        <hr className="border-gray-200 dark:border-gray-700" />

        {/* Individual Feature Controls */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            AI Features
          </h4>
          
          {/* Smart Replies */}
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-1">
              <Label htmlFor="smart-replies" className="text-sm font-medium flex items-center space-x-2">
                <MessageSquare className="h-3 w-3 text-blue-500" />
                <span>Smart Replies</span>
              </Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                AI-generated response suggestions
              </p>
            </div>
            <Switch
              id="smart-replies"
              checked={smartRepliesEnabled && isAIEnabled}
              onCheckedChange={(checked) => handleFeatureToggle('smartReplies', checked)}
              disabled={!isAIEnabled}
            />
          </div>

          {/* Message Summary */}
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-1">
              <Label htmlFor="summary" className="text-sm font-medium flex items-center space-x-2">
                <Sparkles className="h-3 w-3 text-green-500" />
                <span>Message Summary</span>
              </Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Automatic conversation summaries
              </p>
            </div>
            <Switch
              id="summary"
              checked={summaryEnabled && isAIEnabled}
              onCheckedChange={(checked) => handleFeatureToggle('summary', checked)}
              disabled={!isAIEnabled}
            />
          </div>

          {/* Conversation Insights */}
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-1">
              <Label htmlFor="insights" className="text-sm font-medium flex items-center space-x-2">
                <TrendingUp className="h-3 w-3 text-orange-500" />
                <span>Conversation Insights</span>
              </Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Analytics and communication patterns
              </p>
            </div>
            <Switch
              id="insights"
              checked={insightsEnabled && isAIEnabled}
              onCheckedChange={(checked) => handleFeatureToggle('insights', checked)}
              disabled={!isAIEnabled}
            />
          </div>

          {/* Translation */}
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-1">
              <Label htmlFor="translation" className="text-sm font-medium flex items-center space-x-2">
                <Languages className="h-3 w-3 text-purple-500" />
                <span>Auto Translation</span>
                <Badge variant="outline" className="text-xs">
                  Coming Soon
                </Badge>
              </Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Automatic message translation
              </p>
            </div>
            <Switch
              id="translation"
              checked={translationEnabled && isAIEnabled}
              onCheckedChange={(checked) => handleFeatureToggle('translation', checked)}
              disabled={!isAIEnabled}
            />
          </div>
        </div>

        <hr className="border-gray-200 dark:border-gray-700" />

        {/* AI Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">AI Status</span>
            <Badge 
              variant={isAIEnabled ? "default" : "outline"}
              className={isAIEnabled ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : ""}
            >
              {isAIEnabled ? "Active" : "Inactive"}
            </Badge>
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <div className="flex items-center space-x-2">
              <Eye className="h-3 w-3" />
              <span>All AI processing is done securely on WizSpeek® servers</span>
            </div>
            <div className="flex items-center space-x-2">
              <Settings className="h-3 w-3" />
              <span>AI features can be toggled individually</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {isAIEnabled && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Quick Actions
            </h4>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" className="text-xs">
                <Brain className="h-3 w-3 mr-1" />
                Test AI
              </Button>
              <Button size="sm" variant="outline" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                Reset Preferences
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}