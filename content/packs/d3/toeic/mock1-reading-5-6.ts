import { mcq, type ExamPartDef } from "../types";

const S = (prompt: string, options: [string, string, string, string], correct: "A" | "B" | "C" | "D", explanation: string) => mcq(prompt, options, correct, explanation);

export const mock1Part5: ExamPartDef = {
  partNumber: 5, title: "Incomplete sentences", skill: "READING", instructions: "A word or phrase is missing in each sentence. Choose the best answer to complete the sentence.",
  groups: [{ questions: [
    S("The marketing team ___ the new campaign at next Monday's meeting.", ["presents", "will present", "presented", "presenting"], "B", "Next Monday is in the future: will present."),
    S("Ms. Rivera asked that all reports be submitted ___ Friday at noon.", ["by", "until", "since", "during"], "A", "By + a deadline."),
    S("The hotel's conference rooms are ___ equipped with projectors and video-call systems.", ["full", "fuller", "fully", "fullness"], "C", "An adverb (fully) modifies the participle equipped."),
    S("Customers who ___ online before March 1 will receive a 10 percent discount.", ["registers", "register", "registering", "to register"], "B", "Customers who (plural) + present simple: register."),
    S("Due to the ___ demand for electric scooters, the company has hired twenty new workers.", ["increase", "increases", "increasingly", "increasing"], "D", "An adjective is needed before demand: increasing."),
    S("Neither the manager ___ her assistant was available to answer questions.", ["or", "and", "but", "nor"], "D", "Neither … nor."),
    S("Please keep your receipt ___ you need to return the item.", ["in case", "unless", "so that", "although"], "A", "In case = because it may happen."),
    S("The new branch office is located ___ the city library and the central post office.", ["among", "between", "along", "across"], "B", "Between A and B."),
    S("Mr. Kim has worked for the company ___ more than fifteen years.", ["since", "during", "for", "while"], "C", "For + a period of time."),
    S("All employees must complete the safety training ___ they can use the new equipment.", ["after", "before", "because", "whether"], "B", "Training comes first: before they can use it."),
    S("The final design was chosen because it was the most ___ of the three proposals.", ["practically", "practice", "practicality", "practical"], "D", "The most + adjective: practical."),
    S("Ms. Nguyen, ___ joined the firm last year, has already been promoted.", ["which", "whose", "who", "whom"], "C", "A person as the subject of the clause: who."),
    S("The seminar will be held ___ the second floor of the Carlton Hotel.", ["at", "on", "in", "to"], "B", "On + a floor."),
    S("If the weather ___ good tomorrow, the outdoor concert will go ahead as planned.", ["will be", "is", "was", "being"], "B", "First conditional: If + present simple."),
    S("The accounting department is responsible for ___ all invoices within thirty days.", ["process", "processed", "processing", "processes"], "C", "After a preposition (for), use the -ing form."),
    S("Our new software makes it ___ to track customer orders in real time.", ["possibly", "possibility", "possibilities", "possible"], "D", "Make it + adjective + to-infinitive."),
    S("Applicants should have ___ three years of experience in customer service.", ["less", "least", "at most", "at least"], "D", "At least = a minimum of."),
    S("The CEO thanked the staff for their hard work and ___.", ["dedicate", "dedicated", "dedication", "dedicating"], "C", "A noun is needed to match hard work: dedication."),
    S("The museum will remain closed ___ the renovation work is complete.", ["until", "by", "since", "unless"], "A", "Until + a clause describing when the situation ends."),
    S("Mr. Patel prefers to handle client complaints ___ rather than by email.", ["personal", "personally", "person", "personality"], "B", "An adverb describes how he handles them: personally."),
    S("The quarterly sales figures were ___ higher than the company had expected.", ["consider", "considerable", "considerably", "consideration"], "C", "An adverb modifies the comparative higher."),
    S("Please ___ any questions about the new policy to the human resources department.", ["direct", "directly", "direction", "director"], "A", "An imperative verb is needed: direct questions to…"),
    S("The printer on the third floor is ___ repair, so please use the one in the lobby.", ["over", "under", "within", "above"], "B", "Under repair = being repaired."),
    S("By the time the conference starts, the organizers ___ all the name badges.", ["print", "have printed", "will have printed", "are printing"], "C", "By the time + future point: future perfect."),
    S("The contract will be signed ___ both parties agree on the final price.", ["during", "despite", "whereas", "once"], "D", "Once = as soon as, when."),
    S("Each department ___ a representative to the planning committee.", ["send", "sends", "sending", "have sent"], "B", "Each + singular verb: sends."),
    S("The restaurant is popular with tourists ___ its location near the river.", ["because", "due to", "although", "so"], "B", "Due to + noun phrase."),
    S("Ms. Grant reviewed the proposal ___ before presenting it to the board.", ["thorough", "thoroughness", "thoroughly", "more thorough"], "C", "An adverb describes how she reviewed it."),
    S("The new parking regulations will take ___ on July 1.", ["affect", "effective", "effect", "effectively"], "C", "The fixed phrase is take effect."),
    S("Only employees ___ badges have been activated may enter the research laboratory.", ["who", "which", "whom", "whose"], "D", "Possession (their badges): whose.")
  ] }]
};

