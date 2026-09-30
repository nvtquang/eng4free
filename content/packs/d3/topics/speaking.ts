import type { TopicCategoryDef } from "../types";

type Text = { vi: string; en: string };
type TopicSource = { id: string; title: Text; prompt: Text; suggestions: string[] };
type CategorySource = { id: string; title: Text; topics: TopicSource[] };

const t = (id: string, vi: string, en: string, promptVi: string, promptEn: string, suggestions: string[]): TopicSource => ({ id, title: { vi, en }, prompt: { vi: promptVi, en: promptEn }, suggestions });

/**
 * Free-talk speaking topics grouped by theme. There is no level per topic: any learner
 * can answer at their own level. Each topic id is derived from its key (`topic:speak:<id>`)
 * and history points at it, so keep ids stable — renaming one detaches its saved history.
 * Suggestions are English starter sentences, shared by both interface languages.
 */
const categories: CategorySource[] = [
  { id: "about-you", title: { vi: "Bản thân & gia đình", en: "You & your family" }, topics: [
    t("introduce-yourself", "Giới thiệu bản thân", "Introduce yourself", "Hãy giới thiệu về bản thân bạn.", "Introduce yourself.", ["My name is ___ and I'm from ___.", "I'm a student/I work as ___.", "People say I'm quite ___.", "In my free time I like ___."]),
    t("family", "Gia đình của bạn", "Your family", "Hãy giới thiệu về gia đình của bạn.", "Introduce your family.", ["There are ___ people in my family.", "I'm closest to my ___ because ___.", "At weekends we usually ___ together.", "One thing I admire about them is ___."]),
    t("daily-routine", "Một ngày của bạn", "Your daily routine", "Mô tả một ngày bình thường của bạn.", "Describe a typical day for you.", ["I usually get up at ___.", "After breakfast I ___.", "The busiest part of my day is ___.", "Before bed I like to ___."]),
    t("best-friend", "Người bạn thân", "Your best friend", "Kể về người bạn thân nhất của bạn.", "Talk about your best friend.", ["My best friend is ___; we met ___.", "What I like most about them is ___.", "We often ___ together.", "We have been friends for ___."]),
    t("personality", "Tính cách của bạn", "Your personality", "Bạn mô tả tính cách của mình thế nào?", "How would you describe your personality?", ["I'd say I'm quite ___.", "For example, when ___, I usually ___.", "My friends often tell me I'm ___.", "One thing I'd like to change is ___."]),
    t("someone-you-admire", "Người bạn ngưỡng mộ", "Someone you admire", "Kể về một người bạn ngưỡng mộ.", "Talk about someone you admire.", ["The person I admire most is ___.", "I first learned about them when ___.", "What impresses me is ___.", "They've taught me to ___."]),
    t("childhood-memory", "Kỷ niệm tuổi thơ", "A childhood memory", "Kể về một kỷ niệm tuổi thơ đáng nhớ.", "Describe a memorable moment from your childhood.", ["When I was about ___, I ___.", "I remember it clearly because ___.", "At the time I felt ___.", "Looking back, I realise ___."])
  ] },
  { id: "places", title: { vi: "Nơi chốn & đời sống", en: "Places & daily life" }, topics: [
    t("hometown", "Quê hương / nơi bạn sống", "Your hometown", "Mô tả quê hương hoặc nơi bạn đang sống.", "Describe your hometown or the place you live.", ["I'm from ___, which is ___.", "The best thing about living there is ___.", "It's famous for ___.", "If you visited, I would take you to ___."]),
    t("your-home", "Ngôi nhà của bạn", "Your home", "Mô tả ngôi nhà hoặc căn phòng của bạn.", "Describe your home or your room.", ["I live in a ___ with ___.", "My favourite room is ___ because ___.", "In my room there is ___.", "If I could change one thing, I would ___."]),
    t("neighbourhood", "Khu phố của bạn", "Your neighbourhood", "Khu phố bạn sống có gì đặc biệt?", "What is your neighbourhood like?", ["My neighbourhood is ___.", "Near my house there's ___.", "The people there are ___.", "What it really needs is ___."]),
    t("city-or-countryside", "Thành phố hay nông thôn", "City or countryside", "Bạn thích sống ở thành phố hay nông thôn?", "Would you rather live in a city or the countryside?", ["I'd rather live in ___.", "The main reason is ___.", "On the other hand, ___.", "Maybe one day I'll ___."]),
    t("transport", "Đi lại hằng ngày", "Getting around", "Bạn thường di chuyển bằng phương tiện gì?", "How do you usually get around?", ["I usually go by ___.", "It takes me about ___ to get to ___.", "Traffic where I live is ___.", "I wish there were more ___."]),
    t("weather-seasons", "Thời tiết & mùa", "Weather & seasons", "Bạn thích mùa nào nhất và vì sao?", "Which season do you like best and why?", ["My favourite season is ___.", "The weather is usually ___.", "During that season I like to ___.", "I don't like ___ because ___."])
  ] },
  { id: "food-drink", title: { vi: "Ẩm thực", en: "Food & drink" }, topics: [
    t("food", "Món ăn bạn yêu thích", "Food you love", "Mô tả một món ăn bạn yêu thích và lý do.", "Describe a dish you love and why.", ["My favourite dish is ___.", "It's made with ___.", "I usually eat it when ___.", "What I love most about it is ___."]),
    t("cooking", "Nấu ăn", "Cooking", "Bạn có biết nấu ăn không? Kể về một món bạn nấu được.", "Can you cook? Talk about something you can make.", ["I can make ___.", "First you ___, then ___.", "I learned it from ___.", "The trickiest part is ___."]),
    t("street-food", "Ẩm thực đường phố", "Street food", "Giới thiệu một món ăn đường phố nơi bạn sống.", "Recommend a street food from where you live.", ["You should definitely try ___.", "It's sold ___ and costs about ___.", "It tastes ___.", "The best place to get it is ___."]),
    t("eating-out", "Đi ăn ngoài", "Eating out", "Bạn thích ăn ở nhà hay ăn ngoài hơn?", "Do you prefer eating at home or eating out?", ["I usually eat ___.", "Eating out is nice because ___.", "But at home ___.", "My favourite restaurant is ___."]),
    t("coffee-tea", "Cà phê & trà", "Coffee & tea", "Bạn thích cà phê hay trà? Thói quen uống của bạn thế nào?", "Coffee or tea? Describe your drinking habits.", ["I'm more of a ___ person.", "I usually have it ___.", "My favourite place for it is ___.", "I've been trying to ___."])
  ] },
  { id: "free-time", title: { vi: "Sở thích & giải trí", en: "Hobbies & fun" }, topics: [
    t("hobbies", "Sở thích & thời gian rảnh", "Hobbies & free time", "Bạn thường làm gì trong thời gian rảnh?", "What do you usually do in your free time?", ["In my free time I love ___.", "I got into it because ___.", "I usually do it ___.", "It helps me relax because ___."]),
    t("music", "Âm nhạc", "Music", "Bạn thích nghe loại nhạc nào?", "What kind of music do you enjoy?", ["I mostly listen to ___.", "My favourite singer/band is ___.", "I listen to music when ___.", "A song that means a lot to me is ___."]),
    t("film-or-book", "Phim / sách yêu thích", "A film or book you like", "Kể về một bộ phim hoặc cuốn sách bạn thích.", "Talk about a film or book you enjoyed.", ["It's called ___ and it's about ___.", "The main character is ___.", "The part I liked most was ___.", "I'd recommend it to ___ because ___."]),
    t("games", "Trò chơi", "Games", "Bạn có chơi game (điện tử hoặc board game) không?", "Do you play any games — video games or board games?", ["I often play ___.", "What I enjoy is ___.", "I usually play with ___.", "Some people think games are ___, but ___."]),
    t("photography", "Chụp ảnh", "Taking photos", "Bạn thích chụp ảnh gì? Kể về một bức ảnh bạn thích.", "What do you like taking photos of? Describe a favourite photo.", ["I mostly take photos of ___.", "My favourite photo shows ___.", "I took it when ___.", "It reminds me of ___."]),
    t("weekend", "Cuối tuần lý tưởng", "Your ideal weekend", "Mô tả một ngày cuối tuần lý tưởng của bạn.", "Describe your ideal weekend.", ["On Saturday morning I would ___.", "Then I'd meet ___ and ___.", "In the evening I'd ___.", "It would be perfect because ___."])
  ] },
  { id: "sport-health", title: { vi: "Thể thao & sức khoẻ", en: "Sport & health" }, topics: [
    t("sport", "Thể thao & vận động", "Sport & exercise", "Bạn có chơi thể thao hay tập luyện không?", "Do you play any sport or exercise regularly?", ["I play/do ___ about ___ a week.", "I started because ___.", "It keeps me ___.", "The hardest part is ___."]),
    t("health", "Giữ gìn sức khoẻ", "Staying healthy", "Bạn làm gì để giữ sức khoẻ?", "What do you do to stay healthy?", ["To stay healthy I try to ___.", "I'd like to ___ more.", "A bad habit I'm trying to change is ___.", "I think the most important thing is ___."]),
    t("sleep", "Giấc ngủ", "Sleep", "Bạn ngủ có đủ không? Thói quen ngủ của bạn thế nào?", "Do you get enough sleep? Describe your sleep habits.", ["I usually sleep about ___ hours.", "I find it hard to sleep when ___.", "Before bed I ___.", "I feel best when ___."]),
    t("stress", "Căng thẳng & thư giãn", "Stress & relaxing", "Bạn thường làm gì khi căng thẳng?", "What do you do when you feel stressed?", ["I get stressed when ___.", "To calm down I ___.", "Talking to ___ really helps.", "I've learned that ___."]),
    t("sports-event", "Một trận đấu đáng nhớ", "A sports event", "Kể về một trận đấu hay sự kiện thể thao bạn nhớ.", "Describe a sports event you remember.", ["I watched ___ with ___.", "The most exciting moment was ___.", "Everyone around me ___.", "It was memorable because ___."])
  ] },
  { id: "study", title: { vi: "Học tập", en: "Study" }, topics: [
    t("learning-english", "Việc học tiếng Anh", "Learning English", "Vì sao bạn học tiếng Anh và bạn học như thế nào?", "Why are you learning English, and how do you study?", ["I'm learning English because ___.", "I usually practise by ___.", "The hardest part for me is ___.", "My goal is to ___."]),
    t("useful-skill", "Một kỹ năng hữu ích", "A useful skill", "Hãy kể về một kỹ năng hữu ích bạn đã học và cách bạn học kỹ năng đó.", "Talk about a useful skill you learned and explain how you learned it.", ["A skill I find really useful is ___.", "I started learning it when ___.", "The hardest part was ___, but I kept practising.", "Now I use it to ___."]),
    t("school-subject", "Môn học yêu thích", "A favourite subject", "Môn học nào bạn thích nhất ở trường?", "Which school subject did you enjoy most?", ["My favourite subject was ___.", "I liked it because ___.", "My teacher ___.", "It has helped me ___."]),
    t("favourite-teacher", "Một thầy cô đáng nhớ", "A memorable teacher", "Kể về một thầy cô đã ảnh hưởng tới bạn.", "Talk about a teacher who influenced you.", ["The teacher I remember most is ___.", "They taught ___.", "What made them special was ___.", "Because of them, I ___."]),
    t("online-learning", "Học online", "Learning online", "Học online có hiệu quả với bạn không?", "Does learning online work well for you?", ["I've taken online courses in ___.", "The good thing is ___.", "The difficult part is ___.", "I learn best when ___."]),
    t("exams", "Thi cử", "Exams", "Bạn chuẩn bị cho kỳ thi như thế nào?", "How do you prepare for exams?", ["Before an exam I usually ___.", "The night before, I ___.", "I feel ___ during exams.", "My best tip is ___."])
  ] },
  { id: "work", title: { vi: "Công việc & sự nghiệp", en: "Work & career" }, topics: [
    t("dream-job", "Công việc mơ ước", "Your dream job", "Công việc mơ ước của bạn là gì?", "What is your dream job?", ["My dream job is to be a ___.", "I'd love it because ___.", "To get there I need to ___.", "A typical day would involve ___."]),
    t("first-job", "Công việc đầu tiên", "A first job", "Kể về công việc đầu tiên của bạn (hoặc công việc bạn muốn thử).", "Describe your first job, or a job you'd like to try.", ["My first job was ___.", "My main tasks were ___.", "I learned how to ___.", "The most difficult thing was ___."]),
    t("teamwork", "Làm việc nhóm", "Working in a team", "Kể về một lần bạn làm việc nhóm và bạn học được gì.", "Describe a time you worked in a team and what you learned.", ["We had to ___ within ___.", "My role was to ___.", "One challenge we faced was ___.", "It taught me that ___."]),
    t("work-from-home", "Làm việc tại nhà", "Working from home", "Bạn thấy làm việc tại nhà thế nào?", "What do you think about working from home?", ["Working from home is great for ___.", "However, it's hard to ___.", "I stay focused by ___.", "Ideally, I'd work ___."]),
    t("success", "Thành công là gì", "What success means", "Với bạn, thành công nghĩa là gì?", "What does success mean to you?", ["For me, success means ___.", "Some people think it's about ___.", "I'd feel successful if ___.", "Someone I see as successful is ___."])
  ] },
  { id: "travel", title: { vi: "Du lịch", en: "Travel" }, topics: [
    t("travel", "Một chuyến đi đáng nhớ", "A memorable trip", "Kể về một chuyến đi đáng nhớ của bạn.", "Tell me about a memorable trip you took.", ["A trip I'll never forget was to ___.", "I went there with ___.", "The highlight was ___.", "It changed how I think about ___."]),
    t("dream-destination", "Nơi bạn muốn đến", "A place you want to visit", "Bạn muốn đi du lịch đến đâu nhất? Vì sao?", "Where would you most like to travel, and why?", ["I'd love to visit ___.", "I've always wanted to see ___.", "I would spend my time ___.", "It appeals to me because ___."]),
    t("holiday-type", "Kiểu kỳ nghỉ bạn thích", "Your kind of holiday", "Bạn thích đi biển, leo núi hay khám phá thành phố?", "Beach, mountains or city break — which do you prefer?", ["My ideal holiday is ___.", "I like it because ___.", "I usually travel with ___.", "I always pack ___."]),
    t("travel-problem", "Sự cố khi đi du lịch", "A travel problem", "Kể về một lần gặp sự cố khi đi du lịch.", "Describe a problem you had while travelling.", ["While I was in ___, ___ happened.", "At first I ___.", "In the end, ___.", "Next time I'll ___."]),
    t("tourists", "Khách du lịch ở nơi bạn sống", "Tourists where you live", "Du lịch ảnh hưởng thế nào tới nơi bạn sống?", "How does tourism affect the place where you live?", ["Many tourists come to see ___.", "It's good for ___.", "But it can also ___.", "Visitors should ___."])
  ] },
  { id: "culture", title: { vi: "Văn hoá & lễ hội", en: "Culture & traditions" }, topics: [
    t("festival", "Lễ hội / ngày Tết", "A festival you celebrate", "Mô tả một lễ hội bạn thường đón, ví dụ Tết.", "Describe a festival you celebrate, such as Lunar New Year.", ["The festival I love most is ___.", "Before it, people usually ___.", "On the day, my family ___.", "It's important to me because ___."]),
    t("local-tradition", "Một phong tục địa phương", "A local tradition", "Giới thiệu một phong tục ở nơi bạn sống cho người nước ngoài.", "Explain a local tradition to someone from another country.", ["In my country, it's common to ___.", "It comes from ___.", "Young people today ___.", "I think it should be kept because ___."]),
    t("wedding", "Một đám cưới", "A wedding", "Kể về một đám cưới bạn từng dự.", "Describe a wedding you went to.", ["It was the wedding of my ___.", "The ceremony was ___.", "Guests usually ___.", "The part I enjoyed most was ___."]),
    t("gifts", "Tặng quà", "Giving gifts", "Kể về một món quà bạn đã tặng hoặc nhận.", "Talk about a gift you gave or received.", ["The best gift I've ever received was ___.", "It was from ___.", "It meant a lot because ___.", "In my culture, people often give ___."]),
    t("culture-difference", "Khác biệt văn hoá", "A cultural difference", "Kể về một khác biệt văn hoá khiến bạn bất ngờ.", "Describe a cultural difference that surprised you.", ["I was surprised that ___.", "In my country we ___.", "At first I felt ___.", "Now I understand that ___."])
  ] },
  { id: "technology", title: { vi: "Công nghệ", en: "Technology" }, topics: [
    t("technology", "Công nghệ trong đời sống", "Technology in daily life", "Nói về một thiết bị hoặc ứng dụng công nghệ bạn dùng hằng ngày.", "Talk about a device or app you use every day.", ["The app/device I use most is ___.", "I mainly use it for ___.", "Before I had it, I used to ___.", "One downside is ___."]),
    t("smartphones", "Điện thoại & thời gian dùng", "Phones & screen time", "Bạn dùng điện thoại bao nhiêu mỗi ngày? Có quá nhiều không?", "How much do you use your phone? Is it too much?", ["I spend about ___ on my phone.", "Mostly I ___.", "I'd like to cut down on ___.", "A day without my phone would be ___."]),
    t("artificial-intelligence", "Trí tuệ nhân tạo", "Artificial intelligence", "AI đang thay đổi cuộc sống của bạn thế nào?", "How is AI changing your life?", ["I've used AI to ___.", "It's really helpful for ___.", "What worries me is ___.", "In the future, AI might ___."]),
    t("online-safety", "An toàn trên mạng", "Staying safe online", "Bạn làm gì để an toàn khi dùng internet?", "What do you do to stay safe online?", ["I always ___.", "I never ___.", "Once, I almost ___.", "Young people should ___."]),
    t("invention", "Một phát minh quan trọng", "An important invention", "Theo bạn, phát minh nào quan trọng nhất?", "Which invention do you think is the most important?", ["I think ___ is the most important invention.", "Before it, people had to ___.", "It changed ___.", "Life without it would be ___."])
  ] },
  { id: "media", title: { vi: "Truyền thông & mạng xã hội", en: "Media & social media" }, topics: [
    t("social-media", "Mạng xã hội", "Social media", "Mạng xã hội ảnh hưởng tốt hay xấu đến bạn?", "Is social media good or bad for you?", ["I spend about ___ a day on ___.", "On the positive side, ___.", "However, it can ___.", "To use it wisely, I ___."]),
    t("news", "Tin tức", "Following the news", "Bạn theo dõi tin tức bằng cách nào?", "How do you follow the news?", ["I usually get the news from ___.", "I'm most interested in ___.", "I check whether it's true by ___.", "A recent story I noticed was ___."]),
    t("advertising", "Quảng cáo", "Advertising", "Quảng cáo có ảnh hưởng đến việc bạn mua sắm không?", "Does advertising affect what you buy?", ["I often see ads on ___.", "An ad I remember is ___.", "It made me want to ___.", "I think ads should ___."]),
    t("influencers", "Người có sức ảnh hưởng", "Influencers", "Bạn nghĩ gì về các influencer trên mạng?", "What do you think about online influencers?", ["I follow ___ because ___.", "Some influencers ___.", "They can be a good example when ___.", "Young people should remember that ___."])
  ] },
  { id: "money", title: { vi: "Tiền bạc & mua sắm", en: "Money & shopping" }, topics: [
    t("shopping", "Mua sắm", "Shopping", "Bạn thích mua sắm trực tiếp hay online? Vì sao?", "Do you prefer shopping in stores or online? Why?", ["I usually shop ___.", "The main advantage is ___.", "Last time I bought ___.", "One problem with it is ___."]),
    t("saving-money", "Tiết kiệm tiền", "Saving money", "Bạn tiết kiệm tiền như thế nào?", "How do you save money?", ["I try to save by ___.", "I'm saving for ___.", "It's hard not to spend on ___.", "My best money tip is ___."]),
    t("something-you-bought", "Một món đồ bạn đã mua", "Something you bought", "Kể về một món đồ bạn mua và rất hài lòng.", "Describe something you bought that you're happy with.", ["I recently bought ___.", "I chose it because ___.", "It cost about ___.", "It was worth it because ___."]),
    t("brands", "Thương hiệu", "Brands", "Bạn có quan tâm đến thương hiệu khi mua đồ không?", "Do brands matter to you when you shop?", ["For ___, I always choose ___.", "For other things, I just ___.", "I think people buy brands because ___.", "Price matters more when ___."])
  ] },
  { id: "nature", title: { vi: "Thiên nhiên & môi trường", en: "Nature & environment" }, topics: [
    t("environment", "Bảo vệ môi trường", "Protecting the environment", "Mỗi người có thể làm gì để bảo vệ môi trường?", "What can individuals do to protect the environment?", ["One serious problem where I live is ___.", "Individuals can ___.", "Governments should also ___.", "Personally, I've started to ___."]),
    t("animals", "Động vật & thú cưng", "Animals & pets", "Bạn có nuôi thú cưng không? Bạn thích con vật nào?", "Do you have a pet? What animal do you like?", ["I have/I'd love a ___.", "It's ___ and ___.", "Looking after it means ___.", "Animals make people ___."]),
    t("plastic", "Rác thải nhựa", "Plastic waste", "Bạn làm gì để giảm rác thải nhựa?", "What do you do to use less plastic?", ["I try to avoid ___.", "Instead, I use ___.", "Shops could help by ___.", "It's difficult because ___."]),
    t("outdoor-place", "Một nơi ngoài trời bạn thích", "A favourite outdoor place", "Mô tả một công viên hoặc nơi thiên nhiên bạn thích.", "Describe a park or natural place you like.", ["I love going to ___.", "It's full of ___.", "I usually go there to ___.", "It makes me feel ___."]),
    t("climate", "Thời tiết cực đoan", "Extreme weather", "Nơi bạn sống có bị ảnh hưởng bởi thời tiết cực đoan không?", "Has extreme weather affected where you live?", ["Where I live, we sometimes get ___.", "Last time, ___.", "People prepare by ___.", "I'm worried that ___."])
  ] },
  { id: "society", title: { vi: "Xã hội & con người", en: "People & society" }, topics: [
    t("helping-others", "Giúp đỡ người khác", "Helping others", "Kể về một lần bạn giúp đỡ ai đó.", "Talk about a time you helped someone.", ["Once, I helped ___.", "They needed ___.", "Afterwards I felt ___.", "Small acts of kindness ___."]),
    t("generations", "Khác biệt thế hệ", "Different generations", "Thế hệ của bạn khác thế hệ ông bà thế nào?", "How is your generation different from your grandparents'?", ["My grandparents grew up ___.", "Today, young people ___.", "One thing that hasn't changed is ___.", "We could learn from them about ___."]),
    t("future-city", "Thành phố trong tương lai", "Cities of the future", "Bạn nghĩ thành phố của bạn sẽ thay đổi thế nào trong 20 năm tới?", "How do you think your city will change in the next 20 years?", ["In 20 years, I expect ___.", "Technology will probably ___.", "One risk is that ___.", "I hope that ___."]),
    t("rules", "Một quy định bạn muốn thay đổi", "A rule you'd change", "Nếu được thay đổi một quy định, bạn sẽ đổi gì?", "If you could change one rule, what would it be?", ["I would change the rule about ___.", "At the moment, ___.", "Instead, I'd ___.", "This would help ___."]),
    t("volunteering", "Tình nguyện", "Volunteering", "Bạn có từng tham gia hoạt động tình nguyện không?", "Have you ever done volunteer work?", ["I volunteered at ___.", "We ___.", "The experience taught me ___.", "More people should ___."])
  ] },
  { id: "stories", title: { vi: "Kể chuyện & trải nghiệm", en: "Stories & experiences" }, topics: [
    t("proud-moment", "Khoảnh khắc tự hào", "A proud moment", "Kể về một lần bạn thấy rất tự hào về bản thân.", "Describe a moment you felt proud of yourself.", ["I felt really proud when ___.", "It took ___ to achieve.", "People around me ___.", "It showed me that ___."]),
    t("a-mistake", "Một sai lầm đáng nhớ", "A mistake you learned from", "Kể về một sai lầm và bài học bạn rút ra.", "Talk about a mistake you learned from.", ["Once, I made the mistake of ___.", "As a result, ___.", "I fixed it by ___.", "Now I always ___."]),
    t("surprise", "Một bất ngờ", "A surprise", "Kể về một lần bạn thật sự bất ngờ.", "Describe a time you were really surprised.", ["I was so surprised when ___.", "I didn't expect ___.", "My reaction was ___.", "It turned out that ___."]),
    t("good-decision", "Một quyết định đúng đắn", "A good decision", "Kể về một quyết định quan trọng bạn đã đưa ra.", "Describe an important decision you made.", ["I had to decide whether to ___.", "I thought about ___.", "In the end I ___.", "I'm glad because ___."]),
    t("funny-story", "Một chuyện vui", "A funny story", "Kể một câu chuyện vui đã xảy ra với bạn.", "Tell a funny story that happened to you.", ["This happened when ___.", "Suddenly, ___.", "Everyone started ___.", "We still laugh about ___."])
  ] },
  { id: "future", title: { vi: "Tương lai & ước mơ", en: "Future & dreams" }, topics: [
    t("goals", "Mục tiêu năm tới", "Your goals for next year", "Mục tiêu của bạn trong năm tới là gì?", "What are your goals for next year?", ["Next year I want to ___.", "To do that, I'll ___.", "The biggest challenge will be ___.", "I'll know I've succeeded when ___."]),
    t("life-in-ten-years", "Bạn sau 10 năm", "You in ten years", "Bạn hình dung cuộc sống của mình 10 năm nữa thế nào?", "Where do you see yourself in ten years?", ["In ten years, I hope to ___.", "I'll probably be living ___.", "I'd like to have ___.", "What matters most to me is ___."]),
    t("bucket-list", "Những điều muốn làm một lần trong đời", "Your bucket list", "Kể vài điều bạn muốn làm ít nhất một lần trong đời.", "Name a few things you want to do at least once in your life.", ["One thing on my list is ___.", "I've wanted to do it since ___.", "Another is ___.", "I'll start by ___."]),
    t("if-you-were-rich", "Nếu bạn rất giàu", "If you were rich", "Nếu có thật nhiều tiền, bạn sẽ làm gì?", "What would you do if you had a lot of money?", ["If I were rich, I would ___.", "I'd also help ___.", "I wouldn't ___.", "But money can't ___."])
  ] }
];

