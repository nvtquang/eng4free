import { lq, type LessonDef } from "../types";

const B2 = "Grammar for clear arguments";
const C1 = "Advanced grammar";
const C2 = "Grammar for precision";

/** Second wave of grammar topics for B2–C2 (English 4 Free original). */
export const grammarMoreB2C: LessonDef[] = [
  {
    key: "grammar:b2:future-forms", batch: "grammar", level: "B2", unit: B2, slug: "grammar-future-continuous-and-perfect", title: "Future continuous and future perfect", skill: "GRAMMAR", minutes: 17,
    blocks: [
      { kind: "grammar", heading: "Form and use", body: "Future continuous: will be + verb-ing — an action in progress at a time in the future.\nThis time tomorrow, I'll be flying to Singapore.\nIt is also a polite way to ask about plans: Will you be using the car tonight?\n\nFuture perfect: will have + past participle — an action completed before a time in the future.\nBy 2030, the city will have built a new metro line.\nBy the time you arrive, we'll have finished dinner.\n\nTime expressions: this time next week, at 9 p.m. tomorrow (future continuous); by Friday, by the end of the year, by the time… (future perfect).\n\nGhi chú: \"by + thời điểm\" (trước/muộn nhất là) thường đi với thì tương lai hoàn thành." },
      { kind: "text", heading: "Examples", body: "• Don't call at eight — we'll be having dinner.\n• By next June, she will have worked here for ten years.\n• Will you be coming to the meeting on Monday?\n• I won't have finished the report by tomorrow morning.\n• In twenty years, most cars will be running on electricity." },
      { kind: "text", heading: "Common mistakes", body: "✗ By Friday I will finish the project. (completed before Friday) → ✓ By Friday I will have finished the project.\n✗ This time next week I will lie on the beach. → ✓ …I will be lying on the beach.\n✗ By the time you will arrive, … → ✓ By the time you arrive, … (present simple after time words)" },
      { kind: "practice", instruction: "Choose the best form.", questions: [
        lq("This time next month, we ___ in our new flat.", ["will live", "will be living", "will have lived"], 1, "An action in progress at a future time: future continuous."),
        lq("By the end of the year, I ___ all my debts.", ["will be paying", "will have paid", "pay"], 1, "Completed before a future time (by…): future perfect."),
        lq("By the time we ___ the station, the train will have left.", ["will reach", "reach", "will have reached"], 1, "After by the time, use the present simple for the future."),
        lq("___ you be using the printer this afternoon? I need it.", ["Will", "Are", "Have"], 0, "Polite question about plans: Will you be using…?"),
        lq("She ___ the novel by Sunday — she reads very fast.", ["will have finished", "will be finishing", "finishes"], 0, "Completion before Sunday: will have finished."),
        lq("At 3 p.m. tomorrow, the students ___ their final exam.", ["will have taken", "will be taking", "take"], 1, "In progress at that time: will be taking."),
        lq("In 2030, they ___ married for twenty years.", ["will be", "will have been", "are"], 1, "Duration up to a future point: will have been."),
        lq("Which sentence is correct?", ["By next week, I will have moved house.", "By next week, I will be move house.", "By next week, I moved house."], 0, "Future perfect: will have + past participle.")
      ] }
    ]
  },
  {
    key: "grammar:b2:wishes", batch: "grammar", level: "B2", unit: B2, slug: "grammar-wish-and-if-only", title: "Wishes and regrets: wish and if only", skill: "GRAMMAR", minutes: 17,
    blocks: [
      { kind: "grammar", heading: "Form and use", body: "Wishes about the present (something is not true now): wish + past simple.\nI wish I lived closer to the sea. I wish I knew the answer.\nWith be, were is common in careful English: I wish I were taller.\n\nRegrets about the past: wish + past perfect.\nI wish I had studied harder last year.\n\nComplaints or wanting someone else to change: wish + would.\nI wish you would stop interrupting me.\n\nIf only is a stronger, more emotional version: If only I had listened to you!\n\nGhi chú: lùi một thì — hiện tại → quá khứ đơn, quá khứ → quá khứ hoàn thành." },
      { kind: "text", heading: "Examples", body: "• I wish I had more free time.\n• She wishes she hadn't sold her old guitar.\n• If only it would stop raining!\n• Don't you wish you could speak five languages?\n• I wish my neighbours wouldn't play loud music at night." },
      { kind: "text", heading: "Common mistakes", body: "✗ I wish I have a car. → ✓ I wish I had a car.\n✗ I wish I didn't eat so much yesterday. → ✓ I wish I hadn't eaten so much yesterday.\n✗ I wish I would be taller. (about yourself) → ✓ I wish I were taller." },
      { kind: "practice", instruction: "Choose the best form.", questions: [
        lq("I wish I ___ how to fix this computer.", ["know", "knew", "had known"], 1, "Present wish: past simple."),
        lq("She wishes she ___ that job offer last year.", ["accepted", "had accepted", "would accept"], 1, "Past regret: past perfect."),
        lq("I wish you ___ leaving your clothes on the floor.", ["would stop", "stopped", "had stopped"], 0, "Complaint about someone's behaviour: wish + would."),
        lq("If only we ___ more time to prepare!", ["have", "had", "will have"], 1, "Present wish: past simple."),
        lq("I wish I ___ a bit taller.", ["am", "were", "would be"], 1, "Wish about yourself with be: were."),
        lq("He wishes he ___ so rude to his teacher yesterday.", ["wasn't", "hadn't been", "wouldn't be"], 1, "Past regret: past perfect."),
        lq("Don't you wish you ___ fly?", ["can", "could", "will"], 1, "Present wish with ability: could."),
        lq("Which sentence expresses regret about the past?", ["I wish I had gone to the concert.", "I wish I went to concerts more often.", "I wish you would come to the concert."], 0, "Wish + past perfect = regret about the past.")
      ] }
    ]
  },
  {
    key: "grammar:c1:reporting-passives", batch: "grammar", level: "C1", unit: C1, slug: "grammar-impersonal-passive-reporting", title: "Impersonal passives: it is said that…", skill: "GRAMMAR", minutes: 18,
    blocks: [
      { kind: "grammar", heading: "Form and use", body: "Formal writing often reports beliefs and claims without saying who holds them.\n\nPattern 1: It + passive reporting verb + that-clause\nIt is said that the castle is haunted.\nIt was reported that three people had been injured.\n\nPattern 2: Subject + passive reporting verb + to-infinitive\nThe castle is said to be haunted.\nThe minister is believed to have resigned. (an earlier action → to have + past participle)\nThe company is thought to be planning job cuts. (an action in progress → to be + -ing)\n\nCommon verbs: say, believe, think, know, expect, report, consider, estimate, claim.\n\nGhi chú: cấu trúc này giúp bài IELTS Writing khách quan hơn, tránh \"people say…\"." },
      { kind: "text", heading: "Examples", body: "• It is estimated that two million tourists visit the bay each year.\n• The painting is thought to be worth several million dollars.\n• The suspect is believed to have left the country.\n• It has been suggested that the speed limit should be lowered.\n• Prices are expected to rise again next year." },
      { kind: "text", heading: "Common mistakes", body: "✗ It is said the bridge to be unsafe. → ✓ It is said that the bridge is unsafe / The bridge is said to be unsafe.\n✗ He is believed to leave yesterday. → ✓ He is believed to have left yesterday.\n✗ The economy is expected growing. → ✓ The economy is expected to grow." },
      { kind: "practice", instruction: "Choose the best form.", questions: [
        lq("___ that the new law will reduce pollution.", ["It is hoped", "It hopes", "It is hoping"], 0, "Impersonal passive: It is hoped that…"),
        lq("The singer is said ___ a new album next year.", ["to release", "releasing", "that she releases"], 0, "Subject + is said + to-infinitive."),
        lq("The thieves are believed ___ through the back window.", ["to escape", "to have escaped", "escaping"], 1, "An earlier action: to have + past participle."),
        lq("The government is thought ___ new taxes at the moment.", ["to consider", "to be considering", "to have considered"], 1, "An action in progress now: to be + -ing."),
        lq("It ___ that the population will double by 2050.", ["is estimated", "estimates", "is estimating"], 0, "Impersonal passive with estimate."),
        lq("Which sentence is correct?", ["The building is known to be over 300 years old.", "The building is known being over 300 years old.", "It is known the building to be over 300 years old."], 0, "Subject + is known + to-infinitive."),
        lq("The temple ___ in the 11th century.", ["is said to have been built", "is said to build", "says to be built"], 0, "A past passive action: to have been + past participle."),
        lq("Inflation ___ to fall later this year.", ["expects", "is expected", "is expecting"], 1, "Subject + is expected + to-infinitive.")
      ] }
    ]
  },
  {
    key: "grammar:c1:unreal-past", batch: "grammar", level: "C1", unit: C1, slug: "grammar-unreal-past-would-rather-its-time", title: "Unreal past: would rather, it's time, as if", skill: "GRAMMAR", minutes: 17,
    blocks: [
      { kind: "grammar", heading: "Form and use", body: "After some expressions, a past tense describes a present or future situation that is imagined or desired.\n\nwould rather + subject + past simple (preferring what another person does):\nI'd rather you didn't smoke in here.\nCompare: I'd rather stay at home. (same subject → base verb)\n\nit's (high / about) time + subject + past simple (something should already be happening):\nIt's time we left. It's high time the council repaired this road.\n\nas if / as though + past simple (unreal or unlikely comparison):\nHe talks as if he knew everything. (he doesn't)\n\nsuppose / supposing + past simple (imagined situation): Suppose you lost your job — what would you do?\n\nGhi chú: thì quá khứ ở đây không chỉ thời gian quá khứ mà diễn tả điều không có thật." },
      { kind: "text", heading: "Examples", body: "• I'd rather you paid by card, if possible.\n• It's about time you started revising for your exams.\n• She looked at me as if I were a stranger.\n• Would you rather we met tomorrow instead?\n• Supposing you won the lottery, what would you buy first?" },
      { kind: "text", heading: "Common mistakes", body: "✗ I'd rather you don't call so late. → ✓ I'd rather you didn't call so late.\n✗ It's time we go home. → ✓ It's time we went home.\n✗ I'd rather to walk. → ✓ I'd rather walk." },
      { kind: "practice", instruction: "Choose the best form.", questions: [
        lq("I'd rather you ___ the meeting until next week.", ["postpone", "postponed", "will postpone"], 1, "Would rather + another subject + past simple."),
        lq("It's high time the government ___ something about traffic.", ["does", "did", "will do"], 1, "It's high time + past simple."),
        lq("He spends money as if he ___ a millionaire.", ["is", "were", "will be"], 1, "Unreal comparison: as if + past (were)."),
        lq("I'd rather ___ at home tonight.", ["stay", "stayed", "to stay"], 0, "Same subject: would rather + base verb."),
        lq("___ you missed the last bus — how would you get home?", ["Suppose", "Unless", "Despite"], 0, "Suppose + past simple for an imagined situation."),
        lq("It's about time you ___ to bed — it's midnight.", ["go", "went", "have gone"], 1, "It's about time + past simple."),
        lq("Would you rather I ___ you a lift?", ["give", "gave", "will give"], 1, "Would rather + subject + past simple."),
        lq("She acts as though nothing ___.", ["happens", "had happened", "will happen"], 1, "Unreal comparison about an earlier event: past perfect.")
      ] }
    ]
  },
  {
    key: "grammar:c2:modal-perfects", batch: "grammar", level: "C2", unit: C2, slug: "grammar-modal-perfects-and-nuance", title: "Modal perfects: criticism, speculation, needn't have", skill: "GRAMMAR", minutes: 19,
    blocks: [
      { kind: "grammar", heading: "Form and use", body: "Modal + have + past participle talks about the past with different shades of meaning.\n\nCriticism and regret: should have / ought to have / could have (but didn't)\nYou should have told me earlier. You could have warned us!\n\nSpeculation: must have (almost certain), may / might / could have (possible), can't / couldn't have (almost impossible)\nShe must have missed the bus. He can't have seen us — he didn't wave.\n\nUnnecessary action: needn't have + past participle (you did it, but it wasn't necessary)\nYou needn't have brought a gift.\nCompare: didn't need to + base verb (it wasn't necessary — maybe you didn't do it)\nWe didn't need to queue, so we went straight in.\n\nWould have — an unrealised intention or willingness: I would have helped, but nobody asked me.\n\nGhi chú: needn't have done (đã làm nhưng không cần) khác didn't need to do (không cần làm, thường là đã không làm)." },
      { kind: "text", heading: "Examples", body: "• The road is wet — it must have rained overnight.\n• You might have mentioned that the restaurant was closed on Mondays!\n• They can't have finished already; they only started an hour ago.\n• I needn't have worried — the interview was very relaxed.\n• She could have been a professional singer, but she chose medicine." },
      { kind: "text", heading: "Common mistakes", body: "✗ He must has forgotten. → ✓ He must have forgotten.\n✗ You needn't to have come. → ✓ You needn't have come.\n✗ He mustn't have heard us. (a deduction) → ✓ He can't have heard us.\n✗ I should have went. → ✓ I should have gone." },
      { kind: "practice", instruction: "Choose the best form.", questions: [
        lq("The lights are off — they ___ to bed already.", ["must have gone", "should have gone", "needn't have gone"], 0, "Almost certain deduction about the past: must have."),
        lq("You ___ me you were vegetarian! I cooked beef.", ["must have told", "should have told", "can't have told"], 1, "Criticism of something not done: should have."),
        lq("I ___ an umbrella — it didn't rain at all.", ["needn't have taken", "didn't need take", "mustn't have taken"], 0, "Did it, but it was unnecessary: needn't have."),
        lq("He ___ the email; it went to his spam folder.", ["can't have seen", "must have seen", "should have seen"], 0, "Almost impossible, given the evidence: can't have."),
        lq("We ___ a taxi, because Lan offered to drive us.", ["needn't have taken", "didn't need to take", "mustn't take"], 1, "It was not necessary, and they did not take one: didn't need to."),
        lq("She ___ left her phone at the café — she had it on the bus.", ["can't have", "must have", "should have"], 0, "The evidence makes it impossible."),
        lq("I ___ you with the move, but I was abroad that week.", ["would have helped", "must have helped", "needn't have helped"], 0, "An unrealised willingness: would have."),
        lq("The parcel ___ been delivered to the wrong address — I'm not sure.", ["might have", "must", "should have"], 0, "Possibility, not certainty: might have.")
      ] }
    ]
  },
  {
    key: "grammar:c2:fronting", batch: "grammar", level: "C2", unit: C2, slug: "grammar-fronting-and-information-order", title: "Fronting and information order", skill: "GRAMMAR", minutes: 19,
    blocks: [
      { kind: "grammar", heading: "Form and use", body: "English usually puts known information first and new, important information at the end (end focus). Writers move parts of a sentence to the front to link ideas or to create emphasis.\n\nFronted objects and complements (spoken, emphatic):\nThat film I'll never forget. Strange as it may seem, he refused the offer.\n\nFronted adverbials with inversion after place or movement (descriptive writing):\nAt the end of the corridor stood a tall wooden door.\nOn the wall hung a portrait of the founder.\n\nAs / though concessive clauses:\nTired as she was, she kept working. (= Although she was tired…)\nMuch as I admire his work, I can't agree with him.\n\nFronting to link with the previous sentence:\nThe second proposal was cheaper. More importantly, it could start immediately.\n\nGhi chú: đưa thông tin đã biết lên đầu câu giúp đoạn văn mạch lạc — kỹ năng quan trọng ở band 8–9 IELTS." },
      { kind: "text", heading: "Examples", body: "• Into the room walked the director, followed by two assistants.\n• Hard as they tried, they couldn't open the safe.\n• What he said next, nobody expected.\n• Among the guests were several former ministers.\n• Such was the demand that the tickets sold out in minutes." },
      { kind: "text", heading: "Common mistakes", body: "✗ Tired as was she, … → ✓ Tired as she was, …\n✗ At the top of the hill a small temple stood there. → ✓ At the top of the hill stood a small temple.\n✗ Much as I like him, but I disagree. → ✓ Much as I like him, I disagree." },
      { kind: "practice", instruction: "Choose the best option.", questions: [
        lq("___ she was, she still went to work.", ["Ill as", "As ill", "Although ill as"], 0, "Concessive pattern: adjective + as + subject + verb."),
        lq("At the centre of the square ___.", ["a bronze statue stood", "stood a bronze statue", "stood there a bronze statue"], 1, "Place adverbial fronted, then verb before a long subject."),
        lq("Much as I enjoy his novels, ___ the latest one is weak.", ["but I think", "I think", "so I think"], 1, "Much as… already means although; no but."),
        lq("___ the noise that we couldn't hear each other.", ["Such was", "So was", "Such that"], 0, "Such was + noun + that… for emphasis."),
        lq("Which sentence uses end focus to stress the new information?", ["What surprised everyone was the size of the crowd.", "The size of the crowd surprised everyone, which was.", "Everyone surprised the size of the crowd."], 0, "The new information (the size of the crowd) comes last."),
        lq("Among the winners ___ two students from Hue.", ["was", "were", "they were"], 1, "Inverted subject is plural: were two students."),
        lq("Strange as it ___, the old method worked better.", ["may seem", "seems may", "may seems"], 0, "Fixed concessive phrase: strange as it may seem."),
        lq("The first plan was cheaper. ___, it could be finished in a month.", ["More importantly", "Most important it", "Important more"], 0, "A fronted linking adverbial connects the two ideas.")
      ] }
    ]
  }
];
