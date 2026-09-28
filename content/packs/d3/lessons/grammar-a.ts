import { lq, type LessonDef } from "../types";

const A1 = "Grammar basics";
const A2 = "Grammar for everyday life";

export const grammarA: LessonDef[] = [
  {
    key: "grammar:a1:be", batch: "grammar", level: "A1", unit: A1, slug: "grammar-be-am-is-are", title: "Be: am, is, are", skill: "GRAMMAR", minutes: 12,
    blocks: [
      { kind: "grammar", heading: "Form and use", body: "We use the verb be to say who someone is, where they are from, and how they feel.\n\nI am (I'm)\nyou / we / they are (you're, we're, they're)\nhe / she / it is (he's, she's, it's)\n\nNegative: add not → I'm not, she isn't, they aren't.\nQuestion: put the verb first → Are you a student? Is he at home?\n\nGhi chú: tiếng Việt thường bỏ động từ “là/thì” (“Tôi mệt”), nhưng tiếng Anh luôn cần be: I am tired." },
      { kind: "text", heading: "Examples", body: "• I'm Lan. I'm from Da Nang.\n• My brother is a nurse.\n• We aren't late. The bus is early.\n• Is it cold today? — Yes, it is.\n• Are your friends here? — No, they aren't." },
      { kind: "text", heading: "Common mistakes", body: "✗ She very happy. → ✓ She is very happy.\n✗ I am agree. → ✓ I agree. (agree is a verb, so it does not need am)\n✗ They is my parents. → ✓ They are my parents." },
      { kind: "practice", instruction: "Choose the correct form of be.", questions: [
        lq("My name ___ Minh.", ["am", "is", "are"], 1, "Name is singular (it), so we use is."),
        lq("We ___ in the same class.", ["are", "is", "am"], 0, "We takes are."),
        lq("I ___ hungry. Let's eat.", ["is", "are", "am"], 2, "I always takes am."),
        lq("___ your sister a teacher?", ["Is", "Are", "Am"], 0, "Your sister = she, so the question starts with Is."),
        lq("They ___ at school today. They are at home.", ["isn't", "aren't", "am not"], 1, "They takes are; the negative is aren't."),
        lq("Which sentence is correct?", ["He very tall.", "He is very tall.", "He are very tall."], 1, "English needs the verb be before an adjective: He is very tall."),
        lq("It ___ my phone. My phone is black.", ["isn't", "aren't", "not"], 0, "It takes is; the negative is isn't."),
        lq("Are you from Hue? — Yes, I ___.", ["is", "am", "are"], 1, "Short answers repeat the verb for I: Yes, I am.")
      ] }
    ]
  },
  {
    key: "grammar:a1:present-simple", batch: "grammar", level: "A1", unit: A1, slug: "grammar-present-simple", title: "Present simple for routines", skill: "GRAMMAR", minutes: 14,
    blocks: [
      { kind: "grammar", heading: "Form and use", body: "Use the present simple for habits, routines and facts.\n\nI / you / we / they work.\nhe / she / it works (add -s or -es: watches, goes, studies).\n\nNegative: don't / doesn't + base verb → She doesn't drink coffee.\nQuestion: Do / Does + subject + base verb → Do you cook? Does he live here?\n\nTime words: every day, usually, often, sometimes, never, on Mondays.\n\nGhi chú: sau does/doesn't, động từ trở về dạng nguyên mẫu: Does she work? (không nói Does she works?)" },
      { kind: "text", heading: "Examples", body: "• I get up at six every morning.\n• My father reads the news after dinner.\n• We don't have class on Sundays.\n• Does the shop open at eight? — Yes, it does.\n• Water boils at 100 degrees Celsius." },
      { kind: "text", heading: "Common mistakes", body: "✗ She go to work by bus. → ✓ She goes to work by bus.\n✗ He don't like tea. → ✓ He doesn't like tea.\n✗ Does she speaks English? → ✓ Does she speak English?" },
      { kind: "practice", instruction: "Choose the correct present simple form.", questions: [
        lq("My mother ___ breakfast at 6:30.", ["cook", "cooks", "cooking"], 1, "With he/she/it, add -s: cooks."),
        lq("They ___ football on Saturdays.", ["play", "plays", "playing"], 0, "They takes the base form: play."),
        lq("He ___ meat. He is a vegetarian.", ["don't eat", "doesn't eats", "doesn't eat"], 2, "Negative with he: doesn't + base verb."),
        lq("___ you walk to school?", ["Does", "Do", "Are"], 1, "Questions with you use Do."),
        lq("Which verb is spelled correctly?", ["She studys", "She studies", "She studyes"], 1, "Consonant + y changes to -ies: studies."),
        lq("Does your brother ___ in Hanoi?", ["lives", "living", "live"], 2, "After does, use the base verb: live."),
        lq("I ___ watch TV in the morning. I have no time.", ["never", "am never", "don't never"], 0, "Never goes before the main verb and is already negative."),
        lq("The train ___ at 9:15 every day.", ["leave", "leaves", "is leave"], 1, "The train = it, so we add -s: leaves.")
      ] }
    ]
  },
  {
    key: "grammar:a1:there-is", batch: "grammar", level: "A1", unit: A1, slug: "grammar-there-is-there-are", title: "There is / there are", skill: "GRAMMAR", minutes: 12,
    blocks: [
      { kind: "grammar", heading: "Form and use", body: "Use there is / there are to say that something exists or to describe a place.\n\nThere is (there's) + singular or uncountable noun → There's a bank near my house. There is some milk in the fridge.\nThere are + plural noun → There are two parks in my town.\n\nNegative: there isn't / there aren't (any).\nQuestion: Is there…? / Are there any…?\n\nGhi chú: người Việt hay nói “Có một cái bàn” thành “Have a table”. Trong tiếng Anh phải dùng There is a table." },
      { kind: "text", heading: "Examples", body: "• There's a small café opposite the station.\n• There are thirty students in my class.\n• There isn't any sugar left.\n• Are there any good restaurants here? — Yes, there are.\n• Is there a lift in this building? — No, there isn't." },
      { kind: "text", heading: "Common mistakes", body: "✗ Have many people in the market. → ✓ There are many people in the market.\n✗ There is three chairs. → ✓ There are three chairs.\n✗ There are some water. → ✓ There is some water. (water is uncountable)" },
      { kind: "practice", instruction: "Choose the best answer.", questions: [
        lq("___ a supermarket on this street.", ["There are", "There is", "It has"], 1, "A supermarket is singular: There is."),
        lq("There ___ five bedrooms in the house.", ["is", "be", "are"], 2, "Five bedrooms is plural: There are."),
        lq("___ any eggs in the fridge?", ["Is there", "Are there", "There are"], 1, "Questions with plural nouns: Are there any…?"),
        lq("There ___ any bread. Can you buy some?", ["isn't", "aren't", "not is"], 0, "Bread is uncountable, so we use isn't."),
        lq("Which sentence is correct?", ["Have a cat in the garden.", "There is a cat in the garden.", "There are a cat in the garden."], 1, "We use There is + a/an + singular noun."),
        lq("Is there a pharmacy near here? — Yes, ___.", ["there is", "it is", "there are"], 0, "Short answers repeat there is."),
        lq("There ___ a lot of traffic in the city centre.", ["are", "is", "have"], 1, "Traffic is uncountable, so we use is."),
        lq("___ two cinemas and a museum in my town.", ["There's", "It has", "There are"], 2, "The first noun (two cinemas) is plural: There are.")
      ] }
    ]
  },
  {
    key: "grammar:a1:can", batch: "grammar", level: "A1", unit: A1, slug: "grammar-can-ability", title: "Can and can't for ability", skill: "GRAMMAR", minutes: 12,
    blocks: [
      { kind: "grammar", heading: "Form and use", body: "Use can to talk about ability and possibility, and to ask for permission.\n\nSubject + can / can't (cannot) + base verb → I can swim. She can't drive.\nThe form is the same for every subject: he can, they can.\nQuestion: Can + subject + base verb? → Can you speak French?\n\nGhi chú: không thêm “to” sau can: I can swim (không nói I can to swim)." },
      { kind: "text", heading: "Examples", body: "• My grandmother can speak three languages.\n• I can't hear you. The music is too loud.\n• Can you ride a motorbike? — Yes, I can.\n• Can I open the window? — Of course.\n• We can meet after class." },
      { kind: "text", heading: "Common mistakes", body: "✗ He cans play the guitar. → ✓ He can play the guitar.\n✗ I can to cook. → ✓ I can cook.\n✗ Do you can help me? → ✓ Can you help me?" },
      { kind: "practice", instruction: "Choose the correct option.", questions: [
        lq("She ___ play the piano very well.", ["cans", "can", "can to"], 1, "Can has one form for every subject and is followed by the base verb."),
        lq("I ___ see the board. Can I sit at the front?", ["can't", "don't can", "not can"], 0, "The negative is can't (cannot)."),
        lq("___ you swim?", ["Do", "Are", "Can"], 2, "Questions put can before the subject: Can you swim?"),
        lq("Can your brother drive? — No, he ___.", ["doesn't", "can't", "isn't"], 1, "Short answers repeat can: No, he can't."),
        lq("Which sentence is correct?", ["They can speaks English.", "They can speak English.", "They can to speak English."], 1, "After can, use the base verb without to."),
        lq("___ I use your pen, please?", ["Can", "Am", "Do"], 0, "Can I…? asks for permission."),
        lq("My cat ___ climb trees, but it can't swim.", ["can", "cans", "is can"], 0, "Can stays the same with it."),
        lq("We ___ come to the party. We have an exam.", ["can", "can't", "aren't can"], 1, "The second sentence gives a reason for not coming: can't.")
      ] }
    ]
  },
  {
    key: "grammar:a2:past-simple", batch: "grammar", level: "A2", unit: A2, slug: "grammar-past-simple", title: "Past simple: regular and irregular verbs", skill: "GRAMMAR", minutes: 15,
    blocks: [
      { kind: "grammar", heading: "Form and use", body: "Use the past simple for finished actions at a known time in the past (yesterday, last week, in 2020, two days ago).\n\nRegular verbs add -ed: work → worked, study → studied, stop → stopped.\nIrregular verbs have their own form: go → went, have → had, buy → bought, see → saw.\n\nNegative: didn't + base verb → I didn't go.\nQuestion: Did + subject + base verb → Did you see the film?\n\nGhi chú: sau did/didn't, động từ ở dạng nguyên mẫu, không chia quá khứ lần nữa." },
      { kind: "text", heading: "Examples", body: "• We visited Hoi An last summer.\n• She bought a new laptop two weeks ago.\n• I didn't sleep well last night.\n• Did they win the match? — No, they didn't.\n• The film started at eight and finished at ten." },
      { kind: "text", heading: "Common mistakes", body: "✗ I go to the beach yesterday. → ✓ I went to the beach yesterday.\n✗ Did you went out? → ✓ Did you go out?\n✗ He didn't called me. → ✓ He didn't call me." },
      { kind: "practice", instruction: "Choose the correct past simple form.", questions: [
        lq("Last night I ___ a great documentary.", ["watch", "watched", "watching"], 1, "Regular verb + -ed for a finished past action."),
        lq("We ___ to Nha Trang in 2023.", ["go", "goed", "went"], 2, "Go is irregular: went."),
        lq("She ___ her keys this morning.", ["losed", "lost", "loses"], 1, "Lose is irregular: lost."),
        lq("___ you finish your homework?", ["Did", "Do", "Were"], 0, "Past simple questions start with Did."),
        lq("I didn't ___ the email.", ["got", "get", "gets"], 1, "After didn't, use the base verb: get."),
        lq("Which spelling is correct?", ["stoped", "stopped", "stopt"], 1, "One vowel + one consonant: double the consonant → stopped."),
        lq("They ___ a taxi because it was raining.", ["took", "taked", "take"], 0, "Take is irregular: took."),
        lq("Did he call you? — Yes, he ___.", ["called", "does", "did"], 2, "Short answers use did.")
      ] }
    ]
  },
  {
    key: "grammar:a2:going-to", batch: "grammar", level: "A2", unit: A2, slug: "grammar-going-to-plans", title: "Be going to for plans and predictions", skill: "GRAMMAR", minutes: 13,
    blocks: [
      { kind: "grammar", heading: "Form and use", body: "Use be going to + base verb for:\n1. plans you have already decided → I'm going to learn to swim this summer.\n2. predictions based on what you can see now → Look at those clouds. It's going to rain.\n\nForm: am / is / are + going to + base verb.\nNegative: I'm not going to…, she isn't going to…\nQuestion: Are you going to…? Is he going to…?\n\nGhi chú: đừng quên động từ be: They are going to travel (không nói They going to travel)." },
      { kind: "text", heading: "Examples", body: "• My sister is going to study medicine.\n• We aren't going to buy a car this year.\n• Are you going to watch the final? — Yes, I am.\n• Be careful! That glass is going to fall.\n• What are you going to cook tonight?" },
      { kind: "text", heading: "Common mistakes", body: "✗ I going to visit my aunt. → ✓ I'm going to visit my aunt.\n✗ She is going to studies abroad. → ✓ She is going to study abroad.\n✗ We are going to going to the gym. → ✓ We are going to go to the gym." },
      { kind: "practice", instruction: "Choose the best answer.", questions: [
        lq("I ___ going to paint my room this weekend.", ["am", "is", "are"], 0, "I takes am: I am going to…"),
        lq("They ___ going to move to Da Lat next year.", ["is", "are", "be"], 1, "They takes are."),
        lq("She is going to ___ a new job.", ["starts", "starting", "start"], 2, "After going to, use the base verb."),
        lq("Look at the time! We ___ miss the bus.", ["are going to", "going to", "go to"], 0, "A prediction from present evidence: are going to."),
        lq("___ he going to call the manager?", ["Does", "Is", "Are"], 1, "He takes is in the question: Is he going to…?"),
        lq("I'm tired, so I ___ go out tonight.", ["am not going to", "don't going to", "not going"], 0, "Negative: am not going to."),
        lq("Which sentence describes a plan?", ["I'm going to take a cooking class in May.", "I take a cooking class yesterday.", "I can take a cooking class."], 0, "Be going to shows a plan already decided."),
        lq("What ___ you going to do after graduation?", ["do", "are", "is"], 1, "Wh- question: What are you going to do?")
      ] }
    ]
  },
  {
    key: "grammar:a2:comparatives", batch: "grammar", level: "A2", unit: A2, slug: "grammar-comparatives-superlatives", title: "Comparatives and superlatives", skill: "GRAMMAR", minutes: 15,
    blocks: [
      { kind: "grammar", heading: "Form and use", body: "Comparatives compare two things; superlatives compare one thing with a whole group.\n\nShort adjectives: cheap → cheaper → the cheapest; big → bigger → the biggest; easy → easier → the easiest.\nLong adjectives: expensive → more expensive → the most expensive.\nIrregular: good → better → the best; bad → worse → the worst; far → further → the furthest.\n\nUse than after a comparative: Hanoi is bigger than Hue.\n\nGhi chú: không dùng cả “more” và “-er” cùng lúc: easier, không nói more easier." },
      { kind: "text", heading: "Examples", body: "• The train is slower than the plane, but it is cheaper.\n• This is the most beautiful beach in the region.\n• My English is better than last year.\n• July is usually the hottest month here.\n• Taking the bus is more convenient than driving in the city centre." },
      { kind: "text", heading: "Common mistakes", body: "✗ She is more tall than me. → ✓ She is taller than me.\n✗ It is the most cheapest phone. → ✓ It is the cheapest phone.\n✗ He is more good at maths. → ✓ He is better at maths." },
      { kind: "practice", instruction: "Choose the correct form.", questions: [
        lq("My bag is ___ than yours.", ["heavyer", "heavier", "more heavy"], 1, "Consonant + y → -ier: heavier."),
        lq("This is the ___ hotel in the city.", ["most expensive", "expensivest", "more expensive"], 0, "Long adjectives use the most for superlatives."),
        lq("Today is ___ than yesterday. It's 38 degrees.", ["hot", "hotter", "the hottest"], 1, "Comparing two days: hotter than."),
        lq("Messi is one of the ___ players in the world.", ["better", "good", "best"], 2, "Good → the best."),
        lq("The traffic is ___ in the evening than in the morning.", ["worse", "badder", "more bad"], 0, "Bad → worse."),
        lq("Which sentence is correct?", ["She is more happier now.", "She is happier now.", "She is the happier now."], 1, "Happy → happier; do not add more."),
        lq("A motorbike is ___ than a car in heavy traffic.", ["more fast", "faster", "fastest"], 1, "Fast is short: faster."),
        lq("Mount Fansipan is the ___ mountain in Vietnam.", ["highest", "higher", "most high"], 0, "Superlative of high: the highest.")
      ] }
    ]
  },
  {
    key: "grammar:a2:present-continuous", batch: "grammar", level: "A2", unit: A2, slug: "grammar-present-continuous-vs-simple", title: "Present continuous or present simple?", skill: "GRAMMAR", minutes: 15,
    blocks: [
      { kind: "grammar", heading: "Form and use", body: "Present continuous (am / is / are + verb-ing): actions happening now or around now, and temporary situations.\n→ I'm reading a good book at the moment.\n\nPresent simple: habits, routines and permanent facts.\n→ I read before bed every night.\n\nState verbs (like, love, know, want, need, understand, believe) are normally not used in the continuous: I know the answer (not I'm knowing).\n\nGhi chú: dấu hiệu thường gặp — now, at the moment, today, this week → hiện tại tiếp diễn; every day, usually, often → hiện tại đơn." },
      { kind: "text", heading: "Examples", body: "• Be quiet — the baby is sleeping.\n• She usually takes the bus, but today she's walking.\n• They're staying with friends this week.\n• I don't understand this question.\n• What are you doing? — I'm cooking dinner." },
      { kind: "text", heading: "Common mistakes", body: "✗ I am wanting a coffee. → ✓ I want a coffee.\n✗ Look! It rains. → ✓ Look! It's raining.\n✗ He is go to work now. → ✓ He is going to work now." },
      { kind: "practice", instruction: "Choose the correct tense.", questions: [
        lq("Listen! Someone ___ at the door.", ["knocks", "is knocking", "knock"], 1, "Happening now: present continuous."),
        lq("My father ___ tennis every Sunday.", ["plays", "is playing", "play"], 0, "A routine: present simple."),
        lq("I ___ what you mean.", ["am understanding", "understand", "understanding"], 1, "Understand is a state verb; use the simple form."),
        lq("We ___ English this term, not French.", ["are studying", "studies", "study always"], 0, "A temporary situation: present continuous."),
        lq("___ you like spicy food?", ["Are", "Do", "Is"], 1, "Like is a state verb: Do you like…?"),
        lq("Look at Nam! He ___ a funny hat.", ["wears", "wear", "is wearing"], 2, "Describing what we can see now: is wearing."),
        lq("Water ___ at 0°C.", ["is freezing", "freezes", "freeze"], 1, "A scientific fact: present simple."),
        lq("She can't talk now. She ___ a meeting.", ["has", "is having", "have"], 1, "Have for an activity (a meeting) can be continuous: is having.")
      ] }
    ]
  }
];
