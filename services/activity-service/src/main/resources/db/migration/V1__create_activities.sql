CREATE TABLE activities (
    id          UUID PRIMARY KEY,
    case_id     UUID         NOT NULL,
    type        VARCHAR(30)  NOT NULL,
    content     VARCHAR(2000) NOT NULL,
    created_by  VARCHAR(50)  NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_activities_case_created ON activities (case_id, created_at DESC);