"use client";

import type { CoreMessage, Message } from "ai";
import { useChat } from "ai/react";
import _ from "lodash";
import { useEffect } from "react";

import { Button } from "~/components/ui/button";
import { ChatContainer, ChatForm, ChatMessages } from "~/components/ui/chat";
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
};

export function ChatInterface({
  userId,
  selectedTopic,
  topics,
  relevantMoments,
  initialMessages,
  onTopicSelect,
}: ChatInterfaceProps) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    isLoading,
    stop,
  } = useChat({
    body: { userId, selectedActivity: selectedTopic, relevantMoments },
    initialMessages: convertToUIMessages(initialMessages),
    maxSteps: 5,
  });

  const lastMessage = messages.at(-1);
  const isEmpty = messages.length === 0;
  const isTyping = lastMessage?.role === "user";

  const messagesWithMoments = messages.reduce<Message[]>((acc, message) => {
    const content = message.content;
    const momentMatches = content.match(
      /#### ([^\n]+)\n- <moment id=([a-f0-9-]+) \/>\s*\n- ([^\n]+)(?:\n|$)/g,
    );

    if (!momentMatches) {
      acc.push(message);
      return acc;
    }

    const parts = content.split(
      /#### [^\n]+\n- <moment id=[a-f0-9-]+ \/>\s*\n- [^\n]+(?:\n|$)/,
    );
    const firstPart = parts[0];

    if (firstPart) {
      acc.push({
        ...message,
        content: firstPart,
      });
    }

    momentMatches.forEach((match, i) => {
      const regex =
        /#### ([^\n]+)\n- <moment id=([a-f0-9-]+) \/>\s*\n- ([^\n]+)(?:\n|$)/;
      const matches = regex.exec(match);
      const [, title, momentId, subtitle] = matches ?? [];

      // Add the moment message
      acc.push({
        id: `moment-${i}`,
        role: "data",
        content: JSON.stringify({
          title,
          momentId,
          subtitle,
        }),
      });

      // Add the next part if it exists
      const nextPart = parts[i + 1];
      if (nextPart) {
        acc.push({
          ...message,
          content: nextPart,
        });
      }
    });

    return acc;
  }, []);

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
        <div className="space-y-6 pt-12">
          <h2 className="text-center text-2xl font-bold">
            Start by selecting a topic
          </h2>
          <div className="space-y-4">
            {_.chunk(topics, Math.ceil(topics.length / 2)).map((chunk) => (
              <div
                key={`chunk-${chunk
                  .map((topic) => _.camelCase(topic))
                  .join("-")}`}
                className="flex w-full justify-around gap-4"
              >
                {chunk.map((topic) => (
                  <Button
                    key={_.camelCase(topic)}
                    onClick={handleTopicClick(topic)}
                    className="w-full"
                  >
                    <p>{topic}</p>
                  </Button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {!isEmpty && (
        <ChatMessages messages={messagesWithMoments}>
          <MessageList messages={messagesWithMoments} isTyping={isTyping} />
        </ChatMessages>
      )}

      {!isEmpty && (
        <ChatForm
          className="mt-auto"
          isPending={isLoading || isTyping}
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
              isGenerating={isLoading}
            />
          )}
        </ChatForm>
      )}
    </ChatContainer>
  );
}
