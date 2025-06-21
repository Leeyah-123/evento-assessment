/*
  Warnings:

  - Added the required column `organizer_email` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizer_name` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "events" ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "max_attendees" INTEGER,
ADD COLUMN     "organizer_email" TEXT NOT NULL,
ADD COLUMN     "organizer_name" TEXT NOT NULL,
ADD COLUMN     "price" DOUBLE PRECISION,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
