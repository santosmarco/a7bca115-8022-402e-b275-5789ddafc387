"use client";

import type { CoreMessage } from "ai";
import { useChat } from "ai/react";
import { AnimatePresence, motion } from "framer-motion";
import _ from "lodash";
import { AlertCircle, MessageCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import type { ChatRequestBody } from "~/app/api/chat/route";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { ChatContainer, ChatMessages } from "~/components/ui/chat";
import { LoadingSpinner } from "~/components/ui/loading-spinner";
import { MessageList } from "~/components/ui/message-list";
import { RestartChatButton } from "~/components/ui/restart-chat-button";
import { convertToUIMessages } from "~/lib/ai/messages";
import { getMomentIcon } from "~/lib/moments";
import { createClient } from "~/lib/supabase/client";
import type { Tables } from "~/lib/supabase/database.types";
import type { RouterOutputs } from "~/trpc/react";

import { ChatInput } from "../chat/chat-input";
import { Badge } from "../ui/badge";

type ChatInterfaceProps = {
  frameworks: Tables<"coaching_frameworks">[];
  userId: string;
  selectedTopic: string;
  topics: string[];
  relevantMoments: RouterOutputs["moments"]["listAll"]["moments"];
  relevantVideos: RouterOutputs["videos"]["listAll"];
  initialMessages: CoreMessage[];
  onTopicSelect: (topic: string) => void;
  isLoading?: boolean;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const headerVariants = {
  initial: {
    opacity: 0,
    y: -20,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.19, 1.0, 0.22, 1.0],
      scale: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  },
};

export type TopicConfiguration = {
  conversationStarter: string;
};

const TOPIC_CONFIGURATIONS: Record<string, TopicConfiguration> = {
  "Decision Making": {
    conversationStarter: "Explore my decision making",
  },
  Delegation: {
    conversationStarter: "Explore my delegation",
  },
  Emotion: {
    conversationStarter: "Explore my emotions",
  },
  Feedback: {
    conversationStarter: "Explore my feedback",
  },
  "Goal Setting": {
    conversationStarter: "Explore my goals",
  },
  "Team Conflict": {
    conversationStarter: "Explore team conflict",
  },
  Coach: {
    conversationStarter: "What should I discuss with my coach?",
  },
};

export function ChatInterface({
  userId,
  selectedTopic,
  topics,
  relevantMoments,
  relevantVideos,
  initialMessages,
  onTopicSelect,
  isLoading,
  frameworks,
}: ChatInterfaceProps) {
  const supabase = createClient();
  const [selectedMoments, setSelectedMoments] = useState<
    RouterOutputs["moments"]["listAll"]["moments"]
  >([]);
  const [selectedVideos, setSelectedVideos] = useState<
    RouterOutputs["videos"]["listAll"]
  >([]);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    isLoading: chatLoading,
    stop,
    error,
    reload,
    setMessages,
  } = useChat({
    body: {
      userId,
      selectedActivity: selectedTopic,
      relevantMoments,
      selectedMoments,
      selectedVideos,
    } satisfies ChatRequestBody,
    initialMessages: convertToUIMessages(initialMessages),
    maxSteps: 5,
    onError: (error) => {
      toast.error("Failed to send message", {
        description: error.message,
      });
    },
  });

  const lastMessage = messages.at(-1);
  const isEmpty = messages.length === 0;
  const isTyping = lastMessage?.role === "user";

  const handleTopicClick = (topic: string) => () => {
    onTopicSelect(topic);
  };

  const handleRestart = async () => {
    await supabase
      .from("chats")
      .delete()
      .eq("user_id", userId)
      .eq("topic", selectedTopic);
    setMessages([]);
    await reload();
  };

  useEffect(
    function handleInitializeConversation() {
      if (!isEmpty || !userId || !selectedTopic || isTyping) return;

      const initializeChat = async () => {
        const { data } = await supabase
          .from("observation_prompts")
          .select("*")
          .eq("type", selectedTopic)
          .eq("profile_id", userId)
          .eq("latest", true)
          .maybeSingle();

        const defaultMessage = {
          id: _.uniqueId(),
          role: "user" as const,
          content:
            selectedTopic === "Coach"
              ? "What should I talk to my coach about?"
              : `Tell me more about ${selectedTopic}`,
        };

        const assistantMessage = data?.result
          ? {
              id: _.uniqueId(),
              role: "assistant" as const,
              content: data.result,
            }
          : defaultMessage;

        setMessages((messages) =>
          messages.length === 0 ? [...messages, assistantMessage] : messages,
        );
      };

      void initializeChat();
    },
    [supabase, isEmpty, userId, selectedTopic, isTyping, append, setMessages],
  );

  return (
    <ChatContainer className="-mt-2 h-[calc(100vh-7rem)] lg:-mt-12 lg:h-[calc(100vh-3rem)]">
      {isEmpty && !selectedTopic && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container mx-auto flex h-screen max-w-3xl flex-col items-center justify-center"
        >
          {/* Main CTA Section */}
          <motion.div
            variants={itemVariants}
            className="w-full space-y-16 px-4"
          >
            <motion.h2
              variants={itemVariants}
              className="text-center text-4xl font-medium"
            >
              Where do you want to elevate?
            </motion.h2>

            <form
              className="mt-auto w-full"
              onSubmit={(ev) => {
                if (chatLoading || isTyping) {
                  ev.preventDefault();
                  return;
                }

                handleSubmit(ev);
              }}
            >
              <ChatInput
                isLandingPage
                frameworks={frameworks}
                value={input}
                onChange={handleInputChange}
                onSubmit={(ev) => {
                  if (chatLoading || isTyping) {
                    ev?.preventDefault?.();
                    return;
                  }

                  handleSubmit(ev);
                }}
                stop={stop}
                isGenerating={chatLoading}
                moments={relevantMoments}
                videos={relevantVideos}
                selectedMoments={selectedMoments}
                selectedVideos={selectedVideos}
                onSelectMoment={(moment) =>
                  setSelectedMoments((prev) => [...prev, moment])
                }
                onUnselectMoment={(moment) =>
                  setSelectedMoments((prev) =>
                    prev.filter((m) => m.id !== moment.id),
                  )
                }
                onSelectVideo={(video) =>
                  setSelectedVideos((prev) => [...prev, video])
                }
                onUnselectVideo={(video) =>
                  setSelectedVideos((prev) =>
                    prev.filter((v) => v.videoId !== video.videoId),
                  )
                }
              />
            </form>
          </motion.div>

          {/* Topic Selection Section */}
          <motion.div
            variants={itemVariants}
            className="flex w-full flex-col items-center justify-center pt-3"
          >
            <motion.div
              variants={containerVariants}
              className="flex flex-wrap items-center justify-center gap-3 px-3"
            >
              {["Coach", ...topics].map((topic, index) => {
                const TopicIcon = getMomentIcon(topic);
                const topicConversationStarter =
                  TOPIC_CONFIGURATIONS[topic]?.conversationStarter;

                return (
                  <Badge
                    key={topic}
                    variant="outline"
                    onClick={handleTopicClick(topic)}
                    className="flex cursor-pointer items-center gap-x-2.5 px-3 py-1.5 transition-all hover:border-primary hover:bg-primary/10 active:scale-95"
                  >
                    <TopicIcon className="h-3.5 w-3.5 text-primary" />
                    <span className="font-medium">
                      {topicConversationStarter}
                    </span>
                  </Badge>
                );
              })}
            </motion.div>
          </motion.div>

          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center gap-4"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <LoadingSpinner className="h-8 w-8 text-primary" />
                </motion.div>
                <motion.p
                  animate={{
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="text-center text-sm text-muted-foreground"
                >
                  We&apos;re still loading some of your videos...
                  <br />
                  More topics will show up soon.
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {!isEmpty && (
        <>
          {/* Chat Header */}
          {(() => {
            const TopicIcon = selectedTopic
              ? getMomentIcon(selectedTopic)
              : MessageCircleIcon;

            return (
              <AnimatePresence mode="wait">
                <motion.header
                  key={selectedTopic}
                  variants={headerVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="fixed left-0 right-0 top-16 z-50 flex h-16 items-center justify-between border-b border-border bg-background p-4 lg:left-64 lg:top-0 lg:flex lg:h-auto lg:border-border"
                >
                  <motion.div
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <TopicIcon className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">
                      {selectedTopic === "Coach"
                        ? "Exploration"
                        : selectedTopic || "Conversation"}
                    </h2>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-4"
                  >
                    <RestartChatButton onRestart={handleRestart} />
                  </motion.div>
                </motion.header>
              </AnimatePresence>
            );
          })()}

          {/* Chat Messages */}
          <ChatMessages messages={messages}>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}
            <MessageList messages={messages} isTyping={isTyping && !error} />
          </ChatMessages>
        </>
      )}

      {!isEmpty && !error && (
        <form
          className="mt-auto"
          onSubmit={(ev) => {
            if (chatLoading || isTyping) {
              ev.preventDefault();
              return;
            }

            handleSubmit(ev);
          }}
        >
          <ChatInput
            frameworks={frameworks}
            value={input}
            onChange={handleInputChange}
            onSubmit={(ev) => {
              if (chatLoading || isTyping) {
                ev?.preventDefault?.();
                return;
              }

              handleSubmit(ev);
            }}
            stop={stop}
            isGenerating={chatLoading}
            moments={relevantMoments}
            videos={relevantVideos}
            selectedMoments={selectedMoments}
            selectedVideos={selectedVideos}
            onSelectMoment={(moment) =>
              setSelectedMoments((prev) => [...prev, moment])
            }
            onUnselectMoment={(moment) =>
              setSelectedMoments((prev) =>
                prev.filter((m) => m.id !== moment.id),
              )
            }
            onSelectVideo={(video) =>
              setSelectedVideos((prev) => [...prev, video])
            }
            onUnselectVideo={(video) =>
              setSelectedVideos((prev) =>
                prev.filter((v) => v.videoId !== video.videoId),
              )
            }
          />
        </form>
      )}
    </ChatContainer>
  );
}