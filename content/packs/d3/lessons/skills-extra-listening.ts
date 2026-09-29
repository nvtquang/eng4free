import { lq, type LessonDef } from "../types";

const A1 = "Everyday skills";
const A2 = "Skills for daily life";
const B1 = "Skills for independent users";
const B2 = "Skills for confident users";

const tip = (body: string) => ({ kind: "text" as const, heading: "Listening tip", body });

/** Extra Listening lessons: more at the lower levels, fewer as the level rises. */
export const extraListening: LessonDef[] = [
  // ---------- A1 ----------
  {
    key: "extra:a1:listening-new-classmate", batch: "skills-extra", level: "A1", unit: A1, slug: "listening-meeting-a-new-classmate", title: "Listen: meeting a new classmate", skill: "LISTENING", minutes: 10,
    blocks: [
      tip("Listen for names, countries and ages. When people introduce themselves they often say: My name is…, I'm from…, I'm … years old."),
      { kind: "listening", heading: "The first day of class", voices: { Nam: "male", Emma: "female" }, script: "Nam: Hi! Are you new here?\nEmma: Yes, I am. It's my first day. My name's Emma.\nNam: Nice to meet you, Emma. I'm Nam. Where are you from?\nEmma: I'm from Australia, from Sydney.\nNam: Wow. How old are you?\nEmma: I'm fifteen. And you?\nNam: I'm sixteen. Do you like English?\nEmma: Yes, I love it! And I like music. I play the guitar.\nNam: Cool! I play the piano. Let's sit together." },
      { kind: "practice", instruction: "Listen and choose the best answer.", questions: [
        lq("What is the girl's name?", ["Anna", "Emma", "Emily"], 1, "She says: My name's Emma."),
        lq("Where is Emma from?", ["Sydney, Australia", "London, England", "Hanoi, Vietnam"], 0, "I'm from Australia, from Sydney."),
        lq("How old is Nam?", ["Fifteen", "Fourteen", "Sixteen"], 2, "Emma is fifteen; Nam says: I'm sixteen."),
        lq("What instrument does Emma play?", ["The guitar", "The piano", "The violin"], 0, "She says: I play the guitar."),
        lq("What does Nam suggest at the end?", ["Going home", "Sitting together", "Playing football"], 1, "Let's sit together.")
      ] }
    ]
  },
  {
    key: "extra:a1:listening-fruit-market", batch: "skills-extra", level: "A1", unit: A1, slug: "listening-buying-fruit-at-the-market", title: "Listen: buying fruit at the market", skill: "LISTENING", minutes: 10,
    blocks: [
      tip("Prices and numbers are important in shopping. Listen carefully for how many and how much. Write the numbers down while you listen."),
      { kind: "listening", heading: "At the fruit stall", voices: { Seller: "female", Tom: "male" }, script: "Seller: Hello! Fresh fruit here. What would you like?\nTom: Hello. How much are the mangoes?\nSeller: They're thirty thousand dong a kilo.\nTom: OK. Can I have two kilos, please?\nSeller: Sure. Anything else?\nTom: Yes. Do you have bananas?\nSeller: Yes, twenty thousand for a bunch.\nTom: One bunch, please. How much is that?\nSeller: Two kilos of mangoes and one bunch of bananas. That's eighty thousand dong.\nTom: Here you are. Thank you!" },
      { kind: "practice", instruction: "Listen and choose the best answer.", questions: [
        lq("How much is one kilo of mangoes?", ["Thirteen thousand dong", "Thirty thousand dong", "Twenty thousand dong"], 1, "They're thirty thousand dong a kilo."),
        lq("How many kilos of mangoes does Tom buy?", ["Two", "One", "Three"], 0, "Can I have two kilos, please?"),
        lq("What else does Tom buy?", ["Oranges", "Apples", "Bananas"], 2, "He asks for bananas and buys one bunch."),
        lq("How much does Tom pay in total?", ["Fifty thousand dong", "Sixty thousand dong", "Eighty thousand dong"], 2, "Two kilos of mangoes (60,000) and bananas (20,000) = 80,000 dong."),
        lq("Where does the conversation happen?", ["At a fruit stall", "In a restaurant", "At a bus stop"], 0, "The seller says: Fresh fruit here.")
      ] }
    ]
  },
  {
    key: "extra:a1:listening-bus-times", batch: "skills-extra", level: "A1", unit: A1, slug: "listening-what-time-is-the-bus", title: "Listen: what time is the bus?", skill: "LISTENING", minutes: 11,
    blocks: [
      tip("Times can be said in different ways: half past seven = 7:30, quarter to nine = 8:45. Listen for the time and the place together."),
      { kind: "listening", heading: "At the bus station", voices: { Lan: "female", Clerk: "male" }, script: "Lan: Excuse me. What time is the next bus to Hue?\nClerk: The next bus is at half past ten.\nLan: Half past ten? That's late. Is there a bus at nine?\nClerk: Sorry, the nine o'clock bus is full.\nLan: Oh no. How long is the journey?\nClerk: About three hours. You arrive at half past one.\nLan: OK. One ticket for half past ten, please.\nClerk: That's one hundred and twenty thousand dong. The bus leaves from gate four.\nLan: Gate four. Thank you." },
      { kind: "practice", instruction: "Listen and choose the best answer.", questions: [
        lq("Where does Lan want to go?", ["Hue", "Hoi An", "Hanoi"], 0, "What time is the next bus to Hue?"),
        lq("What time is the next bus?", ["9:00", "10:30", "1:30"], 1, "The next bus is at half past ten."),
        lq("Why can't Lan take the nine o'clock bus?", ["It is cancelled.", "It is late.", "It is full."], 2, "The nine o'clock bus is full."),
        lq("How long is the journey?", ["About two hours", "About three hours", "About four hours"], 1, "About three hours."),
        lq("Where does the bus leave from?", ["Gate four", "Gate two", "Gate one"], 0, "The bus leaves from gate four.")
      ] }
    ]
  },
  {
    key: "extra:a1:listening-weather", batch: "skills-extra", level: "A1", unit: A1, slug: "listening-a-short-weather-report", title: "Listen: a short weather report", skill: "LISTENING", minutes: 10,
    blocks: [
      tip("Weather reports use words like sunny, cloudy, rainy, windy, hot and cold. Listen for the place and the weather word that goes with it."),
      { kind: "listening", heading: "Tomorrow's weather", voices: { Presenter: "female" }, script: "Presenter: Good evening. Here is the weather for tomorrow. In Hanoi, it will be cloudy and cool in the morning, about twenty degrees. In the afternoon, it will rain, so take an umbrella. In Da Nang, it will be sunny and hot all day, with a top temperature of thirty-two degrees. It's a good day for the beach. In Ho Chi Minh City, it will be hot in the morning, and there will be a storm in the evening. That's all for tonight. Have a good evening!" },
      { kind: "practice", instruction: "Listen and choose the best answer.", questions: [
        lq("What will the weather be like in Hanoi in the morning?", ["Sunny and hot", "Cloudy and cool", "Windy and cold"], 1, "In Hanoi, it will be cloudy and cool in the morning."),
        lq("What should people in Hanoi take in the afternoon?", ["An umbrella", "Sunglasses", "A coat"], 0, "In the afternoon, it will rain, so take an umbrella."),
        lq("What is the top temperature in Da Nang?", ["Twenty degrees", "Twenty-three degrees", "Thirty-two degrees"], 2, "With a top temperature of thirty-two degrees."),
        lq("Which city is good for the beach tomorrow?", ["Da Nang", "Hanoi", "Ho Chi Minh City"], 0, "In Da Nang… It's a good day for the beach."),
        lq("When will there be a storm in Ho Chi Minh City?", ["In the morning", "In the evening", "At lunchtime"], 1, "There will be a storm in the evening.")
      ] }
    ]
  },
  {
    key: "extra:a1:listening-bedroom", batch: "skills-extra", level: "A1", unit: A1, slug: "listening-describing-a-bedroom", title: "Listen: describing a bedroom", skill: "LISTENING", minutes: 11,
    blocks: [
      tip("Prepositions tell you where things are: on, under, next to, between, in front of. Picture the room in your head while you listen."),
      { kind: "listening", heading: "My bedroom", voices: { Mai: "female" }, script: "Mai: This is my bedroom. It's small, but I love it. My bed is next to the window, so I can see the garden in the morning. There is a desk in front of the bed. On the desk, there is a lamp and my computer. My books are on a shelf above the desk. I have a lot of books — about fifty! My clothes are in a big white wardrobe. The wardrobe is between the door and the desk. Under my bed, there is a box with old photos. My favourite thing is a picture of the sea on the wall." },
      { kind: "practice", instruction: "Listen and choose the best answer.", questions: [
        lq("Where is Mai's bed?", ["Next to the door", "Next to the window", "Under the shelf"], 1, "My bed is next to the window."),
        lq("What is on the desk?", ["A lamp and a computer", "Books and photos", "A picture of the sea"], 0, "On the desk, there is a lamp and my computer."),
        lq("How many books does Mai have?", ["About fifteen", "About five", "About fifty"], 2, "I have a lot of books — about fifty!"),
        lq("What is under the bed?", ["Her clothes", "A box of old photos", "Her computer"], 1, "Under my bed, there is a box with old photos."),
        lq("What is Mai's favourite thing?", ["A picture of the sea", "Her wardrobe", "Her lamp"], 0, "My favourite thing is a picture of the sea on the wall.")
      ] }
    ]
  },

  // ---------- A2 ----------
  {
    key: "extra:a2:listening-station", batch: "skills-extra", level: "A2", unit: A2, slug: "listening-train-station-announcements", title: "Listen: announcements at a train station", skill: "LISTENING", minutes: 13,
    blocks: [
      tip("Announcements repeat key information: the train, the platform, the time and any delay. Listen for changes — words like delayed, cancelled and instead."),
      { kind: "listening", heading: "Station announcements", voices: { Announcer: "female" }, script: "Announcer: Good morning, passengers. The eight fifteen train to Hai Phong is now at platform three. Please stand behind the yellow line. The eight forty train to Lao Cai is delayed by twenty minutes because of bad weather. It will now leave at nine o'clock from platform five. We are sorry for the delay. Passengers for Vinh, please note: the nine thirty service is cancelled today. Please take the ten o'clock train instead. Your tickets are still valid. The café on platform one is now open. Thank you for travelling with us." },
      { kind: "practice", instruction: "Listen and choose the best answer.", questions: [
        lq("Which platform is the train to Hai Phong at?", ["Platform three", "Platform five", "Platform one"], 0, "The eight fifteen train to Hai Phong is now at platform three."),
        lq("Why is the train to Lao Cai late?", ["There is a problem with the engine.", "The weather is bad.", "The driver is ill."], 1, "It is delayed because of bad weather."),
        lq("What time will the train to Lao Cai leave?", ["8:40", "9:30", "9:00"], 2, "It will now leave at nine o'clock."),
        lq("What should passengers for Vinh do?", ["Take the ten o'clock train", "Buy a new ticket", "Wait at platform one"], 0, "Please take the ten o'clock train instead. Your tickets are still valid."),
        lq("What is on platform one?", ["A ticket office", "A waiting room", "A café"], 2, "The café on platform one is now open."),
        lq("How long is the delay to the Lao Cai train?", ["Ten minutes", "Twenty minutes", "Forty minutes"], 1, "It is delayed by twenty minutes.")
      ] }
    ]
  },
  {
    key: "extra:a2:listening-doctor", batch: "skills-extra", level: "A2", unit: A2, slug: "listening-making-a-doctors-appointment", title: "Listen: making a doctor's appointment", skill: "LISTENING", minutes: 13,
    blocks: [
      tip("When people make appointments, they discuss days, times and reasons. If the first time is not possible, listen for the new time they agree on."),
      { kind: "listening", heading: "A phone call to the clinic", voices: { Receptionist: "female", David: "male" }, script: "Receptionist: Good morning, Sunrise Clinic. How can I help?\nDavid: Hello. I'd like to make an appointment with a doctor, please.\nReceptionist: Of course. What's the problem?\nDavid: I've had a bad cough for a week, and I have a sore throat.\nReceptionist: I see. Can you come this afternoon at three?\nDavid: Sorry, I work until five. Is there anything later?\nReceptionist: Dr Hanh has a free appointment at half past five.\nDavid: That's perfect.\nReceptionist: Can I have your name and date of birth?\nDavid: David Tran, the twelfth of May, nineteen ninety-five.\nReceptionist: Thank you. Please come ten minutes early and bring your insurance card." },
      { kind: "practice", instruction: "Listen and choose the best answer.", questions: [
        lq("What is David's problem?", ["A headache and a fever", "A cough and a sore throat", "A stomach ache"], 1, "I've had a bad cough for a week, and I have a sore throat."),
        lq("Why can't David come at three?", ["He is working.", "He is at school.", "He has another appointment."], 0, "I work until five."),
        lq("What time is his appointment?", ["3:00", "5:00", "5:30"], 2, "Dr Hanh has a free appointment at half past five."),
        lq("Which doctor will David see?", ["Dr Hanh", "Dr Tran", "Dr Sunrise"], 0, "Dr Hanh has a free appointment."),
        lq("When was David born?", ["12 March 1995", "12 May 1995", "20 May 1995"], 1, "The twelfth of May, nineteen ninety-five."),
        lq("What should David bring?", ["His passport", "His medicine", "His insurance card"], 2, "Please… bring your insurance card.")
      ] }
    ]
  },
  {
    key: "extra:a2:listening-weekend-plans", batch: "skills-extra", level: "A2", unit: A2, slug: "listening-making-plans-for-the-weekend", title: "Listen: making plans for the weekend", skill: "LISTENING", minutes: 13,
    blocks: [
      tip("Friends often suggest several ideas before they decide. Listen for why each idea is rejected and what they finally agree to do."),
      { kind: "listening", heading: "Plans for Saturday", voices: { Huy: "male", Ngoc: "female" }, script: "Huy: Are you free on Saturday?\nNgoc: Yes, I am. What do you want to do?\nHuy: How about going to the cinema? There's a new action film.\nNgoc: Hmm, I don't really like action films. What about going to the zoo?\nHuy: The zoo is nice, but it's going to be very hot on Saturday.\nNgoc: True. Why don't we go bowling? It's inside, and it's not expensive.\nHuy: Great idea! Let's go in the afternoon.\nNgoc: OK. Shall we meet at the bowling centre at two?\nHuy: Two is a bit early for me. Can we meet at three?\nNgoc: Sure. And let's have dinner after that.\nHuy: Perfect. See you on Saturday!" },
      { kind: "practice", instruction: "Listen and choose the best answer.", questions: [
        lq("Why doesn't Ngoc want to go to the cinema?", ["The tickets are expensive.", "She doesn't like action films.", "She saw the film last week."], 1, "I don't really like action films."),
        lq("Why don't they go to the zoo?", ["It will be very hot.", "It is closed on Saturday.", "It is too far away."], 0, "It's going to be very hot on Saturday."),
        lq("What do they decide to do?", ["Go shopping", "Go swimming", "Go bowling"], 2, "Why don't we go bowling? — Great idea!"),
        lq("What time will they meet?", ["At two o'clock", "At three o'clock", "At four o'clock"], 1, "Two is a bit early for me. Can we meet at three? — Sure."),
        lq("What will they do after bowling?", ["Have dinner", "Watch a film", "Go home"], 0, "And let's have dinner after that.")
      ] }
    ]
  },
  {
    key: "extra:a2:listening-lost-bag", batch: "skills-extra", level: "A2", unit: A2, slug: "listening-reporting-a-lost-bag", title: "Listen: reporting a lost bag", skill: "LISTENING", minutes: 14,
    blocks: [
      tip("When you describe something you have lost, you talk about its colour, size, material and what is inside. Listen for those details."),
      { kind: "listening", heading: "At the lost property office", voices: { Officer: "male", Sara: "female" }, script: "Officer: Good afternoon. Can I help you?\nSara: Yes, I think I left my bag on the number twelve bus this morning.\nOfficer: I'm sorry to hear that. What does it look like?\nSara: It's a small black backpack. It's made of leather.\nOfficer: And what's inside it?\nSara: My wallet, my glasses and a blue notebook. There's also a key with a red key ring.\nOfficer: What time were you on the bus?\nSara: At about half past eight. I got off at the university.\nOfficer: Let me check. We have two black backpacks today. Is this one yours?\nSara: No, that one's too big. Mine has a small pocket on the front.\nOfficer: Then it isn't here yet. Please leave your phone number, and we'll call you if we find it." },
      { kind: "practice", instruction: "Listen and choose the best answer.", questions: [
        lq("Where did Sara lose her bag?", ["On a bus", "At the university", "In a taxi"], 0, "I think I left my bag on the number twelve bus."),
        lq("What is her bag made of?", ["Plastic", "Leather", "Cotton"], 1, "It's made of leather."),
        lq("Which of these is NOT in the bag?", ["Her wallet", "Her glasses", "Her phone"], 2, "She lists her wallet, glasses, a notebook and a key — not her phone."),
        lq("What time was she on the bus?", ["About 8:30", "About 8:00", "About 9:30"], 0, "At about half past eight."),
        lq("Why is the backpack the officer shows her not hers?", ["It is the wrong colour.", "It is too big.", "It has no pocket."], 1, "No, that one's too big."),
        lq("What will the officer do?", ["Give her a new bag", "Call the bus driver now", "Call her if they find it"], 2, "We'll call you if we find it.")
      ] }
    ]
  },

  // ---------- B1 ----------
  {
    key: "extra:b1:listening-job-interview", batch: "skills-extra", level: "B1", unit: B1, slug: "listening-a-part-time-job-interview", title: "Listen: a part-time job interview", skill: "LISTENING", minutes: 15,
    blocks: [
      tip("In interviews, speakers give reasons and examples. Listen not just for facts but for why the candidate thinks they are suitable, and what the job involves."),
      { kind: "listening", heading: "Interview at a bookshop", voices: { Manager: "female", Khanh: "male" }, script: "Manager: Thanks for coming in, Khanh. So, why are you interested in working at our bookshop?\nKhanh: Well, I've always loved reading, and I'd like some work experience while I'm at university. I'm studying marketing, so I'm also interested in how you promote new books.\nManager: Have you worked in a shop before?\nKhanh: Not in a bookshop, but last summer I worked at a phone accessories shop for three months. I dealt with customers every day and used the till.\nManager: That's useful. The job is mainly weekends — Saturday and Sunday, nine to four. Would that suit you?\nKhanh: Saturdays are fine, but I have a class on Sunday mornings until eleven.\nManager: I see. Could you start at twelve on Sundays instead?\nKhanh: Yes, that would work.\nManager: Great. Part of the job is also running our book club for children once a month. How do you feel about that?\nKhanh: I'd enjoy it, actually. I often help my younger cousins with their reading.\nManager: Excellent. We'll let you know by Friday." },
      { kind: "practice", instruction: "Listen and choose the best answer.", questions: [
        lq("What does Khanh study at university?", ["Literature", "Marketing", "Business law"], 1, "I'm studying marketing."),
        lq("What experience does Khanh have?", ["He worked in a phone accessories shop.", "He worked in another bookshop.", "He has no work experience."], 0, "Last summer I worked at a phone accessories shop for three months."),
        lq("What is the problem with the working hours?", ["He can't work on Saturdays.", "He wants to work fewer hours.", "He has a class on Sunday mornings."], 2, "I have a class on Sunday mornings until eleven."),
        lq("What do they agree about Sundays?", ["He will start at twelve.", "He will not work on Sundays.", "He will finish at eleven."], 0, "Could you start at twelve on Sundays instead? — Yes, that would work."),
        lq("What extra task does the job include?", ["Designing the shop window", "Running a children's book club", "Ordering new books"], 1, "Part of the job is also running our book club for children once a month."),
        lq("Why does Khanh think he would enjoy the extra task?", ["He used to be a teacher.", "He wants to write children's books.", "He often helps his younger cousins read."], 2, "I often help my younger cousins with their reading.")
      ] }
    ]
  },
  {
    key: "extra:b1:listening-museum-tour", batch: "skills-extra", level: "B1", unit: B1, slug: "listening-a-guided-museum-tour", title: "Listen: a guided museum tour", skill: "LISTENING", minutes: 15,
    blocks: [
      tip("A guide gives practical information (times, rules, places) as well as facts. Signposting words like first, next, finally and please note help you follow."),
      { kind: "listening", heading: "Welcome to the city museum", voices: { Guide: "male" }, script: "Guide: Good morning, everyone, and welcome to the city museum. Our tour will take about an hour. First, we'll visit the ground floor, where you can see objects that show how people lived here two hundred years ago — tools, cooking pots and traditional clothes. Next, we'll go up to the first floor for the photography exhibition, which shows how the city has changed since the nineteen fifties. Please note that you can take photos everywhere except in the photography room, because the prints are very old and light can damage them. Finally, we'll finish in the garden, where there's a small café. Before we start, please leave large bags in the lockers next to the entrance. They're free, but you'll need a coin to use them. If you get lost, the meeting point is the information desk. Right, follow me, please." },
      { kind: "practice", instruction: "Listen and choose the best answer.", questions: [
        lq("How long will the tour take?", ["About thirty minutes", "About an hour", "About two hours"], 1, "Our tour will take about an hour."),
        lq("What can visitors see on the ground floor?", ["Objects from daily life two hundred years ago", "Modern art", "Photographs of the city"], 0, "Objects that show how people lived here two hundred years ago."),
        lq("Why can't visitors take photos in the photography room?", ["It is too dark.", "The photographer does not allow it.", "Light can damage the old prints."], 2, "The prints are very old and light can damage them."),
        lq("Where does the tour end?", ["At the information desk", "In the garden", "At the entrance"], 1, "Finally, we'll finish in the garden."),
        lq("What do visitors need to use the lockers?", ["A ticket", "A coin", "A key from the desk"], 1, "They're free, but you'll need a coin to use them."),
        lq("Where should people go if they get lost?", ["The information desk", "The café", "The lockers"], 0, "If you get lost, the meeting point is the information desk.")
      ] }
    ]
  },
  {
    key: "extra:b1:listening-landlord", batch: "skills-extra", level: "B1", unit: B1, slug: "listening-calling-the-landlord", title: "Listen: calling the landlord about a problem", skill: "LISTENING", minutes: 15,
    blocks: [
      tip("In complaints and requests, listen for the problem, how long it has lasted, and what solution both people agree on. Polite phrases often hide firm requests."),
      { kind: "listening", heading: "A problem in the flat", voices: { Linh: "female", Landlord: "male" }, script: "Linh: Hello, Mr Binh? It's Linh from flat 4B.\nLandlord: Hi Linh. Is everything all right?\nLinh: Not really, I'm afraid. The air conditioner in the bedroom stopped working on Monday, and it's been really hard to sleep in this heat.\nLandlord: Oh, I'm sorry. Have you tried turning it off at the wall and on again?\nLinh: Yes, a few times. It makes a strange noise, but no cold air comes out.\nLandlord: OK. I'll ask a repair technician to come and look at it. Would Thursday morning be convenient?\nLinh: I'm at work on Thursday morning. Could they come in the evening, after six?\nLandlord: I'll check, but most technicians finish at five. How about Saturday morning?\nLinh: Saturday is fine. And if it can't be repaired?\nLandlord: Then I'll replace it. It's quite old anyway.\nLinh: Thank you. I really appreciate it." },
      { kind: "practice", instruction: "Listen and choose the best answer.", questions: [
        lq("What is the problem?", ["The water heater is broken.", "The air conditioner does not work.", "The bedroom window won't close."], 1, "The air conditioner in the bedroom stopped working on Monday."),
        lq("What happens when Linh turns it on?", ["It makes a noise but gives no cold air.", "Nothing happens at all.", "It works for a few minutes."], 0, "It makes a strange noise, but no cold air comes out."),
        lq("Why can't the technician come on Thursday evening?", ["The landlord is busy.", "Linh is away.", "Most technicians finish at five."], 2, "Most technicians finish at five."),
        lq("When will the technician come?", ["Thursday morning", "Saturday morning", "Monday evening"], 1, "How about Saturday morning? — Saturday is fine."),
        lq("What will the landlord do if it can't be repaired?", ["Replace it", "Lower the rent", "Give Linh a fan"], 0, "Then I'll replace it."),
        lq("Why is the landlord willing to replace it?", ["Linh has complained many times.", "It is still under warranty.", "It is quite old anyway."], 2, "It's quite old anyway.")
      ] }
    ]
  },

  // ---------- B2 ----------
  {
    key: "extra:b2:listening-cycle-lanes", batch: "skills-extra", level: "B2", unit: B2, slug: "listening-a-news-report-on-cycle-lanes", title: "Listen: a news report on new cycle lanes", skill: "LISTENING", minutes: 17,
    blocks: [
      tip("News reports present a decision and then different reactions to it. Identify who holds each opinion and what evidence or reason they give."),
      { kind: "listening", heading: "Local news", voices: { Reporter: "female", Councillor: "male", Owner: "female" }, script: "Reporter: The city council has approved a plan to build twelve kilometres of protected cycle lanes in the city centre over the next two years. Supporters say it will cut traffic and improve air quality, but not everyone is convinced. I spoke to Councillor Phong, who proposed the plan.\nCouncillor: At the moment, most short journeys in the centre — under three kilometres — are made by car or motorbike. In other cities that built safe lanes, the number of people cycling roughly doubled within a few years. We expect something similar here, especially among students.\nReporter: However, some business owners are worried. Mrs Thu runs a clothes shop on Hai Ba Trung Street.\nOwner: I'm not against bicycles. My concern is parking. The new lane will remove the parking spaces outside my shop, and many of my customers come by car. If they can't stop, they'll simply shop somewhere else.\nReporter: The council says it will open two new car parks nearby before the lanes are finished, and that it will review the scheme after the first year." },
      { kind: "practice", instruction: "Listen and choose the best answer.", questions: [
        lq("What has the council approved?", ["A new car park in the centre", "Twelve kilometres of protected cycle lanes", "A ban on motorbikes in the centre"], 1, "A plan to build twelve kilometres of protected cycle lanes."),
        lq("According to the councillor, what happened in other cities?", ["Cycling roughly doubled within a few years.", "Traffic became worse at first.", "Shops closed in the centre."], 0, "The number of people cycling roughly doubled within a few years."),
        lq("Which group does the councillor expect to cycle more?", ["Tourists", "Older residents", "Students"], 2, "Especially among students."),
        lq("What is Mrs Thu's main concern?", ["The cost of the scheme", "The loss of parking spaces", "Noise from construction"], 1, "The new lane will remove the parking spaces outside my shop."),
        lq("What is Mrs Thu's attitude to bicycles?", ["She is not opposed to them.", "She wants them banned.", "She has never thought about them."], 0, "I'm not against bicycles. My concern is parking."),
        lq("How does the council respond to the concerns?", ["It will cancel the plan.", "It will pay shop owners.", "It will open new car parks and review the scheme."], 2, "It will open two new car parks… and review the scheme after the first year.")
      ] }
    ]
  },
  {
    key: "extra:b2:listening-sleep-podcast", batch: "skills-extra", level: "B2", unit: B2, slug: "listening-a-podcast-about-sleep", title: "Listen: a podcast about sleep and learning", skill: "LISTENING", minutes: 18,
    blocks: [
      tip("In an interview-style podcast, the host asks and the expert explains. Pay attention to hedging (seems, tends to, in many cases) — it shows how certain the speaker is."),
      { kind: "listening", heading: "The Study Room podcast", voices: { Host: "male", Expert: "female" }, script: "Host: Welcome back to The Study Room. Today I'm talking to a sleep researcher about something every student does: staying up late before an exam. Is that a bad idea?\nExpert: In most cases, yes. When we sleep, the brain seems to replay and strengthen what we learned during the day. So if you cut your sleep short, you may actually remember less, even though you studied for longer.\nHost: So an all-nighter is worse than just going to bed?\nExpert: It tends to be. Studies of students who stayed awake all night generally found lower scores on memory tests the next day. There's also the problem of attention — tired people make more careless mistakes.\nHost: What would you recommend instead?\nExpert: Spread your revision over several days, and review the hardest material in the evening, then sleep. A short nap of twenty minutes or so in the afternoon can also help, as long as it isn't too late in the day.\nHost: And what about coffee?\nExpert: Coffee can make you feel alert, but it doesn't replace sleep. And if you drink it in the late afternoon, it can make it harder to fall asleep that night." },
      { kind: "practice", instruction: "Listen and choose the best answer.", questions: [
        lq("According to the expert, what does the brain seem to do during sleep?", ["Replay and strengthen what was learned", "Delete unimportant memories only", "Stop working completely"], 0, "The brain seems to replay and strengthen what we learned during the day."),
        lq("What did studies of students who stayed up all night generally find?", ["Better scores the next day", "Lower scores on memory tests", "No difference at all"], 1, "Generally found lower scores on memory tests the next day."),
        lq("Besides memory, what other problem does tiredness cause?", ["Headaches", "Poor eyesight", "More careless mistakes"], 2, "Tired people make more careless mistakes."),
        lq("What does the expert recommend?", ["Studying only in the morning", "Spreading revision over several days and sleeping after the evening review", "Never taking naps"], 1, "Spread your revision over several days… review the hardest material in the evening, then sleep."),
        lq("What does she say about naps?", ["A short nap can help if it isn't too late in the day.", "Naps always make you more tired.", "Naps should last at least two hours."], 0, "A short nap of twenty minutes or so… can also help, as long as it isn't too late in the day."),
        lq("What is the expert's view of coffee?", ["It is the best substitute for sleep.", "It has no effect on alertness.", "It helps you feel alert but doesn't replace sleep."], 2, "Coffee can make you feel alert, but it doesn't replace sleep.")
      ] }
    ]
  }
];
