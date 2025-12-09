/*
  Warnings:

  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
-- AlterTable
-- ALTER TABLE "CalendlyConnection" ADD COLUMN "schedulingUrl" TEXT; -- Skipped: Already exists in production

-- AlterTable
ALTER TABLE "Client" ADD COLUMN "businessModel" TEXT;
ALTER TABLE "Client" ADD COLUMN "companyInfo" TEXT;
ALTER TABLE "Client" ADD COLUMN "domainOrIndustry" TEXT;
ALTER TABLE "Client" ADD COLUMN "niche" TEXT;
ALTER TABLE "Client" ADD COLUMN "packagePrice" REAL;
ALTER TABLE "Client" ADD COLUMN "packageServices" TEXT;
ALTER TABLE "Client" ADD COLUMN "selectedPackage" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Payment";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "AgencyCalendlyConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "calendlyUri" TEXT NOT NULL,
    "schedulingUrl" TEXT,
    "ownerEmail" TEXT NOT NULL,
    "ownerName" TEXT,
    "organization" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceId" TEXT,
    "amount" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "transactionId" TEXT,
    "description" TEXT,
    "personName" TEXT,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Transaction_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CreatedPackage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "services" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Agency" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT 'AdGrades Creative Agency',
    "address" TEXT,
    "website" TEXT,
    "taxId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Agency" ("address", "createdAt", "id", "name", "taxId", "updatedAt", "website") SELECT "address", "createdAt", "id", "name", "taxId", "updatedAt", "website" FROM "Agency";
DROP TABLE "Agency";
ALTER TABLE "new_Agency" RENAME TO "Agency";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