const blank = (number: number, options: [string, string, string, string], correct: "A" | "B" | "C" | "D", explanation: string) => mcq(`(${number})`, options, correct, explanation);

export const mock1Part6: ExamPartDef = {
  partNumber: 6, title: "Text completion", skill: "READING", instructions: "Read the texts. A word, phrase or sentence is missing in parts of each text. Choose the best answer to complete the text.",
  groups: [
    { title: "Questions 131–134 refer to the following e-mail.", passage: "To: All staff\nFrom: Facilities Management\nSubject: Kitchen renovation\n\nStarting on Monday, June 3, the second-floor kitchen will be closed for renovation. The work is expected to take about two weeks. During this time, employees are welcome to use the kitchen on the fourth floor, which ___(131)___ with two new refrigerators last month.\n\n___(132)___ Please remove all personal items from the second-floor refrigerator by Friday, May 31. Any food left after that date will be ___(133)___.\n\nWe apologize for the inconvenience and appreciate your ___(134)___ while we improve our facilities.", questions: [
      blank(131, ["equips", "was equipped", "is equipping", "will equip"], "B", "The kitchen received the refrigerators (passive) last month (past): was equipped."),
      blank(132, ["The fourth-floor kitchen will also be closed.", "We will provide free lunches every day.", "We also need your help with one thing.", "The renovation was completed last week."], "C", "The next sentence makes a request, so this sentence introduces it. The other options contradict the e-mail."),
      blank(133, ["thrown", "discarded", "discarding", "discard"], "B", "Passive: will be discarded. Thrown would need away."),
      blank(134, ["patient", "patiently", "patience", "patients"], "C", "A noun after your: patience.")
    ] },
    { title: "Questions 135–138 refer to the following notice.", passage: "Greenfield Public Library — New Opening Hours\n\nBeginning in September, the Greenfield Public Library will ___(135)___ its opening hours. The library will open at 8 A.M. on weekdays, one hour earlier than now, to serve people who want to study before work. ___(136)___, it will close at 6 P.M. instead of 8 P.M. on Fridays.\n\nThese changes are based on a survey completed by more than 1,200 library users last spring. ___(137)___ Most respondents said they visit the library in the morning rather than in the evening.\n\nFor a complete schedule, please visit our website or ask at the ___(138)___ desk.", questions: [
      blank(135, ["extend", "adjust", "remove", "reduce"], "B", "Some hours start earlier and some end earlier, so the library adjusts them."),
      blank(136, ["However", "Therefore", "For example", "Similarly"], "A", "The Friday change contrasts with the earlier opening: However."),
      blank(137, ["The results were very clear.", "The library was built in 1965.", "The survey will begin next month.", "Parking is available behind the building."], "A", "The sentence connects the survey to the finding that follows."),
      blank(138, ["informed", "informative", "information", "inform"], "C", "Information desk is a compound noun.")
    ] },
    { title: "Questions 139–142 refer to the following advertisement.", passage: "Sparkle Office Cleaning\n\nIs your office always ___(139)___ busy to stay clean? Let Sparkle Office Cleaning take care of it. Our trained team works in the evening, ___(140)___ your staff are never disturbed.\n\nWe use only eco-friendly products, which are safe for people and pets. ___(141)___ Choose a daily, weekly, or monthly plan to suit your budget.\n\nCall 555-0187 today to arrange a free visit. One of our managers will ___(142)___ your space and give you a price on the spot.", questions: [
      blank(139, ["very", "too", "so", "such"], "B", "Too + adjective + to-infinitive: too busy to stay clean."),
      blank(140, ["because", "although", "so that", "unless"], "C", "So that introduces the purpose of working in the evening."),
      blank(141, ["Our prices are also flexible.", "We are closed in the evening.", "Pets are not allowed in our offices.", "Your staff will clean the office themselves."], "A", "It leads into the choice of plans to suit your budget; the others contradict the advertisement."),
      blank(142, ["assess", "assessment", "assessor", "assessed"], "A", "Will + base verb: assess.")
    ] },
    { title: "Questions 143–146 refer to the following memo.", passage: "To: All employees\nFrom: Hannah Cole, Office Manager\nDate: April 2\nRe: Recycling program\n\nAs part of our effort to reduce waste, we are introducing a new recycling program next week. Blue bins for paper and green bins for plastic ___(143)___ in every kitchen and near each printer.\n\nPlease make sure that items are clean and dry before you put them in a bin. ___(144)___ Food waste should still go in the regular trash cans.\n\nTo help everyone get started, we will hold a short information session on Wednesday at 11 A.M. ___(145)___ the session, you will also be able to ask questions about the program. Thank you in advance for your ___(146)___.", questions: [
      blank(143, ["have placed", "will be placed", "placing", "will place"], "B", "The bins are placed by someone next week: future passive."),
      blank(144, ["Dirty items can damage the recycling machines.", "Printers will be replaced next year.", "The kitchen will close early on Friday.", "Bins are available for purchase online."], "A", "It explains why items must be clean and dry."),
      blank(145, ["While", "During", "Unless", "Although"], "B", "During + noun (the session)."),
      blank(146, ["cooperate", "cooperative", "cooperation", "cooperatively"], "C", "A noun after your: cooperation.")
    ] }
  ]
};
