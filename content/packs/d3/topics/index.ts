import type { TopicCategoryDef } from "../types";
import { speakingCategories } from "./speaking";
import { writingCategories } from "./writing";

export const topicCategories: TopicCategoryDef[] = [...speakingCategories, ...writingCategories];
