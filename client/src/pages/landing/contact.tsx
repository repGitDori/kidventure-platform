import { Clock, Mail, MapPin, Phone } from "lucide-react";
import ContactForm from "@/components/ui/contact-form";
import { site } from "./content";
import { Wave } from "./doodles";

const details = [
  { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
  { icon: Phone, label: "Phone", value: site.phone },
  { icon: MapPin, label: "Location", value: site.address },
  { icon: Clock, label: "Hours", value: site.hours },
];

export default function Contact() {
  return (
    <section id="contact" className="bg-kv-sage">
      <Wave className="-mt-px text-white" flip />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:py-20">
        <div className="text-kv-ink">
          <h2 className="font-display text-4xl font-bold md:text-5xl">Say hello 👋</h2>
          <p className="mt-4 max-w-md font-body text-lg text-kv-ink/80">
            Have a quick question before filling out the request form? Send a note and we'll get back to you within a day.
          </p>
          <ul className="mt-10 space-y-5">
            {details.map(({ icon: Icon, label, value, href }) => (
              <li key={label} className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/70">
                  <Icon className="h-5 w-5 text-kv-sageDark" />
                </span>
                <div>
                  <p className="font-body text-sm font-bold uppercase tracking-wide text-kv-ink/60">{label}</p>
                  {href ? (
                    <a href={href} className="font-body text-lg font-semibold underline-offset-4 hover:underline">
                      {value}
                    </a>
                  ) : (
                    <p className="font-body text-lg font-semibold">{value}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[2rem] bg-white p-6 shadow-xl md:p-8">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
