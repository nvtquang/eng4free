import type { PlacementItemDef } from "../types";
import { item } from "./shared";

/** Grammar: one gap per sentence, four options, one clearly correct form. */
export const grammarItems: PlacementItemDef[] = [
  item("GRAMMAR", "A1", 1, "My brother ___ twelve years old.", ["is", "are", "am", "be"], 0, "Third person singular subject takes 'is'."),
  item("GRAMMAR", "A1", 2, "There ___ two cats in the garden.", ["is", "are", "am", "be"], 1, "'There are' with a plural noun."),
  item("GRAMMAR", "A1", 3, "She ___ coffee every morning.", ["drink", "drinking", "drinks", "is drink"], 2, "Present simple habit, third person: 'drinks'."),
  item("GRAMMAR", "A1", 4, "___ do you live? — In Da Nang.", ["What", "Who", "When", "Where"], 3, "The answer is a place, so the question word is 'Where'."),

  item("GRAMMAR", "A2", 1, "We ___ football when it started to rain.", ["were playing", "played", "are playing", "have played"], 0, "An action in progress interrupted by a past event: past continuous."),
  item("GRAMMAR", "A2", 2, "This is the ___ film I have ever seen.", ["good", "best", "better", "most good"], 1, "Superlative of 'good' is 'the best'."),
  item("GRAMMAR", "A2", 3, "You ___ wear a uniform at my school. It's a rule.", ["don't have to", "might", "have to", "could"], 2, "A rule is an obligation: 'have to'."),
  item("GRAMMAR", "A2", 4, "I didn't ___ to the party last night.", ["went", "going", "gone", "go"], 3, "After 'didn't' use the base form."),

  item("GRAMMAR", "B1", 1, "I ___ here since 2019.", ["have lived", "live", "am living", "lived"], 0, "'Since' + a starting point needs the present perfect."),
  item("GRAMMAR", "B1", 2, "If I ___ more time, I would learn to play the guitar.", ["have", "had", "will have", "would have"], 1, "Second conditional: 'if' + past simple, 'would' + verb."),
  item("GRAMMAR", "B1", 3, "The letter ___ yesterday, so it should arrive soon.", ["sent", "has sent", "was sent", "is sending"], 2, "The letter receives the action: past simple passive."),
  item("GRAMMAR", "B1", 4, "She asked me where ___.", ["did I live", "do I live", "I do live", "I lived"], 3, "Reported questions use statement word order and backshift."),

  item("GRAMMAR", "B2", 1, "By the time we arrived, the film ___.", ["had already started", "already started", "has already started", "was already starting"], 0, "An action completed before another past action: past perfect."),
  item("GRAMMAR", "B2", 2, "I'd rather you ___ smoke in the car.", ["don't", "didn't", "won't", "not"], 1, "'Would rather' + another subject takes the past simple."),
  item("GRAMMAR", "B2", 3, "He denied ___ the window.", ["to break", "break", "breaking", "to have broke"], 2, "'Deny' is followed by the -ing form."),
  item("GRAMMAR", "B2", 4, "The new stadium ___ by the end of next year.", ["will complete", "is completing", "has been completed", "will have been completed"], 3, "Completed before a future point, passive: future perfect passive."),

  item("GRAMMAR", "C1", 1, "Not only ___ late, but he also forgot the documents.", ["was he", "he was", "he did", "did he be"], 0, "'Not only' at the start triggers inversion: 'was he'."),
  item("GRAMMAR", "C1", 2, "Had I known about the delay, I ___ a later train.", ["would take", "would have taken", "had taken", "will take"], 1, "Inverted third conditional: 'would have' + past participle."),
  item("GRAMMAR", "C1", 3, "The manager insisted that every report ___ checked twice.", ["is", "was", "be", "will be"], 2, "'Insist that' takes the subjunctive base form: 'be'."),
  item("GRAMMAR", "C1", 4, "She is said ___ a fortune in the 1990s.", ["to make", "making", "having made", "to have made"], 3, "A past action after 'is said' uses the perfect infinitive."),

  item("GRAMMAR", "C2", 1, "Little ___ that the decision would change her career.", ["did she realise", "she realised", "she did realise", "realised she"], 0, "Negative adverbial 'Little' at the start triggers inversion with 'did'."),
  item("GRAMMAR", "C2", 2, "It's high time the council ___ something about the traffic.", ["does", "did", "will do", "has done"], 1, "'It's high time' + past simple for a present situation."),
  item("GRAMMAR", "C2", 3, "___ as it may seem, the plan actually saved money.", ["Strangely", "So strange", "Strange", "Much strange"], 2, "Concessive pattern: adjective + 'as it may seem'."),
  item("GRAMMAR", "C2", 4, "Were the government ___ taxes, spending would fall.", ["raising", "raise", "raised", "to raise"], 3, "Formal inverted conditional: 'Were' + subject + 'to' infinitive.")
];
