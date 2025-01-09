import { render } from "@react-email/components";
import { Resend } from "resend";

import {
  InvitationEmail,
  type InvitationEmailProps,
} from "~/email/invite-user";
import { env } from "~/env";

const resend = new Resend(env.RESEND_API_KEY);

export async function sendInvitationEmail({ invite }: InvitationEmailProps) {
  const emailHtml = await render(InvitationEmail({ invite }));

  const data = await resend.emails.send({
    from: "onboarding@emails.withtitan.com",
    to: invite.email,
    subject: "Create Your Account On Titan GameTape",
    html: emailHtml,
  });

  return data;
}
