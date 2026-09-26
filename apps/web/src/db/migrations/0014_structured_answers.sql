ALTER TABLE "attempt_answers" ADD COLUMN "response" jsonb;
UPDATE "attempt_answers" SET "response" = jsonb_build_object('optionId', "selected_option_id") WHERE "response" IS NULL AND "selected_option_id" IS NOT NULL;
ALTER TABLE "attempt_answers" ALTER COLUMN "selected_option_id" DROP NOT NULL
