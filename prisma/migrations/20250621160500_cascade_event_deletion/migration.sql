-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_location_id_fkey";

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
