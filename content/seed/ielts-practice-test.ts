import type { QuestionAuthoring } from "@english4free/content-schemas";

/**
 * Original English 4 Free IELTS-style practice content (not IELTS material).
 * Questions use the shared flat authoring format, so this file also exercises
 * the same conversion the CMS form and spreadsheet importer use.
 */
export type SeedQuestion = { id: string; authoring: QuestionAuthoring; explanation: string };
export type SeedPart = { id: string; partNumber: number; title: string; skill: "LISTENING" | "READING"; instructions: string; metadata: Record<string, unknown>; passage?: { id: string; title: string; content: string }; questions: SeedQuestion[] };
export type SeedExam = { id: string; slug: string; title: string; mode: "PRACTICE"; durationSeconds: number; parts: SeedPart[] };

const uuid = (value: number) => `91000000-0000-4000-8000-${value.toString(16).padStart(12, "0")}`;

const listeningTranscript = `Receptionist: Good morning, Riverside Sports Centre. How can I help?
Caller: Hi, I'd like to join the evening swimming class.
Receptionist: Of course. Can I take your name?
Caller: It's Laura Brennan. That's B-R-E-N-N-A-N.
Receptionist: Thank you. The class runs on Tuesdays and Thursdays, starting at seven fifteen in the evening. Each session lasts forty-five minutes.
Caller: And how much does it cost?
Receptionist: The monthly fee is thirty-two pounds, or twenty-five pounds if you have a student card.
Caller: I'm a student, so that's great. What do I need to bring?
Receptionist: You'll need a towel, and please bring a padlock for the lockers. Goggles are optional, but we don't provide them.
Caller: Is there parking?
Receptionist: Yes, but it fills up quickly, so most people come by bus. The number eighteen stops right outside.
Caller: Lovely. Is there a class at the weekend too?
Receptionist: There's a Saturday morning beginners' class, but I'm afraid it has no places left at the moment.`;

const readingPassage = `A  Twenty years ago, keeping bees in a city would have struck most people as eccentric. Today, hives sit on the rooftops of hotels, office blocks and railway stations in cities from London to Tokyo. Supporters argue that urban beekeeping reconnects residents with food production and helps to reverse the decline of pollinating insects.

B  The appeal is partly practical. Cities are often warmer than the surrounding countryside, and gardens, parks and roadside verges offer a long flowering season. Many urban gardeners avoid the pesticides common on intensive farms, so city bees may encounter fewer harmful chemicals than their rural relatives.

C  However, ecologists have begun to question whether more hives are always better. Honeybees are only one of hundreds of bee species, and most wild bees live alone rather than in colonies. When the number of honeybee hives rises sharply, the insects compete with wild bees for the same limited supply of nectar and pollen. A study in Paris suggested that areas with the most hives had fewer visits from wild pollinators.

D  For this reason, some city councils now encourage residents to plant flowers rather than install new hives. Their reasoning is simple: a hive adds consumers of nectar, while a flower bed adds food for every species. A few cities have gone further and require new beekeepers to complete a training course.

E  Beekeepers themselves are divided. Some feel that their hobby is being unfairly blamed, pointing out that habitat loss remains the main threat to wild bees. Others welcome the debate and argue that responsible beekeeping means keeping fewer, healthier colonies. What most agree on is that the future of city bees depends less on the number of hives than on the amount of green space available to them.`;

