import type { PromptDef } from "../types";
import { broadbandChart, chartImage, leisureChart, visitorsTable } from "./charts";

const TASK1 = "You should spend about 20 minutes on this task. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.";
const TASK2 = "You should spend about 40 minutes on this task. Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.";
const SPEAKING = "Part 1: answer each question in two or three sentences. Part 2: you have one minute to prepare and should speak for one to two minutes. Part 3: discuss the questions in more depth.";

export const writingPrompts: PromptDef[] = [
  { key: "writing:t1:broadband", slug: "task-1-broadband-households", kind: "IELTS_WRITING_TASK_1", title: "Task 1 · Broadband access in three countries (line graph)", sortOrder: 1,
    content: { instructions: TASK1, minWords: 150, minutes: 20, prompt: "The graph below shows the percentage of households with a broadband internet connection in three countries between 2004 and 2024.", image: chartImage(broadbandChart, "Line graph: broadband households in Country A rose from 12% in 2004 to 92% in 2024; Country B from 5% to 81%; Country C from 25% to 66%.") } },
  { key: "writing:t1:leisure", slug: "task-1-leisure-time-by-age", kind: "IELTS_WRITING_TASK_1", title: "Task 1 · Leisure time by age group (bar chart)", sortOrder: 2,
    content: { instructions: TASK1, minWords: 150, minutes: 20, prompt: "The chart below shows the average number of hours per week that people in three age groups spent on four leisure activities.", image: chartImage(leisureChart, "Bar chart: hours per week. 16–24: TV 8, social media 14, sport 5, reading 2. 25–44: TV 10, social media 8, sport 4, reading 3. 45 and over: TV 16, social media 3, sport 3, reading 6.") } },
  { key: "writing:t1:attractions", slug: "task-1-city-attractions", kind: "IELTS_WRITING_TASK_1", title: "Task 1 · Visitors to city attractions (table)", sortOrder: 3,
    content: { instructions: TASK1, minWords: 150, minutes: 20, prompt: "The table below shows the number of visitors, in thousands, to four attractions in a city in 2014 and 2024.", image: chartImage(visitorsTable, "Table: visitors in thousands, 2014 then 2024. Science museum 420, 510. Art gallery 380, 300. Aquarium 250, 460. Castle 610, 640.") } },
  { key: "writing:t2:transport", slug: "task-2-public-transport-or-roads", kind: "IELTS_WRITING_TASK_2", title: "Task 2 · Public transport or new roads? (opinion)", sortOrder: 4,
    content: { instructions: TASK2, minWords: 250, minutes: 40, prompt: "Some people think that governments should spend money on improving public transport rather than building new roads. To what extent do you agree or disagree?" } },
  { key: "writing:t2:longer-lives", slug: "task-2-people-living-longer", kind: "IELTS_WRITING_TASK_2", title: "Task 2 · People living longer (advantages and disadvantages)", sortOrder: 5,
    content: { instructions: TASK2, minWords: 250, minutes: 40, prompt: "In many countries, people are living longer than ever before. Do the advantages of this development outweigh the disadvantages?" } },
  { key: "writing:t2:university", slug: "task-2-purpose-of-university", kind: "IELTS_WRITING_TASK_2", title: "Task 2 · What is university for? (discuss both views)", sortOrder: 6,
    content: { instructions: TASK2, minWords: 250, minutes: 40, prompt: "Some people believe that universities should focus on providing the skills needed for employment. Others think that a university education should cover a wider range of knowledge. Discuss both views and give your own opinion." } }
];

