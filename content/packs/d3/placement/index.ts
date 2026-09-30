import type { PlacementItemDef, SelfAssessmentDef } from "../types";
import { grammarItems } from "./grammar";
import { listeningItems } from "./listening";
import { readingItems } from "./reading";
import { vocabularyItems } from "./vocabulary";

/** The adaptive placement bank: four auto-scored skills, four items per CEFR level each. */
export const placementItems: PlacementItemDef[] = [...grammarItems, ...vocabularyItems, ...readingItems, ...listeningItems];

/** Can-do statements (English 4 Free wording, modelled on the CEFR scales) for self-assessing Speaking and Writing. */
export const selfAssessment: SelfAssessmentDef[] = [
  { skill: "SPEAKING", level: "A1", canDo: { en: "I can introduce myself and answer simple questions about my name, age and family.", vi: "Tôi có thể giới thiệu bản thân và trả lời câu hỏi đơn giản về tên, tuổi, gia đình." } },
  { skill: "SPEAKING", level: "A2", canDo: { en: "I can talk about my daily routine and manage simple exchanges in shops or cafés.", vi: "Tôi có thể nói về sinh hoạt hằng ngày và giao tiếp đơn giản khi mua sắm, gọi đồ uống." } },
  { skill: "SPEAKING", level: "B1", canDo: { en: "I can describe experiences and plans and keep a conversation going on familiar topics.", vi: "Tôi có thể kể lại trải nghiệm, nói về dự định và duy trì hội thoại về chủ đề quen thuộc." } },
  { skill: "SPEAKING", level: "B2", canDo: { en: "I can give my opinion on many topics with reasons and talk with native speakers without much strain.", vi: "Tôi có thể nêu quan điểm có lý lẽ về nhiều chủ đề và trò chuyện với người bản ngữ khá tự nhiên." } },
  { skill: "SPEAKING", level: "C1", canDo: { en: "I can speak fluently and flexibly at work or university, including about complex or abstract topics.", vi: "Tôi nói lưu loát, linh hoạt trong công việc và học tập, kể cả về chủ đề phức tạp, trừu tượng." } },
  { skill: "SPEAKING", level: "C2", canDo: { en: "I can express fine shades of meaning precisely and speak almost as easily as in my own language.", vi: "Tôi diễn đạt chính xác cả những sắc thái nghĩa tinh tế, nói gần như dễ dàng như tiếng mẹ đẻ." } },
  { skill: "WRITING", level: "A1", canDo: { en: "I can write short, simple sentences about myself, for example to fill in a form.", vi: "Tôi viết được câu ngắn, đơn giản về bản thân, ví dụ để điền vào mẫu đơn." } },
  { skill: "WRITING", level: "A2", canDo: { en: "I can write short messages and simple notes about everyday things.", vi: "Tôi viết được tin nhắn ngắn và ghi chú đơn giản về việc hằng ngày." } },
  { skill: "WRITING", level: "B1", canDo: { en: "I can write a connected text on familiar topics, such as an email describing an experience.", vi: "Tôi viết được đoạn văn mạch lạc về chủ đề quen thuộc, ví dụ email kể một trải nghiệm." } },
  { skill: "WRITING", level: "B2", canDo: { en: "I can write clear, detailed essays or reports that give reasons for and against a point of view.", vi: "Tôi viết được bài luận, báo cáo rõ ràng, chi tiết, nêu lý lẽ ủng hộ và phản đối một quan điểm." } },
  { skill: "WRITING", level: "C1", canDo: { en: "I can write well-structured texts on complex subjects in a style that suits the reader.", vi: "Tôi viết được văn bản bố cục chặt chẽ về chủ đề phức tạp, với văn phong phù hợp người đọc." } },
  { skill: "WRITING", level: "C2", canDo: { en: "I can write complex, polished texts such as articles or reports that are precise and easy to follow.", vi: "Tôi viết được văn bản phức tạp, trau chuốt như bài báo, báo cáo, vừa chính xác vừa dễ theo dõi." } }
];
