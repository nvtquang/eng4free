export type ExamMode = "PRACTICE" | "MINI_TEST" | "FULL_MOCK";
type PartFixture = { id: string; partNumber: number; title: string; skill: "LISTENING" | "READING"; instructions: string; metadata: Record<string, unknown>; passage?: { id: string; title: string; content: string }; question: { id: string; prompt: string; options: { id: string; text: string }[]; correctOptionId: string; explanation: string; image?: { src: string; alt: string } } };
export type ExamFixture = { id: string; slug: string; title: string; type: "TOEIC" | "IELTS"; mode: ExamMode; durationSeconds: number; parts: PartFixture[] };
const uuid = (value: number) => `90000000-0000-4000-8000-${value.toString(16).padStart(12, "0")}`;
const options = (correct: string, wrong1: string, wrong2: string) => [{ id: "a", text: correct }, { id: "b", text: wrong1 }, { id: "c", text: wrong2 }];
/** Parts 1–2 print only answer letters, as in the real test: the statements and responses are heard, not read. */
const spokenChoices = (count: number) => Array.from({ length: count }, (_, index) => ({ id: "abcd"[index]!, text: "ABCD"[index]! }));
type ListeningDefinition = { title: string; prompt: string; audio: string; options: { id: string; text: string }[]; correctOptionId: string; explanation: string; image?: { src: string; alt: string } };
const listeningParts: Record<number, ListeningDefinition> = {
  1: {
    title: "Photographs", prompt: "Look at the picture. Listen to the four statements and choose the one that best describes it.",
    image: { src: "/demo-media/images/toeic-part1-library-shelf.svg", alt: "TOEIC Part 1 photograph: a person in a library next to a tall bookcase." },
    audio: "Narrator: Look at the picture. Choose the statement that best describes what you see.\n(A) She's opening a window.\n(B) She's placing a book on a shelf.\n(C) Some boxes are being carried outside.\n(D) The shelves are empty.",
    options: spokenChoices(4), correctOptionId: "b",
    explanation: "(B) She's placing a book on a shelf. The picture shows no window, no boxes being carried, and the shelves are full of books."
  },
  2: {
    title: "Question–response", prompt: "Listen to the question and the three responses. Choose the best response.",
    audio: "Woman: Where will the training workshop take place?\nMan: (A) At three o'clock this afternoon.\n(B) Yes, I really enjoyed it.\n(C) In the second-floor meeting room.",
    options: spokenChoices(3), correctOptionId: "c",
    explanation: "The question asks where, so (C) \"In the second-floor meeting room\" answers it. (A) answers when, and (B) answers a yes/no question."
  },
  3: {
    title: "Conversations", prompt: "What will the speakers do next?",
    audio: "Woman: Hi, Daniel. Did you hear that the project meeting has moved to Thursday afternoon?\nMan: No, I didn't. I thought it was still on Wednesday morning.\nWoman: It was, but the client asked for more time to review the designs. Let's check the updated schedule before we email the team.\nMan: Good idea. I'll open it on my laptop right now.",
    options: [{ id: "a", text: "Check the updated schedule." }, { id: "b", text: "Cancel the event." }, { id: "c", text: "Order new computers." }], correctOptionId: "a",
    explanation: "The woman says, \"Let's check the updated schedule before we email the team,\" and the man agrees to open it."
  },
  4: {
    title: "Short talks", prompt: "What is the purpose of the announcement?",
    audio: "Speaker: Good morning, and welcome to the Harbor View Hotel. Please note that the main entrance is closed today for maintenance work. Until the work is finished, guests should use the east entrance beside the café. We apologize for any inconvenience, and thank you for your patience.",
    options: [{ id: "a", text: "To explain a temporary entrance change." }, { id: "b", text: "To advertise a new restaurant." }, { id: "c", text: "To announce a job opening." }], correctOptionId: "a",
    explanation: "The speaker says the main entrance is closed today and guests should use the east entrance instead."
  }
};
const toeicPart = (partNumber: number, offset: number, mode: ExamMode): PartFixture => {
  const spoken = listeningParts[partNumber];
  if (spoken) return { id: uuid(offset), partNumber, title: spoken.title, skill: "LISTENING", instructions: mode === "PRACTICE" ? "Listen and choose the best answer. In practice mode you can play the recording twice." : "Listen and choose the best answer. The recording plays once.", metadata: { playbackText: spoken.audio, playbackLimit: mode === "PRACTICE" ? 2 : 1, mediaKind: "GENERATED_TTS" }, question: { id: uuid(offset + 200), prompt: spoken.prompt, options: spoken.options, correctOptionId: spoken.correctOptionId, explanation: spoken.explanation, image: spoken.image } };
  const definitions: Record<number, { title: string; prompt: string; correct: string; wrong1: string; wrong2: string; passage?: string }> = {
    5: { title: "Incomplete sentences", prompt: "The report must be submitted ___ Friday.", correct: "by", wrong1: "during", wrong2: "among" },
    6: { title: "Text completion", prompt: "Which word best completes the notice?", correct: "available", wrong1: "availability", wrong2: "availably", passage: "The new training guide is now ___ on the staff portal. Please read it before Monday." },
    7: { title: "Reading comprehension", prompt: "Why did Mina write the message?", correct: "To confirm a delivery time.", wrong1: "To request a refund.", wrong2: "To apply for a position.", passage: "Hello Alex, the replacement chairs will arrive between 9 and 11 tomorrow. Please confirm that someone can open the storage room. Thanks, Mina." }
  }; const item = definitions[partNumber]!;
  return { id: uuid(offset), partNumber, title: item.title, skill: "READING", instructions: "Read and choose the best answer.", metadata: {}, passage: item.passage ? { id: uuid(offset + 100), title: `${item.title} passage`, content: item.passage } : undefined, question: { id: uuid(offset + 200), prompt: item.prompt, options: options(item.correct, item.wrong1, item.wrong2), correctOptionId: "a", explanation: `The best answer is “${item.correct}”.` } };
};
const makeToeic = (idValue: number, slug: string, title: string, mode: ExamMode, parts: number[], durationSeconds: number): ExamFixture => ({ id: uuid(idValue), slug, title, type: "TOEIC", mode, durationSeconds, parts: parts.map((part, index) => toeicPart(part, idValue + 10 + index, mode)) });
const practices = Array.from({ length: 7 }, (_, index) => makeToeic(1000 + index * 30, `toeic-part-${index + 1}-demo`, `TOEIC Part ${index + 1} Demo`, "PRACTICE", [index + 1], 300));
const ieltsListening: ExamFixture = { id: uuid(2000), slug: "ielts-listening-demo", title: "IELTS Listening Demo", type: "IELTS", mode: "PRACTICE", durationSeconds: 480, parts: [{ id: uuid(2001), partNumber: 1, title: "Community event", skill: "LISTENING", instructions: "Listen and choose the best answer.", metadata: { playbackText: "The community garden workshop starts at ten thirty on Saturday morning. Please bring a hat and a bottle of water.", playbackLimit: 2, mediaKind: "GENERATED_TTS" }, question: { id: uuid(2002), prompt: "What should participants bring?", options: options("A hat and water.", "A laptop.", "Gardening tools only."), correctOptionId: "a", explanation: "The announcement asks for a hat and a bottle of water." } }] };
const ieltsReading: ExamFixture = { id: uuid(2100), slug: "ielts-reading-demo", title: "IELTS Reading Demo", type: "IELTS", mode: "PRACTICE", durationSeconds: 600, parts: [{ id: uuid(2101), partNumber: 1, title: "Urban trees", skill: "READING", instructions: "Read the passage and choose the best answer.", metadata: {}, passage: { id: uuid(2102), title: "Urban trees", content: "Trees can lower surface temperatures in cities by providing shade. Their benefits depend on species, location, water availability, and long-term maintenance." }, question: { id: uuid(2103), prompt: "What does the passage say affects the benefits of urban trees?", options: options("Several planning and maintenance factors.", "Only the age of a city.", "The number of nearby cars."), correctOptionId: "a", explanation: "The passage lists species, location, water, and maintenance." } }] };
export const localExamFixtures: ExamFixture[] = [...practices, makeToeic(1500, "toeic-mini-demo", "TOEIC Mini Test", "MINI_TEST", [1, 2, 5, 7], 900), makeToeic(1700, "toeic-full-demo", "TOEIC Full-format Demo", "FULL_MOCK", [1, 2, 3, 4, 5, 6, 7], 1800), ieltsListening, ieltsReading];
