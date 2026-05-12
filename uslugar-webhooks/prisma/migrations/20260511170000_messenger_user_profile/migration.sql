-- Prikazno ime korisnika (PSID) s Graph User Profile API-ja, ne iz teksta poruke.
CREATE TABLE "MessengerUserProfile" (
    "pageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fetchError" VARCHAR(500),

    CONSTRAINT "MessengerUserProfile_pkey" PRIMARY KEY ("pageId","userId")
);

CREATE INDEX "MessengerUserProfile_userId_idx" ON "MessengerUserProfile"("userId");
