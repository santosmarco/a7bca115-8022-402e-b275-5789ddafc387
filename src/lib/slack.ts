import { WebClient as SlackWebClient } from "@slack/web-api";

import { env } from "~/env";

// Initialize Slack Web Client
const slackClient = env.SLACK_BOT_TOKEN
  ? new SlackWebClient(env.SLACK_BOT_TOKEN)
  : null;

const NOTIFICATIONS_CHANNEL = env.SLACK_NOTIFICATIONS_CHANNEL;

type SlackMessage = {
  text: string;
  channel?: string;
};

class SlackService {
  private async sendMessage({
    text,
    channel = NOTIFICATIONS_CHANNEL,
  }: SlackMessage) {
    if (!slackClient || env.NODE_ENV !== "production") {
      console.warn(
        "Slack notifications disabled - no SLACK_BOT_TOKEN provided",
      );
      return;
    }

    try {
      await slackClient.chat.postMessage({
        channel,
        text,
        unfurl_links: false,
        unfurl_media: false,
      });
    } catch (error) {
      console.error("Failed to send Slack message:", error);
      // Don't throw - we don't want Slack errors to break the main flow
    }
  }

  async send(message: SlackMessage) {
    return this.sendMessage(message);
  }

  async info({ text, channel }: SlackMessage) {
    return this.sendMessage({ text: `ℹ️ ${text}`, channel });
  }

  async success({ text, channel }: SlackMessage) {
    return this.sendMessage({ text: `✅ ${text}`, channel });
  }

  async warn({ text, channel }: SlackMessage) {
    return this.sendMessage({ text: `⚠️ ${text}`, channel });
  }

  async error({ text, channel }: SlackMessage) {
    return this.sendMessage({ text: `❌ ${text}`, channel });
  }

  async done({ text, channel }: SlackMessage) {
    return this.sendMessage({ text: `✨ ${text}`, channel });
  }
}

export const slack = new SlackService();
