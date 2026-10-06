// All of the landing page wording lives here so it can be edited in one place.
// Anything in [brackets] is a placeholder — replace it with your real details.

export const site = {
  name: "Kid-Venture",
  tagline: "Play. Explore. Grow.",
  area: "Lehi & American Fork",
  region: "Utah County, Utah",
  email: "hello@kid-venture.com",
  phone: "[(801) 555-1234]",
  // For privacy, the home address is only shared with families after they get in touch.
  address: "In-home daycare serving Lehi & American Fork — address shared when we schedule your visit",
  hours: "Monday – Friday, [7:30 am – 5:30 pm]",
};

export const hero = {
  badge: `In-home daycare · ${site.area} · Limited spots`,
  titleStart: "A cozy home for",
  titleHighlight: "little explorers",
  description:
    "Kid-Venture is a small, in-home daycare in Utah County run by a mom of two with a bachelor's degree in childhood education and years of experience leading a daycare. Just a few spots, so every child gets real attention, real learning and lots of love.",
};

export const promises = [
  { title: "Degreed educator", text: "A bachelor's in childhood education behind every activity and routine." },
  { title: "Proven experience", text: "Formerly managed a daycare and led a team of six caregivers." },
  { title: "A tiny group", text: "Only a few children join my own two, so no one gets lost in the crowd." },
  { title: "Home, not a center", text: "A warm, family setting with daily photos and updates for you." },
];

export const programs = [
  {
    name: "Play & Discovery",
    tag: "Hands-on",
    color: "sage",
    description:
      "Children learn best by doing. Sensory bins, building, pretend play and time outdoors spark curiosity every day.",
    highlights: ["Outdoor & nature play", "Arts, crafts & messy fun", "Music & movement"],
  },
  {
    name: "Early Learning",
    tag: "School-ready",
    color: "sun",
    description:
      "Gentle, play-based lessons planned with an educator's eye, matched to each child's age and stage.",
    highlights: ["Letters & early reading", "Numbers & counting", "Kindergarten readiness"],
  },
  {
    name: "Heart & Character",
    tag: "Kind & confident",
    color: "coral",
    description:
      "In a small, family-style group, children practice sharing, taking turns, naming feelings and helping each other.",
    highlights: ["Friendship & social skills", "Feelings & self-regulation", "Healthy routines"],
  },
] as const;

export const dailyRhythm = [
  { time: "7:30", title: "Warm welcome", text: "Breakfast, free play and a cozy hello while families drop off." },
  { time: "9:00", title: "Circle time", text: "Songs, stories, the calendar and our question of the day." },
  { time: "9:30", title: "Learning centers", text: "Short, playful lessons in letters, numbers and discovery." },
  { time: "10:30", title: "Outdoor adventure", text: "Backyard play, walks to the park and nature hunts." },
  { time: "12:00", title: "Lunch & rest", text: "A healthy lunch together, then quiet nap or rest time." },
  { time: "3:00", title: "Create & wind down", text: "Art, building, puzzles and books until pickup." },
];

export const founderNote = {
  title: "Hi, I'm so glad you're here",
  paragraphs: [
    "I'm a mom of two and I have a bachelor's degree in childhood education. Before staying home with my own kids, I managed a daycare and led a team of six caregivers. I loved helping children grow, and I loved helping parents feel at ease.",
    "Now I'm opening my home in the Lehi / American Fork area to a few more children. My goal is simple: to give your child the same care, structure and fun learning I give my own kids, in a setting that feels like family.",
    "Because the group is small, spots are limited. Tell me a little about your family below and I'll reach out personally.",
  ],
  signature: "— [Your name], founder of Kid-Venture",
};

export const faqs = [
  {
    question: "Where are you located?",
    answer:
      "Kid-Venture is an in-home daycare serving families in Lehi and American Fork (Utah County). For the safety of the children, we share the exact address when we schedule your visit.",
  },
  {
    question: "How many spots are available?",
    answer:
      "Just a few. Keeping the group small is what makes home daycare special, so spots fill up quickly. Fill out the request form to be considered.",
  },
  {
    question: "What ages do you care for?",
    answer:
      "Add your child's birthdate in the request form and we'll let you know if we have a good fit for their age. Small, mixed-age groups help little ones learn from each other.",
  },
  {
    question: "How much does it cost?",
    answer:
      "Tuition depends on your child's age and how many days you need. Share your budget in the form and we'll talk through options that work for your family.",
  },
  {
    question: "What will my child learn?",
    answer:
      "Every day mixes play-based lessons (letters, numbers, science), outdoor time, art and music, plus social skills like sharing and naming feelings. You can tell us which topics matter most to you in the form.",
  },
  {
    question: "Can I visit before enrolling?",
    answer:
      "Yes, please do! After you send your request, we'll reach out to set up a visit so you can see the space and meet us.",
  },
];
