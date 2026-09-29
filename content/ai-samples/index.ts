/**
 * Evaluation sample set for D6 AI feedback quality (10–20 learner submissions across
 * CEFR levels). It is used by `pnpm ai:eval` to run the writing/speaking feedback
 * pipeline and produce a review sheet, so prompts can be tuned against a fixed
 * baseline. `focus` lists what good feedback should notice for each sample — it is the
 * human reviewer's checklist, never sent to the model.
 */
export type Cefr = "A2" | "B1" | "B2" | "C1";

export type WritingSample = {
  id: string;
  level: Cefr;
  taskType: "IELTS_TASK_1" | "IELTS_TASK_2" | "GENERAL";
  promptId: string;
  prompt: string;
  expectedMinimumWords?: number;
  text: string;
  focus: string[];
};

export type SpeakingSample = {
  id: string;
  level: Cefr;
  promptId: string;
  prompt: string;
  transcript: string;
  focus: string[];
};

export const writingSamples: WritingSample[] = [
  {
    id: "w-a2-daily-routine", level: "A2", taskType: "GENERAL", promptId: "sample-daily-routine",
    prompt: "Describe your typical day.", expectedMinimumWords: 80,
    text: "I wake up at 6 o'clock. I eat breakfast and go to school by bus. In the school I study english and math. I like math because it is easy for me. After school I go home and do my homework. In the evening I watch tv with my family and I go to bed at 10 o'clock. I very like my day because it is not boring.",
    focus: ["Repetition of simple sentence openers (\"I ...\")", "\"very like\" word-order error", "capitalisation of \"english\"", "limited connectives", "should still be encouraging at A2"]
  },
  {
    id: "w-b1-email-complaint", level: "B1", taskType: "GENERAL", promptId: "sample-email-complaint",
    prompt: "Write an email to a shop to complain about a product you bought that stopped working.",
    text: "Dear Sir or Madam, I am writing because I bought a headphone in your shop last week and now it is not working. The left side has no sound since yesterday. I am very disappointed because the price was high and I used it carefully. I would like you to repair it or give me my money back. I attach the receipt. I hope you can solve this problem soon. Yours faithfully, Minh.",
    focus: ["Register is appropriate (formal email)", "\"a headphone\" countability", "good task coverage", "could add more detail/paragraphing", "strengths: clear structure and purpose"]
  },
  {
    id: "w-b1-task2-transport", level: "B1", taskType: "IELTS_TASK_2", promptId: "task-2-public-transport-or-roads", expectedMinimumWords: 250,
    prompt: "Some people think governments should spend money on public transport rather than building new roads. To what extent do you agree or disagree?",
    text: "I agree that government should spend money for public transport more than new roads. First, public transport can carry many people at same time, so there are less cars on the road and less traffic jam. Also it is better for environment because buses and trains make less pollution than many cars. Some people say new roads are important for economy but i think if we build more roads, more people will buy cars and the problem come back again. In conclusion, i believe spending on public transport is better choice for city and for future.",
    focus: ["Under length (should flag below 250 words)", "lowercase \"i\"", "\"spend money for\" preposition", "article omissions (\"at same time\")", "position is clear and on-task", "needs fuller development / examples"]
  },
  {
    id: "w-b2-task2-longevity", level: "B2", taskType: "IELTS_TASK_2", promptId: "task-2-people-living-longer", expectedMinimumWords: 250,
    prompt: "In many countries people are living longer than before. Do the advantages of this development outweigh the disadvantages?",
    text: "It is true that life expectancy has risen significantly in recent decades. While an ageing population brings certain challenges, I would argue that the benefits ultimately outweigh the drawbacks. On the one hand, longer lives place pressure on healthcare systems and pension funds, as a smaller working population must support more retirees. This can slow economic growth. On the other hand, older citizens contribute a great deal: many continue to work, volunteer, and care for grandchildren, and their experience is valuable to families and businesses. Moreover, rising longevity is a sign of medical and social progress that societies should celebrate rather than fear. In my view, with sensible policies such as flexible retirement and investment in preventive healthcare, the advantages clearly prevail.",
    focus: ["Strong cohesion and range (should score higher)", "balanced structure", "minor: could add a concrete example", "feedback should recognise clear strengths, not over-criticise"]
  },
  {
    id: "w-b1-task1-broadband", level: "B1", taskType: "IELTS_TASK_1", promptId: "task-1-broadband-households", expectedMinimumWords: 150,
    prompt: "The line graph shows the percentage of households with broadband in three countries between 2000 and 2020. Summarise the information.",
    text: "The graph show the percent of home with broadband in three country from 2000 to 2020. In 2000 all country have low broadband, under 10 percent. After that all of them go up. Country A grow fastest and reach almost 90 percent in 2020. Country B also increase but slower, it is about 70 percent in the end. Country C is the lowest all the time and finish around 50 percent. Overall, broadband become much more popular in twenty years in every country.",
    focus: ["\"The graph show\" subject-verb agreement", "plural: \"three country\"", "good overview sentence present", "data is described but tenses slip", "keep encouraging — trends are captured"]
  },
  {
    id: "w-c1-task2-university", level: "C1", taskType: "IELTS_TASK_2", promptId: "task-2-purpose-of-university", expectedMinimumWords: 250,
    prompt: "Some believe the main purpose of university is to prepare students for employment. Others think it should broaden the mind. Discuss both views and give your opinion.",
    text: "The question of what universities are ultimately for has become increasingly contested as tuition costs rise and graduate outcomes are scrutinised. Advocates of a vocational model argue, not unreasonably, that degrees represent a substantial investment which ought to yield tangible returns in the labour market; from this perspective, curricula should be aligned with industry demand. Yet reducing higher education to job training risks impoverishing it. Universities have historically served as spaces where students encounter unfamiliar ideas, refine their reasoning, and develop the intellectual autonomy that no narrowly technical course can guarantee. My own view is that these aims are complementary rather than opposed: the graduate who can think critically and adapt is precisely the one employers claim to want. Institutions should therefore resist a false choice, embedding transferable analytical skills within disciplines that also cultivate curiosity for its own sake.",
    focus: ["High-quality response — feedback must not invent errors", "sophisticated cohesion and lexis", "should give SECURE-level rubric with genuine, specific praise", "at most a subtle refinement suggestion"]
  }
];

