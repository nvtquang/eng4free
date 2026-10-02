/**
 * The demo learner's own writing and speaking, written for the seed as a B1 learner from Da Nang
 * would: mostly clear, with the article, tense and collocation slips such learners make, so the
 * feedback has something real to point at. Feedback on this work is produced by the app's own
 * AI pipeline (`pnpm seed:demo-account -- --capture-feedback`) and stored in captured-feedback.json.
 */

export type WritingWork = { key: string; topicSlug: string; taskType: "IELTS_TASK_1" | "IELTS_TASK_2"; dayOffset: number; revisions: string[] };
export type SpeakingWork = { key: string; topicSlug: string; part: "part2" | `part3:${number}`; dayOffset: number; durationMs: number; transcript: string };

export const writingWork: WritingWork[] = [
  {
    key: "task2-transport",
    topicSlug: "task-2-public-transport-or-roads",
    taskType: "IELTS_TASK_2",
    dayOffset: -12,
    revisions: [
      `Nowadays, traffic jam is a big problem in many cities. Some people think government should spend money for public transport instead of building more roads. I mostly agree with this idea.

Firstly, public transport can carry many people at the same time. For example, one bus can take forty passengers but forty motorbikes take a lot of space on the road. If the city have more buses and a metro, less people will use private vehicles and the traffic will be better. In my city, Da Nang, the bus system is still small, so most people go to work by motorbike and the roads is very crowded in the rush hour.

Secondly, public transport is better for the environment. Cars and motorbikes make a lot of pollution and noise. When people take the bus or the train, the air become cleaner and the city is more quiet.

However, building new roads is also necessary in some situation. In the countryside there are many places that buses can not reach, and people need good roads to travel and to sell their products.

In conclusion, I think governments should spend most of the money on public transport because it help to reduce traffic and pollution, but they should still build roads in the areas which really need them.`,
      `Nowadays, traffic congestion is a serious problem in many cities. Some people believe that governments should spend money on public transport rather than on building new roads. I largely agree with this view, although new roads are still needed in some places.

Firstly, public transport can carry far more people in the same amount of space. For example, one bus can take forty passengers, whereas forty motorbikes take up a large part of the road. If a city has more buses and a metro line, fewer people will use private vehicles and traffic will flow more smoothly. In my city, Da Nang, the bus network is still small, so most people ride a motorbike to work and the roads are very crowded during the rush hour.

Secondly, public transport is better for the environment. Cars and motorbikes produce a great deal of air pollution and noise. When more people take the bus or the train, the air becomes cleaner and the city becomes quieter, which improves the health of everyone who lives there.

On the other hand, building new roads is still necessary in certain situations. In rural areas there are many villages that buses cannot reach, and people there need good roads to travel to hospitals and schools and to sell their products in the city.

In conclusion, I believe governments should spend most of their transport budget on public transport, because it reduces both congestion and pollution. However, they should continue to build roads in the areas that genuinely need them.`
    ]
  },
  {
    key: "task1-leisure",
    topicSlug: "task-1-leisure-time-by-age",
    taskType: "IELTS_TASK_1",
    dayOffset: -5,
    revisions: [
      `The bar chart shows how many hours per week people in three age groups spent on four leisure activities: watching TV, using social media, doing sport and reading.

Overall, younger people spent the most time on social media, while older people preferred watching TV and reading. Sport was not very popular in any age group.

Looking at the details, people aged 16 to 24 used social media for 14 hours a week, which is the highest figure in the chart. They watched TV for 8 hours, did sport for 5 hours and only read for 2 hours. In the 25 to 44 group, TV was the most popular activity with 10 hours, followed by social media with 8 hours. This group spent 4 hours on sport and 3 hours on reading.

The oldest group, 45 and over, watched TV for 16 hours per week, which was double the youngest group. In contrast, they used social media for only 3 hours. They also spent 6 hours reading, more than the other groups, and 3 hours on sport.`
    ]
  }
];

export const speakingWork: SpeakingWork[] = [
  {
    key: "part2-favourite-place",
    topicSlug: "speaking-hometown-and-places",
    part: "part2",
    dayOffset: -8,
    durationMs: 104_000,
    transcript: "I would like to talk about My Khe beach in Da Nang, it is near my house, only about ten minutes by motorbike. I go there maybe two or three times a week, usually in the early morning before I go to work, because in the afternoon it is very hot and there is a lot of tourists. When I go there I often walk along the beach with my friend and sometimes we swim if the sea is calm. After that we sit in a small cafe and drink coffee and talk about our plan for the day. I enjoy this place because it make me feel relax. The air is fresh and I can see the sun rise over the sea, it is really beautiful. Also, it is a good way to start the day before I go to the office and sit in front of the computer for many hours. I think every city should have a place like this where people can go to relax for free.",
  },
  {
    key: "part3-public-places",
    topicSlug: "speaking-hometown-and-places",
    part: "part3:0",
    dayOffset: -3,
    durationMs: 58_000,
    transcript: "I think some public places become popular because they are easy to go and they have many things to do. For example, a park in the city center with trees, a playground and some food stall will attract many families at the weekend. On the other hand, some places are rarely used because they are too far or there is no shade, so in summer nobody want to stay there. I also think social media is important now, if a place looks nice in photos, young people will come to visit it and take pictures.",
  }
];
