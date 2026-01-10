-- ============================================================================
-- DODAVANJE NEDOSTAJUĆE AuditLog TABELE U RENDER BAZU
-- ============================================================================
-- Ova skripta dodaje AuditLog tabelu i AuditActionType enum koji nedostaju
-- ============================================================================

-- Kreiraj enum tip ako ne postoji
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AuditActionType') THEN
        CREATE TYPE public."AuditActionType" AS ENUM (
            'MESSAGE_CREATED',
            'MESSAGE_EDITED',
            'MESSAGE_DELETED',
            'ATTACHMENT_UPLOADED',
            'ATTACHMENT_DELETED',
            'CONTACT_REVEALED',
            'CONTACT_MASKED',
            'ROOM_CREATED',
            'ROOM_DELETED'
        );
    END IF;
END $$;

-- Kreiraj AuditLog tabelu ako ne postoji
CREATE TABLE IF NOT EXISTS public."AuditLog" (
    id          text NOT NULL,
    action      public."AuditActionType" NOT NULL,
    "actorId"   text NOT NULL,
    "messageId" text,
    "roomId"    text,
    "jobId"     text,
    metadata    jsonb,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id)
);

-- Kreiraj indekse ako ne postoje
CREATE INDEX IF NOT EXISTS "AuditLog_actorId_createdAt_idx" ON public."AuditLog"("actorId", "createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_messageId_createdAt_idx" ON public."AuditLog"("messageId", "createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_roomId_createdAt_idx" ON public."AuditLog"("roomId", "createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_jobId_createdAt_idx" ON public."AuditLog"("jobId", "createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_action_createdAt_idx" ON public."AuditLog"(action, "createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON public."AuditLog"("createdAt");

-- Dodaj foreign key constraint-e ako ne postoje
DO $$ 
BEGIN
    -- actorId -> User
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'AuditLog_actorId_fkey'
    ) THEN
        ALTER TABLE ONLY public."AuditLog"
            ADD CONSTRAINT "AuditLog_actorId_fkey" 
            FOREIGN KEY ("actorId") 
            REFERENCES public."User"(id) 
            ON UPDATE CASCADE ON DELETE CASCADE;
    END IF;
    
    -- messageId -> ChatMessage
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'AuditLog_messageId_fkey'
    ) THEN
        ALTER TABLE ONLY public."AuditLog"
            ADD CONSTRAINT "AuditLog_messageId_fkey" 
            FOREIGN KEY ("messageId") 
            REFERENCES public."ChatMessage"(id) 
            ON UPDATE CASCADE ON DELETE CASCADE;
    END IF;
    
    -- roomId -> ChatRoom
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'AuditLog_roomId_fkey'
    ) THEN
        ALTER TABLE ONLY public."AuditLog"
            ADD CONSTRAINT "AuditLog_roomId_fkey" 
            FOREIGN KEY ("roomId") 
            REFERENCES public."ChatRoom"(id) 
            ON UPDATE CASCADE ON DELETE CASCADE;
    END IF;
    
    -- jobId -> Job
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'AuditLog_jobId_fkey'
    ) THEN
        ALTER TABLE ONLY public."AuditLog"
            ADD CONSTRAINT "AuditLog_jobId_fkey" 
            FOREIGN KEY ("jobId") 
            REFERENCES public."Job"(id) 
            ON UPDATE CASCADE ON DELETE CASCADE;
    END IF;
END $$;

-- Provera
SELECT 
    'AuditLog tabela kreirana!' as status,
    COUNT(*) as row_count
FROM public."AuditLog";

