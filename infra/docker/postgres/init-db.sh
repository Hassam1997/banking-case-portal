#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres <<-EOSQL
  CREATE USER auth_user     WITH PASSWORD '${AUTH_DB_PASSWORD}';
  CREATE USER case_user     WITH PASSWORD '${CASE_DB_PASSWORD}';
  CREATE USER activity_user WITH PASSWORD '${ACTIVITY_DB_PASSWORD}';

  CREATE DATABASE authdb     OWNER auth_user;
  CREATE DATABASE casedb     OWNER case_user;
  CREATE DATABASE activitydb OWNER activity_user;

  REVOKE CONNECT ON DATABASE authdb     FROM PUBLIC;
  REVOKE CONNECT ON DATABASE casedb     FROM PUBLIC;
  REVOKE CONNECT ON DATABASE activitydb FROM PUBLIC;
EOSQL