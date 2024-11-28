"use client";

import type { CoreMessage } from "ai";
import { useChat } from "ai/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Brain,
  GitCommit,
  Goal,
  Heart,
  MessageCircle,
  MessageSquare,
  Users,
} from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { ChatContainer, ChatForm, ChatMessages } from "~/components/ui/chat";
import { LoadingSpinner } from "~/components/ui/loading-spinner";
import { MessageInput } from "~/components/ui/message-input";
import { MessageList } from "~/components/ui/message-list";
import { convertToUIMessages } from "~/lib/ai/messages";
import type { RouterOutputs } from "~/trpc/react";

type ChatInterfaceProps = {
  userId: string;
  selectedTopic: string;
  topics: string[];
  relevantMoments: RouterOutputs["moments"]["listAll"]["moments"];
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

const topicIcons: Record<string, React.ElementType> = {
  "Decision Making": Brain,
  Delegation: GitCommit,
  Emotion: Heart,
  Feedback: MessageSquare,
  "Goal Setting": Goal,
  "Team Conflict": Users,
};

function getTopicIcon(topic: string) {
  const Icon = topicIcons[topic] ?? Brain;
  return Icon;
}

export function ChatInterface({
  userId,
  selectedTopic,
  topics,
  relevantMoments,
  initialMessages,
  onTopicSelect,
  isLoading,
}: ChatInterfaceProps) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    isLoading: chatLoading,
    stop,
    error,
  } = useChat({
    body: { userId, selectedActivity: selectedTopic, relevantMoments },
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

  useEffect(
    function handleInitializeConversation() {
      if (isEmpty && userId && selectedTopic && !isTyping) {
        const messageContent = `Tell me more about ${selectedTopic}`;
        void append({ role: "user", content: messageContent });
      }
    },
    [isEmpty, userId, selectedTopic, isTyping, append],
  );

  return (
    <ChatContainer className="-mt-2 h-[calc(100vh-7rem)] lg:-mt-12 lg:h-[calc(100vh-3rem)]">
      {isEmpty && !selectedTopic && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12 pt-12"
        >
          {/* Main CTA Section */}
          <motion.div
            variants={itemVariants}
            className="mx-auto max-w-3xl space-y-6 px-4"
          >
            <motion.h2
              variants={itemVariants}
              className="text-center text-3xl font-bold tracking-tight"
            >
              Not sure where to start?
            </motion.h2>
            <Button
              variant="default"
              className="group relative w-full overflow-hidden bg-primary px-8 py-8 text-xl font-bold text-primary-foreground shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
              onClick={() => {
                void append({
                  role: "user",
                  content: "What should I talk to my coach about?",
                });
              }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
              />
              What should I talk to my coach about?
            </Button>
          </motion.div>

          {/* Topic Selection Section */}
          <motion.div
            variants={itemVariants}
            className="mx-auto max-w-3xl space-y-6 px-4"
          >
            <motion.h3
              variants={itemVariants}
              className="text-center text-lg font-medium text-muted-foreground"
            >
              Or explore specific topics
            </motion.h3>

            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            >
              {topics.map((topic, index) => {
                const TopicIcon = getTopicIcon(topic);
                return (
                  <motion.div key={topic} variants={itemVariants}>
                    <Button
                      onClick={handleTopicClick(topic)}
                      className="group relative h-24 w-full overflow-hidden rounded-xl border border-border bg-background p-6 text-left text-primary transition-colors hover:border-primary/50"
                    >
                      {/* Animated gradient background */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                        initial={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />

                      {/* Content */}
                      <div className="relative z-10 flex w-full items-center justify-between gap-4 group-hover:text-foreground">
                        <TopicIcon className="h-10 w-10 rounded-lg bg-primary/10 p-2 text-primary transition-colors group-hover:bg-foreground" />
                        <h4 className="m-0 ml-1 flex-1 text-left text-lg font-semibold">
                          {topic}
                        </h4>
                      </div>
                    </Button>
                  </motion.div>
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
      )}

      {!isEmpty && !error && (
        <ChatForm
          className="mt-auto"
          isPending={chatLoading || isTyping}
          handleSubmit={handleSubmit}
        >
          {({ files, setFiles }) => (
            <MessageInput
              value={input}
              onChange={handleInputChange}
              allowAttachments
              files={files}
              setFiles={setFiles}
              stop={stop}
              isGenerating={chatLoading}
            />
          )}
        </ChatForm>
      )}
    </ChatContainer>
  );
}
