import { heard, mcq, type ExamDef } from "../types";

const P2 = "Listen to the question or statement and the three responses. Choose the best response.";
const exchange = (first: "Woman" | "Man", question: string, answers: [string, string, string]) => `${first}: ${question}\n${first === "Woman" ? "Man" : "Woman"}: (A) ${answers[0]}\n(B) ${answers[1]}\n(C) ${answers[2]}`;
const Q = (prompt: string, options: [string, string, string, string], correct: "A" | "B" | "C" | "D", explanation: string) => mcq(prompt, options, correct, explanation);
const blank = (number: number, options: [string, string, string, string], correct: "A" | "B" | "C" | "D", explanation: string) => mcq(`(${number})`, options, correct, explanation);

/**
 * A 25-question, 25-minute mini test sampling Parts 2–7 with new material. It has no Part 1,
 * because Part 1 needs reviewed CC0 photographs; Mini Test 1 and the full mock cover it.
 */
export const toeicMini2: ExamDef = {
  key: "toeic:mini-2", batch: "toeic", slug: "toeic-mini-test-2", title: "TOEIC Mini Test 2", type: "TOEIC", mode: "MINI_TEST", durationSeconds: 25 * 60,
  parts: [
    { partNumber: 2, title: "Question–response", skill: "LISTENING", instructions: "Listen to a question or statement and three responses. Choose the best response. Each recording plays once.", groups: [{ questions: [
      heard(P2, exchange("Woman", "Where should I leave these files?", ["On the shelf by the window.", "They're very important.", "I filed them yesterday."]), 3, "A", "Where → a place."),
      heard(P2, exchange("Man", "Has the client signed the contract yet?", ["She signed up for the class.", "A two-year contract.", "Not yet, but she will this afternoon."]), 3, "C", "A yes/no question answered with Not yet; the others repeat words with different meanings."),
      heard(P2, exchange("Woman", "Which bus goes to the airport?", ["About forty minutes.", "The number twelve.", "I'd rather take a taxi to the station."]), 3, "B", "Which bus → a specific bus."),
      heard(P2, exchange("Man", "Would you like me to book a table for lunch?", ["It's a wooden table.", "I had a big breakfast.", "That would be great, thanks."]), 3, "C", "An offer is accepted."),
      heard(P2, exchange("Woman", "The presentation has been moved to Thursday.", ["Oh, I'd better tell the rest of the team.", "We moved here last year.", "It's a very long presentation."]), 3, "A", "A natural response to new information."),
      heard(P2, exchange("Man", "Why was the delivery late?", ["It's on the loading dock.", "There was heavy traffic on the highway.", "Late in the afternoon."]), 3, "B", "Why → a reason.")
    ] }] },
    { partNumber: 3, title: "Conversations", skill: "LISTENING", instructions: "Read the questions, then listen to the conversation and answer. The conversation plays once.", groups: [
      { title: "Questions 7–9", listening: { voices: { Man: "male", Woman: "female" }, script: "Man: Hi, Rachel. Are you going to the training session on the new accounting software tomorrow?\nWoman: I was planning to, but the client meeting in Chicago has been moved to tomorrow morning, so I'll be on a flight.\nMan: That's a shame. The software goes live next week, and everyone's supposed to know how to use it by then.\nWoman: I know. Is there another session?\nMan: I think the IT department is recording it. I'll ask them to send you the link.\nWoman: That would be really helpful. Thanks, Marco." }, questions: [
        Q("What are the speakers mainly discussing?", ["A new client in Chicago", "Problems with a flight", "A job interview", "A training session on new software"], "D", "Are you going to the training session on the new accounting software?"),
        Q("Why can't the woman attend?", ["She is on vacation.", "She will be traveling to a client meeting.", "She already knows the software.", "She has another training session."], "B", "The client meeting in Chicago has been moved to tomorrow morning."),
        Q("What will the man do?", ["Ask the IT department to send a recording", "Lead the training session himself", "Change the meeting time", "Book the woman's flight"], "A", "I'll ask them to send you the link.")
      ] }
    ] },
    { partNumber: 4, title: "Short talks", skill: "LISTENING", instructions: "Read the questions, then listen to the talk and answer. The talk is heard once.", groups: [
      { title: "Questions 10–12", listening: { voices: { Speaker: "female" }, script: "Speaker: Good morning, and welcome to the Lakeside Hotel. I'm Grace, the events manager. Before your conference begins, a few announcements. Coffee and pastries are available in the lobby until nine fifteen, when the first session starts in the Maple Room. Lunch will be served at twelve thirty on the terrace, weather permitting; if it rains, we'll move it to the main restaurant. Finally, the hotel's wireless network has been upgraded, and the new password is printed on the back of your name badge. If you need anything at all during the day, please speak to any member of staff wearing a green jacket." }, questions: [
        Q("Who most likely is the speaker?", ["A conference presenter", "A hotel guest", "An events manager", "A restaurant chef"], "C", "I'm Grace, the events manager."),
        Q("Where will lunch be served if it rains?", ["In the main restaurant", "On the terrace", "In the lobby", "In the Maple Room"], "A", "If it rains, we'll move it to the main restaurant."),
        Q("Where can listeners find the wireless network password?", ["At the front desk", "In the lobby", "On a sign in the Maple Room", "On the back of their name badges"], "D", "The new password is printed on the back of your name badge.")
      ] }
    ] },
    { partNumber: 5, title: "Incomplete sentences", skill: "READING", instructions: "Choose the word or phrase that best completes each sentence.", groups: [{ questions: [
      Q("Please submit your travel expenses ___ the end of the month.", ["until", "by", "since", "during"], "B", "A deadline: by the end of the month."),
      Q("The marketing team has ___ completed the customer survey.", ["yet", "still", "ever", "already"], "D", "Already in a positive present perfect sentence."),
      Q("Ms. Nakamura is one of the most ___ engineers in the company.", ["experienced", "experiencing", "experience", "experiences"], "A", "An adjective describing engineers: experienced."),
      Q("The store will offer free delivery ___ orders over fifty dollars.", ["in", "at", "on", "with"], "C", "Offer something on orders over a certain amount."),
      Q("If the shipment ___ tomorrow, we will contact the supplier.", ["won't arrive", "didn't arrive", "hadn't arrived", "doesn't arrive"], "D", "First conditional: if + present simple."),
      Q("The board approved the proposal ___ some members had doubts about the cost.", ["despite", "although", "however", "because of"], "B", "Although + clause (subject + verb); despite needs a noun.")
    ] }] },
    { partNumber: 6, title: "Text completion", skill: "READING", instructions: "Read the text. A word, phrase or sentence is missing in parts of the text. Choose the best answer to complete the text.", groups: [
      { title: "Questions 19–22 refer to the following e-mail.", passage: "To: All employees\nFrom: Human Resources\nSubject: New parking arrangements\n\nFrom March 1, the company will lease twenty additional parking spaces in the garage on Elm Street. These spaces will be ___(19)___ to employees who share a car with at least one colleague.\n\nTo apply for a space, please complete the form on the staff website by February 20. ___(20)___ If more people apply than there are spaces, places will be assigned ___(21)___.\n\nWe hope this scheme will reduce traffic around the office and make it easier for everyone to find parking. Thank you for your ___(22)___.", questions: [
        blank(19, ["reserve", "reserving", "reserved", "reservation"], "C", "Passive: will be reserved."),
        blank(20, ["Each application must include the names of everyone sharing the car.", "The garage on Elm Street was built last year.", "Parking fines will increase next month.", "Employees may not use public transportation."], "A", "The sentence gives a practical detail of the application process mentioned just before."),
        blank(21, ["random", "randomly", "randomness", "randomize"], "B", "An adverb modifies assigned: randomly."),
        blank(22, ["cooperation", "cooperate", "cooperative", "cooperatively"], "A", "A noun after your: cooperation.")
      ] }
    ] },
    { partNumber: 7, title: "Reading comprehension", skill: "READING", instructions: "Read the text and answer the questions.", groups: [
      { title: "Questions 23–25 refer to the following advertisement.", passage: "BRIGHTLINE OFFICE SUPPLIES — SPRING SALE\n\nFor two weeks only, from April 3 to April 16, all printer paper and ink cartridges are 25% off at our downtown store and online.\n\nBusiness customers who open an account during the sale will also receive free next-day delivery on all orders for six months.\n\nThe discount does not apply to office furniture or to items already on clearance. Visit brightline-office.example to see the full list of products included.", questions: [
        Q("What is being advertised?", ["A temporary discount on certain products", "A new downtown store", "A job opening", "A furniture delivery service"], "A", "For two weeks only… 25% off printer paper and ink cartridges."),
        Q("What will business customers who open an account receive?", ["A 50% discount on furniture", "A free printer", "Clearance items at no cost", "Free next-day delivery for six months"], "D", "Free next-day delivery on all orders for six months."),
        Q("What is NOT included in the sale?", ["Printer paper", "Ink cartridges", "Office furniture", "Online orders"], "C", "The discount does not apply to office furniture.")
      ] }
    ] }
  ]
};
