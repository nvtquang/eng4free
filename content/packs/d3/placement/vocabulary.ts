import type { PlacementItemDef } from "../types";
import { item } from "./shared";

/** Vocabulary: word meaning, collocation and word choice in context. */
export const vocabularyItems: PlacementItemDef[] = [
  item("VOCABULARY", "A1", 1, "I wash my hands in the ___.", ["bathroom", "bedroom", "garden", "garage"], 0, "Hands are washed at a basin in the bathroom."),
  item("VOCABULARY", "A1", 2, "The opposite of 'hot' is ___.", ["warm", "cold", "tall", "old"], 1, "'Cold' is the opposite of 'hot'."),
  item("VOCABULARY", "A1", 3, "We usually eat breakfast in the ___.", ["evening", "night", "morning", "afternoon"], 2, "Breakfast is the morning meal."),
  item("VOCABULARY", "A1", 4, "A person who works at a school and gives lessons is a ___.", ["doctor", "driver", "farmer", "teacher"], 3, "A teacher gives lessons at a school."),

  item("VOCABULARY", "A2", 1, "Can you ___ me your pen? I forgot mine.", ["lend", "borrow", "keep", "return"], 0, "You lend something to someone; you borrow something from someone."),
  item("VOCABULARY", "A2", 2, "The train was ___, so we waited for an hour.", ["early", "late", "fast", "empty"], 1, "Waiting an hour means the train did not arrive on time."),
  item("VOCABULARY", "A2", 3, "I need to ___ a room at the hotel for Friday.", ["write", "pay", "book", "take"], 2, "You book (reserve) a hotel room in advance."),
  item("VOCABULARY", "A2", 4, "She's very ___; she always helps other people.", ["lazy", "rude", "shy", "kind"], 3, "Helping other people describes a kind person."),

  item("VOCABULARY", "B1", 1, "The concert was ___ because of the storm, so we got our money back.", ["cancelled", "painted", "borrowed", "invented"], 0, "An event that does not happen is cancelled."),
  item("VOCABULARY", "B1", 2, "I'm trying to ___ smoking; it's bad for my health.", ["take up", "give up", "put off", "look after"], 1, "'Give up' means stop doing a habit."),
  item("VOCABULARY", "B1", 3, "The hotel staff were very ___ and answered all our questions.", ["useless", "careless", "helpful", "harmful"], 2, "Answering questions is helpful."),
  item("VOCABULARY", "B1", 4, "The company is looking for someone with at least two years of ___.", ["experiment", "expense", "expression", "experience"], 3, "Work experience is measured in years; the other words look similar."),

  item("VOCABULARY", "B2", 1, "The minister refused to ___ on the rumours.", ["comment", "tell", "mention", "discuss"], 0, "'Comment on' is the only option that takes 'on'."),
  item("VOCABULARY", "B2", 2, "The results were ___ with what the scientists had predicted.", ["constant", "consistent", "considerate", "continuous"], 1, "'Consistent with' means matching or in agreement with."),
  item("VOCABULARY", "B2", 3, "After months of negotiation, the two sides finally ___ an agreement.", ["arrived", "made up", "reached", "came"], 2, "The collocation is 'reach an agreement'."),
  item("VOCABULARY", "B2", 4, "She has a ___ understanding of the problem and can explain every detail.", ["through", "though", "thought", "thorough"], 3, "'Thorough' means complete and detailed."),

  item("VOCABULARY", "C1", 1, "The new policy has been widely ___ as unfair to small businesses.", ["criticised", "complained", "blamed", "objected"], 0, "'Criticised as' fits the passive; 'complain' and 'object' need other prepositions."),
  item("VOCABULARY", "C1", 2, "His argument doesn't ___ water; the figures he uses are out of date.", ["carry", "hold", "keep", "contain"], 1, "Idiom: an argument that 'doesn't hold water' is not convincing."),
  item("VOCABULARY", "C1", 3, "The company's profits have ___ since the new director took over.", ["flown", "raised", "soared", "lifted"], 2, "'Soar' is intransitive and means rise quickly; 'raise' and 'lift' need an object."),
  item("VOCABULARY", "C1", 4, "There is a ___ lack of evidence to support the claim.", ["conscious", "conscientious", "contagious", "conspicuous"], 3, "'A conspicuous lack of' means a very noticeable absence."),

  item("VOCABULARY", "C2", 1, "The report paints a ___ picture of the economy, predicting years of decline.", ["bleak", "blunt", "bland", "brisk"], 0, "'Bleak' means without hope, matching 'years of decline'."),
  item("VOCABULARY", "C2", 2, "The director's sudden resignation came as a bolt from the ___.", ["sky", "blue", "dark", "storm"], 1, "Idiom: 'a bolt from the blue' is a complete surprise."),
  item("VOCABULARY", "C2", 3, "The rules are deliberately ___, so they can be interpreted in several ways.", ["ambitious", "amiable", "ambiguous", "ambivalent"], 2, "'Ambiguous' means open to more than one interpretation."),
  item("VOCABULARY", "C2", 4, "The negotiations reached an ___, with neither side willing to compromise.", ["impulse", "impact", "imprint", "impasse"], 3, "An 'impasse' is a situation where no progress is possible.")
];
