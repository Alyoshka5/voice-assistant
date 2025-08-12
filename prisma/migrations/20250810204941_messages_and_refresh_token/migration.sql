-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('user', 'assistant');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "googleRefreshToken" TEXT;

-- CreateTable
CREATE TABLE "public"."Message" (
    "id" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
