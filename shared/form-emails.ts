import {
  budgetOptions,
  cityOptions,
  dayOptions,
  focusTopicOptions,
  heardFromOptions,
  labelFor,
  scheduleOptions,
  type InquiryData,
} from "./inquiry";

// Turns form submissions into labeled rows for notification emails.
// Used by the server (Resend) and the static GitHub Pages site (Web3Forms).

export type EmailRows = [label: string, value: string][];

type InquiryFields = Omit<InquiryData, "website" | "consent">;
type ContactFields = { name: string; email: string; subject: string; message: string };

export const contactSubjects: Record<string, string> = {
  general: "General question",
  enrollment: "Enrollment & tours",
  careers: "Working at Kid-Venture",
  feedback: "Feedback",
};

function ageFrom(birthdate: string) {
  const born = new Date(`${birthdate}T00:00:00`);
  const now = new Date();
  const months = (now.getFullYear() - born.getFullYear()) * 12 + (now.getMonth() - born.getMonth());
  if (months < 0) return "due";
  return months < 24 ? `${months} mo` : `${Math.floor(months / 12)} yrs`;
}

export function inquiryEmail(inquiry: InquiryFields): { subject: string; rows: EmailRows } {
  return {
    subject: `New enrollment inquiry: ${inquiry.parentName}`,
    rows: [
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
  };
}

export function contactEmail(message: ContactFields): { subject: string; rows: EmailRows } {
  const subject = contactSubjects[message.subject] ?? message.subject;
  return {
    subject: `New message from ${message.name}: ${subject}`,
    rows: [
      ["Name", message.name],
      ["Email", message.email],
      ["Subject", subject],
      ["Message", message.message],
    ],
  };
}
