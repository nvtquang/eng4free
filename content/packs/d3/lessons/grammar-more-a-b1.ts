import { lq, type LessonDef } from "../types";

const A1 = "Grammar basics";
const A2 = "Grammar for everyday life";
const B1 = "Grammar for independent users";

/** Second wave of grammar topics for A1–B1 (English 4 Free original). */
export const grammarMoreAB1: LessonDef[] = [
  {
    key: "grammar:a1:articles", batch: "grammar", level: "A1", unit: A1, slug: "grammar-articles-a-an-the", title: "Articles: a, an and the", skill: "GRAMMAR", minutes: 14,
    blocks: [
      { kind: "grammar", heading: "Form and use", body: "Use a or an with one thing when it is new or not specific:\nI have a brother. She is an engineer.\n\nUse a before a consonant sound and an before a vowel sound:\na book, a university (/juː/), an apple, an hour (/aʊ/).\n\nUse the when the listener knows which one we mean, or when there is only one:\nI have a cat. The cat is black.\nThe sun is very hot today.\n\nUse no article with plural or uncountable nouns in general:\nI like dogs. Water is important.\n\nGhi chú: tiếng Việt không có mạo từ, nên người Việt hay bỏ quên a/an. Một danh từ đếm được số ít (book, teacher) gần như luôn cần a, an, the hoặc my, this…" },
      { kind: "text", heading: "Examples", body: "• My father is a doctor. (one of many doctors)\n• Can you open the window? (the window in this room)\n• We had an egg and a banana for breakfast.\n• The bus to Hue leaves at six.\n• Children love games." },
      { kind: "text", heading: "Common mistakes", body: "✗ She is teacher. → ✓ She is a teacher.\n✗ I want a apple. → ✓ I want an apple.\n✗ I like the music. (music in general) → ✓ I like music.\n✗ It is an university. → ✓ It is a university." },
      { kind: "practice", instruction: "Choose the correct answer.", questions: [
        lq("My sister is ___ nurse.", ["a", "an", "the"], 0, "Jobs take a/an; nurse starts with a consonant sound."),
        lq("I eat ___ orange every morning.", ["a", "an", "the"], 1, "Orange starts with a vowel sound: an orange."),
        lq("I bought a shirt and a hat. ___ hat is red.", ["A", "An", "The"], 2, "We already know which hat: the hat."),
        lq("___ moon is very bright tonight.", ["A", "The", "An"], 1, "There is only one moon: the moon."),
        lq("We wait for ___ hour every day.", ["a", "an", "the"], 1, "Hour starts with a vowel sound /aʊ/: an hour."),
        lq("I don't like ___ coffee.", ["a", "the", "— (no article)"], 2, "Coffee in general is uncountable: no article."),
        lq("He studies at ___ university in Hanoi.", ["a", "an", "the"], 0, "University starts with the sound /juː/: a university."),
        lq("Is there ___ bank near here?", ["a", "an", "the"], 0, "Any bank, not a specific one: a bank.")
      ] }
    ]
  },
  {
    key: "grammar:a1:possessives", batch: "grammar", level: "A1", unit: A1, slug: "grammar-possessives-my-your-and-s", title: "Possessives: my, your and 's", skill: "GRAMMAR", minutes: 13,
    blocks: [
      { kind: "grammar", heading: "Form and use", body: "Possessive adjectives come before a noun:\nI → my, you → your, he → his, she → her, it → its, we → our, they → their.\nThis is my phone. Their house is big.\n\nUse 's after a person's name or a singular noun:\nLan's bag, my mother's car, the teacher's desk.\n\nAfter a plural noun ending in -s, add only an apostrophe:\nmy parents' room, the students' books.\n\nGhi chú: tiếng Việt nói \"cái túi của Lan\", tiếng Anh nói Lan's bag — người sở hữu đứng trước vật. Đừng nhầm its (của nó) với it's (= it is)." },
      { kind: "text", heading: "Examples", body: "• What is your name? — My name is Minh.\n• This is Hoa's brother. His name is Nam.\n• The dog is hungry. Its bowl is empty.\n• Our English teacher is from Australia.\n• My grandparents' house is in Can Tho." },
      { kind: "text", heading: "Common mistakes", body: "✗ This is the bag of Lan. → ✓ This is Lan's bag.\n✗ She loves he cat. → ✓ She loves her cat.\n✗ The company changed it's name. → ✓ The company changed its name.\n✗ my parent's car (two parents) → ✓ my parents' car" },
      { kind: "practice", instruction: "Choose the correct answer.", questions: [
        lq("Mai has a new bike. ___ bike is blue.", ["Her", "His", "She"], 0, "Mai is a woman: her bike."),
        lq("This is ___ car.", ["Tuan", "Tuan's", "Tuans'"], 1, "One person: name + 's."),
        lq("We love ___ new flat.", ["our", "we", "us"], 0, "Possessive adjective for we: our."),
        lq("The cat is playing with ___ toy.", ["it's", "its", "it"], 1, "Its = belonging to it; it's = it is."),
        lq("Mr and Mrs Lee are here with ___ children.", ["they", "there", "their"], 2, "Possessive for they: their."),
        lq("The ___ room is upstairs. (more than one boy)", ["boy's", "boys'", "boys"], 1, "Plural noun ending in -s: add only an apostrophe."),
        lq("Is this ___ pen, Linh?", ["you", "your", "yours"], 1, "Before a noun use your."),
        lq("That is my ___ office.", ["father's", "fathers", "father"], 0, "One father: father's office.")
      ] }
    ]
  },
  {
    key: "grammar:a2:quantifiers", batch: "grammar", level: "A2", unit: A2, slug: "grammar-some-any-much-many", title: "Some, any, much, many, a lot of", skill: "GRAMMAR", minutes: 15,
    blocks: [
      { kind: "grammar", heading: "Form and use", body: "Countable nouns have a plural (apples, chairs); uncountable nouns do not (water, rice, money, information).\n\nsome — positive sentences and offers: I have some friends here. Would you like some tea?\nany — negatives and questions: I don't have any money. Are there any eggs?\nmany — with plural countable nouns, mostly in negatives and questions: How many people came?\nmuch — with uncountable nouns, mostly in negatives and questions: We don't have much time.\na lot of — with both, especially in positive sentences: She drinks a lot of water.\n\nGhi chú: rice, information, advice, homework, furniture là danh từ không đếm được — không thêm -s và không dùng a/an." },
      { kind: "text", heading: "Examples", body: "• There are some good cafés on this street.\n• Is there any milk in the fridge?\n• How much does this shirt cost?\n• I didn't take many photos.\n• We had a lot of rain last month." },
      { kind: "text", heading: "Common mistakes", body: "✗ I need some informations. → ✓ I need some information.\n✗ How many money do you have? → ✓ How much money do you have?\n✗ I don't have some time. → ✓ I don't have any time.\n✗ She gave me an advice. → ✓ She gave me some advice / a piece of advice." },
      { kind: "practice", instruction: "Choose the correct answer.", questions: [
        lq("Are there ___ apples in the bag?", ["some", "any", "much"], 1, "A question: any."),
        lq("How ___ sugar do you want in your coffee?", ["many", "much", "a lot"], 1, "Sugar is uncountable: how much."),
        lq("I bought ___ vegetables at the market.", ["some", "any", "much"], 0, "A positive sentence: some."),
        lq("We don't have ___ homework today.", ["many", "much", "a"], 1, "Homework is uncountable: much."),
        lq("How ___ students are in your class?", ["much", "many", "any"], 1, "Students are countable: how many."),
        lq("She has ___ friends in Da Nang.", ["a lot of", "much", "any"], 0, "Positive sentence with a plural noun: a lot of."),
        lq("Can you give me some ___?", ["advices", "advice", "an advice"], 1, "Advice is uncountable."),
        lq("Would you like ___ juice?", ["any", "some", "many"], 1, "Offers usually use some.")
      ] }
    ]
  },
  {
    key: "grammar:a2:past-continuous", batch: "grammar", level: "A2", unit: A2, slug: "grammar-past-continuous", title: "Past continuous and past simple", skill: "GRAMMAR", minutes: 15,
    blocks: [
      { kind: "grammar", heading: "Form and use", body: "Past continuous: was / were + verb-ing.\nI was cooking. They were sleeping.\n\nUse it for an action in progress at a time in the past:\nAt 8 p.m. yesterday, I was watching TV.\n\nUse past continuous + past simple when a short action interrupts a longer one:\nI was walking home when it started to rain.\nWhile she was studying, her phone rang.\n\nUse when + past simple for the short action, and while + past continuous for the long one.\n\nGhi chú: hành động dài, đang diễn ra → past continuous; hành động ngắn xen vào → past simple." },
      { kind: "text", heading: "Examples", body: "• What were you doing at nine o'clock last night?\n• We were having dinner when the lights went out.\n• While I was waiting for the bus, I met an old friend.\n• The children were playing in the garden all afternoon.\n• He wasn't listening when the teacher explained the homework." },
      { kind: "text", heading: "Common mistakes", body: "✗ I was walk to school. → ✓ I was walking to school.\n✗ When I was arriving, the film started. → ✓ When I arrived, the film started.\n✗ They was playing football. → ✓ They were playing football.\n✗ While I cooked dinner, the phone was ringing. → ✓ While I was cooking dinner, the phone rang." },
      { kind: "practice", instruction: "Choose the correct answer.", questions: [
        lq("At 10 a.m. yesterday, I ___ in the library.", ["studied", "was studying", "study"], 1, "An action in progress at a past time: was studying."),
        lq("She ___ a shower when the doorbell rang.", ["was taking", "took", "takes"], 0, "The long action interrupted: past continuous."),
        lq("While we were driving, we ___ an accident.", ["were seeing", "saw", "see"], 1, "The short action: past simple."),
        lq("What ___ you doing when I called?", ["was", "were", "did"], 1, "You takes were."),
        lq("I ___ my keys while I was running.", ["was losing", "lost", "lose"], 1, "Losing keys is a short, completed action."),
        lq("They ___ to music when the teacher came in.", ["listened", "were listening", "are listening"], 1, "The background action in progress."),
        lq("It ___ when we left the house.", ["was raining", "rains", "is raining"], 0, "Background situation in the past: was raining."),
        lq("___ I was cooking, my brother set the table.", ["When", "While", "During"], 1, "While + past continuous for the longer action.")
      ] }
    ]
  },
  {
    key: "grammar:b1:used-to", batch: "grammar", level: "B1", unit: B1, slug: "grammar-used-to-and-would", title: "Used to and would for past habits", skill: "GRAMMAR", minutes: 16,
    blocks: [
      { kind: "grammar", heading: "Form and use", body: "used to + base verb describes past habits and past states that are no longer true:\nI used to live in Hue. (I don't now.)\nShe used to play the piano every day.\n\nNegative and question: didn't use to / Did you use to…?\n\nwould + base verb can also describe repeated past actions, often in stories:\nEvery summer, we would go to the beach.\nBut would is not used for states: ✗ I would have long hair → ✓ I used to have long hair.\n\nDo not confuse used to (past habit) with be used to + -ing (be familiar with):\nI'm used to getting up early.\n\nGhi chú: used to ≈ \"trước đây từng…, bây giờ thì không\"." },
      { kind: "text", heading: "Examples", body: "• There used to be a cinema on this corner.\n• Did you use to walk to school?\n• My grandmother would tell us stories every evening.\n• I didn't use to like vegetables, but now I do.\n• He's lived in the city for years, so he's used to the traffic." },
      { kind: "text", heading: "Common mistakes", body: "✗ I use to play football when I was young. → ✓ I used to play…\n✗ Did you used to live here? → ✓ Did you use to live here?\n✗ We would have a dog. (a state) → ✓ We used to have a dog.\n✗ I used to working at night. → ✓ I used to work / I'm used to working at night." },
      { kind: "practice", instruction: "Choose the correct answer.", questions: [
        lq("I ___ in Can Tho, but now I live in Saigon.", ["use to live", "used to live", "am used to live"], 1, "A past state that is no longer true: used to + base verb."),
        lq("Did you ___ wear glasses?", ["use to", "used to", "using to"], 0, "In questions after did: use to."),
        lq("We ___ a big garden when I was a child.", ["would have", "used to have", "were used to have"], 1, "Have (possession) is a state: used to, not would."),
        lq("Every Sunday, my father ___ us to the park.", ["would take", "was used to take", "use to take"], 0, "A repeated past action in a story: would take."),
        lq("He ___ like spicy food, but now he loves it.", ["didn't use to", "didn't used to", "wasn't used to like"], 0, "Negative: didn't use to + base verb."),
        lq("I'm used to ___ on the left — I lived in the UK for years.", ["drive", "driving", "drove"], 1, "Be used to + -ing = be familiar with."),
        lq("There ___ a market here, but it closed.", ["used to be", "would be", "is used to be"], 0, "There used to be = it existed before."),
        lq("Which sentence is correct?", ["I used to have long hair.", "I would have long hair.", "I use to have long hair."], 0, "A past state: used to have.")
      ] }
    ]
  },
  {
    key: "grammar:b1:gerunds-infinitives", batch: "grammar", level: "B1", unit: B1, slug: "grammar-gerunds-and-infinitives", title: "Verb + -ing or to + verb", skill: "GRAMMAR", minutes: 17,
    blocks: [
      { kind: "grammar", heading: "Form and use", body: "Some verbs are followed by -ing:\nenjoy, finish, mind, avoid, suggest, keep, practise, consider, can't stand\nI enjoy cooking. She suggested taking a taxi.\n\nSome verbs are followed by to + verb:\nwant, decide, hope, plan, agree, refuse, promise, learn, need, would like\nWe decided to stay at home. I hope to see you soon.\n\nAfter prepositions, always use -ing: I'm interested in learning Korean. Thanks for helping me.\n\nA few verbs change meaning:\nI stopped smoking. (I don't smoke now.) / I stopped to smoke. (I stopped in order to smoke.)\nRemember to lock the door. (don't forget) / I remember locking the door. (I have a memory of it)\n\nGhi chú: học các động từ theo nhóm, ví dụ \"enjoy + V-ing\", \"decide + to V\"." },
      { kind: "text", heading: "Examples", body: "• Have you finished writing your report?\n• They agreed to meet at seven.\n• I'm thinking about changing jobs.\n• Would you mind closing the window?\n• Don't forget to call your grandmother." },
      { kind: "text", heading: "Common mistakes", body: "✗ I enjoy to swim. → ✓ I enjoy swimming.\n✗ She decided going home. → ✓ She decided to go home.\n✗ I'm good at cook. → ✓ I'm good at cooking.\n✗ He suggested to take the bus. → ✓ He suggested taking the bus." },
      { kind: "practice", instruction: "Choose the correct answer.", questions: [
        lq("I really enjoy ___ in the mountains.", ["to hike", "hiking", "hike"], 1, "Enjoy + -ing."),
        lq("We've decided ___ a new car.", ["buying", "to buy", "buy"], 1, "Decide + to + verb."),
        lq("Would you mind ___ me with this box?", ["to help", "helping", "help"], 1, "Mind + -ing."),
        lq("She is interested in ___ abroad.", ["study", "to study", "studying"], 2, "After a preposition (in): -ing."),
        lq("They refused ___ the extra fee.", ["paying", "to pay", "pay"], 1, "Refuse + to + verb."),
        lq("Please remember ___ the lights before you leave.", ["to turn off", "turning off", "turn off"], 0, "Remember to = don't forget to do it."),
        lq("He stopped ___ a coffee on the way to work.", ["buying", "to buy", "buy"], 1, "Stop to do = stop in order to do something."),
        lq("I'm looking forward to ___ you.", ["see", "seeing", "to see"], 1, "Look forward to: to is a preposition here, so -ing.")
      ] }
    ]
  }
];