export const speakingPrompts: PromptDef[] = [
  { key: "speaking:hometown", slug: "speaking-hometown-and-places", kind: "IELTS_SPEAKING", title: "Speaking set 1 · Your hometown and favourite places", sortOrder: 1,
    content: { instructions: SPEAKING, prompt: "Describe a place in your town or city that you enjoy visiting.", part1: ["Where do you live at the moment?", "What do you like most about your neighbourhood?", "Is it easy to get around your town?", "Has your town changed much since you were a child?"],
      cueCard: { topic: "Describe a place in your town or city that you enjoy visiting.", points: ["where it is", "how often you go there", "what you do there"], closing: "and explain why you enjoy visiting this place." },
      part3: ["Why do some public places become popular while others are rarely used?", "How can city planners make towns more attractive to young people?", "Should historic buildings be protected even if the land is needed for housing?", "How might cities change in the next thirty years?"] } },
  { key: "speaking:technology", slug: "speaking-useful-technology", kind: "IELTS_SPEAKING", title: "Speaking set 2 · Technology in everyday life", sortOrder: 2,
    content: { instructions: SPEAKING, prompt: "Describe a piece of technology that you find useful.", part1: ["How often do you use your phone each day?", "Do you prefer reading on a screen or on paper?", "What was the first electronic device you owned?", "Is there any technology you would like to stop using?"],
      cueCard: { topic: "Describe a piece of technology that you find useful.", points: ["what it is", "when you started using it", "what you use it for"], closing: "and explain why it is useful to you." },
      part3: ["Do older people find it harder to learn new technology? Why?", "Has technology made people's working lives easier or more stressful?", "Should children be taught to program at primary school?", "What are the risks of depending too much on technology?"] } },
  { key: "speaking:food", slug: "speaking-a-shared-meal", kind: "IELTS_SPEAKING", title: "Speaking set 3 · Food and eating together", sortOrder: 3,
    content: { instructions: SPEAKING, prompt: "Describe a meal you enjoyed with other people.", part1: ["What kind of food do you like most?", "Do you often cook at home?", "Is there any food you disliked as a child but like now?", "Do people in your country usually eat together as a family?"],
      cueCard: { topic: "Describe a meal you enjoyed with other people.", points: ["where and when you had it", "who you were with", "what you ate"], closing: "and explain why you enjoyed this meal." },
      part3: ["Why do people often celebrate special occasions with food?", "How have eating habits changed in your country in recent years?", "Should schools teach children how to cook?", "Is fast food a serious problem in modern society?"] } },
  { key: "speaking:travel", slug: "speaking-a-journey-that-changed", kind: "IELTS_SPEAKING", title: "Speaking set 4 · Travel and journeys", sortOrder: 4,
    content: { instructions: SPEAKING, prompt: "Describe a journey that did not go as planned.", part1: ["Do you enjoy travelling?", "How do you usually travel to work or school?", "Do you prefer travelling alone or with other people?", "Where would you like to travel in the future?"],
      cueCard: { topic: "Describe a journey that did not go as planned.", points: ["where you were going", "what went wrong", "how you dealt with the problem"], closing: "and explain what you learned from the experience." },
      part3: ["What are the benefits of travelling to other countries?", "How has tourism affected popular destinations?", "Will people travel less in the future because of environmental concerns?", "Is it better to plan a trip carefully or to be spontaneous?"] } },
  { key: "speaking:learning", slug: "speaking-a-skill-you-learned", kind: "IELTS_SPEAKING", title: "Speaking set 5 · Learning new skills", sortOrder: 5,
    content: { instructions: SPEAKING, prompt: "Describe a skill you learned outside school.", part1: ["What subjects did you enjoy most at school?", "Do you prefer learning alone or in a group?", "Is there anything you would like to learn now?", "How do you usually learn new words in English?"],
      cueCard: { topic: "Describe a skill you learned outside school.", points: ["what the skill is", "when and how you learned it", "who helped you"], closing: "and explain how this skill has been useful to you." },
      part3: ["Which is more important: academic knowledge or practical skills?", "Why do some adults stop learning new things?", "How can technology help people learn skills?", "Should employers pay for their workers' training?"] } }
];

export const ieltsPromptDefs: PromptDef[] = [...writingPrompts, ...speakingPrompts];
