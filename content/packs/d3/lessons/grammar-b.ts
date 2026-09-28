import { lq, type LessonDef } from "../types";

const B1 = "Grammar for independent users";
const B2 = "Grammar for clear arguments";

export const grammarB: LessonDef[] = [
  {
    key: "grammar:b1:present-perfect", batch: "grammar", level: "B1", unit: B1, slug: "grammar-present-perfect-vs-past", title: "Present perfect or past simple?", skill: "GRAMMAR", minutes: 16,
    blocks: [
      { kind: "grammar", heading: "Form and use", body: "Present perfect: have / has + past participle (worked, been, written).\n\nUse it for:\n• experiences with no stated time → I've been to Singapore twice.\n• past actions with a result now → I've lost my wallet (so I can't pay).\n• situations that started in the past and continue now, with for / since → She has worked here since 2021.\n\nUse the past simple when the time is finished or stated → I went to Singapore in 2019.\n\nGhi chú: không dùng hiện tại hoàn thành với mốc thời gian đã kết thúc như yesterday, last year, in 2019, ago." },
      { kind: "text", heading: "Examples", body: "• Have you ever tried durian? — Yes, I tried it last month in Ben Tre.\n• We've known each other for ten years.\n• The price of rice has gone up this year.\n• He hasn't replied to my message yet.\n• I saw that film when I was a child." },
      { kind: "text", heading: "Common mistakes", body: "✗ I have seen him yesterday. → ✓ I saw him yesterday.\n✗ I live here since 2020. → ✓ I have lived here since 2020.\n✗ She has went home. → ✓ She has gone home." },
      { kind: "practice", instruction: "Choose the best form.", questions: [
        lq("I ___ this book three times.", ["read", "have read", "am reading"], 1, "An experience repeated up to now, no time given: present perfect."),
        lq("They ___ married in 2015.", ["got", "have got", "have been getting"], 0, "A finished time (in 2015) needs the past simple."),
        lq("She has lived in Can Tho ___ five years.", ["since", "for", "ago"], 1, "For + a period of time."),
        lq("Have you ___ been to a music festival?", ["ever", "yet", "ago"], 0, "Ever asks about experience at any time up to now."),
        lq("I can't open the door — I ___ my key.", ["lost", "have lost", "lose"], 1, "A past action with a result now: present perfect."),
        lq("We ___ the report yet.", ["didn't finish", "haven't finished", "don't finish"], 1, "Yet with a negative: haven't finished."),
        lq("When ___ you start learning English?", ["did", "have", "do"], 0, "When asks about a specific past time: past simple."),
        lq("He has worked at the bank ___ he left university.", ["for", "since", "during"], 1, "Since + a starting point.")
      ] }
    ]
  },
  {
    key: "grammar:b1:conditionals", batch: "grammar", level: "B1", unit: B1, slug: "grammar-first-second-conditional", title: "First and second conditionals", skill: "GRAMMAR", minutes: 16,
    blocks: [
      { kind: "grammar", heading: "Form and use", body: "First conditional — a real possibility in the future:\nIf + present simple, will + base verb → If it rains, we'll stay at home.\n\nSecond conditional — an unreal or unlikely situation now or in the future:\nIf + past simple, would + base verb → If I had more time, I would learn the guitar.\nWith be, were is common for all subjects: If I were you, I'd apply.\n\nThe if-clause can come second; then there is no comma: We'll stay at home if it rains.\n\nGhi chú: không dùng will trong mệnh đề if: If it rains (không nói If it will rain)." },
      { kind: "text", heading: "Examples", body: "• If you study every day, you'll improve quickly.\n• I'll call you if the train is late.\n• If we lived by the sea, we would go swimming every morning.\n• What would you do if you won the lottery?\n• If I were the manager, I'd change the schedule." },
      { kind: "text", heading: "Common mistakes", body: "✗ If I will see her, I will tell her. → ✓ If I see her, I will tell her.\n✗ If I would have money, I would buy it. → ✓ If I had money, I would buy it.\n✗ If I was you, … (informal) → ✓ If I were you, … (preferred in exams)" },
      { kind: "practice", instruction: "Choose the correct form.", questions: [
        lq("If you ___ now, you'll catch the bus.", ["leave", "will leave", "left"], 0, "First conditional: If + present simple."),
        lq("If I ___ you, I would talk to the teacher.", ["am", "were", "will be"], 1, "Advice with the second conditional: If I were you."),
        lq("We ___ the match if we play as a team.", ["would win", "win", "will win"], 2, "A real possibility: will + base verb."),
        lq("If she spoke Japanese, she ___ apply for the job in Osaka.", ["will", "could", "can"], 1, "Second conditional result: would / could + base verb."),
        lq("What would you do if you ___ a snake in your room?", ["find", "found", "will find"], 1, "Second conditional: If + past simple."),
        lq("Which sentence is a real possibility?", ["If the shop is open, I'll buy some bread.", "If I were a bird, I would fly home.", "If I had wings, I would fly."], 0, "Only the first describes something that can really happen."),
        lq("I wouldn't do that if I ___ you.", ["were", "am", "would be"], 0, "If I were you… is the standard form for advice."),
        lq("If it ___ tomorrow, the picnic will be cancelled.", ["will rain", "rains", "rained"], 1, "No will in the if-clause of a first conditional.")
      ] }
    ]
  },
  {
    key: "grammar:b1:obligation", batch: "grammar", level: "B1", unit: B1, slug: "grammar-must-have-to-should", title: "Must, have to and should", skill: "GRAMMAR", minutes: 15,
    blocks: [
      { kind: "grammar", heading: "Form and use", body: "must — strong obligation, often from the speaker, or a written rule → I must call my mum. Passengers must wear seat belts.\nhave to — obligation from outside (rules, work, circumstances) → I have to wear a uniform at work.\nshould — advice or the right thing to do → You should see a doctor.\n\nNegatives have different meanings:\nmustn't = it is not allowed → You mustn't smoke here.\ndon't have to = it is not necessary → You don't have to come early.\nshouldn't = it is not a good idea → You shouldn't eat so late.\n\nGhi chú: mustn't (cấm) và don't have to (không cần) rất khác nhau — đây là lỗi hay gặp trong bài thi." },
      { kind: "text", heading: "Examples", body: "• Students must show their ID card at the entrance.\n• My brother has to work on Saturdays.\n• You don't have to bring food — lunch is provided.\n• You mustn't use your phone during the exam.\n• We should leave now if we want a good seat." },
      { kind: "text", heading: "Common mistakes", body: "✗ You must to finish it today. → ✓ You must finish it today.\n✗ She have to go. → ✓ She has to go.\n✗ You mustn't pay; it's free. → ✓ You don't have to pay; it's free." },
      { kind: "practice", instruction: "Choose the best option.", questions: [
        lq("You ___ touch that wire. It's dangerous.", ["don't have to", "mustn't", "should"], 1, "It is not allowed / dangerous: mustn't."),
        lq("It's Sunday, so I ___ get up early.", ["mustn't", "don't have to", "shouldn't to"], 1, "It is not necessary: don't have to."),
        lq("You look tired. You ___ go to bed earlier.", ["should", "mustn't", "has to"], 0, "Advice: should."),
        lq("My sister ___ wear glasses to read.", ["have to", "has to", "must to"], 1, "She takes has to."),
        lq("Visitors ___ sign in at reception. (a written rule)", ["must", "should not", "don't have to"], 0, "A formal rule: must."),
        lq("Did you ___ pay for the tickets?", ["must", "have to", "had to"], 1, "Did + base form: have to."),
        lq("You ___ eat so much sugar. It's bad for your teeth.", ["shouldn't", "don't have to", "mustn't to"], 0, "Advice against something: shouldn't."),
        lq("Which sentence means 'it is not necessary'?", ["You mustn't wait for me.", "You don't have to wait for me.", "You shouldn't wait for me."], 1, "Don't have to = not necessary.")
      ] }
    ]
  },
  {
    key: "grammar:b1:relative-basic", batch: "grammar", level: "B1", unit: B1, slug: "grammar-relative-who-which-that", title: "Relative clauses with who, which, that, where", skill: "GRAMMAR", minutes: 15,
    blocks: [
      { kind: "grammar", heading: "Form and use", body: "Relative clauses give information about a noun.\n\nwho → people: The woman who lives next door is a pilot.\nwhich → things and animals: The phone which I bought is fast.\nthat → people or things (in defining clauses): The film that we saw was funny.\nwhere → places: This is the café where we first met.\nwhose → possession: That's the student whose bike was stolen.\n\nWhen the relative pronoun is the object, you can leave it out: The book (that) you lent me is great.\n\nGhi chú: không lặp lại đại từ trong mệnh đề: The man who I met him ✗ → The man who I met ✓." },
      { kind: "text", heading: "Examples", body: "• A nurse is someone who looks after patients.\n• I need a bag that is big enough for my laptop.\n• Hoi An is a town where you can walk everywhere.\n• The teacher whose class I joined is from Canada.\n• The song you played yesterday is stuck in my head." },
      { kind: "text", heading: "Common mistakes", body: "✗ The girl which won the prize… → ✓ The girl who won the prize…\n✗ The hotel where we stayed there… → ✓ The hotel where we stayed…\n✗ The man who his car… → ✓ The man whose car…" },
      { kind: "practice", instruction: "Choose the correct relative word.", questions: [
        lq("The doctor ___ treated me was very kind.", ["which", "who", "where"], 1, "A person: who."),
        lq("This is the restaurant ___ we celebrated my birthday.", ["where", "which", "who"], 0, "A place with an action inside it: where."),
        lq("I lost the umbrella ___ my grandmother gave me.", ["who", "whose", "that"], 2, "A thing: that or which."),
        lq("She's the writer ___ novel won the award.", ["who", "whose", "which"], 1, "Possession: whose."),
        lq("Which sentence is correct?", ["The bus that goes to the airport is number 86.", "The bus who goes to the airport is number 86.", "The bus where goes to the airport is number 86."], 0, "A thing takes that/which."),
        lq("Is this the key ___ opens the back door?", ["which", "who", "where"], 0, "A thing: which."),
        lq("The man ___ I spoke to was very helpful.", ["whose", "where", "who"], 2, "A person as the object: who (or that, or nothing)."),
        lq("The town ___ I grew up has changed a lot.", ["which", "where", "who"], 1, "A place: where.")
      ] }
    ]
  },
  {
    key: "grammar:b2:deduction", batch: "grammar", level: "B2", unit: B2, slug: "grammar-modals-of-deduction", title: "Modals of deduction: must, might, can't", skill: "GRAMMAR", minutes: 16,
    blocks: [
      { kind: "grammar", heading: "Form and use", body: "Use modal verbs to show how sure you are about something.\n\nPresent:\nmust + base verb → almost certain it is true: She must be at work; her car isn't here.\nmight / may / could + base verb → possible: He might be stuck in traffic.\ncan't + base verb → almost certain it is not true: That can't be Tom; he's in Paris.\n\nPast:\nmust / might / can't + have + past participle → They must have left early. She can't have seen us.\n\nGhi chú: phủ định của must (suy luận) là can't, không phải mustn't." },
      { kind: "text", heading: "Examples", body: "• The lights are off. They must be asleep.\n• I'm not sure where Linh is. She might be in the library.\n• You can't be hungry — you've just had lunch!\n• The road is wet. It must have rained last night.\n• He didn't answer. He may not have heard the phone." },
      { kind: "text", heading: "Common mistakes", body: "✗ He mustn't be at home; the lights are off. → ✓ He can't be at home…\n✗ She must has forgotten. → ✓ She must have forgotten.\n✗ They might went out. → ✓ They might have gone out." },
      { kind: "practice", instruction: "Choose the best modal.", questions: [
        lq("She has three jobs. She ___ be very busy.", ["can't", "must", "might not"], 1, "Strong evidence that it is true: must."),
        lq("That ___ be the right answer. It doesn't make sense.", ["can't", "must", "should"], 0, "Almost certain it is not true: can't."),
        lq("I'm not sure. The parcel ___ arrive tomorrow.", ["must", "can't", "might"], 2, "Only possible: might."),
        lq("The window is broken. Someone ___ thrown a ball through it.", ["must have", "must", "can't have"], 0, "A past deduction with evidence: must have + past participle."),
        lq("He ___ have seen me. I was hiding behind the door.", ["must", "can't", "should"], 1, "Past deduction that it is impossible: can't have."),
        lq("Which sentence is correct?", ["They must have finished.", "They must had finished.", "They must finished."], 0, "Modal + have + past participle."),
        lq("She isn't answering. She ___ be in a meeting.", ["may", "mustn't", "can"], 0, "A possible explanation: may."),
        lq("You ___ be tired after that long flight.", ["can't", "must", "mustn't"], 1, "A logical conclusion: must.")
      ] }
    ]
  },
  {
    key: "grammar:b2:relative-nondefining", batch: "grammar", level: "B2", unit: B2, slug: "grammar-defining-non-defining-clauses", title: "Defining and non-defining relative clauses", skill: "GRAMMAR", minutes: 16,
    blocks: [
      { kind: "grammar", heading: "Form and use", body: "Defining clauses tell us which person or thing we mean. They have no commas, and that is possible.\n→ The students who passed the test received certificates. (only those students)\n\nNon-defining clauses add extra information. They use commas, and that is not allowed.\n→ My brother, who lives in Hue, is a chef. (I have one brother; the clause is extra)\n\nIn non-defining clauses you cannot leave out the pronoun. Which can also refer to a whole idea:\n→ He arrived two hours late, which annoyed everyone.\n\nGhi chú: dấu phẩy làm thay đổi nghĩa — “My sister who lives in Hue” ngụ ý bạn có nhiều chị em." },
      { kind: "text", heading: "Examples", body: "• Ho Chi Minh City, which has over nine million people, is the largest city in Vietnam.\n• The laptop that I ordered hasn't arrived.\n• Our manager, whose office is on the top floor, rarely sends emails.\n• The flight was cancelled, which meant we stayed another night.\n• People who exercise regularly tend to sleep better." },
      { kind: "text", heading: "Common mistakes", body: "✗ My father, that is a doctor, works nights. → ✓ My father, who is a doctor, works nights.\n✗ Paris which is in France is beautiful. → ✓ Paris, which is in France, is beautiful.\n✗ She passed the exam, what surprised everyone. → ✓ …, which surprised everyone." },
      { kind: "practice", instruction: "Choose the best option.", questions: [
        lq("Hanoi, ___ is the capital of Vietnam, has many lakes.", ["that", "which", "where"], 1, "A non-defining clause about a thing: which (never that)."),
        lq("The applicants ___ were successful will be contacted on Friday.", ["whose", "which", "who"], 2, "People: who. It is a defining clause (which applicants?), so there are no commas."),
        lq("She won the award, ___ made her parents very proud.", ["which", "that", "what"], 0, "Which can refer to the whole previous idea."),
        lq("My grandmother, ___ garden is full of roses, is 85.", ["who", "whose", "which"], 1, "Possession: whose."),
        lq("Which sentence suggests the speaker has more than one sister?", ["My sister, who works in a bank, is visiting.", "My sister who works in a bank is visiting.", "My only sister, who works in a bank, is visiting."], 1, "Without commas, the clause defines which sister."),
        lq("The Mekong, ___ flows through six countries, is vital for farming.", ["which", "where", "who"], 0, "A river is a thing: which."),
        lq("Which sentence is punctuated correctly?", ["Da Lat which is in the highlands is cool all year.", "Da Lat, which is in the highlands, is cool all year.", "Da Lat, that is in the highlands, is cool all year."], 1, "A non-defining clause needs commas and which."),
        lq("The report ___ you sent me was very clear.", ["that", ", which", "what"], 0, "Defining clause about a thing: that (or which, or nothing).")
      ] }
    ]
  },
  {
    key: "grammar:b2:passive", batch: "grammar", level: "B2", unit: B2, slug: "grammar-passive-voice", title: "The passive voice", skill: "GRAMMAR", minutes: 16,
    blocks: [
      { kind: "grammar", heading: "Form and use", body: "Passive: be (in the right tense) + past participle.\n\nPresent simple: Coffee is grown in the Central Highlands.\nPast simple: The bridge was built in 1998.\nPresent perfect: The results have been published.\nFuture: The meeting will be held online.\nModal: The form must be signed.\nContinuous: The road is being repaired.\n\nUse the passive when the action is more important than who does it, or when the doer is unknown or obvious. Add by + agent only if it is useful: The novel was written by a young teacher.\n\nGhi chú: câu bị động rất phổ biến trong văn viết trang trọng, báo cáo và IELTS Writing Task 1 (quy trình)." },
      { kind: "text", heading: "Examples", body: "• English is spoken in many countries.\n• My bike was stolen last night.\n• The new airport will be opened next year.\n• Applications must be submitted by 30 June.\n• Our house is being painted this week, so we're staying with friends." },
      { kind: "text", heading: "Common mistakes", body: "✗ The letter was wrote yesterday. → ✓ The letter was written yesterday.\n✗ The problem has solved. → ✓ The problem has been solved.\n✗ It was happened in 2010. → ✓ It happened in 2010. (happen has no passive)" },
      { kind: "practice", instruction: "Choose the correct passive form.", questions: [
        lq("Rice ___ in the Mekong Delta.", ["grows", "is grown", "is growing by"], 1, "Present simple passive: is + past participle."),
        lq("The museum ___ in 1920.", ["was opened", "has opened", "was open by"], 0, "A finished past time: was + past participle."),
        lq("All the tickets ___ already ___.", ["have / sold", "have / been sold", "are / sold"], 1, "Present perfect passive: have been + past participle."),
        lq("The results ___ next Monday.", ["will announce", "will be announced", "are announcing"], 1, "Future passive: will be + past participle."),
        lq("Which verb cannot be made passive?", ["build", "arrive", "invite"], 1, "Arrive is intransitive (it has no object), so it has no passive."),
        lq("The kitchen ___ at the moment, so we can't cook.", ["is being cleaned", "is cleaned", "has cleaning"], 0, "An action in progress: is being + past participle."),
        lq("This form must ___ in black ink.", ["complete", "be completed", "completed"], 1, "Modal passive: must be + past participle."),
        lq("The Mona Lisa ___ by Leonardo da Vinci.", ["painted", "was painted", "is painting"], 1, "Past simple passive with an agent.")
      ] }
    ]
  },
  {
    key: "grammar:b2:reported", batch: "grammar", level: "B2", unit: B2, slug: "grammar-reported-speech", title: "Reported speech", skill: "GRAMMAR", minutes: 16,
    blocks: [
      { kind: "grammar", heading: "Form and use", body: "When we report what someone said, the verb usually moves one tense back after a past reporting verb:\npresent simple → past simple: \"I'm tired.\" → She said (that) she was tired.\npresent perfect → past perfect: \"I've finished.\" → He said he had finished.\nwill → would: \"I'll help.\" → They said they would help.\ncan → could.\n\nQuestions become statements (no question word order):\n\"Where do you live?\" → He asked me where I lived.\n\"Are you ready?\" → She asked if/whether I was ready.\n\nCommands and requests: told / asked + object + to + verb → The teacher told us to sit down.\n\nGhi chú: say không có tân ngữ trực tiếp (said that…), còn tell cần tân ngữ (told me that…)." },
      { kind: "text", heading: "Examples", body: "• \"We're moving to Hue.\" → They said they were moving to Hue.\n• \"I can't come tomorrow.\" → She said she couldn't come the next day.\n• \"Did you call Minh?\" → He asked whether I had called Minh.\n• \"Please close the door.\" → She asked me to close the door.\n• \"Don't be late.\" → My boss told me not to be late." },
      { kind: "text", heading: "Common mistakes", body: "✗ She said me that she was busy. → ✓ She told me that she was busy.\n✗ He asked me where did I work. → ✓ He asked me where I worked.\n✗ They told to wait. → ✓ They told us to wait." },
      { kind: "practice", instruction: "Choose the correct reported form.", questions: [
        lq("\"I work in a hospital.\" → She said she ___ in a hospital.", ["works", "worked", "has worked"], 1, "Present simple moves back to past simple."),
        lq("\"We will call you.\" → They said they ___ call me.", ["would", "will", "can"], 0, "Will becomes would."),
        lq("\"Where is the station?\" → He asked me where ___.", ["is the station", "the station was", "was the station"], 1, "Reported questions use statement word order."),
        lq("\"Are you hungry?\" → She asked ___ I was hungry.", ["that", "if", "what"], 1, "Yes/no questions are reported with if or whether."),
        lq("\"Sit down, please.\" → The nurse ___ me to sit down.", ["said", "told", "spoke"], 1, "Told + object + to-infinitive."),
        lq("\"I have lost my passport.\" → He said he ___ his passport.", ["had lost", "has lost", "lost had"], 0, "Present perfect becomes past perfect."),
        lq("\"Don't touch the screen.\" → She told us ___ the screen.", ["don't touch", "not to touch", "to not touching"], 1, "Negative command: not to + base verb."),
        lq("Which sentence is correct?", ["He said me he was sorry.", "He told me he was sorry.", "He told that he was sorry."], 1, "Tell needs an object: told me.")
      ] }
    ]
  }
];
