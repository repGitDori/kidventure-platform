import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQItem } from "@/lib/types";

interface FAQAccordionProps {
  items: FAQItem[];
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>([]);
  
  const toggleItem = (value: string) => {
    setOpenItems((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  };
  
  return (
    <Accordion
      type="multiple"
      value={openItems}
      onValueChange={setOpenItems}
      className="space-y-6"
    >
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          value={`item-${index}`}
          className="bg-white rounded-xl shadow-md overflow-hidden border-none"
        >
          <AccordionTrigger
            onClick={() => toggleItem(`item-${index}`)}
            className="px-6 py-4 font-heading font-semibold text-lg hover:no-underline"
          >
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-4 text-gray-600">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
