import fs from "fs";
import path from "path";
import type { Inquiry, InquiryData, InquiryStatus } from "@shared/inquiry";
import type { ContactMessage, InsertContactMessage } from "@shared/schema";

// Saves public form submissions (enrollment inquiries and contact messages)
// to JSON files so they survive server restarts. Set DATA_DIR to a persistent
// disk on your host; it defaults to ./data in the project folder.

const DATA_DIR = path.resolve(process.env.DATA_DIR || "data");

class JsonCollection<T extends { id: number }> {
  private items: T[] = [];
  private file: string;
  private writing = Promise.resolve();

  constructor(name: string) {
    this.file = path.join(DATA_DIR, `${name}.json`);
    fs.mkdirSync(DATA_DIR, { recursive: true });
    if (fs.existsSync(this.file)) {
      this.items = JSON.parse(fs.readFileSync(this.file, "utf8"));
    }
  }

  all(): T[] {
    return [...this.items];
  }

  async add(item: Omit<T, "id">): Promise<T> {
    const id = this.items.reduce((max, i) => Math.max(max, i.id), 0) + 1;
    const created = { ...item, id } as T;
    this.items.push(created);
    await this.save();
    return created;
  }

  async update(id: number, changes: Partial<T>): Promise<T | undefined> {
    const index = this.items.findIndex((i) => i.id === id);
    if (index === -1) return undefined;
    this.items[index] = { ...this.items[index], ...changes, id };
    await this.save();
    return this.items[index];
  }

  // Writes are queued and done via a temp file + rename so a crash never
  // leaves a half-written file behind.
  private save(): Promise<void> {
    const snapshot = JSON.stringify(this.items, null, 2);
    this.writing = this.writing.then(async () => {
      const tmp = `${this.file}.tmp`;
      await fs.promises.writeFile(tmp, snapshot);
      await fs.promises.rename(tmp, this.file);
    });
    return this.writing;
  }
}

const newestFirst = <T extends { createdAt: string | Date | null }>(a: T, b: T) =>
  new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();

type StoredContactMessage = Omit<ContactMessage, "createdAt"> & { createdAt: string };

const inquiries = new JsonCollection<Inquiry>("inquiries");
const contactMessages = new JsonCollection<StoredContactMessage>("contact-messages");

const toContactMessage = (m: StoredContactMessage): ContactMessage => ({
  ...m,
  createdAt: new Date(m.createdAt),
});

export const formStore = {
  async addInquiry(data: InquiryData): Promise<Inquiry> {
    const { website: _honeypot, consent: _consent, ...rest } = data;
    return inquiries.add({ ...rest, status: "new", createdAt: new Date().toISOString() });
  },

  getInquiries(): Inquiry[] {
    return inquiries.all().sort(newestFirst);
  },

  updateInquiryStatus(id: number, status: InquiryStatus) {
    return inquiries.update(id, { status });
  },

  async addContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const created = await contactMessages.add({
      ...message,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    return toContactMessage(created);
  },

  getContactMessages(): ContactMessage[] {
    return contactMessages.all().sort(newestFirst).map(toContactMessage);
  },

  async markContactMessageAsRead(id: number): Promise<ContactMessage | undefined> {
    const updated = await contactMessages.update(id, { isRead: true });
    return updated && toContactMessage(updated);
  },
};
