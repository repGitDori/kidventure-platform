import {
  budgetOptions,
  cityOptions,
  dayOptions,
  focusTopicOptions,
  heardFromOptions,
  labelFor,
  scheduleOptions,
  type Inquiry,
} from "@shared/inquiry";
import type { ContactMessage } from "@shared/schema";
import { log } from "./vite";

// Email alerts for every form submission, sent through Resend
// (https://resend.com, free tier is plenty). Environment variables:
//   RESEND_API_KEY  - API key from Resend (required for emails to send)
//   NOTIFY_EMAIL    - where alerts go (default: databasemaestro@gmail.com)
//   NOTIFY_FROM     - sender; set to "Kid-Venture <forms@kid-venture.com>" once
//                     kid-venture.com is verified in Resend. Until then Resend's
//                     test sender only delivers to the Resend account's own email.
// Submissions are always saved and visible in the admin pages either way.

const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || "databasemaestro@gmail.com";
const NOTIFY_FROM = process.env.NOTIFY_FROM || "Kid-Venture <onboarding@resend.dev>";

if (!process.env.RESEND_API_KEY) {
  log("RESEND_API_KEY is not set: form submissions will be saved but not emailed");
}

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function ageFrom(birthdate: string) {
  const born = new Date(birthdate);
  const months =
    (new Date().getFullYear() - born.getFullYear()) * 12 + (new Date().getMonth() - born.getMonth());
  if (months < 0) return "due " + birthdate;
  return months < 24 ? `${months} mo` : `${Math.floor(months / 12)} yrs`;
}

async function send(subject: string, rows: [string, string][], replyTo: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const html = `<table cellpadding="6" style="font-family:sans-serif;font-size:14px">${rows
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="color:#666;vertical-align:top"><b>${escape(k)}</b></td><td style="white-space:pre-wrap">${escape(v)}</td></tr>`,
    )
    .join("")}</table>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: NOTIFY_FROM,
        to: NOTIFY_EMAIL.split(",").map((e) => e.trim()),
        reply_to: replyTo,
        subject,
        html,
      }),
    });
    if (!res.ok) log(`email notification failed: ${res.status} ${await res.text()}`);
    else log(`emailed "${subject}" to ${NOTIFY_EMAIL}`);
  } catch (error) {
    log(`email notification failed: ${error}`);
  }
}

export function notifyNewInquiry(inquiry: Inquiry) {
  return send(
    `New enrollment inquiry: ${inquiry.parentName}`,
    [
      ["Parent", inquiry.parentName],
      ["Email", inquiry.email],
      ["Phone", inquiry.phone],
      ["City", labelFor(cityOptions, inquiry.city)],
      [
        "Children",
        inquiry.children.map((c) => `${c.name || "Child"} (${ageFrom(c.birthdate)}, born ${c.birthdate})`).join("\n"),
      ],
      ["Start", inquiry.startDate],
      [
        "Schedule",
        `${labelFor(scheduleOptions, inquiry.schedule)} – ${inquiry.days.map((d) => labelFor(dayOptions, d)).join(", ")}${
          inquiry.hours ? ` (${inquiry.hours})` : ""
        }`,
      ],
      ["Budget", labelFor(budgetOptions, inquiry.budget)],
      ["Expecting", inquiry.expectations],
      ["Focus topics", inquiry.focusTopics.map((t) => labelFor(focusTopicOptions, t)).join(", ")],
      ["Other topics", inquiry.otherTopics],
      ["Notes", inquiry.notes],
      ["Heard from", inquiry.heardFrom ? labelFor(heardFromOptions, inquiry.heardFrom) : ""],
    ],
    inquiry.email,
  );
}

const contactSubjects: Record<string, string> = {
  general: "General question",
  enrollment: "Enrollment & tours",
  careers: "Working at Kid-Venture",
  feedback: "Feedback",
};

export function notifyNewContactMessage(message: ContactMessage) {
  const subject = contactSubjects[message.subject] ?? message.subject;
  return send(
    `New message from ${message.name}: ${subject}`,
    [
      ["Name", message.name],
      ["Email", message.email],
      ["Subject", subject],
      ["Message", message.message],
    ],
    message.email,
  );
}
