import { lq, type LessonDef } from "../types";

const C1 = "Advanced grammar";
const C2 = "Grammar for precision";

export const grammarC: LessonDef[] = [
  {
    key: "grammar:c1:inversion", batch: "grammar", level: "C1", unit: C1, slug: "grammar-inversion-for-emphasis", title: "Inversion for emphasis", skill: "GRAMMAR", minutes: 18,
    blocks: [
      { kind: "grammar", heading: "Form and use", body: "In formal English, a negative or restrictive expression can move to the front of the sentence. The subject and auxiliary then change places, as in a question.\n\nNever have I seen such a crowd.\nRarely does the committee change its mind.\nNot only did she win, but she also broke the record.\nNo sooner had we arrived than it started to rain.\nHardly had the meeting begun when the power went off.\nOnly after the test did I realise my mistake.\nUnder no circumstances should you share your password.\n\nIf there is no auxiliary, use do / does / did.\n\nGhi chú: đảo ngữ tạo giọng văn trang trọng, nhấn mạnh — hữu ích trong IELTS Writing nhưng không nên lạm dụng." },
      { kind: "text", heading: "Examples", body: "• Seldom do we see such commitment from new staff.\n• Not until the results came out did he relax.\n• Little did they know that the company was about to close.\n• Only by working together can we meet the deadline.\n• At no time was the public informed of the risk." },
      { kind: "text", heading: "Common mistakes", body: "✗ Never I have been so tired. → ✓ Never have I been so tired.\n✗ Not only she sings, but… → ✓ Not only does she sing, but…\n✗ No sooner had we sat down when… → ✓ No sooner had we sat down than…" },
      { kind: "practice", instruction: "Choose the correct inverted form.", questions: [
        lq("Never ___ such a beautiful sunset.", ["I have seen", "have I seen", "I saw"], 1, "Negative adverb first → auxiliary before subject: have I seen."),
        lq("Rarely ___ late for work.", ["is he", "he is", "he does"], 0, "Rarely + be + subject: is he."),
        lq("Not only ___ the exam, but she also got the highest score.", ["she passed", "did she pass", "passed she"], 1, "No auxiliary in the original, so add did: did she pass."),
        lq("No sooner had we left ___ the storm began.", ["when", "than", "then"], 1, "The fixed pattern is No sooner… than."),
        lq("Hardly had the film started ___ the fire alarm rang.", ["than", "that", "when"], 2, "The fixed pattern is Hardly… when."),
        lq("Only after checking the data ___ the error.", ["we noticed", "did we notice", "noticed we"], 1, "Only after… moves the auxiliary before the subject: did we notice."),
        lq("Under no circumstances ___ the doors be opened during the flight.", ["should", "they should", "do"], 0, "Modal before subject: should the doors be opened."),
        lq("Little ___ that she was being watched.", ["she knew", "did she know", "knew she"], 1, "Little (= not at all) + did + subject + base verb.")
      ] }
    ]
  },
  {
    key: "grammar:c1:mixed-conditionals", batch: "grammar", level: "C1", unit: C1, slug: "grammar-mixed-conditionals", title: "Third and mixed conditionals", skill: "GRAMMAR", minutes: 18,
    blocks: [
      { kind: "grammar", heading: "Form and use", body: "Third conditional — an imagined past that did not happen:\nIf + past perfect, would have + past participle → If I had left earlier, I would have caught the train.\n\nMixed conditionals combine times:\nPast condition → present result: If I had studied medicine, I would be a doctor now.\nPresent condition → past result: If I were more organised, I wouldn't have missed the deadline.\n\nFormal alternative without if (inversion): Had I known, I would have called you.\n\nGhi chú: hãy xác định thời gian của từng mệnh đề trước, rồi mới chọn thì." },
      { kind: "text", heading: "Examples", body: "• If we had booked in advance, we would have got a table.\n• If she hadn't taken that job in Singapore, she wouldn't speak Chinese so well now.\n• If I weren't afraid of heights, I would have gone up the tower with you.\n• Had the weather been better, the event would have gone ahead.\n• He would still be working here if he hadn't argued with the director." },
      { kind: "text", heading: "Common mistakes", body: "✗ If I would have known, I would have come. → ✓ If I had known, I would have come.\n✗ If I had studied harder, I would pass the exam last week. → ✓ …, I would have passed the exam last week.\n✗ If he took the medicine, he would have recovered. (past situation) → ✓ If he had taken the medicine, …" },
      { kind: "practice", instruction: "Choose the best form.", questions: [
        lq("If you ___ me, I would have helped you.", ["asked", "had asked", "would ask"], 1, "Third conditional: If + past perfect."),
        lq("If I had taken the job in Da Nang, I ___ by the sea now.", ["would live", "would have lived", "lived"], 0, "Past condition, present result: would + base verb."),
        lq("If she were more careful, she ___ the vase yesterday.", ["wouldn't break", "wouldn't have broken", "didn't break"], 1, "Present condition (her personality), past result: would have + past participle."),
        lq("___ the alarm, we would have missed the flight.", ["If we hadn't heard", "If we didn't hear", "Unless we heard"], 0, "An unreal past condition: past perfect."),
        lq("Had I known about the traffic, I ___ earlier.", ["would leave", "would have left", "had left"], 1, "Inverted third conditional: would have + past participle."),
        lq("Which sentence is a mixed conditional?", ["If I had saved money, I would have a car now.", "If I save money, I will buy a car.", "If I saved money, I would buy a car."], 0, "Past condition with a present result."),
        lq("If he hadn't eaten the seafood, he ___ ill now.", ["wouldn't be", "wouldn't have been", "won't be"], 0, "Result in the present: wouldn't be."),
        lq("We ___ the match if our best player hadn't been injured.", ["would win", "would have won", "will win"], 1, "Past condition, past result: would have won.")
      ] }
    ]
  },
  {
    key: "grammar:c1:cleft", batch: "grammar", level: "C1", unit: C1, slug: "grammar-cleft-sentences", title: "Cleft sentences for focus", skill: "GRAMMAR", minutes: 16,
    blocks: [
      { kind: "grammar", heading: "Form and use", body: "Cleft sentences split one idea into two clauses so that one part gets the focus.\n\nIt-cleft: It + be + focus + that/who… → It was my sister who found the keys (not me).\nWhat-cleft: What + clause + be + focus → What I need is a long holiday.\nAll-cleft: All + clause + be → All I want is some sleep.\nThe thing / reason / place: The reason (why) I called is to apologise.\n\nWith actions, use do: What she did was (to) resign.\n\nGhi chú: câu chẻ giúp nhấn mạnh và tạo liên kết trong bài nói, rất tự nhiên khi sửa ý người khác." },
      { kind: "text", heading: "Examples", body: "• It was in 2010 that the company opened its first office in Vietnam.\n• What surprised me was how quickly the team adapted.\n• All you have to do is fill in this form.\n• It's not the price that worries me; it's the quality.\n• The place where we stayed was right next to the market." },
      { kind: "text", heading: "Common mistakes", body: "✗ What I need it is more time. → ✓ What I need is more time.\n✗ It was Nam which called. → ✓ It was Nam who called.\n✗ What he did was he left. → ✓ What he did was (to) leave." },
      { kind: "practice", instruction: "Choose the best option.", questions: [
        lq("___ I love about Hue is the food.", ["That", "What", "Which"], 1, "What-cleft: What I love … is …"),
        lq("It was the manager ___ made the final decision.", ["who", "what", "which"], 0, "It-cleft with a person: who (or that)."),
        lq("All I want ___ a quiet evening at home.", ["are", "is", "it is"], 1, "All + clause takes a singular verb: is."),
        lq("What she did was ___ the whole report again.", ["rewrote", "rewriting", "rewrite"], 2, "What … did was + (to) base verb."),
        lq("It ___ until midnight that we finished.", ["wasn't", "didn't", "hadn't"], 0, "It-cleft uses be: It wasn't until…"),
        lq("Which sentence puts the focus on 'the noise'?", ["The noise kept me awake.", "It was the noise that kept me awake.", "The noise, it kept me awake."], 1, "The it-cleft puts the noise in focus."),
        lq("The reason ___ I'm late is the traffic.", ["why", "because", "for"], 0, "The reason why…"),
        lq("What ___ is how little it cost.", ["amazed me", "amazing me", "I amazed"], 0, "What + subject clause: What amazed me is…")
      ] }
    ]
  },
  {
    key: "grammar:c1:participle", batch: "grammar", level: "C1", unit: C1, slug: "grammar-participle-clauses", title: "Participle clauses", skill: "GRAMMAR", minutes: 17,
    blocks: [
      { kind: "grammar", heading: "Form and use", body: "Participle clauses make writing shorter and more formal. The subject of the participle must be the same as the subject of the main clause.\n\nPresent participle (-ing) — active, same time or reason: Walking home, I met an old friend. Feeling tired, she went to bed.\nPast participle — passive meaning: Built in 1880, the church is the oldest in the city.\nPerfect participle — the first action finished before the second: Having finished the report, he went home.\n\nThey can also replace relative clauses: Students living on campus pay less. (= who live)\n\nGhi chú: tránh “dangling participle”: Walking into the room, the lights went off ✗ (đèn không thể đi vào phòng)." },
      { kind: "text", heading: "Examples", body: "• Not knowing the way, we asked a local driver.\n• Located in the Old Quarter, the hotel is popular with tourists.\n• Having lived abroad for years, she found it hard to settle back home.\n• The documents attached to this email explain the new policy.\n• Written in simple language, the guide is easy to follow." },
      { kind: "text", heading: "Common mistakes", body: "✗ Having eaten dinner, the dishes were washed. → ✓ Having eaten dinner, we washed the dishes.\n✗ Built in 1990, we renovated the house. → ✓ Built in 1990, the house was renovated last year.\n✗ Being raining, we stayed in. → ✓ As it was raining, we stayed in." },
      { kind: "practice", instruction: "Choose the correct participle clause.", questions: [
        lq("___ the email, she replied immediately.", ["Read", "Having read", "Been read"], 1, "The reading finished before replying: perfect participle."),
        lq("___ in 1902, the bridge is still in use today.", ["Building", "Having built", "Built"], 2, "Passive meaning (the bridge was built): past participle."),
        lq("___ no money left, they walked home.", ["Having", "Had", "Have"], 0, "Reason, active: present participle."),
        lq("People ___ in the city centre often use public transport.", ["lived", "living", "who living"], 1, "Replaces who live: living."),
        lq("Which sentence is correct?", ["Opening the door, the cat ran out.", "Opening the door, I saw the cat run out.", "Opened the door, I saw the cat."], 1, "The subject (I) opens the door, so the participle fits."),
        lq("___ by the noise, the baby started crying.", ["Waking", "Woken", "Having woken"], 1, "Passive meaning (the baby was woken): past participle."),
        lq("Not ___ what to say, he stayed silent.", ["knowing", "known", "knew"], 0, "Negative participle clause: Not knowing…"),
        lq("The parcel ___ yesterday has been lost.", ["sending", "sent", "sends"], 1, "Passive meaning (which was sent): sent.")
      ] }
    ]
  },
  {
    key: "grammar:c2:subjunctive", batch: "grammar", level: "C2", unit: C2, slug: "grammar-subjunctive-formal-structures", title: "The subjunctive and formal structures", skill: "GRAMMAR", minutes: 18,
    blocks: [
      { kind: "grammar", heading: "Form and use", body: "The mandative subjunctive uses the base form of the verb for every subject after verbs and adjectives of demand, suggestion and importance:\nrecommend, suggest, insist, demand, require, propose; it is essential / vital / important that…\n→ The doctor recommended that she rest for a week.\n→ It is essential that every applicant be interviewed.\n\nNegative: not + base verb → We insisted that he not travel alone.\nBritish English often uses should instead: …that she should rest.\n\nOther formal patterns: If need be, … / Be that as it may, … / It's (high) time we left.\n\nGhi chú: không thêm -s và không lùi thì: The board requires that he submit (không nói submits)." },
      { kind: "text", heading: "Examples", body: "• The committee proposed that the fee be reduced.\n• It is vital that the patient not eat before surgery.\n• I suggest that he apply again next year.\n• Be that as it may, the decision is final.\n• It's high time the city invested in public transport." },
      { kind: "text", heading: "Common mistakes", body: "✗ They demanded that he pays the fine. → ✓ They demanded that he pay the fine.\n✗ It is important that she doesn't forget. → ✓ It is important that she not forget.\n✗ It's time we go. → ✓ It's time we went." },
      { kind: "practice", instruction: "Choose the most appropriate formal form.", questions: [
        lq("The lawyer insisted that her client ___ present at the hearing.", ["is", "be", "was being"], 1, "Mandative subjunctive: base form be."),
        lq("It is essential that each candidate ___ the form in person.", ["submit", "submits", "submitted"], 0, "After it is essential that…, use the base form for every subject."),
        lq("We recommended that the report ___ published until it was checked.", ["wasn't", "not be", "doesn't be"], 1, "Negative subjunctive: not + base form."),
        lq("It's high time the government ___ the problem seriously.", ["takes", "take", "took"], 2, "It's (high) time + past simple."),
        lq("Which sentence is correct in formal English?", ["The manager requested that he attends.", "The manager requested that he attend.", "The manager requested that he attended."], 1, "Requested that + base form."),
        lq("___ that as it may, we still need a decision today.", ["Be", "Being", "It is"], 0, "The fixed formal phrase: Be that as it may."),
        lq("I propose that the meeting ___ until Friday.", ["postpones", "be postponed", "is postponing"], 1, "Passive subjunctive: be + past participle."),
        lq("If ___, we can hire extra staff for the weekend.", ["need be", "needed be", "need is"], 0, "The fixed phrase if need be = if necessary.")
      ] }
    ]
  },
  {
    key: "grammar:c2:nominalisation", batch: "grammar", level: "C2", unit: C2, slug: "grammar-nominalisation", title: "Nominalisation in academic writing", skill: "GRAMMAR", minutes: 18,
    blocks: [
      { kind: "grammar", heading: "Form and use", body: "Nominalisation turns verbs and adjectives into nouns. It packs more information into a sentence and gives academic writing an objective tone.\n\nverb → noun: decide → decision, reduce → reduction, grow → growth, fail → failure.\nadjective → noun: important → importance, accurate → accuracy, able → ability.\n\nSpoken style: Prices rose sharply, so fewer people bought houses.\nAcademic style: The sharp rise in prices led to a decline in house sales.\n\nNominalised phrases often combine with verbs such as lead to, result in, contribute to, account for.\n\nGhi chú: dùng vừa phải — quá nhiều danh từ nối nhau sẽ khiến câu nặng và khó đọc." },
      { kind: "text", heading: "Examples", body: "• The introduction of the new policy caused confusion among staff.\n• There has been a significant improvement in air quality.\n• The failure to respond quickly resulted in further damage.\n• The availability of cheap flights has encouraged domestic tourism.\n• Their refusal to negotiate prolonged the dispute." },
      { kind: "text", heading: "Common mistakes", body: "✗ The reduce of costs… → ✓ The reduction of costs / in costs…\n✗ There was a significantly increase. → ✓ There was a significant increase.\n✗ The analyse of the data… → ✓ The analysis of the data…" },
      { kind: "practice", instruction: "Choose the best nominalised form.", questions: [
        lq("The ___ of the bridge took three years.", ["construct", "construction", "constructing of"], 1, "Verb construct → noun construction."),
        lq("There was a sharp ___ in unemployment last year.", ["rise", "rose", "rising up"], 0, "The noun form is rise (a rise in…)."),
        lq("The ___ of clean water is a major concern in some regions.", ["available", "availability", "availableness"], 1, "Adjective available → noun availability."),
        lq("Which sentence is more academic?", ["People used cars more, so pollution got worse.", "Increased car use contributed to higher pollution levels.", "Cars were used a lot and pollution was bad."], 1, "Nominalised subject + contributed to: typical academic style."),
        lq("Their ___ to accept the offer surprised everyone.", ["refuse", "refusing", "refusal"], 2, "Verb refuse → noun refusal."),
        lq("The ___ of the results was checked by two researchers.", ["accurate", "accuracy", "accurately"], 1, "Adjective accurate → noun accuracy."),
        lq("A lack of investment ___ the decline of the industry.", ["led to", "leading", "was lead"], 0, "Noun phrase + led to + noun phrase."),
        lq("The ___ of the project depends on funding.", ["succeed", "success", "successful"], 1, "Verb succeed → noun success.")
      ] }
    ]
  },
  {
    key: "grammar:c2:ellipsis", batch: "grammar", level: "C2", unit: C2, slug: "grammar-ellipsis-substitution", title: "Ellipsis and substitution", skill: "GRAMMAR", minutes: 16,
    blocks: [
      { kind: "grammar", heading: "Form and use", body: "Fluent speakers avoid repeating words. They leave words out (ellipsis) or replace them (substitution).\n\nSubstitution:\none / ones for countable nouns → I don't like the red shirt; I prefer the blue one.\ndo / does / did (so) for verb phrases → She wanted to leave early, and so did I.\nso / not for clauses → Will it rain? — I hope not. / I think so.\n\nEllipsis:\nafter auxiliaries → I haven't read it, but Mai has.\nafter to → You can come if you want to.\nin coordinated clauses → Some people prefer tea; others, coffee.\n\nGhi chú: trong bài nói IELTS, dùng I think so / I'm afraid not / I'd love to giúp câu trả lời tự nhiên hơn." },
      { kind: "text", heading: "Examples", body: "• Do you need a bag? — No, I've got one.\n• He said he'd finish it by Friday, and he did.\n• Is the museum open on Mondays? — I don't think so.\n• I wasn't planning to go, but now I'd like to.\n• Minh can play the violin, and so can his sister." },
      { kind: "text", heading: "Common mistakes", body: "✗ I don't think. (as a short answer) → ✓ I don't think so.\n✗ I prefer the black shoes, not the brown. → ✓ …, not the brown ones.\n✗ She likes jazz and so I do. → ✓ She likes jazz and so do I." },
      { kind: "practice", instruction: "Choose the most natural option.", questions: [
        lq("These glasses are dirty. Can I have some clean ___?", ["one", "ones", "them"], 1, "Plural countable noun: ones."),
        lq("Is the train on time? — I hope ___.", ["so", "it", "yes"], 0, "Substitute a whole clause: I hope so."),
        lq("I haven't finished the report, but Lan ___.", ["has", "has it", "did"], 0, "Ellipsis after the auxiliary: Lan has."),
        lq("Will there be a test tomorrow? — I'm afraid ___.", ["so not", "not", "no"], 1, "Negative clause substitute: I'm afraid not."),
        lq("You don't have to come, but you can if you ___.", ["want", "want to", "want it"], 1, "Ellipsis after to: if you want to."),
        lq("She passed the driving test, and so ___ her brother.", ["was", "had", "did"], 2, "So + auxiliary + subject: so did her brother."),
        lq("Which reply is most natural? 'Are you coming to the party?'", ["I'd love.", "I'd love to.", "I'd love to come to the party."], 1, "Ellipsis after to avoids repetition; I'd love on its own is incomplete."),
        lq("I asked him to call me, but he ___.", ["didn't so", "didn't", "didn't it"], 1, "Ellipsis after the auxiliary: but he didn't.")
      ] }
    ]
  },
  {
    key: "grammar:c2:hedging", batch: "grammar", level: "C2", unit: C2, slug: "grammar-hedging-and-stance", title: "Hedging and stance", skill: "GRAMMAR", minutes: 17,
    blocks: [
      { kind: "grammar", heading: "Form and use", body: "Academic and professional English rarely states claims as absolute facts. Writers hedge to show caution and precision, and use stance markers to show their attitude.\n\nHedging tools:\nmodal verbs → may, might, could: This may explain the drop in sales.\nverbs → appear, seem, tend, suggest, indicate: The results suggest that…\nadverbs → possibly, arguably, largely, relatively.\nimpersonal phrases → It is likely / widely believed that…\nquantifiers → some, many, in most cases.\n\nStance markers: admittedly, undoubtedly, surprisingly, it is worth noting that…\n\nGhi chú: IELTS Writing đánh giá cao việc tránh khẳng định tuyệt đối (all, always, prove) khi không có bằng chứng." },
      { kind: "text", heading: "Examples", body: "• The data appear to support the hypothesis, although the sample was small.\n• Remote work tends to increase productivity for some types of tasks.\n• This is arguably the most important reform of the decade.\n• It is widely believed that exercise improves mood, but the evidence is mixed.\n• Admittedly, the policy has drawbacks; nevertheless, it reduced traffic." },
      { kind: "text", heading: "Common mistakes", body: "✗ This proves that all students prefer online classes. → ✓ This suggests that many students may prefer online classes.\n✗ It seems to be possibly true. (double hedging) → ✓ It seems to be true. / It is possibly true.\n✗ The results are appear significant. → ✓ The results appear significant." },
      { kind: "practice", instruction: "Choose the most appropriately hedged option.", questions: [
        lq("Which claim is appropriately cautious?", ["Social media causes depression.", "Heavy social media use may contribute to low mood.", "Social media always makes people sad."], 1, "May + contribute to avoids an absolute claim."),
        lq("The findings ___ that sleep affects memory.", ["prove", "suggest", "are proving"], 1, "Suggest is a typical hedging verb."),
        lq("It is ___ that prices will rise next year.", ["likely", "certainly sure", "definite true"], 0, "It is likely that… is a standard impersonal hedge."),
        lq("Older drivers ___ to have fewer accidents than younger ones.", ["tend", "tending", "are tend"], 0, "Tend to + base verb expresses a general pattern."),
        lq("Which word signals the writer's surprise?", ["Admittedly", "Surprisingly", "Consequently"], 1, "Surprisingly marks the writer's attitude."),
        lq("The new policy has ___ improved safety, although some problems remain.", ["largely", "totally", "never"], 0, "Largely limits the claim appropriately."),
        lq("Which sentence avoids double hedging?", ["It might possibly perhaps be true.", "It might be true.", "It is possibly maybe true."], 1, "One hedge is enough."),
        lq("___, the plan is expensive; however, the long-term savings are considerable.", ["Admittedly", "Consequently", "For instance"], 0, "Admittedly concedes a point before a counter-argument.")
      ] }
    ]
  }
];