export const ieltsPracticeTest: SeedExam = {
  id: uuid(1), slug: "ielts-practice-test-1", title: "IELTS Practice Test 1 — Listening & Reading", mode: "PRACTICE", durationSeconds: 40 * 60,
  parts: [
    {
      id: uuid(10), partNumber: 1, title: "Listening Section 1 — Joining a sports centre", skill: "LISTENING",
      instructions: "Listen to a phone call between a receptionist and a caller, then answer Questions 1–10. You can play the recording twice.",
      metadata: { mediaKind: "GENERATED_TTS", playbackText: listeningTranscript, playbackLimit: 2, audioVoices: { Receptionist: "en-GB-RyanNeural", Caller: "en-GB-SoniaNeural" } },
      questions: [
        { id: uuid(11), explanation: "The caller spells her surname B-R-E-N-N-A-N; the class runs on Tuesdays and Thursdays at 7.15, and the student fee is £25.", authoring: { type: "FILL_BLANK", wordLimit: 2, prompt: "Complete the form. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.\n\nSurname: ___\nClass days: Tuesdays and ___\nStart time: ___ p.m.\nStudent fee per month: £___", acceptedAnswers: "Brennan; Thursdays | Thursday; 7.15 | 7:15 | seven fifteen; 25 | twenty-five | twenty five" } },
        { id: uuid(12), explanation: "Members need a towel and a padlock for the lockers. Goggles are optional.", authoring: { type: "MULTI_SELECT", prompt: "Which TWO things must members bring to the class?", options: ["goggles", "a towel", "a padlock", "a water bottle", "a swimming certificate"], correct: "B, C" } },
        { id: uuid(13), explanation: "Parking fills up quickly, so most people come by bus.", authoring: { type: "MCQ", prompt: "How do most people travel to the centre?", options: ["by car", "by bus", "on foot"], correct: "B" } },
        { id: uuid(14), explanation: "Each evening session lasts forty-five minutes; the Saturday class has no places left; goggles are not provided.", authoring: { type: "MATCHING", prompt: "What does the receptionist say about each of the following? Choose the correct letter, A–D.", items: ["The evening swimming class", "The Saturday beginners' class", "Swimming goggles"], options: ["It has no places left.", "It is not provided by the centre.", "It lasts forty-five minutes.", "It is free for students."], correct: "C, A, B" } }
      ]
    },
    {
      id: uuid(20), partNumber: 2, title: "Reading Passage — The Return of the Urban Beekeeper", skill: "READING",
      instructions: "Read the passage, then answer Questions 11–23.",
      metadata: {},
      passage: { id: uuid(21), title: "The Return of the Urban Beekeeper", content: readingPassage },
      questions: [
        { id: uuid(22), explanation: "B explains why cities suit bees; C describes competition for nectar and pollen; D recommends planting flowers; E describes disagreement among beekeepers.", authoring: { type: "MATCHING", prompt: "Choose the correct heading for paragraphs B–E from the list of headings.", items: ["Paragraph B", "Paragraph C", "Paragraph D", "Paragraph E"], options: ["Competition for limited food", "Why towns suit bees", "A disagreement among hobbyists", "The cost of starting a hive", "Planting instead of keeping", "Honey sales in city markets"], correct: "B, A, E, C" } },
        { id: uuid(23), explanation: "Paragraph A says that twenty years ago city beekeeping would have seemed eccentric.", authoring: { type: "TRUE_FALSE", prompt: "Urban beekeeping was already popular twenty years ago.", correct: "False" } },
        { id: uuid(24), explanation: "Paragraph B: city bees may encounter fewer harmful chemicals than bees near intensive farms.", authoring: { type: "TRUE_FALSE", prompt: "City bees may be exposed to fewer pesticides than bees near intensive farms.", correct: "True" } },
        { id: uuid(25), explanation: "The passage mentions the Paris study's findings about wild pollinators but says nothing about honey production.", authoring: { type: "TRUE_FALSE", prompt: "The Paris study measured how much honey each hive produced.", correct: "Not Given" } },
        { id: uuid(26), explanation: "Paragraph C: wild bees live alone; D: plant flowers and complete a training course; E: habitat loss is the main threat.", authoring: { type: "FILL_BLANK", wordLimit: 2, prompt: "Complete the summary. Write NO MORE THAN TWO WORDS from the passage for each answer.\n\nMost wild bees live ___ rather than in colonies. Some councils ask residents to plant ___ instead of installing hives, and a few require new beekeepers to complete a ___. Many beekeepers point out that the main threat to wild bees is ___.", acceptedAnswers: "alone; flowers | flower beds | flowerbeds; training course; habitat loss" } },
        { id: uuid(27), explanation: "The final sentence says the future of city bees depends more on green space than on the number of hives.", authoring: { type: "MCQ", prompt: "What is the writer's main conclusion?", options: ["Cities should ban new hives.", "Green space matters more than the number of hives.", "Honeybees are the most important pollinators.", "Beekeeping training should be compulsory everywhere."], correct: "B" } }
      ]
    }
  ]
};

export const ieltsSkillsDrill: SeedExam = {
  id: uuid(100), slug: "ielts-skills-drill-dictation-order", title: "IELTS Skills Drill — Dictation & Sentence Order", mode: "PRACTICE", durationSeconds: 15 * 60,
  parts: [
    {
      id: uuid(110), partNumber: 1, title: "Dictation", skill: "LISTENING",
      instructions: "Listen and write each sentence exactly as you hear it. Spelling counts; punctuation and capital letters do not.",
      metadata: {},
      questions: [
        { id: uuid(111), explanation: "Times can be written in words or figures.", authoring: { type: "DICTATION", prompt: "Write the sentence you hear.", audioText: "The library closes at half past nine on Fridays.", acceptedAnswers: "The library closes at half past nine on Fridays. | The library closes at 9.30 on Fridays. | The library closes at 9:30 on Fridays." } },
        { id: uuid(112), explanation: "Listen for the small words: “to”, “your” and “the”.", authoring: { type: "DICTATION", prompt: "Write the sentence you hear.", acceptedAnswers: "Please remember to bring your student card to the first seminar." } }
      ]
    },
    {
      id: uuid(120), partNumber: 2, title: "Sentence order", skill: "READING",
      instructions: "Put the sentences in the order that makes the clearest paragraph. Linking words such as “first”, “then” and “finally” will help you.",
      metadata: {},
      questions: [
        { id: uuid(121), explanation: "The sequence words First → Next → Then → Finally give the order.", authoring: { type: "ORDERING", prompt: "Put the exam tips in a logical order.", items: ["First, read the instructions carefully.", "Next, look at the questions before you read the passage.", "Then, scan the passage for key words from each question.", "Finally, check that every answer fits the word limit."] } },
        { id: uuid(122), explanation: "Paper-making moves from raw wood to pulp, then to sheets, then to drying.", authoring: { type: "ORDERING", prompt: "Put the stages of making paper in order.", items: ["Wood is cut into small chips.", "The chips are cooked into a soft pulp.", "The pulp is spread thinly on a screen.", "The wet sheets are pressed and dried."] } }
      ]
    }
  ]
};

export const ieltsPracticeExams = [ieltsPracticeTest, ieltsSkillsDrill];
