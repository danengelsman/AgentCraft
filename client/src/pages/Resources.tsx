import { type KeyboardEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Video, FileText, Trophy, ExternalLink, Play, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Resources() {
  const { toast } = useToast();
  // todo: remove mock functionality
  const useCases = [
    {
      id: "1",
      title: "How to Automate Customer Support",
      description: "Learn how small businesses save 15+ hours per week by automating customer inquiries with AI chatbots.",
      category: "Customer Service",
      readTime: "8 min read",
    },
    {
      id: "2",
      title: "Qualifying Leads with AI",
      description: "Discover how to automatically score and qualify leads in HubSpot, increasing conversion rates by 30%.",
      category: "Sales",
      readTime: "6 min read",
    },
    {
      id: "3",
      title: "Appointment Scheduling Best Practices",
      description: "Reduce no-shows by 40% with automated appointment reminders and smart calendar integration.",
      category: "Operations",
      readTime: "5 min read",
    },
    {
      id: "4",
      title: "Email Automation for Small Business",
      description: "Set up intelligent email responses that maintain your brand voice while saving hours of manual work.",
      category: "Marketing",
      readTime: "7 min read",
    },
    {
      id: "5",
      title: "Building a Social Media Strategy",
      description: "Automate your social media presence while keeping authentic engagement with your audience.",
      category: "Marketing",
      readTime: "9 min read",
    },
    {
      id: "6",
      title: "Customer Onboarding Made Easy",
      description: "Create seamless onboarding experiences that reduce churn and increase customer satisfaction.",
      category: "Customer Success",
      readTime: "6 min read",
    },
  ];

  // todo: remove mock functionality
  const videos = [
    {
      id: "1",
      title: "Getting Started with AgentCraft",
      description: "A complete walkthrough of creating your first AI agent in under 10 minutes",
      duration: "9:32",
      thumbnail: "video",
    },
    {
      id: "2",
      title: "HubSpot Integration Setup",
      description: "Connect your CRM and sync leads automatically with this step-by-step guide",
      duration: "6:15",
      thumbnail: "video",
    },
    {
      id: "3",
      title: "Advanced Agent Configuration",
      description: "Customize your agents for complex workflows and multi-step automations",
      duration: "12:48",
      thumbnail: "video",
    },
  ];

  // todo: remove mock functionality
  const bestPractices = [
    {
      id: "1",
      title: "Writing Effective Agent Instructions",
      description: "Best practices for training your AI agents to understand your business context and respond appropriately.",
    },
    {
      id: "2",
      title: "Managing Multiple Agents",
      description: "Strategies for organizing and coordinating multiple automation agents without conflicts.",
    },
    {
      id: "3",
      title: "Security & Privacy Guidelines",
      description: "How to ensure your customer data stays secure while using AI automation tools.",
    },
    {
      id: "4",
      title: "Optimizing Response Quality",
      description: "Tips for improving agent responses and maintaining high customer satisfaction rates.",
    },
  ];

  // todo: remove mock functionality
  const successStories = [
    {
      id: "1",
      company: "Riverside Dental",
      industry: "Healthcare",
      challenge: "Managing appointment scheduling calls took 10+ hours weekly",
      solution: "Deployed Appointment Scheduler agent with calendar integration",
      result: "Reduced scheduling time by 85%, no-shows decreased 40%",
    },
    {
      id: "2",
      company: "TechStart Solutions",
      industry: "SaaS",
      challenge: "Lead qualification was inconsistent and time-consuming",
      solution: "Implemented Lead Qualification Agent with HubSpot sync",
      result: "Qualified 3x more leads with 95% accuracy, closed 30% more deals",
    },
    {
      id: "3",
      company: "Urban Bistro",
      industry: "Restaurant",
      challenge: "Customer questions flooded email and social media",
      solution: "Created FAQ Chatbot trained on menu and policies",
      result: "Answered 80% of inquiries automatically, staff focused on service",
    },
  ];

  const handleVideoClick = (video: typeof videos[0]) => {
    toast({
      title: "Video Tutorial Coming Soon",
      description: `"${video.title}" will be available soon. We're creating high-quality video content to help you get the most out of AgentCraft.`,
    });
  };

  const handleUseCaseClick = (useCase: typeof useCases[0]) => {
    toast({
      title: "Guide Coming Soon",
      description: `"${useCase.title}" guide will be available soon. Check back for detailed industry-specific strategies.`,
    });
  };

  const handleKeyDown = (e: KeyboardEvent, callback: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  };

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-5xl font-semibold mb-3 tracking-tight">Learning Resources</h1>
        <p className="text-lg text-muted-foreground">
          Everything you need to master AI automation for your small business
        </p>
      </div>

      {/* Video Tutorials */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Video className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Video Tutorials</h2>
            <p className="text-muted-foreground">Step-by-step guides to get you started</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <Card 
              key={video.id} 
              className="hover-elevate cursor-pointer" 
              data-testid={`video-${video.id}`}
              role="button"
              tabIndex={0}
              onClick={() => handleVideoClick(video)}
              onKeyDown={(e) => handleKeyDown(e, () => handleVideoClick(video))}
            >
              <CardContent className="p-0">
                <div className="aspect-video bg-muted/50 flex items-center justify-center rounded-t-lg border-b">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <Play className="h-8 w-8 text-primary ml-1" />
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-primary">{video.duration}</span>
                  </div>
                  <h3 className="font-semibold mb-2">{video.title}</h3>
                  <p className="text-sm text-muted-foreground">{video.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Use Case Guides */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Use Case Guides</h2>
            <p className="text-muted-foreground">Industry-specific automation strategies</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase) => (
            <Card 
              key={useCase.id} 
              className="hover-elevate cursor-pointer" 
              data-testid={`use-case-${useCase.id}`}
              role="button"
              tabIndex={0}
              onClick={() => handleUseCaseClick(useCase)}
              onKeyDown={(e) => handleKeyDown(e, () => handleUseCaseClick(useCase))}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-primary px-2 py-1 rounded-md bg-primary/10">
                    {useCase.category}
                  </span>
                  <span className="text-xs text-muted-foreground">{useCase.readTime}</span>
                </div>
                <CardTitle className="text-xl">{useCase.title}</CardTitle>
                <CardDescription>{useCase.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Best Practices */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Best Practices</h2>
            <p className="text-muted-foreground">Expert tips for optimal results</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bestPractices.map((practice) => (
            <Card key={practice.id} data-testid={`practice-${practice.id}`}>
              <CardHeader>
                <CardTitle className="text-xl flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  {practice.title}
                </CardTitle>
                <CardDescription className="ml-8">{practice.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Success Stories */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Success Stories</h2>
            <p className="text-muted-foreground">Real results from small businesses like yours</p>
          </div>
        </div>
        <div className="space-y-6">
          {successStories.map((story) => (
            <Card key={story.id} data-testid={`story-${story.id}`}>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-2xl font-semibold mb-2">{story.company}</h3>
                    <p className="text-sm text-muted-foreground">{story.industry}</p>
                  </div>
                  <div className="lg:col-span-2 space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">Challenge</h4>
                      <p>{story.challenge}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">Solution</h4>
                      <p>{story.solution}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">Result</h4>
                      <p className="text-primary font-medium">{story.result}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