export const speakingSamples: SpeakingSample[] = [
  {
    id: "s-a2-hometown", level: "A2", promptId: "speaking-hometown-and-places",
    prompt: "Tell me about your hometown.",
    transcript: "My hometown is Da Nang. It is a city in the center of Vietnam. Um, it is near the sea so we have many nice beach. The weather is hot in summer. I like my hometown because the food is very delicious and the people is friendly. Um, on weekend I like go to the beach with my friend.",
    focus: ["fillers (\"um\")", "\"many nice beach\" plural", "\"the people is\" agreement", "\"like go\" missing to-infinitive", "still a full A2 answer — encourage"]
  },
  {
    id: "s-b1-technology", level: "B1", promptId: "speaking-useful-technology",
    prompt: "Describe a piece of technology you find useful.",
    transcript: "I want to talk about my smartphone. I think it is the most useful technology for me because I use it for everything. For example I use it to study English, to talk with my family, and to find the way when I travel. Before I had a smartphone, I always get lost in new city. Now it is very easy. Also I can read news and listen music anytime. So yeah, my smartphone is really important in my daily life.",
    focus: ["good task response and examples", "\"get lost\" tense (past context)", "\"listen music\" missing \"to\"", "\"in new city\" article", "fluency is good — recognise it"]
  },
  {
    id: "s-b2-journey", level: "B2", promptId: "speaking-a-journey-that-changed",
    prompt: "Describe a journey that changed the way you think.",
    transcript: "A journey that really changed my perspective was a trip I took to the countryside last year to volunteer at a small school. Honestly, before that I had always assumed that happiness depended a lot on having modern things, but the children there had very little and yet they were incredibly cheerful and curious. Spending two weeks teaching them made me realise that connection and purpose matter far more than possessions. Since then I've tried to focus less on buying things and more on the people around me. It was, without doubt, one of the most meaningful experiences of my life.",
    focus: ["strong, fluent, well-organised answer", "rich linking and lexis", "should get high rubric levels", "feedback must be genuine, not fabricate corrections"]
  },
  {
    id: "s-a2-short-food", level: "A2", promptId: "speaking-a-shared-meal",
    prompt: "Talk about a meal you enjoy sharing with others.",
    transcript: "I like hot pot. My family eat it together in winter. It is warm and we talk a lot. Very fun.",
    focus: ["very short — should flag length and ask for more detail/examples", "simple but correct sentences", "\"my family eat\" agreement", "keep encouraging at A2"]
  }
];
