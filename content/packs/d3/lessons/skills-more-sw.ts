import { lq, type LessonDef } from "../types";

const A1 = "Everyday skills";
const A2 = "Skills for daily life";
const B1 = "Skills for independent users";
const B2 = "Skills for confident users";
const C1 = "Skills for advanced users";
const C2 = "Skills for expert users";

/** More speaking and writing lessons, one of each per CEFR level (English 4 Free original). */
export const moreSpeakingWriting: LessonDef[] = [
  {
    key: "more:a1:speaking-daily-routine", batch: "lessons", level: "A1", unit: A1, slug: "speaking-talk-about-your-day", title: "Speak: talk about your day", skill: "SPEAKING", minutes: 12,
    blocks: [
      { kind: "text", heading: "Useful language", body: "• I get up at six o'clock.\n• I have breakfast at home.\n• I go to school / work by bus.\n• I have lunch at twelve.\n• In the evening, I watch TV or read.\n• I go to bed at ten thirty.\n\nTime words: in the morning, in the afternoon, in the evening, at night, every day, usually, sometimes.\nQuestions: What time do you get up? How do you go to work? What do you do in the evening?" },
      { kind: "listening", heading: "Model conversation", voices: { Ana: "female", Khoa: "male" }, script: "Ana: What time do you get up, Khoa?\nKhoa: I usually get up at half past six.\nAna: Do you have breakfast at home?\nKhoa: No, I buy breakfast near my office. I go to work by motorbike.\nAna: What do you do in the evening?\nKhoa: I cook dinner, and then I study English for thirty minutes.\nAna: That's great. What time do you go to bed?\nKhoa: At eleven o'clock. What about you?\nAna: I go to bed early, at ten." },
      { kind: "practice", instruction: "Choose the best answer.", questions: [
        lq("What time does Khoa get up?", ["At six", "At half past six", "At seven"], 1, "I usually get up at half past six."),
        lq("How does Khoa go to work?", ["By bus", "By motorbike", "On foot"], 1, "I go to work by motorbike."),
        lq("What does Khoa do after dinner?", ["He watches TV.", "He studies English.", "He goes to bed."], 1, "I cook dinner, and then I study English."),
        lq("Choose the correct sentence.", ["I go to bed at ten.", "I going to bed at ten.", "I goes to bed at ten."], 0, "Present simple with I: I go."),
        lq("\"What time do you have lunch?\"", ["At twelve o'clock.", "In the restaurant.", "Rice and fish."], 0, "What time asks for a time."),
        lq("Which word completes the sentence? \"I ___ get up early on Sundays.\"", ["don't", "doesn't", "not"], 0, "Negative with I: don't.")
      ] }
    ]
  },
  {
    key: "more:a1:writing-profile", batch: "lessons", level: "A1", unit: A1, slug: "writing-a-short-profile-about-yourself", title: "Write: a short profile about yourself", skill: "WRITING", minutes: 12,
    blocks: [
      { kind: "text", heading: "Model profile", body: "Hello! My name is Phuong. I am twenty years old and I am from Hai Phong. Now I live in Hanoi with my aunt. I am a student at a university. I study tourism.\n\nI like music and cooking. My favourite food is fish soup. At the weekend, I play badminton with my friends.\n\nI want to learn English because I want to work in a hotel. I can speak a little English, and I want to make new friends here!" },
      { kind: "text", heading: "How to write a profile", body: "• Start with your name, age and where you are from.\n• Say where you live and what you do (student, job).\n• Write about things you like and your free time.\n• Finish with why you are here or what you want.\n\nUseful sentences: I am from… / I live in… / I work as a… / I like + noun or -ing / My favourite… is… / I want to…\n\nCheck: a capital letter for names and places (Hanoi, Phuong), and a full stop at the end of each sentence." },
      { kind: "practice", instruction: "Choose the best answer.", questions: [
        lq("Where is Phuong from?", ["Hanoi", "Hai Phong", "Da Nang"], 1, "I am from Hai Phong."),
        lq("Why does Phuong want to learn English?", ["To work in a hotel", "To travel to the UK", "To pass a test"], 0, "I want to work in a hotel."),
        lq("Which sentence is correct?", ["I am twenty years old.", "I have twenty years old.", "I am twenty years."], 0, "Use be for age: I am twenty years old."),
        lq("Which word needs a capital letter?", ["hanoi", "soup", "music"], 0, "Names of places start with a capital letter: Hanoi."),
        lq("\"I like ___ .\"", ["cook", "cooking", "to cooking"], 1, "Like + -ing: I like cooking."),
        lq("What is the best way to start a profile?", ["My favourite food is noodles.", "Hello! My name is Minh.", "Goodbye and thanks."], 1, "Start with a greeting and your name.")
      ] }
    ]
  },
  {
    key: "more:a2:speaking-shopping-clothes", batch: "lessons", level: "A2", unit: A2, slug: "speaking-shopping-for-clothes", title: "Speak: shopping for clothes", skill: "SPEAKING", minutes: 13,
    blocks: [
      { kind: "text", heading: "Useful language", body: "Shop assistant: Can I help you? / What size are you? / The changing rooms are over there. / How is it?\nCustomer: I'm looking for a shirt. / Do you have this in a medium / in blue? / Can I try it on? / It's too small / big / long. / How much is it? / I'll take it. / Can I pay by card?\n\nTip: too + adjective = more than you want: It's too expensive. Not … enough = less than you want: It isn't big enough." },
      { kind: "listening", heading: "Model conversation", voices: { Assistant: "female", Customer: "male" }, script: "Assistant: Hello, can I help you?\nCustomer: Yes, I'm looking for a jacket for the winter.\nAssistant: What size are you?\nCustomer: Usually a large.\nAssistant: How about this one? It's very warm.\nCustomer: I like it. Do you have it in black?\nAssistant: Yes, here you are. The changing rooms are over there.\nCustomer: Thanks. … Hmm, it's a bit too tight. Do you have an extra large?\nAssistant: Let me check. Yes, here it is.\nCustomer: That's much better. How much is it?\nAssistant: It's eight hundred thousand dong, but it's twenty percent off this week.\nCustomer: Great. I'll take it. Can I pay by card?\nAssistant: Of course." },
      { kind: "practice", instruction: "Choose the best answer.", questions: [
        lq("What is the customer looking for?", ["A winter jacket", "A shirt", "A pair of shoes"], 0, "I'm looking for a jacket for the winter."),
        lq("What colour does he want?", ["Blue", "Black", "Grey"], 1, "Do you have it in black?"),
        lq("What is the problem with the first jacket?", ["It's too long.", "It's too tight.", "It's too expensive."], 1, "It's a bit too tight."),
        lq("How much discount is there this week?", ["Ten percent", "Twenty percent", "Fifty percent"], 1, "Twenty percent off this week."),
        lq("Which question asks to wear clothes in the shop before buying?", ["Can I try it on?", "Can I take it?", "Can I pay by card?"], 0, "Try on = put clothes on to see if they fit."),
        lq("Complete: \"These shoes aren't big ___.\"", ["too", "enough", "very"], 1, "Not + adjective + enough.")
      ] }
    ]
  },
  {
    key: "more:a2:writing-thank-you", batch: "lessons", level: "A2", unit: A2, slug: "writing-a-thank-you-note", title: "Write: a thank-you note", skill: "WRITING", minutes: 13,
    blocks: [
      { kind: "text", heading: "Model note", body: "Dear Mrs Thanh,\n\nThank you very much for the lovely dinner on Saturday. The spring rolls were delicious, and it was nice to meet your family. I really enjoyed talking to your son about football!\n\nThank you also for the book about Hoi An. I'm going to read it before my trip next month.\n\nI hope you can visit me in Da Lat one day. I would love to cook for you.\n\nBest wishes,\nLaura" },
      { kind: "text", heading: "How to write a thank-you note", body: "• Say thank you and say what for: Thank you for the dinner / for your help.\n• Give a detail to show you mean it: The spring rolls were delicious.\n• Add something about the future: I'm going to… / I hope we can meet again soon.\n• Use a friendly ending: Best wishes, / See you soon, / Love, (for family and close friends)\n\nGrammar: Thank you for + noun or -ing → Thank you for helping me." },
      { kind: "practice", instruction: "Choose the best answer.", questions: [
        lq("Why is Laura writing?", ["To invite Mrs Thanh to a party", "To thank Mrs Thanh for dinner and a book", "To ask for directions"], 1, "Thank you for the lovely dinner… Thank you also for the book."),
        lq("What is Laura going to do next month?", ["Visit Hoi An", "Move to Da Lat", "Cook for Mrs Thanh's family"], 0, "I'm going to read it before my trip next month."),
        lq("Which sentence is correct?", ["Thank you for help me.", "Thank you for helping me.", "Thank you to help me."], 1, "Thank you for + -ing."),
        lq("Why does Laura mention the spring rolls?", ["To give a detail that shows she enjoyed the dinner", "To ask for the recipe", "To complain"], 0, "Details show you really mean your thanks."),
        lq("Which ending is best for a note to a teacher?", ["Love,", "Best wishes,", "Bye bye!!"], 1, "Best wishes is friendly but polite."),
        lq("\"I hope ___ visit me one day.\"", ["you can", "you to", "can you"], 0, "I hope + subject + verb.")
      ] }
    ]
  },
  {
    key: "more:b1:speaking-past-experience", batch: "lessons", level: "B1", unit: B1, slug: "speaking-describing-a-memorable-experience", title: "Speak: describing a memorable experience", skill: "SPEAKING", minutes: 15,
    blocks: [
      { kind: "text", heading: "Useful language", body: "Setting the scene: It happened when I was… / A few years ago, … / I was travelling with…\nSequencing: First, … / Then, … / After that, … / In the end, …\nFeelings: I was really nervous / amazed / relieved. / I couldn't believe it.\nReflecting: Looking back, … / I'll never forget… / It taught me that…\n\nTip: use the past simple for the main events and the past continuous for the background: We were walking along the beach when we saw a turtle." },
      { kind: "listening", heading: "Model answer", voices: { Speaker: "female" }, script: "Speaker: I'd like to talk about the first time I gave a presentation in English. It happened about two years ago, when I was working for a travel company. My manager asked me to present our new tours to a group of visitors from Australia.\nI was really nervous. The night before, I practised in front of the mirror at least ten times. On the day, I was setting up my slides when the projector stopped working. For a moment, I couldn't believe it. Then I decided to continue without slides and just talk to the audience.\nIn the end, it went much better than I expected. The visitors asked lots of questions, and two of them booked a tour that afternoon.\nLooking back, I think that experience taught me that preparation matters, but staying calm when things go wrong matters even more." },
      { kind: "practice", instruction: "Choose the best answer.", questions: [
        lq("When did the experience happen?", ["Last week", "About two years ago", "When she was a child"], 1, "It happened about two years ago."),
        lq("What went wrong?", ["The visitors were late.", "The projector stopped working.", "She forgot her notes."], 1, "The projector stopped working."),
        lq("What did she decide to do?", ["Cancel the presentation", "Continue without slides", "Ask her manager to present"], 1, "I decided to continue without slides."),
        lq("What was the result?", ["Two visitors booked a tour.", "Nobody asked questions.", "She lost her job."], 0, "Two of them booked a tour that afternoon."),
        lq("Which tense describes the background? \"I ___ my slides when the projector stopped.\"", ["set up", "was setting up", "have set up"], 1, "Past continuous for the background action."),
        lq("Which phrase introduces a reflection?", ["A few years ago", "Looking back", "First of all"], 1, "Looking back introduces what you think about it now.")
      ] }
    ]
  },
  {
    key: "more:b1:writing-enquiry-email", batch: "lessons", level: "B1", unit: B1, slug: "writing-an-email-asking-for-information", title: "Write: an email asking for information", skill: "WRITING", minutes: 15,
    blocks: [
      { kind: "text", heading: "Model email", body: "Subject: Enquiry about evening English classes\n\nDear Sir or Madam,\n\nI am writing to ask for information about the evening English classes advertised on your website.\n\nI work full-time, so I am interested in a course that starts after 6 p.m. Could you tell me which days the intermediate classes take place and how many students there are in each class? I would also like to know whether the course fee includes books.\n\nFinally, is it possible to take a placement test before I enrol? I studied English at school, but I am not sure which level is right for me.\n\nI look forward to hearing from you.\n\nYours faithfully,\nNguyen Thanh Tam" },
      { kind: "text", heading: "Features of an enquiry email", body: "• A clear subject line.\n• Opening: Dear Sir or Madam (name unknown) → Yours faithfully. Dear Ms Lee (name known) → Yours sincerely.\n• First paragraph: why you are writing — I am writing to ask for information about…\n• Middle: your questions, often as indirect questions, which sound more polite:\n  Could you tell me which days the classes take place? (not: Which days do the classes take place?)\n  I would like to know whether the fee includes books.\n• Ending: I look forward to hearing from you." },
      { kind: "practice", instruction: "Choose the best answer.", questions: [
        lq("Why does Tam need a class after 6 p.m.?", ["He works full-time.", "He studies at university.", "He lives far away."], 0, "I work full-time."),
        lq("Which question does Tam NOT ask?", ["How many students are in each class?", "Who is the teacher?", "Does the fee include books?"], 1, "He does not ask about the teacher."),
        lq("Which indirect question is correct?", ["Could you tell me when does the course start?", "Could you tell me when the course starts?", "Could you tell me when starts the course?"], 1, "In indirect questions, use normal word order: the course starts."),
        lq("If you start with 'Dear Sir or Madam', you should end with…", ["Yours sincerely", "Yours faithfully", "Love"], 1, "Name unknown → Yours faithfully."),
        lq("What is the purpose of the first paragraph?", ["To give the reason for writing", "To say goodbye", "To describe your family"], 0, "I am writing to ask for information about…"),
        lq("\"I would like to know ___ there is a discount for students.\"", ["if", "that", "what"], 0, "Yes/no indirect questions use if or whether.")
      ] }
    ]
  },
  {
    key: "more:b2:speaking-online-meetings", batch: "lessons", level: "B2", unit: B2, slug: "speaking-taking-part-in-online-meetings", title: "Speak: taking part in online meetings", skill: "SPEAKING", minutes: 16,
    blocks: [
      { kind: "text", heading: "Useful language", body: "Joining in: Can I just come in here? / If I could add something…\nAsking for clarification: Sorry, could you go over that again? / Just to clarify, are you saying that…?\nTechnical problems: You're breaking up a little. / I think you're on mute. / Could you share your screen again?\nKeeping things moving: Shall we move on to the next point? / Let's come back to that later.\nSumming up: So, to sum up, we've agreed that… / Who's going to follow up on that?\n\nTip: online, it's harder to see when someone wants to speak, so short, polite signals (Can I just…?) are essential." },
      { kind: "listening", heading: "Model meeting", voices: { Huong: "female", David: "male", Priya: "female" }, script: "Huong: Okay, I think everyone's here. Shall we start with the launch date?\nDavid: Sure. Our plan is still the first of June, but the app testing is behind schedule.\nPriya: Sorry, David, you're breaking up a little. Could you go over that again?\nDavid: Of course. The testing is about two weeks behind.\nHuong: Just to clarify, are you saying the first of June isn't realistic?\nDavid: Not exactly. It's possible, but only if we reduce the number of features at launch.\nPriya: Can I just come in here? From a marketing point of view, a smaller launch is fine, as long as the main booking feature works.\nHuong: That's a good point. Let's come back to the feature list on Thursday. So, to sum up, we're keeping the first of June, with fewer features. David, could you send us the list of what's ready?\nDavid: I'll send it by tomorrow morning." },
      { kind: "practice", instruction: "Choose the best answer.", questions: [
        lq("What is the problem with the launch?", ["The app testing is behind schedule.", "The marketing team is not ready.", "The date has already passed."], 0, "The app testing is behind schedule."),
        lq("Why does Priya ask David to repeat?", ["His connection is breaking up.", "She disagrees with him.", "She wasn't invited."], 0, "You're breaking up a little."),
        lq("What condition does David give for launching on 1 June?", ["More testers", "Fewer features at launch", "A bigger budget"], 1, "Only if we reduce the number of features at launch."),
        lq("What is Priya's view?", ["A smaller launch is fine if booking works.", "The launch must be delayed.", "All features are essential."], 0, "As long as the main booking feature works."),
        lq("Which phrase checks understanding?", ["Just to clarify, are you saying…?", "Shall we start?", "I'll send it tomorrow."], 0, "Just to clarify asks whether you understood correctly."),
        lq("What will David do next?", ["Send the list of ready features", "Cancel the meeting", "Test the app himself"], 0, "I'll send it by tomorrow morning.")
      ] }
    ]
  },
  {
    key: "more:b2:writing-for-against", batch: "lessons", level: "B2", unit: B2, slug: "writing-a-for-and-against-essay", title: "Write: a for-and-against essay", skill: "WRITING", minutes: 18,
    blocks: [
      { kind: "text", heading: "Model essay", body: "Should students have to wear school uniforms?\n\nIn many countries, school uniforms are a normal part of student life, while in others they are rare. There are strong arguments on both sides of the debate.\n\nOn the one hand, uniforms can reduce pressure on students and families. When everyone wears the same clothes, there is less competition over fashion and brands, which can be expensive. Uniforms may also create a sense of belonging and make it easier for teachers to recognise students during school trips.\n\nOn the other hand, critics argue that uniforms limit self-expression. Teenagers are developing their identity, and clothes are one way of showing who they are. Furthermore, uniforms are not always cheap, especially if families have to buy them from a single supplier, and they may be uncomfortable in hot weather.\n\nIn conclusion, both sides make valid points. In my view, uniforms are useful, provided that they are affordable and practical, and that students have some say in the design." },
      { kind: "text", heading: "Structure and language", body: "1. Introduction: introduce the topic neutrally.\n2. Arguments for: On the one hand, … / One advantage is that… / Moreover, …\n3. Arguments against: On the other hand, … / Critics argue that… / Furthermore, …\n4. Conclusion: summarise and, if asked, give your opinion: In conclusion, … / In my view, … / provided that…\n\nTip: keep the opinion for the conclusion, and give each paragraph a clear topic sentence." },
      { kind: "practice", instruction: "Choose the best answer.", questions: [
        lq("Which argument for uniforms does the writer give?", ["They reduce competition over fashion.", "They are always cheap.", "They are comfortable in hot weather."], 0, "There is less competition over fashion and brands."),
        lq("Which argument against uniforms is mentioned?", ["They limit self-expression.", "They make students taller.", "They improve exam results."], 0, "Critics argue that uniforms limit self-expression."),
        lq("Where does the writer give a personal opinion?", ["In the introduction", "In the conclusion", "In every paragraph"], 1, "In my view… in the conclusion."),
        lq("What does 'provided that' mean in the conclusion?", ["only if", "because", "although"], 0, "Provided that = on condition that."),
        lq("Which linker introduces the opposite side?", ["Moreover", "On the other hand", "For example"], 1, "On the other hand introduces the contrasting view."),
        lq("Which is the best topic sentence for an 'against' paragraph?", ["Uniforms have several disadvantages.", "I wear jeans.", "Many schools are big."], 0, "It clearly states what the paragraph is about.")
      ] }
    ]
  },
  {
    key: "more:c1:speaking-handling-questions", batch: "lessons", level: "C1", unit: C1, slug: "speaking-handling-questions-after-a-talk", title: "Speak: handling questions after a talk", skill: "SPEAKING", minutes: 17,
    blocks: [
      { kind: "text", heading: "Useful language", body: "Welcoming: That's a really interesting question. / Thanks for raising that.\nBuying time: Let me think about that for a moment. / That's a fair point — let me answer it in two parts.\nClarifying: If I've understood you correctly, you're asking whether…\nAdmitting limits: I don't have the exact figure to hand, but I can send it to you. / That's slightly outside my area, but…\nDeflecting hostility: I can see why you'd see it that way. However, …\nChecking: Does that answer your question?\n\nTip: paraphrasing the question before answering gives you time and shows the whole audience what was asked." },
      { kind: "listening", heading: "Model Q&A", voices: { Presenter: "male", Questioner: "female" }, script: "Questioner: Thank you for the talk. You said the new bus lanes have cut journey times, but haven't they just made traffic worse for everyone else?\nPresenter: Thanks for raising that — it's the question we hear most often. If I've understood you correctly, you're asking whether the gains for bus passengers come at the expense of drivers.\nQuestioner: Exactly.\nPresenter: Let me answer it in two parts. First, in the first few months, yes, car journeys on those roads did get slower. I wouldn't want to pretend otherwise. Second, after about six months, a noticeable number of drivers had switched to the bus, and car journey times recovered somewhat. I don't have the exact figures to hand, but they're in our published report, and I'm happy to send you the link.\nQuestioner: So you're saying it evens out?\nPresenter: Partly. It doesn't fully even out on every road, and I can see why drivers on those routes feel frustrated. But overall, more people are now moving through the city in less time. Does that answer your question?\nQuestioner: Yes, thank you." },
      { kind: "practice", instruction: "Choose the best answer.", questions: [
        lq("What is the questioner's concern?", ["Bus lanes have made traffic worse for drivers.", "Buses are too expensive.", "The talk was too long."], 0, "Haven't they just made traffic worse for everyone else?"),
        lq("Why does the presenter paraphrase the question?", ["To make sure he understood and to gain time", "To avoid answering", "To criticise the questioner"], 0, "If I've understood you correctly, you're asking…"),
        lq("What does he admit about the first months?", ["Car journeys did get slower.", "Nothing changed.", "Bus passengers complained."], 0, "Yes, car journeys on those roads did get slower."),
        lq("How does he deal with not knowing the exact figures?", ["He invents a number.", "He offers to send the published report.", "He changes the subject."], 1, "They're in our published report… happy to send you the link."),
        lq("Which phrase acknowledges the other side's feelings?", ["Let me answer it in two parts.", "I can see why drivers feel frustrated.", "Does that answer your question?"], 1, "I can see why… acknowledges their view."),
        lq("What is his overall conclusion?", ["The bus lanes failed completely.", "Overall, more people move through the city in less time.", "Drivers should not complain."], 1, "Overall, more people are now moving through the city in less time.")
      ] }
    ]
  },
  {
    key: "more:c1:writing-review", batch: "lessons", level: "C1", unit: C1, slug: "writing-a-balanced-review", title: "Write: a balanced review", skill: "WRITING", minutes: 19,
    blocks: [
      { kind: "text", heading: "Model review", body: "The River House — a review\n\nTucked away at the end of a quiet lane in Hoi An's old town, The River House promises 'home cooking with a view', and on the whole it delivers.\n\nThe setting is undeniably its greatest asset. Tables on the wooden terrace look directly onto the river, and at sunset, when the lanterns are lit, it is hard to imagine a more atmospheric place to eat. Inside, the decor is simple but tasteful.\n\nThe food, while not ground-breaking, is consistently well prepared. The cao lầu was particularly good, with noodles that had exactly the right texture, though the fried spring rolls were rather oily. Portions are generous, and the staff are attentive without being intrusive.\n\nWhere the restaurant falls short is value for money. Prices are noticeably higher than at comparable places nearby, presumably to pay for the view. Service also slowed considerably once the terrace filled up.\n\nOverall, The River House is well worth a visit for a special evening, particularly if you book a terrace table early. Those on a tighter budget, however, may prefer to enjoy the view with a drink and eat elsewhere." },
      { kind: "text", heading: "Features of a good review", body: "• An engaging opening that sets the scene and hints at your verdict.\n• Balance: strengths and weaknesses, each supported by specific details.\n• Precise, evaluative language: undeniably, consistently well prepared, rather oily, falls short, well worth a visit.\n• Hedging and concession: while not ground-breaking, …; though…; on the whole…\n• A clear recommendation that says who the place (or book, film) is for." },
      { kind: "practice", instruction: "Choose the best answer.", questions: [
        lq("What does the reviewer consider the restaurant's greatest strength?", ["The prices", "The setting", "The speed of service"], 1, "The setting is undeniably its greatest asset."),
        lq("Which criticism does the reviewer make of the food?", ["The spring rolls were rather oily.", "The noodles were overcooked.", "The portions were small."], 0, "Though the fried spring rolls were rather oily."),
        lq("Where does the restaurant 'fall short'?", ["Atmosphere", "Value for money", "Decor"], 1, "Where the restaurant falls short is value for money."),
        lq("What does 'while not ground-breaking' show?", ["The reviewer hated the food.", "A concession before a positive judgement", "That the food was new"], 1, "It concedes a limitation before praising consistency."),
        lq("Who does the reviewer recommend the restaurant for?", ["People wanting a special evening", "Large groups in a hurry", "Nobody"], 0, "Well worth a visit for a special evening."),
        lq("What advice is given to people on a tight budget?", ["Avoid Hoi An", "Have a drink for the view and eat elsewhere", "Order only spring rolls"], 1, "Enjoy the view with a drink and eat elsewhere.")
      ] }
    ]
  },
  {
    key: "more:c2:speaking-storytelling", batch: "lessons", level: "C2", unit: C2, slug: "speaking-telling-a-story-with-impact", title: "Speak: telling a story with impact", skill: "SPEAKING", minutes: 18,
    blocks: [
      { kind: "text", heading: "Techniques", body: "• Start in the middle of the action, then fill in the background: I was standing on the roof of a bus in Bolivia when…\n• Vary pace: slow down for the key moment, and use short sentences for tension.\n• Use present tense for vividness in informal storytelling: So I walk in, and there's nobody there.\n• Show, don't tell: instead of 'I was scared', describe what you did or felt physically.\n• Withhold information to build suspense: What I didn't know yet was that…\n• End with a reflection or a twist that gives the story a point.\n\nUseful phrases: It turned out that… / Little did I know… / To this day, I… / The funny thing is…" },
      { kind: "listening", heading: "Model story", voices: { Speaker: "male" }, script: "Speaker: So there I am, standing at the front of a lecture hall, two hundred faces looking at me, and my laptop screen goes completely black.\nThis was my first talk at an international conference. I'd spent three months on the research and about three weeks on the slides. What I hadn't spent any time on was what to do without them.\nMy hands were shaking. I could hear someone in the third row unwrapping a sweet. And then — I don't really know why — I closed the laptop, walked to the edge of the stage, and said, 'Well. Let me tell you what I found.'\nI talked for twenty minutes without a single slide. I remember almost nothing of what I said. What I do remember is that people stopped looking at their phones.\nAfterwards, the chair of the session came over. I was ready for sympathy. Instead she said, 'You should lose the slides more often.'\nTo this day, I still prepare slides. But I always practise once without them — just in case the screen goes black again." },
      { kind: "practice", instruction: "Choose the best answer.", questions: [
        lq("How does the speaker begin the story?", ["With background about his research", "In the middle of the dramatic moment", "With the moral of the story"], 1, "He starts as the screen goes black."),
        lq("Why does he use the present tense at the start?", ["To make the moment feel vivid and immediate", "Because it happened today", "Because it is a formal talk"], 0, "Present tense creates vividness in storytelling."),
        lq("Which detail 'shows' rather than 'tells' his nervousness?", ["My hands were shaking.", "I was nervous.", "It was a conference."], 0, "A physical detail shows the feeling."),
        lq("What surprised him after the talk?", ["The chair offered sympathy.", "The chair suggested he use fewer slides.", "Nobody spoke to him."], 1, "You should lose the slides more often."),
        lq("What is the effect of 'What I hadn't spent any time on was…'?", ["It withholds and then reveals important information.", "It changes the topic.", "It ends the story."], 0, "It builds suspense before the problem matters."),
        lq("How does the story end?", ["With a reflection on what he does now", "With a joke about sweets", "Without a conclusion"], 0, "To this day… I always practise once without them.")
      ] }
    ]
  },
  {
    key: "more:c2:writing-letter-to-editor", batch: "lessons", level: "C2", unit: C2, slug: "writing-a-letter-to-the-editor", title: "Write: a letter to the editor", skill: "WRITING", minutes: 20,
    blocks: [
      { kind: "text", heading: "Model letter", body: "Sir,\n\nYour editorial of 12 May ('Let the old market go') argues that the city's plan to replace the central market with a shopping centre is simply the price of progress. I would like to suggest that the choice is not as stark as you imply.\n\nNo one disputes that the present building is in poor repair, nor that vendors and shoppers deserve better facilities. But to conclude from this that the market itself must disappear is to confuse the container with what it contains. The market's value lies less in its roof than in the several hundred small traders who depend on it and in the affordable food it supplies to the surrounding districts.\n\nOther cities have shown that renovation need not mean replacement. Markets have been restored with modern drainage, refrigeration and fire safety while keeping rents within reach of existing tenants. Such projects are rarely cheaper in the short term; they are, however, far less costly in social terms.\n\nYou describe opponents of the plan as nostalgic. Some may be. But it is not nostalgia to ask who will be able to afford a stall in the new building, and where the rest will go. Before the council proceeds, it owes those traders — and your readers — a clear answer.\n\nYours faithfully,\nĐỗ Minh Quân" },
      { kind: "text", heading: "Features of an effective letter", body: "• Refer precisely to the article you are responding to.\n• State your position early and economically: I would like to suggest that the choice is not as stark as you imply.\n• Concede what is reasonable in the opposing view before challenging it: No one disputes that… But…\n• Use evidence or comparison rather than emotion alone.\n• Address the other side's characterisation of your view: You describe opponents as nostalgic. Some may be. But…\n• End with a clear demand or question.\n• Register: formal, controlled irony at most; never personal insults." },
      { kind: "practice", instruction: "Choose the best answer.", questions: [
        lq("What is the writer's main claim?", ["The market should stay exactly as it is.", "Renovation is a real alternative to replacement.", "The editorial was well researched."], 1, "Renovation need not mean replacement."),
        lq("What does 'to confuse the container with what it contains' mean here?", ["Mistaking the building's condition for the value of the market itself", "Mixing up two different markets", "Storing food incorrectly"], 0, "The market's value lies less in its roof than in the traders."),
        lq("What does the writer concede?", ["The building is in poor repair.", "Shopping centres are always better.", "Traders pay too little rent."], 0, "No one disputes that the present building is in poor repair."),
        lq("How does the writer respond to being called nostalgic?", ["By denying it angrily", "By partly accepting it and then reframing the issue", "By ignoring it"], 1, "Some may be. But it is not nostalgia to ask…"),
        lq("What does the letter end with?", ["A personal story", "A demand for a clear answer from the council", "A joke"], 1, "It owes those traders — and your readers — a clear answer."),
        lq("Which phrase best shows controlled, formal disagreement?", ["You are completely wrong.", "The choice is not as stark as you imply.", "This is a stupid plan."], 1, "Measured wording challenges the claim without insult.")
      ] }
    ]
  }
];
