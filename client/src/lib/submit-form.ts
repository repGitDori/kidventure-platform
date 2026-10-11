import { contactEmail, inquiryEmail, type EmailRows } from "@shared/form-emails";
import type { InquiryInput } from "@shared/inquiry";

// Sends the public forms. On the static GitHub Pages site there is no server,
// so submissions go to Web3Forms (https://web3forms.com), which emails them to
// the address the access key was created for. Otherwise they go to our API.

const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY as string | undefined;
export const isStaticSite = import.meta.env.VITE_STATIC_SITE === "true";

async function sendToWeb3Forms(email: { subject: string; rows: EmailRows }, replyTo: string, name: string) {
  if (!WEB3FORMS_KEY) {
    throw new Error("The form isn't connected yet");
  }
  const res = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      access_key: WEB3FORMS_KEY,
      subject: email.subject,
      from_name: "Kid-Venture website",
      replyto: replyTo,
      name,
      ...Object.fromEntries(email.rows.filter(([, v]) => v)),
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) {
    throw new Error(body.message || "Something went wrong");
  }
}

async function postToApi(url: string, data: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Something went wrong");
  }
}

export async function sendInquiry(data: InquiryInput) {
  if (!isStaticSite) return postToApi("/api/inquiries", data);
  // Honeypot filled in: a bot, so quietly drop it.
  if (data.website) return;
  const { website: _honeypot, consent: _consent, ...fields } = data;
  return sendToWeb3Forms(
    inquiryEmail({
      ...fields,
      children: fields.children.map((c) => ({ name: c.name ?? "", birthdate: c.birthdate })),
      hours: fields.hours ?? "",
      otherTopics: fields.otherTopics ?? "",
      notes: fields.notes ?? "",
      heardFrom: fields.heardFrom ?? "",
    }),
    data.email,
    data.parentName,
  );
}

export async function sendContactMessage(data: { name: string; email: string; subject: string; message: string }) {
  if (!isStaticSite) return postToApi("/api/contact", data);
  return sendToWeb3Forms(contactEmail(data), data.email, data.name);
}
