-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_referrals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "referrerId" TEXT NOT NULL,
    "referredMemberId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "adminNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "referrals_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "members" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "referrals_referredMemberId_fkey" FOREIGN KEY ("referredMemberId") REFERENCES "members" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_referrals" ("createdAt", "date", "id", "referredMemberId", "referrerId", "updatedAt") SELECT "createdAt", "date", "id", "referredMemberId", "referrerId", "updatedAt" FROM "referrals";
DROP TABLE "referrals";
ALTER TABLE "new_referrals" RENAME TO "referrals";
CREATE INDEX "referrals_referrerId_idx" ON "referrals"("referrerId");
CREATE INDEX "referrals_referredMemberId_idx" ON "referrals"("referredMemberId");
CREATE UNIQUE INDEX "referrals_referrerId_referredMemberId_key" ON "referrals"("referrerId", "referredMemberId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
