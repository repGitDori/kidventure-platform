import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { faqs } from "./content";
import { Squiggle } from "./doodles";

export default function FAQ() {
  return (
    <section id="faq" className="bg-white px-4 py-16 md:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <Squiggle className="mx-auto mb-4 h-4 w-24 text-kv-sky" />
          <h2 className="font-display text-4xl font-bold text-kv-ink md:text-5xl">Questions from parents</h2>
          <p className="mt-4 font-body text-lg text-kv-inkSoft">Don't see yours? Send us a message below.</p>
        </div>

        <Accordion type="single" collapsible className="mt-12 space-y-4">
          {faqs.map((item, i) => (
            <AccordionItem
              key={item.question}
              value={`faq-${i}`}
              className="rounded-3xl border-none bg-kv-cream px-6 ring-1 ring-kv-sand data-[state=open]:bg-[#FDF0D2]"
            >
              <AccordionTrigger className="py-5 text-left font-display text-xl font-semibold text-kv-ink hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="pb-5 font-body text-base leading-relaxed text-kv-inkSoft">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
