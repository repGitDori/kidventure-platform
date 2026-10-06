// All of the landing page wording lives here so it can be edited in one place.
// Anything in [brackets] is a placeholder — replace it with your real details.

export const site = {
  name: "Kid-Venture",
  tagline: "Play. Explore. Grow.",
  city: "[Your City]",
  email: "hello@kid-venture.com",
  phone: "[(555) 123-4567]",
  address: "[Street address, City, State]",
  hours: "Monday – Friday, 7:00 am – 6:00 pm",
};

export const hero = {
  badge: `Opening soon in ${site.city}`,
  titleStart: "Little explorers,",
  titleHighlight: "big adventures",
  description:
    "Kid-Venture is a small, home-hearted daycare where curiosity leads the way. Children learn through play, nature and lots of laughter — and parents get peace of mind every single day.",
};

export const promises = [
  { title: "Small groups", text: "Low child-to-teacher ratios so every child is truly seen." },
  { title: "Safety first", text: "Secure check-in, a childproofed space and clear daily routines." },
  { title: "Healthy food", text: "Nutritious meals and snacks, with allergies taken seriously." },
  { title: "Daily updates", text: "Photos and notes about naps, meals and milestones." },
];

export const programs = [
  {
    name: "Little Sprouts",
    ages: "6 weeks – 12 months",
    color: "sage",
    description:
      "Cuddles, tummy time and gentle sensory play, following each baby's own rhythm for feeding and naps.",
    highlights: ["Personal daily schedules", "Sensory exploration", "Lots of one-on-one care"],
  },
  {
    name: "Busy Explorers",
    ages: "1 – 2 years",
    color: "sun",
    description:
      "Wobbly first steps turn into big discoveries — music, movement, messy art and first words.",
    highlights: ["Music & movement", "Early language games", "Outdoor play every day"],
  },
  {
    name: "Curious Minds",
    ages: "3 – 5 years",
    color: "coral",
    description:
      "Play-based preschool that builds kindergarten readiness: letters, numbers, friendship and confidence.",
    highlights: ["Pre-reading & early math", "Science & nature projects", "Social-emotional skills"],
  },
] as const;

export const dailyRhythm = [
  { time: "7:00", title: "Warm welcome", text: "Free play and a cozy hello while families drop off." },
  { time: "9:00", title: "Circle time", text: "Songs, stories and our question of the day." },
  { time: "10:00", title: "Outdoor adventure", text: "Fresh air, digging, climbing and nature walks." },
  { time: "11:30", title: "Lunch & rest", text: "A healthy meal together, then quiet nap time." },
  { time: "2:30", title: "Creative studio", text: "Painting, building, pretend play and sensory bins." },
  { time: "4:30", title: "Wind down", text: "Puzzles, books and a happy hand-off at pickup." },
];

export const founderNote = {
  title: "A note from our founder",
  paragraphs: [
    "Kid-Venture started as a dream at our own kitchen table: a place where children feel as safe and loved as they do at home, while discovering something new every day.",
    "We believe the early years are made for wonder — muddy boots, block towers and endless “why?” questions. Our job is to protect that curiosity and give it room to grow.",
    "We can't wait to meet your family.",
  ],
  signature: "— The Kid-Venture family",
};

export const faqs = [
  {
    question: "When will Kid-Venture open?",
    answer:
      "We're getting everything ready now. Join the interest list and you'll be the first to hear about our opening date, tours and enrollment.",
  },
  {
    question: "What ages do you care for?",
    answer:
      "We plan to welcome children from 6 weeks to 5 years old, grouped into Little Sprouts, Busy Explorers and Curious Minds.",
  },
  {
    question: "What does a typical day look like?",
    answer:
      "Our days balance active and quiet time: circle time, outdoor play, healthy meals, naps and creative projects. See “A day at Kid‑Venture” above for the full rhythm.",
  },
  {
    question: "Will I get updates during the day?",
    answer:
      "Yes! Parents receive photos and short notes about meals, naps, activities and milestones, plus a secure parent portal to keep everything in one place.",
  },
  {
    question: "Can I visit before enrolling?",
    answer:
      "Absolutely. Once we open, we'll offer tours so you can see the space and meet the team. Join the interest list and we'll reach out to schedule one.",
  },
];
