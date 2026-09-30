import { lq, type LessonDef } from "../types";

const A1 = "Everyday skills";
const A2 = "Skills for daily life";
const B1 = "Skills for independent users";
const B2 = "Skills for confident users";
const C1 = "Skills for advanced users";
const C2 = "Skills for expert users";

const before = (body: string) => ({ kind: "text" as const, heading: "Before you read", body });

/** Extra Reading lessons: more at the lower levels, fewer as the level rises. */
export const extraReading: LessonDef[] = [
  // ---------- A1 ----------
  {
    key: "extra:a1:reading-postcard", batch: "lessons", level: "A1", unit: A1, slug: "reading-a-postcard-from-hoi-an", title: "Read: a postcard from Hoi An", skill: "READING", minutes: 10,
    blocks: [
      before("You will read a postcard from Lucy to her grandmother. First, find who she is with and where she is staying. Then read again and answer the questions."),
      { kind: "text", heading: "Lucy's postcard", body: "Dear Grandma,\n\nHello from Hoi An! I am here with Mum and Dad for five days. We are staying in a small hotel near the river. Our room has a balcony, and every evening we watch the lanterns on the water. They are red, yellow and green. They are beautiful!\n\nThe weather is hot and sunny. Yesterday we rode bicycles to the beach. Today we are visiting the old town. I want to buy a lantern for you.\n\nThe food here is great. My favourite is cao lau — a noodle dish with pork and vegetables.\n\nSee you soon!\nLove,\nLucy" },
      { kind: "practice", instruction: "Read the postcard and choose the best answer.", questions: [
        lq("Who is Lucy with?", ["Her grandmother", "Her mum and dad", "Her friends"], 1, "I am here with Mum and Dad."),
        lq("How long are they staying in Hoi An?", ["Five days", "Three days", "One week"], 0, "I am here… for five days."),
        lq("Where is their hotel?", ["Near the beach", "In the old town", "Near the river"], 2, "We are staying in a small hotel near the river."),
        lq("What did they do yesterday?", ["They visited the old town.", "They rode bicycles to the beach.", "They bought lanterns."], 1, "Yesterday we rode bicycles to the beach."),
        lq("What does Lucy want to buy for her grandmother?", ["A lantern", "Some food", "A bicycle"], 0, "I want to buy a lantern for you."),
        lq("What is cao lau?", ["A kind of lantern", "A hotel", "A noodle dish"], 2, "Cao lau — a noodle dish with pork and vegetables.")
      ] }
    ]
  },
  {
    key: "extra:a1:reading-timetable", batch: "lessons", level: "A1", unit: A1, slug: "reading-my-school-timetable", title: "Read: my school timetable", skill: "READING", minutes: 11,
    blocks: [
      before("You will read a student's description of his school week. Look for the days, the times and the subjects. Days of the week start with a capital letter."),
      { kind: "text", heading: "My school week", body: "My name is Bao, and I am in grade seven. School starts at seven o'clock every morning and finishes at half past eleven.\n\nOn Monday, I have maths, English and history. Monday is my favourite day because I love history. On Tuesday, I have science and art. On Wednesday, we have sports in the afternoon, so I stay at school until four o'clock. On Thursday, I have English again and music. On Friday, I have maths and geography, and then we clean our classroom together.\n\nI don't go to school on Saturday or Sunday. On Saturday morning, I have a guitar lesson, and on Sunday I visit my grandparents." },
      { kind: "practice", instruction: "Read the text and choose the best answer.", questions: [
        lq("What time does school finish in the morning?", ["At 11:30", "At 7:00", "At 4:00"], 0, "School… finishes at half past eleven."),
        lq("Why is Monday Bao's favourite day?", ["He has sports.", "He loves history.", "He has music."], 1, "Monday is my favourite day because I love history."),
        lq("When does Bao have art?", ["On Monday", "On Thursday", "On Tuesday"], 2, "On Tuesday, I have science and art."),
        lq("Why does Bao stay at school until four on Wednesday?", ["He has sports in the afternoon.", "He cleans the classroom.", "He has a guitar lesson."], 0, "On Wednesday, we have sports in the afternoon."),
        lq("How many times a week does Bao have English?", ["Once", "Twice", "Three times"], 1, "He has English on Monday and on Thursday."),
        lq("What does Bao do on Sunday?", ["He has a guitar lesson.", "He goes to school.", "He visits his grandparents."], 2, "On Sunday I visit my grandparents.")
      ] }
    ]
  },
  {
    key: "extra:a1:reading-menu", batch: "lessons", level: "A1", unit: A1, slug: "reading-a-cafe-menu", title: "Read: a café menu", skill: "READING", minutes: 10,
    blocks: [
      before("You will read a menu from a small café. Menus give names of food and drinks and their prices. Read quickly to find the cheapest and the most expensive items."),
      { kind: "text", heading: "Green Leaf Café — menu", body: "DRINKS\nHot tea — 15,000 dong\nIced coffee with milk — 25,000 dong\nFresh orange juice — 35,000 dong\nMango smoothie — 40,000 dong\n\nFOOD\nBread with egg — 30,000 dong\nChicken sandwich — 45,000 dong\nVegetable fried rice — 50,000 dong\nBeef noodle soup — 60,000 dong\n\nCAKES\nBanana cake — 20,000 dong\nChocolate cake — 30,000 dong\n\nOpen every day from 7 a.m. to 9 p.m.\nFree water with every meal. We do not take credit cards." },
      { kind: "practice", instruction: "Read the menu and choose the best answer.", questions: [
        lq("What is the cheapest drink?", ["Hot tea", "Iced coffee with milk", "Mango smoothie"], 0, "Hot tea costs 15,000 dong, the lowest drink price."),
        lq("How much is a chicken sandwich?", ["30,000 dong", "45,000 dong", "50,000 dong"], 1, "Chicken sandwich — 45,000 dong."),
        lq("Which food is good for a vegetarian?", ["Beef noodle soup", "Chicken sandwich", "Vegetable fried rice"], 2, "Vegetable fried rice has no meat."),
        lq("What is the most expensive food?", ["Beef noodle soup", "Chicken sandwich", "Bread with egg"], 0, "Beef noodle soup costs 60,000 dong."),
        lq("What do you get free with every meal?", ["A cake", "Water", "Tea"], 1, "Free water with every meal."),
        lq("How can you pay at this café?", ["Only by credit card", "By card or cash", "Only in cash"], 2, "We do not take credit cards, so you pay in cash.")
      ] }
    ]
  },
  {
    key: "extra:a1:reading-best-friend", batch: "lessons", level: "A1", unit: A1, slug: "reading-my-best-friend", title: "Read: my best friend", skill: "READING", minutes: 11,
    blocks: [
      before("You will read a short text about a best friend. Look for words that describe people: tall, short, funny, kind. Then answer the questions."),
      { kind: "text", heading: "My best friend, Trang", body: "My best friend is Trang. We are in the same class, and we live on the same street. Trang is fourteen, like me. She is tall and has long black hair and glasses.\n\nTrang is very funny and kind. When I am sad, she always makes me laugh. She is good at maths, and she often helps me with my homework. I am good at drawing, so I help her with art.\n\nAfter school, we usually walk home together. At the weekend, we sometimes go to the library or ride our bikes in the park. Trang has a little dog called Bong. He is white and very friendly.\n\nI am happy to have a friend like Trang." },
      { kind: "practice", instruction: "Read the text and choose the best answer.", questions: [
        lq("How old is Trang?", ["Thirteen", "Fourteen", "Fifteen"], 1, "Trang is fourteen, like me."),
        lq("What does Trang look like?", ["Tall with long black hair and glasses", "Short with short hair", "Tall with blond hair"], 0, "She is tall and has long black hair and glasses."),
        lq("What does Trang do when the writer is sad?", ["She buys a present.", "She calls her mother.", "She makes the writer laugh."], 2, "When I am sad, she always makes me laugh."),
        lq("How does the writer help Trang?", ["With maths", "With art", "With English"], 1, "I am good at drawing, so I help her with art."),
        lq("What do they sometimes do at the weekend?", ["Go to the library or ride bikes", "Go swimming", "Watch films at the cinema"], 0, "We sometimes go to the library or ride our bikes in the park."),
        lq("What is Bong?", ["Trang's brother", "A park", "Trang's dog"], 2, "Trang has a little dog called Bong.")
      ] }
    ]
  },
  {
    key: "extra:a1:reading-pool-notice", batch: "lessons", level: "A1", unit: A1, slug: "reading-a-notice-at-the-swimming-pool", title: "Read: a notice at the swimming pool", skill: "READING", minutes: 10,
    blocks: [
      before("Notices give rules and information. Words like must, must not and please tell you what to do. Read the notice and find three rules."),
      { kind: "text", heading: "Blue Wave Swimming Pool", body: "OPENING TIMES\nMonday to Friday: 6 a.m. – 8 p.m.\nSaturday and Sunday: 7 a.m. – 6 p.m.\nThe pool is closed on the first Monday of every month for cleaning.\n\nTICKETS\nAdults: 40,000 dong\nChildren under 12: 20,000 dong\nChildren under 5: free\n\nRULES\nYou must wear a swimming cap.\nYou must take a shower before you swim.\nDo not eat or drink near the pool.\nDo not run.\nChildren under 10 must swim with an adult.\n\nSwimming lessons for children every Saturday at 9 a.m. Ask at reception." },
      { kind: "practice", instruction: "Read the notice and choose the best answer.", questions: [
        lq("What time does the pool close on Sunday?", ["8 p.m.", "6 p.m.", "7 p.m."], 1, "Saturday and Sunday: 7 a.m. – 6 p.m."),
        lq("When is the pool closed for cleaning?", ["Every Monday", "The first Sunday of the month", "The first Monday of every month"], 2, "Closed on the first Monday of every month for cleaning."),
        lq("How much does a ticket cost for a 3-year-old child?", ["Nothing", "20,000 dong", "40,000 dong"], 0, "Children under 5: free."),
        lq("What must you do before you swim?", ["Buy a drink", "Take a shower", "Talk to reception"], 1, "You must take a shower before you swim."),
        lq("Who must swim with an adult?", ["Children under 5", "Children under 12", "Children under 10"], 2, "Children under 10 must swim with an adult."),
        lq("When are the swimming lessons?", ["Saturday at 9 a.m.", "Every day at 6 a.m.", "Sunday at 9 a.m."], 0, "Swimming lessons for children every Saturday at 9 a.m.")
      ] }
    ]
  },

  // ---------- A2 ----------
  {
    key: "extra:a2:reading-recipe", batch: "lessons", level: "A2", unit: A2, slug: "reading-a-simple-recipe", title: "Read: a simple recipe", skill: "READING", minutes: 13,
    blocks: [
      before("Recipes have two parts: a list of ingredients and the steps. The steps use imperatives (Cut…, Add…, Stir…) and sequence words. Read in order."),
      { kind: "text", heading: "Tomato and egg stir-fry (for 2 people)", body: "Ingredients\n• 3 eggs\n• 2 large tomatoes\n• 1 spring onion\n• 1 tablespoon of oil\n• a little salt, sugar and fish sauce\n\nMethod\n1. Cut the tomatoes into small pieces and chop the spring onion.\n2. Break the eggs into a bowl, add a little salt and beat them with a fork.\n3. Heat the oil in a pan. Cook the eggs for about one minute, then take them out of the pan.\n4. Put the tomatoes in the same pan. Cook them for three or four minutes until they are soft.\n5. Add a little sugar and fish sauce. Then put the eggs back in the pan and stir gently.\n6. Add the spring onion at the end and serve with hot rice.\n\nTip: If the tomatoes are not very sweet, add a bit more sugar." },
      { kind: "practice", instruction: "Read the recipe and choose the best answer.", questions: [
        lq("How many people is this recipe for?", ["One", "Two", "Four"], 1, "Tomato and egg stir-fry (for 2 people)."),
        lq("What do you do with the eggs first?", ["Cook them in the pan", "Add them to the tomatoes", "Beat them in a bowl with salt"], 2, "Break the eggs into a bowl, add a little salt and beat them."),
        lq("How long do you cook the tomatoes?", ["About one minute", "Three or four minutes", "Ten minutes"], 1, "Cook them for three or four minutes until they are soft."),
        lq("When do you put the eggs back in the pan?", ["After adding sugar and fish sauce", "Before cooking the tomatoes", "At the very beginning"], 0, "Add a little sugar and fish sauce. Then put the eggs back in the pan."),
        lq("When do you add the spring onion?", ["At the start", "With the eggs", "At the end"], 2, "Add the spring onion at the end."),
        lq("What should you do if the tomatoes are not sweet?", ["Add more sugar", "Cook them longer", "Add more fish sauce"], 0, "If the tomatoes are not very sweet, add a bit more sugar.")
      ] }
    ]
  },
  {
    key: "extra:a2:reading-invitation", batch: "lessons", level: "A2", unit: A2, slug: "reading-a-birthday-party-invitation", title: "Read: a birthday party invitation", skill: "READING", minutes: 12,
    blocks: [
      before("Invitations tell you what the event is, when and where it is, and what to do. Read the invitation and the reply, and find what is different in the reply."),
      { kind: "text", heading: "An invitation and a reply", body: "Hi everyone!\n\nI'm turning sixteen next week, and I'm having a party to celebrate! It's on Saturday the 14th, from 6 p.m. to 10 p.m., at my house, 25 Nguyen Hue Street. We'll have a barbecue in the garden, and my brother is going to play music.\n\nPlease don't bring presents — just bring yourself and something to drink if you can. The party theme is \"summer\", so wear something bright!\n\nPlease tell me by Wednesday if you can come, so I know how much food to buy.\n\nMinh Anh\n\n---\n\nHi Minh Anh,\n\nThanks for the invitation! I'd love to come, but I have a piano exam on Saturday afternoon, so I'll be a bit late — probably around 7:30. Is that OK? I'll bring some lemonade.\n\nSee you then,\nKim" },
      { kind: "practice", instruction: "Read the texts and choose the best answer.", questions: [
        lq("Why is Minh Anh having a party?", ["It's her birthday.", "She finished her exams.", "Her brother is leaving."], 0, "I'm turning sixteen next week."),
        lq("Where is the party?", ["At a restaurant", "At Minh Anh's house", "In a park"], 1, "At my house, 25 Nguyen Hue Street."),
        lq("What does Minh Anh ask guests NOT to bring?", ["Drinks", "Music", "Presents"], 2, "Please don't bring presents."),
        lq("Why should guests reply by Wednesday?", ["So she knows how much food to buy", "Because the party is on Wednesday", "So she can send a map"], 0, "So I know how much food to buy."),
        lq("Why will Kim be late?", ["She has to work.", "She has a piano exam.", "She lives far away."], 1, "I have a piano exam on Saturday afternoon."),
        lq("What will Kim bring?", ["A present", "Some food", "Lemonade"], 2, "I'll bring some lemonade.")
      ] }
    ]
  },
  {
    key: "extra:a2:reading-hotel-review", batch: "lessons", level: "A2", unit: A2, slug: "reading-a-hotel-review", title: "Read: a hotel review", skill: "READING", minutes: 13,
    blocks: [
      before("Online reviews mix good points and bad points. Look for words like but, however and although — they often show a change from positive to negative."),
      { kind: "text", heading: "Review: Sea Breeze Hotel, Nha Trang ★★★☆☆", body: "We stayed at the Sea Breeze Hotel for three nights in July. The location is excellent — the beach is only two minutes' walk away, and there are lots of restaurants nearby.\n\nOur room was clean and the bed was comfortable, but it was quite small, and the window looked at a wall, not the sea. If you want a sea view, pay a little more for a room on a higher floor.\n\nThe staff were very friendly and helpful. The receptionist booked a boat trip for us and it was the best day of our holiday. However, the breakfast was disappointing: the same food every day and not much fruit.\n\nThe Wi-Fi was fast in the lobby but slow in our room.\n\nOverall, it's a good hotel for the price, especially if you spend most of the day outside." },
      { kind: "practice", instruction: "Read the review and choose the best answer.", questions: [
        lq("How long did the writer stay?", ["Two nights", "Three nights", "One week"], 1, "We stayed… for three nights in July."),
        lq("What did the writer like most about the location?", ["It was near the beach and restaurants.", "It was very quiet.", "It was near the airport."], 0, "The beach is only two minutes' walk away, and there are lots of restaurants nearby."),
        lq("What was the problem with the room?", ["It was dirty.", "The bed was uncomfortable.", "It was small and had no sea view."], 2, "It was quite small, and the window looked at a wall, not the sea."),
        lq("What was the best day of the holiday?", ["The day on the beach", "The boat trip", "The day they arrived"], 1, "The receptionist booked a boat trip for us and it was the best day of our holiday."),
        lq("What did the writer think of the breakfast?", ["It was disappointing.", "It was excellent.", "It was expensive."], 0, "The breakfast was disappointing."),
        lq("Who does the writer think this hotel is good for?", ["People who want a sea view", "People who work in their room", "People who spend most of the day outside"], 2, "Especially if you spend most of the day outside.")
      ] }
    ]
  },
  {
    key: "extra:a2:reading-city-bikes", batch: "lessons", level: "A2", unit: A2, slug: "reading-how-to-use-the-city-bikes", title: "Read: how to use the city bikes", skill: "READING", minutes: 13,
    blocks: [
      before("Instructions explain how to do something step by step. Look for numbers, prices and conditions (if…). Then answer the questions."),
      { kind: "text", heading: "City Bike — quick guide", body: "City Bike has 80 stations around the city. You can rent a bike at one station and return it at any other station.\n\nHow to rent a bike\n1. Download the City Bike app and create an account.\n2. Add money to your account. The minimum is 50,000 dong.\n3. At a station, scan the QR code on the bike with your phone. The lock will open.\n4. When you finish, put the bike back into an empty space at any station and close the lock. Check that the light turns green.\n\nPrices\nThe first 30 minutes cost 5,000 dong. After that, each extra 30 minutes costs 5,000 dong. A day pass costs 50,000 dong.\n\nImportant\nIf you do not return the bike within 24 hours, you will pay a fine of 500,000 dong. Children under 14 cannot rent a bike. Helmets are not included, so please bring your own." },
      { kind: "practice", instruction: "Read the guide and choose the best answer.", questions: [
        lq("Where can you return a bike?", ["Only where you rented it", "At any City Bike station", "At the City Bike office"], 1, "You can rent a bike at one station and return it at any other station."),
        lq("What is the minimum amount you can add to your account?", ["5,000 dong", "500,000 dong", "50,000 dong"], 2, "The minimum is 50,000 dong."),
        lq("How do you open the lock?", ["Scan the QR code with your phone", "Use a key from the station", "Call the office"], 0, "Scan the QR code on the bike with your phone. The lock will open."),
        lq("How much does a one-hour ride cost?", ["5,000 dong", "10,000 dong", "50,000 dong"], 1, "The first 30 minutes cost 5,000 dong, and the next 30 minutes cost 5,000 dong more."),
        lq("What happens if you keep the bike for more than 24 hours?", ["You must buy the bike.", "Your account is closed.", "You pay a fine of 500,000 dong."], 2, "You will pay a fine of 500,000 dong."),
        lq("What should riders bring?", ["Their own helmet", "A printed ticket", "Cash"], 0, "Helmets are not included, so please bring your own.")
      ] }
    ]
  },

  // ---------- B1 ----------
  {
    key: "extra:b1:reading-language-apps", batch: "lessons", level: "B1", unit: B1, slug: "reading-can-apps-teach-you-a-language", title: "Read: can apps teach you a language?", skill: "READING", minutes: 16,
    blocks: [
      before("This article gives both sides of an argument. As you read, note which paragraph gives advantages, which gives limitations, and what the writer finally recommends."),
      { kind: "text", heading: "Can apps teach you a language?", body: "Millions of people now try to learn a language on their phones, often for just ten minutes a day. But can an app really make you fluent?\n\nThere are clear advantages. Apps are cheap or free, and you can use them anywhere — on the bus, in a queue or before bed. Many use games, points and reminders to keep learners coming back, which helps build a daily habit. For vocabulary and basic grammar, this regular practice can be very effective.\n\nHowever, most apps have limits. They are good at recognition — choosing the right word from a list — but they rarely ask you to produce long answers or hold a real conversation. Speaking to a screen is also very different from speaking to a person who interrupts, asks questions and talks quickly. As a result, some learners reach a point where they can read well but still feel nervous when they have to speak.\n\nSo what should learners do? Most teachers agree that apps work best as one part of a wider plan. Use them to build vocabulary every day, but also find chances to speak — with a teacher, a language partner or even by recording yourself. Reading and listening to real material, such as articles, podcasts or films, will fill the gaps that apps leave." },
      { kind: "practice", instruction: "Read the article and choose the best answer.", questions: [
        lq("According to the article, how do apps help learners build a habit?", ["By using games, points and reminders", "By giving certificates", "By connecting learners with teachers"], 0, "Many use games, points and reminders to keep learners coming back, which helps build a daily habit."),
        lq("What are apps especially good for, according to the writer?", ["Improving pronunciation", "Vocabulary and basic grammar", "Writing long essays"], 1, "For vocabulary and basic grammar, this regular practice can be very effective."),
        lq("What is the main limitation of most apps?", ["They are too expensive.", "They are hard to use on a phone.", "They rarely ask learners to produce long answers or converse."], 2, "They rarely ask you to produce long answers or hold a real conversation."),
        lq("Why can speaking to a real person feel harder?", ["People interrupt, ask questions and speak quickly.", "People use more difficult vocabulary than apps.", "People correct every mistake."], 0, "Speaking to a screen is very different from speaking to a person who interrupts, asks questions and talks quickly."),
        lq("What does the writer recommend?", ["Stop using apps completely", "Use apps as one part of a wider plan", "Only use apps for ten minutes a day"], 1, "Apps work best as one part of a wider plan."),
        lq("Which is suggested as a way to practise speaking?", ["Playing more games in the app", "Reading articles", "Recording yourself"], 2, "Find chances to speak — with a teacher, a language partner or even by recording yourself.")
      ] }
    ]
  },
  {
    key: "extra:b1:reading-banh-mi", batch: "lessons", level: "B1", unit: B1, slug: "reading-the-story-of-banh-mi", title: "Read: the story of banh mi", skill: "READING", minutes: 15,
    blocks: [
      before("This text explains how a famous sandwich developed over time. Follow the order of events and notice how the writer explains causes and changes."),
      { kind: "text", heading: "The story of banh mi", body: "Today banh mi is sold on street corners all over Vietnam and in cities around the world, but its story is fairly recent. The French brought wheat bread to Vietnam in the nineteenth century. At first, bread was expensive and was eaten mainly by French residents and wealthy families, often with butter or pâté.\n\nOver time, local bakers changed the recipe. The baguettes they made became lighter, with a thin, crispy crust and a soft inside, which suited the hot, humid climate. By the middle of the twentieth century, street sellers — especially in Saigon — had started filling the bread with local ingredients: grilled pork, pickled carrot and radish, fresh coriander, chilli and a little soy sauce.\n\nThis mix of French and Vietnamese flavours is what makes banh mi special. It is also practical: it is cheap, quick to prepare and easy to eat on the go, which explains why it became a favourite breakfast for workers and students.\n\nIn recent decades, Vietnamese communities abroad have made banh mi known internationally, and the word itself now appears in some English dictionaries. Yet many people still say that the best banh mi is the one you buy from a small stall near your home." },
      { kind: "practice", instruction: "Read the text and choose the best answer.", questions: [
        lq("Who first brought wheat bread to Vietnam?", ["Chinese traders", "The French", "Street sellers in Saigon"], 1, "The French brought wheat bread to Vietnam in the nineteenth century."),
        lq("Who ate bread at first?", ["Mainly French residents and wealthy families", "Mainly students", "Mainly farmers"], 0, "Bread was expensive and was eaten mainly by French residents and wealthy families."),
        lq("Why did local bakers make the bread lighter?", ["To use less wheat", "To sell it abroad", "It suited the hot, humid climate"], 2, "It became lighter… which suited the hot, humid climate."),
        lq("Which of these is NOT mentioned as a typical filling?", ["Pickled carrot", "Cheese", "Fresh coriander"], 1, "The fillings listed are pork, pickled carrot and radish, coriander, chilli and soy sauce — not cheese."),
        lq("According to the writer, why did banh mi become a popular breakfast?", ["It is cheap, quick and easy to eat on the go.", "It was served in schools.", "It is healthier than rice."], 0, "It is cheap, quick to prepare and easy to eat on the go."),
        lq("How did banh mi become known internationally?", ["Through French restaurants", "Through TV cooking shows", "Through Vietnamese communities abroad"], 2, "Vietnamese communities abroad have made banh mi known internationally.")
      ] }
    ]
  },

  // ---------- B2 ----------
  {
    key: "extra:b2:reading-rooftop-farms", batch: "lessons", level: "B2", unit: B2, slug: "reading-farms-on-city-rooftops", title: "Read: farms on city rooftops", skill: "READING", minutes: 17,
    blocks: [
      before("This feature article describes a trend and weighs its benefits against its limits. Pay attention to how the writer qualifies claims — words like partly, rarely and on its own."),
      { kind: "text", heading: "Farms on city rooftops", body: "Look up in some of the world's busiest cities and you may notice something unexpected: vegetables. On flat roofs that once held nothing but water tanks and air-conditioning units, residents and small companies are growing lettuce, herbs, tomatoes and even fruit trees.\n\nSupporters point to several benefits. Food grown on a roof travels a few metres rather than hundreds of kilometres, so it reaches the table fresher. Plants also absorb heat, which can make the floors below noticeably cooler in summer and reduce the need for air conditioning. For many participants, however, the main attraction is social: shared rooftop gardens give neighbours who rarely spoke a reason to meet, and children learn where food actually comes from.\n\nThe limits are just as real. Soil and water are heavy, so not every building can safely support a garden without costly structural work. Rooftops are often windy and exposed to strong sun, which restricts what can be grown. And even the most productive urban farms supply only a small share of a city's food; on its own, rooftop farming will not feed millions.\n\nPerhaps that is the wrong way to judge it. Advocates argue that rooftop farms are less about replacing traditional agriculture than about reconnecting city dwellers with the food they eat — and making dense, hot cities slightly greener in the process." },
      { kind: "practice", instruction: "Read the article and choose the best answer.", questions: [
        lq("What were many flat roofs used for before?", ["Water tanks and air-conditioning units", "Car parks", "Restaurants"], 0, "Flat roofs that once held nothing but water tanks and air-conditioning units."),
        lq("Why does rooftop food reach the table fresher?", ["It is picked earlier.", "It travels only a short distance.", "It is grown without soil."], 1, "Food grown on a roof travels a few metres rather than hundreds of kilometres."),
        lq("How can rooftop plants affect the building?", ["They can damage the roof.", "They make the building noisier.", "They can make the floors below cooler."], 2, "Plants also absorb heat, which can make the floors below noticeably cooler."),
        lq("For many participants, what is the main attraction?", ["Making money", "The social benefits", "Saving on electricity"], 1, "For many participants, however, the main attraction is social."),
        lq("Why can't every building have a rooftop garden?", ["Soil and water are heavy, and structural work may be needed.", "Most cities have banned them.", "Plants cannot survive in cities."], 0, "Soil and water are heavy, so not every building can safely support a garden without costly structural work."),
        lq("What is the writer's overall conclusion?", ["Rooftop farms will soon feed whole cities.", "Rooftop farms are too expensive to be worthwhile.", "Rooftop farms matter more for reconnecting people with food than for replacing agriculture."], 2, "Rooftop farms are less about replacing traditional agriculture than about reconnecting city dwellers with the food they eat.")
      ] }
    ]
  },
  {
    key: "extra:b2:reading-digital-detox", batch: "lessons", level: "B2", unit: B2, slug: "reading-does-a-digital-detox-work", title: "Read: does a digital detox work?", skill: "READING", minutes: 17,
    blocks: [
      before("This opinion piece questions a popular idea. Identify the writer's position, the evidence used, and the alternative the writer proposes."),
      { kind: "text", heading: "Does a digital detox work?", body: "Every few months, someone I know announces a \"digital detox\": a week, or even a month, without social media. They delete the apps, post a farewell message and disappear. A few weeks later, most of them are back, often scrolling more than before.\n\nThe idea behind a detox is appealing. If our phones distract us, why not simply remove them for a while and reset? The trouble is that a detox treats the phone as the problem, when the real issue is usually the habits we have built around it. We reach for our phones when we are bored, anxious or avoiding a difficult task. Removing the phone for a week does nothing to change those triggers, so when the detox ends, the old routine returns almost immediately.\n\nThere is some evidence that short breaks can improve mood and sleep, which is not nothing. But the benefits tend to fade once people go back to their normal lives. A more lasting approach may be less dramatic: turning off non-essential notifications, keeping the phone out of the bedroom, or setting specific times to check messages.\n\nThese changes are less exciting to announce than a month offline. Yet they are easier to maintain, and they target the behaviour rather than the device. In the end, the goal should not be to escape technology for a few weeks, but to use it on our own terms every day." },
      { kind: "practice", instruction: "Read the article and choose the best answer.", questions: [
        lq("What usually happens to the writer's friends after a detox?", ["They give up social media for good.", "They return, often using it even more.", "They start working in technology."], 1, "Most of them are back, often scrolling more than before."),
        lq("According to the writer, what is the real problem?", ["The habits we build around our phones", "The price of smartphones", "Poor internet connections"], 0, "The real issue is usually the habits we have built around it."),
        lq("Why does the old routine return after a detox?", ["Friends pressure people to come back.", "Phones become cheaper.", "The triggers behind the habit have not changed."], 2, "Removing the phone for a week does nothing to change those triggers."),
        lq("What does the writer say about the evidence for short breaks?", ["They may help mood and sleep, but the effect tends to fade.", "They have no effect at all.", "They permanently improve concentration."], 0, "Short breaks can improve mood and sleep… But the benefits tend to fade."),
        lq("Which of these is suggested as a more lasting approach?", ["Buying a simpler phone", "Deleting every app", "Keeping the phone out of the bedroom"], 2, "Keeping the phone out of the bedroom."),
        lq("What is the writer's main message?", ["Everyone should try a month offline.", "We should use technology on our own terms every day.", "Social media should be banned for young people."], 1, "The goal should not be to escape technology for a few weeks, but to use it on our own terms every day.")
      ] }
    ]
  },

  // ---------- C1 ----------
  {
    key: "extra:c1:reading-habits", batch: "lessons", level: "C1", unit: C1, slug: "reading-why-habits-are-hard-to-break", title: "Read: why habits are hard to break", skill: "READING", minutes: 19,
    blocks: [
      before("This essay draws on a widely used model of habit formation. Track the argument carefully: the writer describes the mechanism, then challenges a common misconception, and finally draws a practical implication."),
      { kind: "text", heading: "Why habits are hard to break", body: "Anyone who has resolved to stop checking their phone first thing in the morning, only to find it in their hand before they are fully awake, will recognise how little habits seem to care about our intentions. That is precisely the point: a habit, by definition, is behaviour that no longer depends on a conscious decision.\n\nA model that has become popular in recent years describes habits as a loop with three parts. A cue — a time, a place, a feeling — triggers a routine, which is followed by some kind of reward. Repeated often enough, the sequence becomes so automatic that the cue alone is sufficient to set the routine in motion. The reward need not be large; the mild relief of seeing a new message may be enough to reinforce the pattern.\n\nIt follows that willpower, the tool we instinctively reach for, is poorly suited to the task. Willpower operates at the level of deliberate choice, whereas an established habit bypasses that level altogether. Relying on resolve alone is rather like trying to steer a car by shouting at it: the effort is real, but it is applied in the wrong place.\n\nThis is also why simply stopping a habit so often fails. The cue remains, and so does the craving for the reward; remove the routine and a vacuum is left that the old behaviour readily fills. A more promising strategy is substitution: keep the cue and, where possible, the reward, but attach them to a different routine. Someone who snacks out of boredom in the afternoon, for instance, might take a short walk at the same time instead. Changing the environment so that the cue appears less often — leaving the phone charging in another room overnight — can be more effective still.\n\nNone of this makes change effortless. But it does suggest that the most successful attempts are designed rather than merely willed." },
      { kind: "practice", instruction: "Read the essay and choose the best answer.", questions: [
        lq("How does the writer define a habit?", ["Behaviour that no longer depends on a conscious decision", "Behaviour we are ashamed of", "Any action repeated more than once a day"], 0, "A habit, by definition, is behaviour that no longer depends on a conscious decision."),
        lq("According to the model, what sets a routine in motion once a habit is established?", ["A large reward", "The cue alone", "A conscious decision"], 1, "The cue alone is sufficient to set the routine in motion."),
        lq("Why does the writer compare relying on willpower to shouting at a car?", ["To show that willpower is always useless", "To suggest habits are dangerous", "To show the effort is applied in the wrong place"], 2, "The effort is real, but it is applied in the wrong place."),
        lq("Why does simply stopping a habit often fail, according to the writer?", ["The cue and the craving remain, leaving a gap the old behaviour fills.", "People forget their resolution.", "Rewards become larger over time."], 0, "The cue remains, and so does the craving… a vacuum is left that the old behaviour readily fills."),
        lq("What does the strategy of substitution involve?", ["Removing the cue completely", "Keeping the cue and reward but changing the routine", "Increasing willpower through practice"], 1, "Keep the cue and, where possible, the reward, but attach them to a different routine."),
        lq("Which statement best reflects the writer's conclusion?", ["Habits cannot really be changed.", "Change requires no effort once you understand habits.", "Successful change is designed rather than merely willed."], 2, "The most successful attempts are designed rather than merely willed.")
      ] }
    ]
  },

  // ---------- C2 ----------
  {
    key: "extra:c2:reading-tourism-paradox", batch: "lessons", level: "C2", unit: C2, slug: "reading-the-paradox-of-tourism", title: "Read: the paradox of tourism", skill: "READING", minutes: 20,
    blocks: [
      before("This essay develops a nuanced argument about tourism. Expect irony, concession and implied meaning. Focus on what the writer implies as well as what is stated, and on how each paragraph shifts the argument."),
      { kind: "text", heading: "The paradox of tourism", body: "There is a particular melancholy in arriving at a place celebrated for its tranquillity and finding it thronged with others who have come in search of the same thing. Tourism, in this sense, contains the seeds of its own undoing: the qualities that draw visitors — quiet streets, unhurried rhythms, a sense of the untouched — are precisely those that mass visitation erodes.\n\nIt would be easy, and somewhat self-flattering, to cast the problem as one of other people: the coach parties, the selfie sticks, the travellers who, unlike ourselves, fail to appreciate what they see. Yet every visitor, however discerning, adds to the crowd. The distinction between the tourist and the traveller, so often invoked, tends to dissolve under scrutiny; it is less a difference of kind than a way of excusing our own presence.\n\nNor is the answer simply to stay at home. For many communities, tourism is not an intrusion to be tolerated but a livelihood, and a sudden collapse in visitors, as several destinations discovered during recent periods of closed borders, can be as devastating as an excess of them. The question, then, is not whether people should travel but how the benefits and burdens are distributed — who profits from the hotel built on the waterfront, and who bears the cost when rents rise and residents are gradually priced out of their own neighbourhoods.\n\nSome cities have begun to experiment with limits: capping the number of daily visitors, levying charges on day-trippers, or restricting short-term rentals. Such measures are inevitably imperfect and frequently resented. But they reflect a growing recognition that a place is not merely a backdrop for visitors' experiences; it is, first and foremost, somewhere people live. Travel that forgets this is, in the end, a kind of consumption that leaves the consumed diminished." },
      { kind: "practice", instruction: "Read the essay and choose the best answer.", questions: [
        lq("What is the 'paradox' referred to in the title?", ["Tourism damages the very qualities that attract tourists.", "Tourists rarely enjoy their holidays.", "Quiet places are harder to reach."], 0, "The qualities that draw visitors… are precisely those that mass visitation erodes."),
        lq("What is the writer's view of the distinction between 'tourists' and 'travellers'?", ["It is a clear and useful distinction.", "It is largely a way of excusing one's own presence.", "Only travellers damage destinations."], 1, "It is less a difference of kind than a way of excusing our own presence."),
        lq("Why does the writer reject the idea of simply staying at home?", ["Travel broadens the mind.", "Staying at home is too expensive.", "Many communities depend on tourism for their livelihood."], 2, "For many communities, tourism is not an intrusion… but a livelihood."),
        lq("According to the writer, what is the real question?", ["How the benefits and burdens of tourism are distributed", "Whether people should travel at all", "Which destinations are most beautiful"], 0, "The question… is not whether people should travel but how the benefits and burdens are distributed."),
        lq("How does the writer evaluate measures such as visitor caps?", ["As a complete solution", "As imperfect but reflecting an important recognition", "As unnecessary and harmful"], 1, "Such measures are inevitably imperfect… But they reflect a growing recognition."),
        lq("What does the final sentence imply?", ["Travel is always harmful.", "Tourists should spend more money.", "Travel that ignores residents' lives diminishes the places visited."], 2, "Travel that forgets this is… a kind of consumption that leaves the consumed diminished.")
      ] }
    ]
  }
];
