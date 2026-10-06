import {
  budgetOptions,
  cityOptions,
  dayOptions,
  focusTopicOptions,
  labelFor,
  scheduleOptions,
  type Inquiry,
} from "@shared/inquiry";
import type { ContactMessage } from "@shared/schema";
import { log } from "./vite";

// Optional email alerts for new form submissions, sent through Resend
// (https://resend.com, free tier is plenty). Set these environment variables:
//   RESEND_API_KEY  - API key from Resend
//   NOTIFY_EMAIL    - where alerts go, e.g. your Gmail address
//   NOTIFY_FROM     - verified sender, defaults to Resend's test sender
// Without them, submissions are still saved and visible in the admin pages.

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
  const to = process.env.NOTIFY_EMAIL;
  if (!apiKey || !to) return;

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
        from: process.env.NOTIFY_FROM || "Kid-Venture <onboarding@resend.dev>",
        to: [to],
        reply_to: replyTo,
        subject,
        html,
      }),
    });
    if (!res.ok) log(`email notification failed: ${res.status} ${await res.text()}`);
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
      ["Heard from", inquiry.heardFrom],
    ],
    inquiry.email,
  );
}

export function notifyNewContactMessage(message: ContactMessage) {
  return send(
    `New message from ${message.name}: ${message.subject}`,
    [
      ["Name", message.name],
      ["Email", message.email],
      ["Subject", message.subject],
      ["Message", message.message],
    ],
    message.email,
  );
}
