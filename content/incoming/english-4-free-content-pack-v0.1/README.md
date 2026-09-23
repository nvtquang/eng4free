# English 4 Free Content Pack v0.1

A 300-record original seed pack aligned to the data model in the project plan. It is CC0-1.0 and contains no ETS, TOEIC or IELTS copyrighted questions. TOEIC and IELTS fixtures reproduce only engine-level question formats.

## Counts

- content_batches: 1
- courses: 8
- course_levels: 6
- lessons: 12
- lesson_blocks: 24
- vocab_cards: 120
- pronunciation_items: 18
- passages: 10
- questions: 90
- exams: 2
- exam_parts: 9
- total: 300

## Import order

1. content_batches
2. courses and course_levels
3. lessons and lesson_blocks
4. vocab_cards and pronunciation_items
5. passages and questions
6. exams and exam_parts

IDs are deterministic strings. Resolve passage_id, lesson_id, course_id, exam_id and question_ids as foreign keys. audio_url is intentionally null: upload or synthesize licensed audio, then patch only these fields.

## Important

The supplied plan defines the domain entities but not the concrete Drizzle columns or enum literals. This JSON uses those entity names and portable fields. Your importer should validate and map fields to the implemented database schema before insert.