/** Upper-intermediate/advanced frames (B2–C1: inversion, conditionals, cleft and concessive structures) per topic id. */
const advancedSuggestions: Record<string, string[]> = {
  "introduce-yourself": ["What really drives me is ___, which is why I ___.", "If I had to sum myself up in three words, I'd say ___."],
  "family": ["Growing up in a ___ family taught me the value of ___.", "Although we don't always see eye to eye on ___, we ___."],
  "daily-routine": ["Unless something unexpected comes up, I tend to ___.", "Over the past year my routine has shifted towards ___, mainly because ___."],
  "best-friend": ["What I value most is that we can ___ without ___.", "Having known each other since ___, we've been through ___ together."],
  "personality": ["I'd describe myself as someone who ___, although I can be ___ at times.", "It's only recently that I've come to realise ___."],
  "someone-you-admire": ["What sets them apart is the way they ___ even when ___.", "Had it not been for their example, I probably wouldn't have ___."],
  "childhood-memory": ["It's funny how vividly I can still recall ___.", "Only years later did I understand why ___."],
  "hometown": ["What makes it stand out, in my view, is ___.", "It has changed almost beyond recognition since ___, largely due to ___."],
  "your-home": ["It may not be ___, but it's ___, which matters more to me.", "If I were to redesign it, I'd prioritise ___ over ___."],
  "neighbourhood": ["It strikes a nice balance between ___ and ___.", "The one thing that would make a real difference is ___."],
  "city-or-countryside": ["While city life offers ___, it comes at the cost of ___.", "I suspect that as I get older I'll be drawn more to ___."],
  "transport": ["Were public transport more ___, far fewer people would ___.", "Commuting every day has made me realise how much time ___."],
  "weather-seasons": ["There's something about ___ that puts me in a ___ mood.", "The weather here has become noticeably ___ in recent years."],
  "food": ["What makes it special is the balance between ___ and ___.", "It's the kind of dish that instantly takes me back to ___."],
  "cooking": ["The secret, as far as I'm concerned, is to ___ rather than ___.", "Once you've mastered ___, it's surprisingly easy to ___."],
  "street-food": ["It's hard to beat the combination of ___ and ___.", "Visitors are often surprised to find that ___."],
  "eating-out": ["For me, eating out is less about the food and more about ___.", "I've noticed that more and more people are choosing to ___."],
  "coffee-tea": ["For me, it's not so much the drink itself as ___.", "I've tried cutting down, but I find it hard to ___ without ___."],
  "hobbies": ["What started as ___ has gradually turned into ___.", "It gives me a sense of ___ that I rarely get from ___."],
  "music": ["Music has a way of ___ that words alone can't.", "My taste has changed considerably since ___, moving towards ___."],
  "film-or-book": ["What makes it compelling is the way it explores ___.", "Without giving too much away, I'd say the ending ___."],
  "games": ["Contrary to popular belief, games can actually ___.", "The appeal, I think, lies in ___."],
  "photography": ["A good photo, in my opinion, captures ___ rather than just ___.", "What I try to do is ___ so that the viewer ___."],
  "weekend": ["Ideally, I'd strike a balance between ___ and ___.", "There's nothing quite like ___ after a long week."],
  "sport": ["Beyond the physical benefits, it has taught me ___.", "Had I started earlier, I might have ___."],
  "health": ["It's not about being perfect but about ___ consistently.", "I've come to realise that mental health is just as important as ___."],
  "sleep": ["The quality of my sleep has a huge impact on ___.", "Ever since I started ___, I've been sleeping ___."],
  "stress": ["What helps me most is putting things into perspective by ___.", "I've learned to recognise the early signs, such as ___."],
  "sports-event": ["The atmosphere was electric, especially when ___.", "Even though ___ lost, it was one of the most ___ matches I've ever seen."],
  "learning-english": ["The biggest breakthrough came when I stopped ___ and started ___.", "Even though I can ___, I still struggle to ___."],
  "useful-skill": ["It's the kind of skill that pays off in ways you don't expect, like ___.", "Looking back, the turning point was when ___."],
  "school-subject": ["It wasn't the subject itself so much as the way it was taught that ___.", "It sparked an interest in ___ that I've kept ever since."],
  "favourite-teacher": ["They had a knack for ___, which made even ___ interesting.", "I doubt I would have ___ if it hadn't been for them."],
  "online-learning": ["It works well provided that you ___.", "What online learning can't fully replace is ___."],
  "exams": ["I've found that ___ is far more effective than ___.", "Exams measure ___, but they don't necessarily reflect ___."],
  "dream-job": ["What draws me to it is the chance to ___.", "I'm aware it's highly competitive, so I'm working on ___."],
  "first-job": ["It threw me in at the deep end, but ___.", "It gave me a real insight into ___."],
  "teamwork": ["What made the difference was that everyone ___.", "If I could do it again, I'd make sure we ___ from the start."],
  "work-from-home": ["The flexibility is a huge plus, but it blurs the line between ___ and ___.", "In the long run, I think a hybrid model ___."],
  "success": ["Success is often measured by ___, but I'd argue ___ matters more.", "To me, someone is truly successful if they ___."],
  "travel": ["What struck me most was ___.", "It was the kind of trip that left me feeling ___ for weeks afterwards."],
  "dream-destination": ["It's been on my list ever since ___.", "Rather than just sightseeing, I'd want to ___."],
  "holiday-type": ["I'm the kind of traveller who prefers ___ to ___.", "The whole point of a holiday, for me, is to ___."],
  "travel-problem": ["It could have ruined the trip, but in hindsight ___.", "It taught me never to ___ without ___."],
  "tourists": ["Tourism is a double-edged sword: ___, yet ___.", "Local authorities should do more to ___."],
  "festival": ["It's a time when ___, regardless of ___.", "Although some customs have faded, ___ remains at the heart of it."],
  "local-tradition": ["It dates back to ___ and was originally meant to ___.", "It would be a real shame if ___."],
  "wedding": ["Traditional weddings here tend to ___, whereas modern ones ___.", "What moved me most was ___."],
  "gifts": ["It's the thought behind a gift, rather than its price, that ___.", "In my culture it's considered ___ to ___."],
  "culture-difference": ["What seemed strange at first gradually ___.", "It made me question assumptions I'd had about ___."],
  "technology": ["It has become so much a part of my life that ___.", "While it saves time, it has also made me ___."],
  "smartphones": ["I've started to notice that it's affecting my ___.", "Setting limits such as ___ has helped me ___."],
  "artificial-intelligence": ["It's remarkably good at ___, but it still can't ___.", "The key question, I think, is how we ___."],
  "online-safety": ["Many people underestimate how easily ___.", "It's worth taking a moment to ___ before ___."],
  "invention": ["It's hard to overstate the impact of ___ on ___.", "Ironically, it has also led to ___."],
  "social-media": ["It's a great way to ___, provided you ___.", "The danger is that we start comparing ___ with ___."],
  "news": ["With so much misinformation around, I make a point of ___.", "I find that reading ___ gives me a more balanced view."],
  "advertising": ["Advertising works in subtle ways, for instance by ___.", "I think there should be stricter rules on ___."],
  "influencers": ["The best influencers ___, while the worst ___.", "It's worth remembering that much of what we see is ___."],
  "shopping": ["Online shopping is convenient, but it makes it all too easy to ___.", "I've become much more conscious of ___ when I shop."],
  "saving-money": ["The trick is to ___ before you even see the money.", "Cutting back on ___ has made a surprisingly big difference."],
  "something-you-bought": ["It was a bit of a splurge, but ___.", "What convinced me in the end was ___."],
  "brands": ["Brands sell an image as much as a product, which is why ___.", "I'd rather pay more for ___ than save money on ___."],
  "environment": ["Small changes add up, but real progress depends on ___.", "It's frustrating that ___, even though we know ___."],
  "animals": ["Having a pet teaches you ___.", "I feel strongly that ___ should be protected because ___."],
  "plastic": ["It's not realistic to ___ completely, but we can ___.", "Businesses should take more responsibility for ___."],
  "outdoor-place": ["It's one of the few places where I can ___.", "Spending time there reminds me how important it is to ___."],
  "climate": ["What used to be rare is now becoming ___.", "Unless we ___, things are likely to get worse."],
  "helping-others": ["What I didn't expect was how much ___.", "It made me realise that helping doesn't have to be ___."],
  "generations": ["Each generation tends to see the next as ___, but ___.", "I think we have a lot to gain from ___."],
  "future-city": ["Cities will need to adapt to ___, particularly ___.", "The challenge will be to ___ without ___."],
  "rules": ["The rule may have made sense once, but nowadays ___.", "Changing it would, in my view, ___."],
  "volunteering": ["It gave me a completely different perspective on ___.", "Volunteering isn't just about giving — you also ___."],
  "proud-moment": ["It wasn't easy, and there were times when ___.", "What made it even more meaningful was that ___."],
  "a-mistake": ["At the time it felt like ___, but it turned out to be ___.", "If I could go back, I would ___."],
  "surprise": ["Never in a million years did I expect ___.", "It took me a while to ___."],
  "good-decision": ["It meant giving up ___, but ___.", "Looking back, it was a turning point because ___."],
  "funny-story": ["The funniest part was that ___ had no idea ___.", "To this day, whenever someone mentions ___, we ___."],
  "goals": ["Rather than setting vague goals, I'm going to ___.", "The real test will be whether I can ___."],
  "life-in-ten-years": ["I'd like to think that by then I'll have ___.", "Whatever happens, I hope I'll still ___."],
  "bucket-list": ["Some of these might sound ambitious, but ___.", "It's less about ticking boxes and more about ___."],
  "if-you-were-rich": ["I'd like to think I'd ___ rather than ___.", "Having that much money would probably change ___."]
};

/** Free-talk speaking topics (batch "topics"); session history links to the topic id derived from its key. */
export const speakingCategories: TopicCategoryDef[] = categories.map((category, index) => ({
  key: `topic-category:speak:${category.id}`, kind: "FREE_SPEAKING", slug: `speak-${category.id}`, title: category.title, sortOrder: index + 1,
  topics: category.topics.map((topic) => ({ key: `topic:speak:${topic.id}`, slug: `speak-${topic.id}`, title: topic.title, prompt: topic.prompt, suggestions: topic.suggestions, advanced: advancedSuggestions[topic.id] ?? [] }))
}));
