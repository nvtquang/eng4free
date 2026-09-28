import { lq, type LessonDef } from "../types";

const B1 = "Skills for independent users";
const B2 = "Skills for confident users";

export const skillsB: LessonDef[] = [
  {
    key: "skills:b1:reading-volunteer", batch: "lessons", level: "B1", unit: B1, slug: "reading-volunteering-abroad", title: "Read: is volunteering abroad worth it?", skill: "READING", minutes: 16,
    blocks: [
      { kind: "text", heading: "Before you read", body: "Skim the article in one minute and decide: is the writer for or against volunteering abroad, or somewhere in between? Then read carefully and answer the questions." },
      { kind: "text", heading: "Article", body: "Every year, thousands of young people spend their summer volunteering in another country. They build classrooms, teach English or help on farms. For many, it is a life-changing experience. But is it always as useful as it looks?\n\nSupporters say that volunteering abroad teaches independence and helps young people understand other cultures. Thao, who spent six weeks at a community library in Laos, says she became more confident. \"I had to solve problems on my own, in a language I didn't speak well,\" she explains.\n\nCritics point out that short trips can do more harm than good. Children in orphanages, for example, may become attached to volunteers who leave after two weeks. Some construction projects also take jobs from local workers, who could do the work faster and better.\n\nSo what should you do if you want to volunteer? Experts suggest choosing an organisation that is run by local people, staying for at least three months, and doing work that matches your skills. If you are a nursing student, a health project makes sense; if you have no building experience, perhaps a building project does not.\n\nVolunteering can be valuable for everyone involved — but only if it is planned carefully." },
      { kind: "practice", instruction: "Read the article and choose the best answer.", questions: [
        lq("What is the writer's overall opinion?", ["Volunteering abroad is always harmful.", "Volunteering abroad can be useful if it is well planned.", "Only nursing students should volunteer."], 1, "The conclusion: valuable … but only if it is planned carefully."),
        lq("How did Thao change after her trip?", ["She became more confident.", "She learned to build classrooms.", "She decided to study nursing."], 0, "She says she became more confident."),
        lq("Why can short visits to orphanages be a problem?", ["Volunteers are too expensive.", "The buildings are unsafe.", "Children may become attached to people who soon leave."], 2, "Children may become attached to volunteers who leave after two weeks."),
        lq("According to critics, what can happen with some construction projects?", ["Local workers lose jobs.", "Volunteers get injured.", "The projects are never finished."], 0, "Some projects take jobs from local workers."),
        lq("How long do experts suggest staying?", ["Two weeks", "Six weeks", "At least three months"], 2, "Staying for at least three months."),
        lq("The word 'attached' in paragraph 3 is closest in meaning to…", ["emotionally close", "physically tied", "officially registered"], 0, "Become attached to someone = develop strong feelings for them.")
      ] }
    ]
  },
  {
    key: "skills:b1:listening-podcast", batch: "lessons", level: "B1", unit: B1, slug: "listening-study-habits-podcast", title: "Listen: a podcast about study habits", skill: "LISTENING", minutes: 16,
    blocks: [
      { kind: "text", heading: "Listening tip", body: "In interviews, the host's questions tell you what each part is about. Listen for signposts such as 'the first thing', 'another tip', 'the most important' — they introduce the main points." },
      { kind: "listening", heading: "Podcast: Smarter studying", voices: { Host: "female", Daniel: "male" }, script: "Host: Welcome back to Smarter Studying. Today I'm talking to Daniel Price, who teaches study skills at a university in Manchester. Daniel, what's the biggest mistake students make?\nDaniel: I think it's reading their notes again and again. It feels productive, but it doesn't help memory very much.\nHost: So what should they do instead?\nDaniel: The first thing is to test yourself. Close the book and try to write down everything you remember. Then check what you missed.\nHost: That sounds hard.\nDaniel: It is hard, and that's why it works. Another tip is to spread your study over several days. Twenty minutes a day for a week is better than three hours the night before an exam.\nHost: What about music while studying?\nDaniel: Some people like quiet background music. But songs with lyrics usually distract you, especially when you're reading.\nHost: And the most important tip?\nDaniel: Sleep. Your brain organises new information while you sleep, so staying up all night is a bad idea." },
      { kind: "practice", instruction: "Listen and choose the best answer.", questions: [
        lq("What is Daniel's job?", ["He is a university study-skills teacher.", "He is a psychologist.", "He is a student in Manchester."], 0, "He teaches study skills at a university."),
        lq("What is the biggest mistake, according to Daniel?", ["Studying with friends", "Reading notes again and again", "Taking too many notes"], 1, "The biggest mistake is reading their notes again and again."),
        lq("Why does testing yourself work?", ["Because it is quick", "Because it is fun", "Because it is difficult"], 2, "It is hard, and that's why it works."),
        lq("Which study plan does Daniel recommend?", ["Three hours the night before", "Twenty minutes a day for a week", "One long session each weekend"], 1, "Twenty minutes a day for a week is better."),
        lq("What does he say about music?", ["Songs with lyrics usually distract you.", "Music always helps concentration.", "You should never study in silence."], 0, "Songs with lyrics usually distract you."),
        lq("What is his most important tip?", ["Eat well", "Take notes by hand", "Get enough sleep"], 2, "The most important tip is sleep.")
      ] }
    ]
  },
  {
    key: "skills:b1:speaking-opinions", batch: "lessons", level: "B1", unit: B1, slug: "speaking-agreeing-and-disagreeing", title: "Speak: agreeing and disagreeing politely", skill: "SPEAKING", minutes: 15,
    blocks: [
      { kind: "text", heading: "Useful language", body: "Giving opinions: In my opinion, … / I think that… / Personally, I feel…\nAgreeing: I completely agree. / That's a good point. / Exactly!\nPartly agreeing: I see what you mean, but… / That's true, but on the other hand…\nDisagreeing politely: I'm not sure about that. / I see it differently. / I'm afraid I don't agree, because…\nAsking for opinions: What do you think? / How do you feel about…?\n\nTip: when you disagree, give a reason. It sounds more polite and more convincing." },
      { kind: "listening", heading: "Model discussion: should homework be banned?", voices: { Nga: "female", Leo: "male" }, script: "Nga: I think homework should be banned in primary schools. Children are tired after school.\nLeo: I see what you mean, but a little homework helps them practise what they learned.\nNga: That's true, but many children spend two hours on it every night.\nLeo: I agree that two hours is too much. Maybe the answer is shorter homework, not no homework.\nNga: That's a good point. Twenty minutes a day sounds reasonable.\nLeo: Exactly. And it should be something useful, like reading a book." },
      { kind: "practice", instruction: "Choose the best answer.", questions: [
        lq("Which phrase partly agrees with someone?", ["I completely agree.", "I see what you mean, but…", "Exactly!"], 1, "I see what you mean, but… accepts a point and adds a different view."),
        lq("What do Nga and Leo agree on at the end?", ["Homework should be banned.", "Homework should be shorter and useful.", "Homework should take two hours."], 1, "Shorter, useful homework — about twenty minutes."),
        lq("Which is the most polite way to disagree?", ["You're wrong.", "That's a stupid idea.", "I'm not sure about that, because…"], 2, "A soft phrase plus a reason is polite."),
        lq("\"Personally, I feel that cities need more parks.\" What is the speaker doing?", ["Giving an opinion", "Asking a question", "Disagreeing"], 0, "Personally, I feel… introduces an opinion."),
        lq("Which reply shows full agreement?", ["That's a good point.", "I see it differently.", "I'm afraid I don't agree."], 0, "That's a good point shows agreement."),
        lq("Which question invites someone to give an opinion?", ["Do you have homework?", "What do you think about school uniforms?", "Where is your school?"], 1, "What do you think about…? asks for an opinion.")
      ] }
    ]
  },
  {
    key: "skills:b1:writing-complaint", batch: "lessons", level: "B1", unit: B1, slug: "writing-a-polite-complaint", title: "Write: a polite complaint email", skill: "WRITING", minutes: 16,
    blocks: [
      { kind: "text", heading: "Model email", body: "Subject: Order 58213 — wrong item delivered\n\nDear Customer Service Team,\n\nI am writing to complain about an order I received on 12 March. I ordered a blue backpack (size M), but the parcel contained a black one in size S.\n\nI have attached two photos of the item and the label. As I need the backpack for a school trip on 20 March, I would be grateful if you could send the correct item before that date. Alternatively, I would like a full refund.\n\nI look forward to hearing from you.\n\nYours faithfully,\nPham Thu Trang" },
      { kind: "text", heading: "Structure and language", body: "1. Reason for writing: I am writing to complain about… / to inform you that…\n2. Details of the problem: what, when, order number.\n3. What you want: I would be grateful if you could… / I would like a refund / replacement.\n4. Polite ending: I look forward to hearing from you.\n\nFormal style: no contractions (I am, not I'm), no slang, and Dear Sir or Madam → Yours faithfully; Dear Mr Lee → Yours sincerely." },
      { kind: "practice", instruction: "Choose the best answer.", questions: [
        lq("What was wrong with the order?", ["It arrived late.", "The colour and size were wrong.", "It was damaged."], 1, "She received a black backpack in size S instead of blue, size M."),
        lq("Why does Trang need the backpack before 20 March?", ["For a school trip", "For a birthday present", "For a job interview"], 0, "She needs it for a school trip on 20 March."),
        lq("Which sentence is the most appropriate for a formal complaint?", ["Send me the right bag now!", "I'd be grateful if you could send the correct item.", "Hey, you sent the wrong thing."], 1, "Polite, formal request."),
        lq("Which closing matches 'Dear Customer Service Team'?", ["Yours faithfully,", "Love,", "See you soon,"], 0, "When you do not know the person's name, end with Yours faithfully."),
        lq("Which phrase gives the reason for writing?", ["I look forward to hearing from you.", "I am writing to complain about…", "Alternatively, I would like…"], 1, "I am writing to… states the purpose."),
        lq("Which sentence is formal?", ["I'm really fed up with this.", "It's totally not OK.", "I am disappointed with the service."], 2, "Full forms and neutral vocabulary are formal.")
      ] }
    ]
  },
  {
    key: "skills:b2:reading-four-day-week", batch: "lessons", level: "B2", unit: B2, slug: "reading-four-day-work-week", title: "Read: the four-day work week", skill: "READING", minutes: 18,
    blocks: [
      { kind: "text", heading: "Before you read", body: "The article discusses trials of a four-day working week. As you read, separate facts (results from trials) from opinions (what people think). This is a key skill for B2 reading and for IELTS." },
      { kind: "text", heading: "Article", body: "When a software company in Da Nang gave its staff every Friday off last year, many clients expected slower replies and missed deadlines. Twelve months later, the company reports the opposite: projects are delivered on time, sick days have fallen by a third, and only two employees have left, compared with nine the year before.\n\nThe company is part of a growing number of employers testing a four-day week without cutting pay. The idea is simple: people who are rested work more efficiently, so they can do the same amount in less time. To make this possible, the Da Nang team shortened meetings to fifteen minutes and introduced 'focus mornings' when messages are switched off.\n\nNot everyone is convinced. Economists warn that the results may not transfer to hospitals, factories or shops, where work depends on being present rather than finishing tasks. A nurse cannot treat four days of patients in three and a half days. Others note that trial companies often choose to take part because they already expect success, which makes the results look better than they would be across the whole economy.\n\nEven supporters admit that the model needs adapting. Some firms give staff a shorter day instead of a full day off; others let teams take different days off so that customers are always served. What seems clear is that the traditional five-day week is no longer the only option — and that the answer may differ from one type of work to another." },
      { kind: "practice", instruction: "Read the article and choose the best answer.", questions: [
        lq("What happened to the number of sick days at the Da Nang company?", ["It rose slightly.", "It fell by a third.", "It stayed the same."], 1, "Sick days have fallen by a third."),
        lq("Which change helped staff work more efficiently?", ["Longer lunch breaks", "Shorter meetings and message-free mornings", "Working on Saturdays"], 1, "Meetings were shortened and focus mornings introduced."),
        lq("Why might the results not apply to hospitals?", ["Hospitals pay less.", "Nurses dislike change.", "The work depends on being present."], 2, "Work depends on being present rather than finishing tasks."),
        lq("What problem do critics see in the trials?", ["Companies that join may already expect to succeed.", "The trials are too long.", "Employees are paid less."], 0, "Trial companies often choose to take part because they already expect success."),
        lq("Which of these is an opinion rather than a reported result?", ["Only two employees left.", "Projects are delivered on time.", "The answer may differ from one type of work to another."], 2, "This is the writer's conclusion, not a measured result."),
        lq("What does the final paragraph suggest?", ["The five-day week will soon disappear everywhere.", "Flexible versions of the model are being tried.", "Supporters now reject the idea."], 1, "Firms adapt the model: shorter days or different days off.")
      ] }
    ]
  },
  {
    key: "skills:b2:listening-lecture", batch: "lessons", level: "B2", unit: B2, slug: "listening-lecture-urban-heat", title: "Listen: a short lecture on urban heat", skill: "LISTENING", minutes: 18,
    blocks: [
      { kind: "text", heading: "Listening tip", body: "Lectures follow a structure. Listen for how the speaker organises the talk: 'I'll start with…', 'the second cause…', 'so what can cities do?'. Note the main points, not every example." },
      { kind: "listening", heading: "Lecture: why cities are hotter", voices: { Lecturer: "female" }, script: "Lecturer: Good morning. Today I want to explain why cities are often several degrees warmer than the countryside around them — something we call the urban heat island effect.\nI'll start with the materials. Roads and roofs made of asphalt and concrete absorb heat during the day and release it slowly at night. That's why city nights, in particular, stay warm.\nThe second cause is the lack of vegetation. Trees cool the air in two ways: they provide shade, and they release water through their leaves, which cools the surrounding air. When we replace trees with buildings, we lose both effects.\nThird, human activity itself produces heat — air conditioners, traffic, factories. Ironically, the more we use air conditioning to escape the heat, the more heat we pump into the street.\nSo what can cities do? The cheapest solution is often to plant trees along streets. Some cities also paint roofs white, which reflects sunlight. And in Singapore, new buildings must include gardens to replace the green space they take up.\nNext week we'll look at how these measures are paid for." },
      { kind: "practice", instruction: "Listen and choose the best answer.", questions: [
        lq("When is the heat island effect especially noticeable, according to the lecture?", ["At night", "Early in the morning", "In winter"], 0, "Materials release heat slowly at night, so city nights stay warm."),
        lq("How do trees cool the air?", ["Only by giving shade", "By giving shade and releasing water", "By absorbing traffic noise"], 1, "Shade plus water released through their leaves."),
        lq("What is ironic about air conditioning?", ["It is cheap.", "It is banned in some cities.", "It adds heat to the street."], 2, "Using air conditioning pumps more heat into the street."),
        lq("What is described as the cheapest solution?", ["Planting street trees", "Painting roofs white", "Building gardens on roofs"], 0, "The cheapest solution is often to plant trees."),
        lq("What rule is mentioned about Singapore?", ["All roofs must be white.", "New buildings must include gardens.", "Cars are banned in the centre."], 1, "New buildings must include gardens."),
        lq("What will the next lecture be about?", ["Air pollution", "How the measures are paid for", "The history of Singapore"], 1, "Next week… how these measures are paid for.")
      ] }
    ]
  },
  {
    key: "skills:b2:speaking-problem", batch: "lessons", level: "B2", unit: B2, slug: "speaking-solving-a-problem-together", title: "Speak: solving a problem together", skill: "SPEAKING", minutes: 16,
    blocks: [
      { kind: "text", heading: "Useful language", body: "Suggesting: What if we…? / How about…? / It might be worth -ing… / Why don't we…?\nEvaluating: That could work, but… / The main advantage is… / The downside is… / It depends on…\nComparing options: …is more practical than… / On balance, I'd go for…\nReaching a decision: So shall we agree on…? / Let's go with…, then.\n\nIn a discussion task, react to your partner's ideas before adding your own." },
      { kind: "listening", heading: "Model discussion: a club with falling membership", voices: { Hana: "female", Omar: "male" }, script: "Hana: Our photography club has lost half its members this year. What do you think we should do?\nOmar: How about moving the meetings online? People are busy after work.\nHana: That could work, but the whole point is taking photos together outside.\nOmar: Fair enough. What if we changed the meeting time to Saturday mornings instead?\nHana: That's more practical. The downside is that some members work at weekends.\nOmar: It might be worth asking them. We could send a quick survey with three possible times.\nHana: Good idea. And maybe we could run a free workshop for beginners to attract new people.\nOmar: So shall we agree on a survey first and a beginners' workshop next month?\nHana: Let's go with that." },
      { kind: "practice", instruction: "Choose the best answer.", questions: [
        lq("Why does Hana reject the online idea?", ["It is too expensive.", "The club is about taking photos together outside.", "Members don't have computers."], 1, "The whole point is taking photos together outside."),
        lq("Which phrase makes a suggestion?", ["The downside is…", "It might be worth asking them.", "Fair enough."], 1, "It might be worth -ing… suggests an action."),
        lq("What do they decide to do first?", ["Send a survey", "Cancel the meetings", "Buy new cameras"], 0, "A survey first and a beginners' workshop next month."),
        lq("Which phrase evaluates a disadvantage?", ["How about…?", "Let's go with that.", "The downside is…"], 2, "The downside is… introduces a disadvantage."),
        lq("What does 'Fair enough' show in the discussion?", ["Omar accepts Hana's point.", "Omar is angry.", "Omar wants to finish."], 0, "Fair enough = I accept that."),
        lq("Which reply reacts to a partner before adding an idea?", ["No. Next idea.", "That's a good point — and we could also…", "I have my own idea."], 1, "It acknowledges the partner first, then builds on it.")
      ] }
    ]
  },
  {
    key: "skills:b2:writing-opinion", batch: "lessons", level: "B2", unit: B2, slug: "writing-an-opinion-paragraph", title: "Write: a well-supported opinion paragraph", skill: "WRITING", minutes: 18,
    blocks: [
      { kind: "text", heading: "Model paragraph", body: "Question: Should university education be free?\n\nIn my view, university education should be free for students from low-income families, but not necessarily for everyone. The main reason is fairness: talented young people should not lose the chance to study simply because their parents cannot pay. For example, a scholarship programme in my province has allowed hundreds of students from rural areas to become engineers and teachers, who then return to work in their communities. However, making university free for all would be extremely expensive and would benefit wealthy families who could easily afford the fees. Therefore, targeted support is a more effective use of public money than free tuition for everyone." },
      { kind: "text", heading: "How the paragraph works", body: "Topic sentence: states a clear, specific opinion.\nReason: The main reason is…\nSupport: an example or evidence (For example, …).\nCounter-point: However, … — shows you have considered another view.\nConcluding sentence: Therefore, … — returns to the opinion.\n\nUseful linkers: Firstly, Moreover, In addition, For instance, However, On the other hand, As a result, Therefore." },
      { kind: "practice", instruction: "Choose the best answer.", questions: [
        lq("What is the writer's opinion?", ["University should be free for everyone.", "University should be free for students from low-income families.", "Students should always pay full fees."], 1, "The topic sentence limits free education to low-income families."),
        lq("What is the purpose of the scholarship example?", ["To support the main reason", "To introduce a counter-argument", "To conclude the paragraph"], 0, "It gives evidence for the fairness argument."),
        lq("Which sentence introduces a counter-point?", ["In my view, …", "For example, …", "However, making university free for all…"], 2, "However introduces the opposing consideration."),
        lq("Choose the best linker: 'Public transport is cheap. ___, it reduces pollution.'", ["However", "Moreover", "Therefore"], 1, "Moreover adds a further point in the same direction."),
        lq("Which is the strongest topic sentence?", ["There are many opinions about homework.", "Homework is a thing in schools.", "Primary schools should limit homework to twenty minutes a day."], 2, "It states a clear, specific position."),
        lq("What does the final sentence do?", ["It adds a new example.", "It restates the opinion as a conclusion.", "It asks the reader a question."], 1, "Therefore, targeted support… returns to the main opinion.")
      ] }
    ]
  }
];
