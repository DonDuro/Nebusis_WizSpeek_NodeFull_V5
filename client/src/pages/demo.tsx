import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  MessageSquare, Video, Phone, FileUp, Zap, Shield, Users, 
  Settings, Send, Mic, Paperclip, Smile, MoreVertical,
  UserPlus, Search, Bell, Star
} from "lucide-react";
import wizSpeakIcon from "@/assets/wizspeak-icon.svg";

export default function Demo() {
  const [activeTab, setActiveTab] = useState("chat");
  const [message, setMessage] = useState("");

  const conversations = [
    { id: 1, name: "Team Project Alpha", lastMessage: "Great progress on the encryption!", time: "2m", unread: 3 },
    { id: 2, name: "Security Review", lastMessage: "AI summary: Key compliance points discussed", time: "15m", unread: 0 },
    { id: 3, name: "Development Team", lastMessage: "File uploaded: design-specs.pdf", time: "1h", unread: 1 },
    { id: 4, name: "Client Demo", lastMessage: "Video call scheduled for 3 PM", time: "2h", unread: 0 },
  ];

  const messages = [
    { id: 1, sender: "Admin", content: "Welcome to WizSpeek®! All enhancements are now active.", time: "10:30", type: "system" },
    { id: 2, sender: "Sarah", content: "The new AI summarization is incredible!", time: "10:32", type: "message" },
    { id: 3, sender: "Mike", content: "Just shared the encrypted project files", time: "10:35", type: "file", attachment: "project-docs.pdf" },
    { id: 4, sender: "You", content: "Let's start a video call to review", time: "10:37", type: "message" },
  ];

  const features = [
    {
      title: "Enhancement 1: WebRTC Video/Audio Calling",
      icon: <Video className="h-5 w-5" />,
      status: "✓ Complete",
      description: "Real-time video and audio calls with professional UI",
      features: ["HD video calling", "Crystal clear audio", "Screen sharing", "Call recording"]
    },
    {
      title: "Enhancement 2: AI-Powered Features", 
      icon: <Zap className="h-5 w-5" />,
      status: "✓ Complete",
      description: "Smart replies and conversation summarization",
      features: ["Message summarization", "Smart reply suggestions", "Sentiment analysis", "Key topic extraction"]
    },
    {
      title: "Enhancement 3: Advanced File Sharing",
      icon: <FileUp className="h-5 w-5" />,
      status: "✓ Complete", 
      description: "AES-256 encrypted file sharing with access control",
      features: ["Client-side encryption", "Secure file sharing", "Access logging", "Permission management"]
    },
    {
      title: "Core Security & Compliance",
      icon: <Shield className="h-5 w-5" />,
      status: "✓ Complete",
      description: "ISO 9001/27001 compliance features",
      features: ["End-to-end encryption", "Audit trails", "Role-based access", "Compliance dashboard"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <img src={wizSpeakIcon} alt="WizSpeek" className="w-8 h-8" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              WizSpeek®
            </h1>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              All Enhancements Active
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Admin
            </Button>
            <Avatar>
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <div className="w-80 bg-white dark:bg-slate-900 border-r flex flex-col">
          {/* Navigation */}
          <div className="flex space-x-1 p-4 border-b">
            <Button 
              variant={activeTab === "chat" ? "default" : "ghost"} 
              size="sm"
              onClick={() => setActiveTab("chat")}
              className="flex-1"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </Button>
            <Button 
              variant={activeTab === "features" ? "default" : "ghost"} 
              size="sm"
              onClick={() => setActiveTab("features")}
              className="flex-1"
            >
              <Star className="h-4 w-4 mr-2" />
              Features
            </Button>
          </div>

          {activeTab === "chat" ? (
            <>
              {/* Search */}
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search conversations..." className="pl-10" />
                </div>
              </div>

              {/* Conversations */}
              <ScrollArea className="flex-1">
                <div className="p-2">
                  {conversations.map((conversation) => (
                    <div key={conversation.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <Avatar>
                        <AvatarFallback>{conversation.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">{conversation.name}</p>
                          <span className="text-xs text-muted-foreground">{conversation.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                      </div>
                      {conversation.unread > 0 && (
                        <Badge variant="default" className="ml-auto">
                          {conversation.unread}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          ) : (
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <Card key={index} className="border-l-4 border-l-primary">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          {feature.icon}
                          <span className="truncate">{feature.title}</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          {feature.status}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-muted-foreground mb-2">{feature.description}</p>
                      <div className="grid grid-cols-2 gap-1">
                        {feature.features.map((item, idx) => (
                          <div key={idx} className="flex items-center space-x-1">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            <span className="text-xs">{item}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback>TP</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold">Team Project Alpha</h2>
                <p className="text-sm text-muted-foreground">4 members • Online</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === "You" ? "justify-end" : "justify-start"}`}>
                  {message.sender !== "You" && (
                    <Avatar className="mr-3 mt-1">
                      <AvatarFallback>{message.sender[0]}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-xs lg:max-w-md ${message.sender === "You" ? "order-1" : ""}`}>
                    {message.sender !== "You" && (
                      <p className="text-sm font-medium text-muted-foreground mb-1">{message.sender}</p>
                    )}
                    <div className={`rounded-lg px-4 py-2 ${
                      message.sender === "You" 
                        ? "bg-primary text-primary-foreground" 
                        : message.type === "system"
                        ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                        : "bg-muted"
                    }`}>
                      {message.type === "file" ? (
                        <div className="flex items-center space-x-2">
                          <FileUp className="h-4 w-4" />
                          <span className="text-sm">{message.attachment}</span>
                        </div>
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{message.time}</p>
                  </div>
                  {message.sender === "You" && (
                    <Avatar className="ml-3 mt-1">
                      <AvatarFallback>Y</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* AI Smart Replies */}
          <div className="px-6 py-2 border-t bg-blue-50 dark:bg-blue-950">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">AI Smart Replies:</span>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="text-xs">
                  "Sounds great!"
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  "Let me review that"
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  "Schedule for tomorrow?"
                </Button>
              </div>
            </div>
          </div>

          {/* Message Input */}
          <div className="p-6 border-t">
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Paperclip className="h-4 w-4" />
              </Button>
              <div className="flex-1 flex items-center space-x-2 bg-muted rounded-lg px-3 py-2">
                <Input 
                  placeholder="Type a message..." 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="border-0 bg-transparent focus-visible:ring-0"
                />
                <Button variant="ghost" size="sm">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
              <Button size="sm">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}