import { apiRequest } from "./queryClient";

export interface MessageSummary {
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  confidenceScore: number;
}

export interface SmartReply {
  id: string;
  content: string;
  type: 'quick' | 'detailed' | 'question' | 'confirmation';
  confidence: number;
  tone: 'professional' | 'casual' | 'friendly' | 'formal';
}

export interface ConversationInsights {
  totalMessages: number;
  averageResponseTime: number;
  topicsDiscussed: string[];
  communicationPattern: string;
  lastActiveTime: string;
}

class AIService {
  private isEnabled: boolean = true;

  async summarizeMessages(conversationId: number, messageCount: number = 10): Promise<MessageSummary> {
    try {
      const response = await apiRequest("POST", "/api/ai/summarize", {
        conversationId,
        messageCount
      });
      return response.json();
    } catch (error) {
      console.error("Failed to summarize messages:", error);
      throw new Error("Failed to generate message summary");
    }
  }

  async generateSmartReplies(conversationId: number, lastMessageId: number): Promise<SmartReply[]> {
    try {
      const response = await apiRequest("POST", "/api/ai/smart-replies", {
        conversationId,
        lastMessageId
      });
      return response.json();
    } catch (error) {
      console.error("Failed to generate smart replies:", error);
      return this.getFallbackReplies();
    }
  }

  async getConversationInsights(conversationId: number): Promise<ConversationInsights> {
    try {
      const response = await apiRequest("GET", `/api/ai/insights/${conversationId}`);
      return response.json();
    } catch (error) {
      console.error("Failed to get conversation insights:", error);
      throw new Error("Failed to generate conversation insights");
    }
  }

  async categorizeMessage(content: string): Promise<{
    category: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    needsResponse: boolean;
    suggestedActions: string[];
  }> {
    try {
      const response = await apiRequest("POST", "/api/ai/categorize", {
        content
      });
      return response.json();
    } catch (error) {
      console.error("Failed to categorize message:", error);
      return {
        category: 'general',
        priority: 'medium',
        needsResponse: false,
        suggestedActions: []
      };
    }
  }

  async improveMessageTone(content: string, targetTone: string): Promise<{
    improvedContent: string;
    changes: string[];
    confidence: number;
  }> {
    try {
      const response = await apiRequest("POST", "/api/ai/improve-tone", {
        content,
        targetTone
      });
      return response.json();
    } catch (error) {
      console.error("Failed to improve message tone:", error);
      throw new Error("Failed to improve message tone");
    }
  }

  async detectLanguage(content: string): Promise<{
    language: string;
    confidence: number;
    suggestTranslation: boolean;
  }> {
    try {
      const response = await apiRequest("POST", "/api/ai/detect-language", {
        content
      });
      return response.json();
    } catch (error) {
      console.error("Failed to detect language:", error);
      return {
        language: 'en',
        confidence: 1.0,
        suggestTranslation: false
      };
    }
  }

  async translateMessage(content: string, targetLanguage: string): Promise<{
    translatedContent: string;
    originalLanguage: string;
    confidence: number;
  }> {
    try {
      const response = await apiRequest("POST", "/api/ai/translate", {
        content,
        targetLanguage
      });
      return response.json();
    } catch (error) {
      console.error("Failed to translate message:", error);
      throw new Error("Failed to translate message");
    }
  }

  private getFallbackReplies(): SmartReply[] {
    return [
      {
        id: 'quick_1',
        content: 'Got it, thanks!',
        type: 'quick',
        confidence: 0.8,
        tone: 'casual'
      },
      {
        id: 'quick_2',
        content: 'Let me check and get back to you.',
        type: 'detailed',
        confidence: 0.7,
        tone: 'professional'
      },
      {
        id: 'question_1',
        content: 'Could you provide more details?',
        type: 'question',
        confidence: 0.6,
        tone: 'friendly'
      }
    ];
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  isAIEnabled(): boolean {
    return this.isEnabled;
  }
}

export const aiService = new AIService();