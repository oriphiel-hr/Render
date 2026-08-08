-- CreateTable
CREATE TABLE `AuditEvent` (
    `id` VARCHAR(191) NOT NULL,
    `category` ENUM('ADMIN_ACTION', 'MODERATION', 'SECURITY', 'FEED_RANKING', 'COMPLIANCE') NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `actorProfileId` VARCHAR(191) NULL,
    `targetProfileId` VARCHAR(191) NULL,
    `entityType` VARCHAR(191) NULL,
    `entityId` VARCHAR(191) NULL,
    `summary` TEXT NOT NULL,
    `payload` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditEvent_category_createdAt_idx`(`category`, `createdAt`),
    INDEX `AuditEvent_actorProfileId_createdAt_idx`(`actorProfileId`, `createdAt`),
    INDEX `AuditEvent_targetProfileId_createdAt_idx`(`targetProfileId`, `createdAt`),
    INDEX `AuditEvent_entityType_entityId_idx`(`entityType`, `entityId`),
    INDEX `AuditEvent_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ModerationDecision` (
    `id` VARCHAR(191) NOT NULL,
    `reportId` VARCHAR(191) NOT NULL,
    `resolvedByProfileId` VARCHAR(191) NOT NULL,
    `outcome` VARCHAR(191) NOT NULL,
    `actionTaken` VARCHAR(191) NOT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ModerationDecision_reportId_idx`(`reportId`),
    INDEX `ModerationDecision_resolvedByProfileId_createdAt_idx`(`resolvedByProfileId`, `createdAt`),
    INDEX `ModerationDecision_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserProfile` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `displayName` VARCHAR(191) NOT NULL,
    `age` INTEGER NOT NULL,
    `dateOfBirth` DATETIME(3) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL DEFAULT 'HR',
    `locale` VARCHAR(191) NOT NULL DEFAULT 'hr',
    `bio` TEXT NULL,
    `identity` VARCHAR(191) NOT NULL DEFAULT 'OTHER',
    `profileType` VARCHAR(191) NOT NULL DEFAULT 'INDIVIDUAL',
    `seekingIdentities` JSON NOT NULL,
    `seekingProfileTypes` JSON NOT NULL,
    `intents` JSON NOT NULL,
    `availability` ENUM('AVAILABLE', 'FOCUSED_CONTACT', 'PAUSED') NOT NULL DEFAULT 'AVAILABLE',
    `photos` JSON NOT NULL,
    `planTier` VARCHAR(191) NOT NULL DEFAULT 'free',
    `notifyEmail` BOOLEAN NOT NULL DEFAULT true,
    `photoVerified` BOOLEAN NOT NULL DEFAULT false,
    `onboardingDone` BOOLEAN NOT NULL DEFAULT false,
    `icebreakers` JSON NOT NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `shareLocation` BOOLEAN NOT NULL DEFAULT false,
    `seekingAgeMin` INTEGER NOT NULL DEFAULT 18,
    `seekingAgeMax` INTEGER NOT NULL DEFAULT 99,
    `maxDistanceKm` INTEGER NULL,
    `sameCountryOnly` BOOLEAN NOT NULL DEFAULT false,
    `publicTags` JSON NOT NULL,
    `privateTags` JSON NOT NULL,
    `lastActiveAt` DATETIME(3) NULL,
    `childrenPref` VARCHAR(191) NULL,
    `smoking` VARCHAR(191) NULL,
    `relationshipStatus` VARCHAR(191) NULL,
    `videoUrl` TEXT NULL,
    `verificationSelfie` TEXT NULL,
    `verificationPending` BOOLEAN NOT NULL DEFAULT false,
    `referralCode` VARCHAR(191) NULL,
    `referredByProfileId` VARCHAR(191) NULL,
    `supporterSince` DATETIME(3) NULL,
    `lifetimeDonatedCents` INTEGER NOT NULL DEFAULT 0,
    `donorBadgeVisible` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserProfile_email_key`(`email`),
    UNIQUE INDEX `UserProfile_referralCode_key`(`referralCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PairMessageEmailLog` (
    `pairId` VARCHAR(191) NOT NULL,
    `profileId` VARCHAR(191) NOT NULL,
    `lastSentAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`pairId`, `profileId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EngagedPair` (
    `id` VARCHAR(191) NOT NULL,
    `userAId` VARCHAR(191) NOT NULL,
    `userBId` VARCHAR(191) NOT NULL,
    `sourceContactId` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'CLOSED') NOT NULL DEFAULT 'ACTIVE',
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endedAt` DATETIME(3) NULL,
    `closeReason` VARCHAR(191) NULL,

    INDEX `EngagedPair_status_startedAt_idx`(`status`, `startedAt`),
    INDEX `EngagedPair_userAId_userBId_status_idx`(`userAId`, `userBId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MatchContact` (
    `id` VARCHAR(191) NOT NULL,
    `requesterId` VARCHAR(191) NOT NULL,
    `targetId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'AUTO_CLOSED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `MatchContact_requesterId_status_createdAt_idx`(`requesterId`, `status`, `createdAt`),
    INDEX `MatchContact_targetId_status_createdAt_idx`(`targetId`, `status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserAccount` (
    `id` VARCHAR(191) NOT NULL,
    `profileId` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `verifiedAt` DATETIME(3) NULL,
    `suspendedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserAccount_profileId_key`(`profileId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmailVerificationCode` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `consumedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `EmailVerificationCode_email_createdAt_idx`(`email`, `createdAt`),
    INDEX `EmailVerificationCode_email_code_expiresAt_idx`(`email`, `code`, `expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserBlock` (
    `id` VARCHAR(191) NOT NULL,
    `blockerId` VARCHAR(191) NOT NULL,
    `blockedId` VARCHAR(191) NOT NULL,
    `reason` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `UserBlock_blockerId_createdAt_idx`(`blockerId`, `createdAt`),
    UNIQUE INDEX `UserBlock_blockerId_blockedId_key`(`blockerId`, `blockedId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserReport` (
    `id` VARCHAR(191) NOT NULL,
    `reporterId` VARCHAR(191) NOT NULL,
    `reportedId` VARCHAR(191) NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `details` TEXT NULL,
    `status` ENUM('OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED') NOT NULL DEFAULT 'OPEN',
    `priority` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `UserReport_status_priority_createdAt_idx`(`status`, `priority`, `createdAt`),
    INDEX `UserReport_reportedId_createdAt_idx`(`reportedId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserRating` (
    `id` VARCHAR(191) NOT NULL,
    `fromUserId` VARCHAR(191) NOT NULL,
    `toUserId` VARCHAR(191) NOT NULL,
    `score` INTEGER NOT NULL,
    `comment` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `UserRating_toUserId_createdAt_idx`(`toUserId`, `createdAt`),
    INDEX `UserRating_fromUserId_createdAt_idx`(`fromUserId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FairnessConfigChange` (
    `id` VARCHAR(191) NOT NULL,
    `changedByUserId` VARCHAR(191) NULL,
    `oldDailyLimit` INTEGER NOT NULL,
    `newDailyLimit` INTEGER NOT NULL,
    `reason` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FairnessConfigChange_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PasswordResetCode` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `consumedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PasswordResetCode_email_createdAt_idx`(`email`, `createdAt`),
    INDEX `PasswordResetCode_email_code_expiresAt_idx`(`email`, `code`, `expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PairReadState` (
    `id` VARCHAR(191) NOT NULL,
    `pairId` VARCHAR(191) NOT NULL,
    `profileId` VARCHAR(191) NOT NULL,
    `lastReadAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PairReadState_profileId_idx`(`profileId`),
    UNIQUE INDEX `PairReadState_pairId_profileId_key`(`pairId`, `profileId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PairMessage` (
    `id` VARCHAR(191) NOT NULL,
    `pairId` VARCHAR(191) NOT NULL,
    `senderId` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `reaction` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PairMessage_pairId_createdAt_idx`(`pairId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentOrder` (
    `id` VARCHAR(191) NOT NULL,
    `userProfileId` VARCHAR(191) NULL,
    `orderType` ENUM('DONATION', 'PLAN', 'CUSTOM') NOT NULL DEFAULT 'CUSTOM',
    `planId` VARCHAR(191) NULL,
    `provider` ENUM('STRIPE', 'BANK_TRANSFER') NOT NULL,
    `status` ENUM('PENDING', 'PAID', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `amountCents` INTEGER NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'EUR',
    `description` TEXT NOT NULL,
    `stripeSessionId` VARCHAR(191) NULL,
    `bankTransferReference` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PaymentOrder_userProfileId_createdAt_idx`(`userProfileId`, `createdAt`),
    INDEX `PaymentOrder_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `PaymentOrder_orderType_status_createdAt_idx`(`orderType`, `status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InAppNotification` (
    `id` VARCHAR(191) NOT NULL,
    `profileId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `linkPath` VARCHAR(191) NULL,
    `readAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `InAppNotification_profileId_readAt_createdAt_idx`(`profileId`, `readAt`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PushSubscription` (
    `id` VARCHAR(191) NOT NULL,
    `profileId` VARCHAR(191) NOT NULL,
    `endpoint` VARCHAR(191) NOT NULL,
    `p256dh` VARCHAR(191) NOT NULL,
    `auth` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PushSubscription_endpoint_key`(`endpoint`),
    INDEX `PushSubscription_profileId_idx`(`profileId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserAccount` ADD CONSTRAINT `UserAccount_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `UserProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
