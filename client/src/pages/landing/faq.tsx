import FAQAccordion from "@/components/ui/faq-accordion";
import type { FAQItem } from "@/lib/types";

export default function FAQ() {
  const faqItems: FAQItem[] = [
    {
      question: "When will KidVenture be available?",
      answer: "We're currently in the final stages of development and plan to launch in early 2023. By joining our waitlist, you'll be among the first to know when we're ready!"
    },
    {
      question: "What age groups is KidVenture designed for?",
      answer: "KidVenture is designed for children ages 3-12, with age-appropriate content and activities for different developmental stages. Our platform grows with your child!"
    },
    {
      question: "How does the branch management system work?",
      answer: "Our branch management system allows educational organizations to manage multiple locations from a single platform. Administrators can oversee all branches while staff can focus on their specific location. Parents can interact with whichever branch their child attends."
    },
    {
      question: "Is my child's data secure?",
      answer: "Absolutely. We take data security very seriously, especially when it comes to children's information. Our platform uses encryption, secure authentication, and follows COPPA compliance guidelines. We never share personal data with third parties without explicit consent."
    },
    {
      question: "What devices can I use KidVenture on?",
      answer: "KidVenture is designed to work on any modern device with a web browser, including computers, tablets, and smartphones. We're also developing dedicated mobile apps for iOS and Android that will be available shortly after launch."
    }
  ];
  
  return (
    <section id="faq" className="py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-gray-800 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600">
            Find answers to common questions about KidVenture.
          </p>
        </div>
        
        <FAQAccordion items={faqItems} />
      </div>
    </section>
  );
}
