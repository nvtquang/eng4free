export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type PlacementQuestion = { id: string; level: CefrLevel; prompt: string; options: [string, string, string]; correctIndex: 0 | 1 | 2 };

/**
 * A short, fixed-order placement test: three questions per CEFR level, easiest first.
 * It is not adaptive (the same 18 items for everyone), which keeps it simple and fast
 * to take, but still spans the full range the recommendation needs.
 */
export const placementQuestions: PlacementQuestion[] = [
  { id: "a1-1", level: "A1", prompt: "She ___ a teacher.", options: ["is", "am", "are"], correctIndex: 0 },
  { id: "a1-2", level: "A1", prompt: "I have two ___.", options: ["book", "books", "bookes"], correctIndex: 1 },
  { id: "a1-3", level: "A1", prompt: "___ you from Vietnam?", options: ["Is", "Are", "Do"], correctIndex: 1 },

  { id: "a2-1", level: "A2", prompt: "Yesterday, we ___ to the beach.", options: ["go", "went", "goes"], correctIndex: 1 },
  { id: "a2-2", level: "A2", prompt: "This bag is ___ than mine.", options: ["cheap", "cheaper", "more cheap"], correctIndex: 1 },
  { id: "a2-3", level: "A2", prompt: "I ___ visit my grandmother this weekend.", options: ["am going to", "go to", "going"], correctIndex: 0 },

  { id: "b1-1", level: "B1", prompt: "I have never ___ sushi before.", options: ["eat", "eaten", "ate"], correctIndex: 1 },
  { id: "b1-2", level: "B1", prompt: "If it rains tomorrow, we ___ the picnic.", options: ["cancel", "will cancel", "cancelled"], correctIndex: 1 },
  { id: "b1-3", level: "B1", prompt: "The man ___ called yesterday is my uncle.", options: ["who", "which", "whose"], correctIndex: 0 },

  { id: "b2-1", level: "B2", prompt: "The bridge ___ in 1998.", options: ["built", "was built", "has built"], correctIndex: 1 },
  { id: "b2-2", level: "B2", prompt: "She must ___ tired after the long flight.", options: ["be", "is", "being"], correctIndex: 0 },
  { id: "b2-3", level: "B2", prompt: "Despite ___ hard, he failed the exam.", options: ["study", "studying", "studied"], correctIndex: 1 },

  { id: "c1-1", level: "C1", prompt: "Never ___ such a beautiful sunset.", options: ["I have seen", "have I seen", "I saw"], correctIndex: 1 },
  { id: "c1-2", level: "C1", prompt: "If I had left earlier, I ___ the train.", options: ["would catch", "would have caught", "caught"], correctIndex: 1 },
  { id: "c1-3", level: "C1", prompt: "___ I love about this city is its energy.", options: ["That", "What", "Which"], correctIndex: 1 },

  { id: "c2-1", level: "C2", prompt: "It is essential that she ___ present at the hearing.", options: ["is", "be", "was"], correctIndex: 1 },
  { id: "c2-2", level: "C2", prompt: "The ___ of the new policy caused confusion.", options: ["introduce", "introduction", "introducing"], correctIndex: 1 },
  { id: "c2-3", level: "C2", prompt: "The results ___ that the treatment is effective.", options: ["suggest", "proves", "proving"], correctIndex: 0 }
];

export const placementLevelOrder: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
