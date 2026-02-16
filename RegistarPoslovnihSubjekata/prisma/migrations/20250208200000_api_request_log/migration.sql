-- CreateTable
CREATE TABLE "api_request_log" (
    "id" BIGSERIAL NOT NULL,
    "method" VARCHAR(16) NOT NULL,
    "path" VARCHAR(512) NOT NULL,
    "query_string" VARCHAR(2048),
    "status_code" INTEGER NOT NULL,
    "duration_ms" INTEGER NOT NULL,
    "client_ip" VARCHAR(64),
    "user_agent" VARCHAR(512),
    "response_preview" VARCHAR(1024),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_request_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "api_request_log_path_idx" ON "api_request_log"("path");

-- CreateIndex
CREATE INDEX "api_request_log_created_at_idx" ON "api_request_log"("created_at");
