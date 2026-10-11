CREATE SEQUENCE case_number_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE cases (
    id            UUID PRIMARY KEY,
    case_number   VARCHAR(30)  NOT NULL UNIQUE,
    customer_name VARCHAR(100) NOT NULL,
    title         VARCHAR(150) NOT NULL,
    description   VARCHAR(2000),
    status        VARCHAR(30)  NOT NULL,
    priority      VARCHAR(20)  NOT NULL,
    created_by    VARCHAR(50)  NOT NULL,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    version       BIGINT       NOT NULL DEFAULT 0
);

CREATE INDEX idx_cases_status   ON cases (status);
CREATE INDEX idx_cases_priority ON cases (priority);