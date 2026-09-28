import { lq, type LessonDef } from "../types";

const A1 = "Everyday skills";
const A2 = "Skills for daily life";

export const skillsA: LessonDef[] = [
  {
    key: "skills:a1:reading-neighbourhood", batch: "lessons", level: "A1", unit: A1, slug: "reading-my-new-neighbourhood", title: "Read: my new neighbourhood", skill: "READING", minutes: 12,
    blocks: [
      { kind: "text", heading: "Before you read", body: "You will read an email from Hoa to her friend Ben. Hoa has a new flat. Read quickly first and find three places near her home. Then read again and answer the questions." },
      { kind: "text", heading: "Hoa's email", body: "Hi Ben,\n\nI have a new flat! It is on the third floor of a small building on Tran Phu Street. The flat is not big, but it is bright and quiet. There are two rooms: a bedroom and a living room with a small kitchen.\n\nMy neighbourhood is great. There is a market at the end of the street, and it opens at six in the morning. There is also a park near my building. I walk there every evening. The bus stop is opposite the park, so it is easy to get to work.\n\nMy neighbours are friendly. The woman next door is a teacher, and she has two cats.\n\nCome and visit me next month!\n\nHoa" },
      { kind: "practice", instruction: "Read the email and choose the best answer.", questions: [
        lq("Where is Hoa's flat?", ["On the ground floor", "On the third floor", "Above the market"], 1, "She writes: It is on the third floor of a small building."),
        lq("How many rooms are there in the flat?", ["Two", "Three", "Four"], 0, "There are two rooms: a bedroom and a living room."),
        lq("When does the market open?", ["At six in the evening", "At nine in the morning", "At six in the morning"], 2, "It opens at six in the morning."),
        lq("What does Hoa do every evening?", ["She goes to the market.", "She walks in the park.", "She takes the bus."], 1, "I walk there (the park) every evening."),
        lq("Why is it easy for Hoa to get to work?", ["The bus stop is opposite the park.", "Her office is next door.", "She has a new motorbike."], 0, "The bus stop is opposite the park, so it is easy to get to work."),
        lq("What do we know about the woman next door?", ["She is a doctor.", "She has a dog.", "She is a teacher with two cats."], 2, "The woman next door is a teacher, and she has two cats.")
      ] }
    ]
  },
  {
    key: "skills:a1:listening-cafe", batch: "lessons", level: "A1", unit: A1, slug: "listening-ordering-at-a-cafe", title: "Listen: ordering at a café", skill: "LISTENING", minutes: 12,
    blocks: [
      { kind: "text", heading: "Listening tip", body: "Before you listen, read the questions. Think about the words you might hear: drinks, sizes, prices. You do not need to understand every word — listen for the information in the questions." },
      { kind: "listening", heading: "At the café", voices: { Server: "male", Linh: "female" }, script: "Server: Good morning. What can I get you?\nLinh: Hi. Can I have an iced coffee with milk, please?\nServer: Sure. Small or large?\nLinh: Large, please. And do you have any cake?\nServer: We have chocolate cake and banana cake today.\nLinh: I'll have the banana cake, please.\nServer: OK. That's one large iced coffee and one banana cake. That's seventy-five thousand dong.\nLinh: Here you are.\nServer: Thank you. Please take a seat. I'll bring it to your table." },
      { kind: "practice", instruction: "Listen and choose the best answer.", questions: [
        lq("What drink does Linh order?", ["Hot tea", "Iced coffee with milk", "Orange juice"], 1, "Linh asks for an iced coffee with milk."),
        lq("What size is the drink?", ["Large", "Small", "Medium"], 0, "The server asks small or large; Linh says large."),
        lq("Which cakes does the café have today?", ["Chocolate and coconut", "Banana and lemon", "Chocolate and banana"], 2, "We have chocolate cake and banana cake today."),
        lq("How much does Linh pay?", ["57,000 dong", "75,000 dong", "70,000 dong"], 1, "That's seventy-five thousand dong."),
        lq("What will the server do?", ["Bring the order to Linh's table", "Call Linh's name", "Put the order in a bag"], 0, "I'll bring it to your table.")
      ] }
    ]
  },
  {
    key: "skills:a1:speaking-family", batch: "lessons", level: "A1", unit: A1, slug: "speaking-talk-about-your-family", title: "Speak: talk about your family", skill: "SPEAKING", minutes: 12,
    blocks: [
      { kind: "text", heading: "Useful language", body: "• There are four people in my family.\n• I have one brother and two sisters.\n• My mother is a nurse. My father works in an office.\n• My brother is older / younger than me.\n• We live in Can Tho.\n• I don't have any brothers or sisters. I'm an only child.\n\nQuestions to ask: Do you have any brothers or sisters? What does your father do? How old is your sister?" },
      { kind: "listening", heading: "Model conversation", voices: { Sam: "male", Vy: "female" }, script: "Sam: Do you have any brothers or sisters, Vy?\nVy: Yes, I have one brother. His name is Duc.\nSam: Is he older than you?\nVy: No, he's younger. He's twelve.\nSam: And what do your parents do?\nVy: My mother is a teacher, and my father is a driver. What about you?\nSam: I'm an only child. I live with my mum and my grandmother." },
      { kind: "practice", instruction: "Choose the best reply.", questions: [
        lq("\"Do you have any brothers or sisters?\"", ["Yes, I have two sisters.", "Yes, I am a sister.", "No, I have."], 0, "Answer with have + number + noun."),
        lq("\"What does your mother do?\"", ["She is fifty.", "She's a doctor.", "She does fine."], 1, "What does she do? asks about her job."),
        lq("\"How old is your brother?\"", ["He is tall.", "He is a student.", "He's nineteen."], 2, "How old asks for an age."),
        lq("Which sentence means you have no brothers or sisters?", ["I'm an only child.", "I'm a single child.", "I'm one child."], 0, "The natural phrase is I'm an only child."),
        lq("\"Is your sister older than you?\"", ["Yes, she has.", "Yes, she is.", "Yes, she does."], 1, "Short answers with be: Yes, she is."),
        lq("Choose the correct sentence.", ["There is five people in my family.", "Have five people in my family.", "There are five people in my family."], 2, "Plural noun after there are.")
      ] }
    ]
  },
  {
    key: "skills:a1:writing-message", batch: "lessons", level: "A1", unit: A1, slug: "writing-a-short-message", title: "Write: a short message to a friend", skill: "WRITING", minutes: 12,
    blocks: [
      { kind: "text", heading: "Model message", body: "Hi Tuan,\n\nAre you free on Saturday afternoon? There is a football match at the city stadium at three o'clock. My cousin has two extra tickets. We can meet at the bus stop near your house at two. Please reply today!\n\nSee you,\nKhoa" },
      { kind: "text", heading: "How to write a short message", body: "1. Start with a greeting: Hi…, / Hello…,\n2. Say why you are writing: Are you free…? / Thank you for…\n3. Give the key information: what, where, when.\n4. Ask for a reply or give an instruction: Please reply today. / Call me later.\n5. End: See you, / Love, / Best wishes, + your name.\n\nUse capital letters for names, days and months: Saturday, June, Tuan." },
      { kind: "practice", instruction: "Choose the best answer.", questions: [
        lq("Why does Khoa write the message?", ["To invite Tuan to a football match", "To sell tickets", "To ask about homework"], 0, "He asks if Tuan is free and mentions extra tickets."),
        lq("Where will they meet?", ["At the stadium", "At the bus stop near Tuan's house", "At Khoa's house"], 1, "We can meet at the bus stop near your house."),
        lq("Which is the best way to start a message to a friend?", ["Dear Sir,", "Hi Mai,", "To whom it may concern,"], 1, "A friendly greeting: Hi + name."),
        lq("Which sentence is written correctly?", ["see you on saturday.", "See you on Saturday.", "See you on saturday."], 1, "Sentences and days of the week start with a capital letter."),
        lq("Which sentence asks for a reply?", ["Please reply today!", "My cousin has two tickets.", "The match is at three."], 0, "Please reply… asks the reader to answer."),
        lq("Which ending is best for a message to a friend?", ["Yours faithfully,", "See you,", "Regards from the company,"], 1, "See you is informal and friendly.")
      ] }
    ]
  },
  {
    key: "skills:a2:reading-market", batch: "lessons", level: "A2", unit: A2, slug: "reading-weekend-night-market", title: "Read: a weekend night market", skill: "READING", minutes: 14,
    blocks: [
      { kind: "text", heading: "Before you read", body: "You will read a short blog post about a night market. Look at the title and guess: what can you buy at a night market? Then read and check." },
      { kind: "text", heading: "Blog post: Saturday nights at Ben Thanh Street", body: "Every Saturday evening, the street behind our school becomes a busy night market. The first stalls open at half past five, and the market stays open until eleven. When I was younger, I only went there for the food, but now I go for the atmosphere too.\n\nThe food stalls are at the north end of the street. My favourite is a small stall that sells grilled corn and sweet potato soup. It is cheap and always crowded, so I usually arrive early. In the middle of the street, students sell handmade things: bracelets, notebooks and small paintings. Last month I bought a notebook with a leather cover for my sister's birthday.\n\nThe south end is quieter. There is a stage where local bands play music from eight o'clock. Some people dance, but most people just sit on plastic chairs and listen.\n\nOne piece of advice: bring cash. Only a few sellers accept card payments." },
      { kind: "practice", instruction: "Read the blog post and choose the best answer.", questions: [
        lq("What time does the market close?", ["At half past five", "At eight o'clock", "At eleven o'clock"], 2, "The market stays open until eleven."),
        lq("Why does the writer arrive early at the corn stall?", ["Because it is always crowded", "Because it closes at six", "Because the food is cheaper then"], 0, "It is cheap and always crowded, so I usually arrive early."),
        lq("Who sells handmade things?", ["Local bands", "Students", "Restaurant owners"], 1, "In the middle of the street, students sell handmade things."),
        lq("What did the writer buy last month?", ["A bracelet", "A painting", "A notebook"], 2, "Last month I bought a notebook with a leather cover."),
        lq("What happens at the south end of the street?", ["There is live music.", "There are food stalls.", "Students sell clothes."], 0, "There is a stage where local bands play music."),
        lq("What is the writer's advice?", ["Arrive after eight.", "Bring cash.", "Buy food at the south end."], 1, "One piece of advice: bring cash.")
      ] }
    ]
  },
  {
    key: "skills:a2:listening-booking", batch: "lessons", level: "A2", unit: A2, slug: "listening-booking-a-table", title: "Listen: booking a table by phone", skill: "LISTENING", minutes: 14,
    blocks: [
      { kind: "text", heading: "Listening tip", body: "Phone calls often include numbers, times and names. Write them down while you listen. When a name is spelled, write each letter." },
      { kind: "listening", heading: "Phone call to a restaurant", voices: { Receptionist: "female", Mark: "male" }, script: "Receptionist: Good afternoon, Lotus Garden Restaurant. How can I help you?\nMark: Hello. I'd like to book a table for Friday evening, please.\nReceptionist: Of course. For how many people?\nMark: For six people.\nReceptionist: And what time would you like?\nMark: Seven thirty, if possible.\nReceptionist: I'm sorry, we're full at seven thirty. We have a table at eight o'clock.\nMark: Eight o'clock is fine.\nReceptionist: Can I have your name, please?\nMark: Yes, it's Mark Dawson. That's D-A-W-S-O-N.\nReceptionist: Thank you, Mr Dawson. Would you like a table inside or on the terrace?\nMark: On the terrace, please. It's my mother's birthday, so a nice view would be great.\nReceptionist: No problem. See you on Friday at eight." },
      { kind: "practice", instruction: "Listen and choose the best answer.", questions: [
        lq("Which day is the booking for?", ["Thursday", "Friday", "Saturday"], 1, "I'd like to book a table for Friday evening."),
        lq("How many people will come?", ["Six", "Seven", "Eight"], 0, "For six people."),
        lq("What time is the booking?", ["Seven o'clock", "Seven thirty", "Eight o'clock"], 2, "Seven thirty is full; Mark accepts eight o'clock."),
        lq("How do you spell Mark's surname?", ["DORSON", "DAWSON", "DAWSEN"], 1, "He spells it D-A-W-S-O-N."),
        lq("Where will they sit?", ["On the terrace", "Near the kitchen", "Inside, by the window"], 0, "On the terrace, please."),
        lq("Why are they going to the restaurant?", ["For a business meeting", "To celebrate a wedding", "For his mother's birthday"], 2, "It's my mother's birthday.")
      ] }
    ]
  },
  {
    key: "skills:a2:speaking-directions", batch: "lessons", level: "A2", unit: A2, slug: "speaking-asking-for-directions", title: "Speak: asking for and giving directions", skill: "SPEAKING", minutes: 13,
    blocks: [
      { kind: "text", heading: "Useful language", body: "Asking: Excuse me, how do I get to…? / Is there a … near here? / Is it far?\nGiving directions: Go straight on. / Turn left at the traffic lights. / Take the second road on the right. / It's on your left, next to the bank. / It's opposite the post office. / It's about five minutes' walk.\nChecking: Sorry, could you say that again? / So I turn left at the lights?" },
      { kind: "listening", heading: "Model conversation", voices: { Tourist: "female", Local: "male" }, script: "Tourist: Excuse me, is there a pharmacy near here?\nLocal: Yes, there's one on Le Loi Street. Go straight on and turn right at the traffic lights.\nTourist: Turn right at the lights. And then?\nLocal: Walk past the bookshop. The pharmacy is on your left, opposite the post office.\nTourist: Is it far?\nLocal: No, it's about five minutes' walk.\nTourist: Great, thank you very much.\nLocal: You're welcome." },
      { kind: "practice", instruction: "Choose the best answer.", questions: [
        lq("Where is the pharmacy?", ["Next to the bookshop", "Opposite the post office", "Behind the traffic lights"], 1, "It is on your left, opposite the post office."),
        lq("How far is the pharmacy?", ["About five minutes' walk", "About fifteen minutes' walk", "Two kilometres"], 0, "It's about five minutes' walk."),
        lq("Which phrase checks that you understood?", ["You're welcome.", "So I turn right at the lights?", "Is there a bank?"], 1, "Repeating the direction as a question checks understanding."),
        lq("Complete: \"Take the ___ road on the left.\"", ["two", "second", "twice"], 1, "Use ordinal numbers: the second road."),
        lq("Which is the most polite way to start?", ["Where pharmacy?", "Tell me the way.", "Excuse me, is there a pharmacy near here?"], 2, "Excuse me + a full question is polite."),
        lq("\"It's ___ the bank.\" (the bank and the shop are side by side)", ["next to", "opposite", "between"], 0, "Next to = beside.")
      ] }
    ]
  },
  {
    key: "skills:a2:writing-trip-email", batch: "lessons", level: "A2", unit: A2, slug: "writing-email-about-a-trip", title: "Write: an email about a trip", skill: "WRITING", minutes: 15,
    blocks: [
      { kind: "text", heading: "Model email", body: "Hi Anna,\n\nI'm back from Da Lat! We stayed there for four days, and it was wonderful. The weather was cool and sunny, so we walked a lot. On the first day we visited the flower gardens, and on the second day we rode bikes around Xuan Huong Lake.\n\nThe best part was the night market. We tried grilled rice paper and hot soy milk. The worst part was the bus journey — it took eight hours because of the traffic.\n\nNext time, I want to go with you. What about next spring?\n\nWrite back soon,\nMinh" },
      { kind: "text", heading: "Language for describing a trip", body: "Past simple for events: We stayed…, We visited…, It took…\nSequencing: On the first day…, Then…, After that…, Finally…\nOpinions: The best part was…, The worst part was…, It was amazing / disappointing.\nLinking: and, but, so, because.\n\nPlan your email in three paragraphs: 1) where and how long, 2) what you did, 3) your opinion and a question for your friend." },
      { kind: "practice", instruction: "Choose the best answer.", questions: [
        lq("How long did Minh stay in Da Lat?", ["Three days", "Four days", "Eight days"], 1, "We stayed there for four days."),
        lq("What was the worst part of the trip?", ["The weather", "The food", "The bus journey"], 2, "The worst part was the bus journey."),
        lq("Choose the correct past form: \"We ___ bikes around the lake.\"", ["ride", "rode", "rided"], 1, "Ride is irregular: rode."),
        lq("Which word shows a result? \"The weather was cool, ___ we walked a lot.\"", ["so", "because", "but"], 0, "So introduces a result."),
        lq("Which sentence gives an opinion?", ["We arrived on Monday.", "The best part was the night market.", "We took a bus."], 1, "The best part was… expresses an opinion."),
        lq("What does Minh do in the last paragraph?", ["He suggests another trip.", "He describes the hotel.", "He complains about the food."], 0, "Next time, I want to go with you. What about next spring?")
      ] }
    ]
  }
];
