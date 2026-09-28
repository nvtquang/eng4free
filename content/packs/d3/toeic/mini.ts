import { heard, mcq, type ExamDef } from "../types";

const P2 = "Listen to the question or statement and the three responses. Choose the best response.";
const exchange = (first: "Woman" | "Man", question: string, answers: [string, string, string]) => `${first}: ${question}\n${first === "Woman" ? "Man" : "Woman"}: (A) ${answers[0]}\n(B) ${answers[1]}\n(C) ${answers[2]}`;
const Q = (prompt: string, options: [string, string, string, string], correct: "A" | "B" | "C" | "D", explanation: string) => mcq(prompt, options, correct, explanation);

/** A 22-question, 25-minute mini test that samples Parts 1, 2, 3, 5 and 7 with new material. */
export const toeicMini: ExamDef = {
  key: "toeic:mini-1", batch: "toeic", slug: "toeic-mini-test-1", title: "TOEIC Mini Test 1", type: "TOEIC", mode: "MINI_TEST", durationSeconds: 25 * 60,
  parts: [
    { partNumber: 1, title: "Photographs", skill: "LISTENING", instructions: "Look at the picture and listen to four statements. Choose the one that best describes the picture. The recording plays once.", groups: [{ questions: [
      heard("Look at the picture and listen to the four statements. Choose the statement that best describes the picture.", "Narrator: Look at the picture.\n(A) She's opening a window.\n(B) She's placing a book on a shelf.\n(C) Some boxes are being carried outside.\n(D) The shelves are empty.", 4, "B", "(B) She's placing a book on a shelf. There is no window, no boxes, and the shelves are full.", { image: { src: "/demo-media/images/toeic-part1-library-shelf.svg", alt: "Photograph for question 1", credit: "Illustration: English 4 Free original, CC0 1.0" } })
    ] }] },
    { partNumber: 2, title: "Question–response", skill: "LISTENING", instructions: "Listen to a question or statement and three responses. Choose the best response. Each recording plays once.", groups: [{ questions: [
      heard(P2, exchange("Man", "When is the new printer being delivered?", ["On Thursday morning.", "To the second floor.", "It prints in color."]), 3, "A", "When → a time: Thursday morning."),
      heard(P2, exchange("Woman", "Who's in charge of the budget report?", ["It's due next week.", "Mr. Alvarez is.", "About two thousand dollars."]), 3, "B", "Who → a person."),
      heard(P2, exchange("Man", "Why don't we take a short break?", ["Because it broke.", "In the break room.", "Good idea, I need some coffee."]), 3, "C", "A suggestion is accepted."),
      heard(P2, exchange("Woman", "Is the conference room free this afternoon?", ["I think it's booked until three.", "It was a free concert.", "Yes, the conference was great."]), 3, "A", "The reply gives availability; the other options repeat words with different meanings."),
      heard(P2, exchange("Man", "How long have you worked here?", ["Twenty kilometers.", "Almost five years.", "Every weekday."]), 3, "B", "How long → a duration."),
      heard(P2, exchange("Woman", "Could you send me the updated schedule?", ["The train was late.", "It's on my desk.", "Sure, I'll email it now."]), 3, "C", "A request is accepted.")
    ] }] },
    { partNumber: 3, title: "Conversations", skill: "LISTENING", instructions: "Read the questions, then listen to each conversation and answer. Each conversation plays once.", groups: [
      { title: "Questions 8–10", listening: { voices: { Woman: "female", Man: "male" }, script: "Woman: Hi, Paul. Did the new laptops for the sales team arrive?\nMan: They did, but two of them have the wrong keyboard layout. I've already contacted the supplier.\nWoman: Will they replace them quickly? The new staff start on Monday.\nMan: They promised to send the right ones by Friday. Until then, the new staff can use the laptops in the training room.\nWoman: Great. I'll let the team leader know." }, questions: [
        Q("What problem does the man mention?", ["Some laptops have the wrong keyboards.", "The laptops arrived late.", "The training room is locked.", "The supplier went out of business."], "A", "Two of them have the wrong keyboard layout."),
        Q("When do the new staff start?", ["On Friday", "On Thursday", "On Monday", "Next month"], "C", "The new staff start on Monday."),
        Q("What will the woman do next?", ["Call the supplier", "Inform the team leader", "Prepare the training room", "Order new laptops"], "B", "I'll let the team leader know.")
      ] },
      { title: "Questions 11–13", listening: { voices: { Man: "male", Woman: "female" }, script: "Man: Good morning, Greenway Dry Cleaning. How can I help?\nWoman: Hello. I dropped off a suit on Monday, and the ticket says it would be ready today, but I'm leaving for a business trip at noon.\nMan: Let me check. Yes, your suit is ready. We open at seven thirty, so you can pick it up any time this morning.\nWoman: Perfect. Can I pay by card?\nMan: Of course. And since you're a regular customer, there's a ten percent discount today." }, questions: [
        Q("Why is the woman in a hurry?", ["She is going to a wedding.", "She is leaving for a business trip.", "The store is closing early.", "She has a job interview."], "B", "I'm leaving for a business trip at noon."),
        Q("What time does the store open?", ["At 7:00", "At 8:30", "At noon", "At 7:30"], "D", "We open at seven thirty."),
        Q("Why will the woman receive a discount?", ["She paid in advance.", "Her suit was late.", "She is a regular customer.", "She is paying by card."], "C", "Since you're a regular customer, there's a ten percent discount.")
      ] }
    ] },
    { partNumber: 5, title: "Incomplete sentences", skill: "READING", instructions: "Choose the word or phrase that best completes each sentence.", groups: [{ questions: [
      Q("The new branch will open ___ the renovation is finished.", ["during", "as soon as", "despite", "because of"], "B", "As soon as + clause = immediately after."),
      Q("Ms. Tran is responsible ___ training new employees.", ["for", "to", "of", "at"], "A", "Responsible for + noun/-ing."),
      Q("Neither the printer ___ the scanner is working today.", ["or", "nor", "and", "but"], "B", "Neither … nor."),
      Q("All visitors must ___ a badge while in the building.", ["wears", "wearing", "wear", "worn"], "C", "Must + base verb."),
      Q("Sales increased ___ after the new advertising campaign began.", ["steady", "steadily", "steadiness", "more steady"], "B", "An adverb modifies increased."),
      Q("The manager, ___ office is on the third floor, will meet you shortly.", ["who", "which", "whom", "whose"], "D", "Possession (her office): whose.")
    ] }] },
    { partNumber: 7, title: "Reading comprehension", skill: "READING", instructions: "Read the text and answer the questions.", groups: [
      { title: "Questions 20–22 refer to the following notice.", passage: "HARBOR CITY PUBLIC POOL — SUMMER SCHEDULE\n\nFrom June 1 to August 31, the pool will open at 6:00 A.M. on weekdays and 8:00 A.M. on weekends. Lap swimming is reserved for adults from 6:00 to 8:00 A.M. every weekday.\n\nSwimming lessons for children aged 5–12 take place on Saturday mornings. Places are limited to ten children per class, and registration opens on May 15 at the front desk or online.\n\nPlease note: the pool will be closed on July 4 for maintenance.", questions: [
        Q("What is the purpose of the notice?", ["To announce a new pool", "To give the summer schedule", "To advertise a job", "To report an accident"], "B", "It gives opening times and lessons for the summer."),
        Q("When can adults swim laps on weekdays?", ["From 6:00 to 8:00 A.M.", "After 8:00 A.M.", "On Saturday mornings", "All day"], "A", "Lap swimming is reserved for adults from 6:00 to 8:00 A.M. every weekday."),
        Q("What is indicated about the swimming lessons?", ["They are for adults only.", "They are held every evening.", "Each class has a maximum of ten children.", "Registration closes on May 15."], "C", "Places are limited to ten children per class.")
      ] }
    ] }
  ]
};
