-- Runtime security verification checks for JobAppliesTracker.
-- Run with backend DSN and with direct postgres DSN, then compare outputs.

-- 1) Effective role capabilities.
SELECT current_user AS role_name, r.rolsuper, r.rolbypassrls
FROM pg_roles r
WHERE r.rolname = current_user;

-- 2) User-owned tables expected by application RLS.
WITH user_owned_tables(table_name) AS (
  VALUES
    ('resume'),
    ('profile_data'),
    ('job_platform'),
    ('company'),
    ('application'),
    ('application_history'),
    ('appointment'),
    ('experience_entry'),
    ('experience_bullet'),
    ('education_entry'),
    ('education_highlight'),
    ('project_entry'),
    ('project_bullet'),
    ('skill_group'),
    ('skill_item'),
    ('certification_entry'),
    ('course_entry'),
    ('profile_about_me')
)
SELECT t.table_name
FROM user_owned_tables t;

-- 3) Table owner, grants, and role posture.
WITH user_owned_tables(table_name) AS (
  VALUES
    ('resume'),
    ('profile_data'),
    ('job_platform'),
    ('company'),
    ('application'),
    ('application_history'),
    ('appointment'),
    ('experience_entry'),
    ('experience_bullet'),
    ('education_entry'),
    ('education_highlight'),
    ('project_entry'),
    ('project_bullet'),
    ('skill_group'),
    ('skill_item'),
    ('certification_entry'),
    ('course_entry'),
    ('profile_about_me')
)
SELECT
  c.relname AS table_name,
  r.rolname AS owner_role
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_roles r ON r.oid = c.relowner
WHERE n.nspname = 'public'
  AND c.relname IN (SELECT table_name FROM user_owned_tables)
ORDER BY c.relname;

-- 4) RLS enabled and force RLS flags.
WITH user_owned_tables(table_name) AS (
  VALUES
    ('resume'),
    ('profile_data'),
    ('job_platform'),
    ('company'),
    ('application'),
    ('application_history'),
    ('appointment'),
    ('experience_entry'),
    ('experience_bullet'),
    ('education_entry'),
    ('education_highlight'),
    ('project_entry'),
    ('project_bullet'),
    ('skill_group'),
    ('skill_item'),
    ('certification_entry'),
    ('course_entry'),
    ('profile_about_me')
)
SELECT
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS force_rls
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN (SELECT table_name FROM user_owned_tables)
ORDER BY c.relname;

-- 5) Policy coverage by table and command.
WITH user_owned_tables(table_name) AS (
  VALUES
    ('resume'),
    ('profile_data'),
    ('job_platform'),
    ('company'),
    ('application'),
    ('application_history'),
    ('appointment'),
    ('experience_entry'),
    ('experience_bullet'),
    ('education_entry'),
    ('education_highlight'),
    ('project_entry'),
    ('project_bullet'),
    ('skill_group'),
    ('skill_item'),
    ('certification_entry'),
    ('course_entry'),
    ('profile_about_me')
),
required_cmds(cmd) AS (
  VALUES ('SELECT'), ('INSERT'), ('UPDATE'), ('DELETE')
)
SELECT
  t.table_name,
  c.cmd,
  EXISTS (
    SELECT 1
    FROM pg_policies p
    WHERE p.schemaname = 'public'
      AND p.tablename = t.table_name
      AND p.cmd = c.cmd
  ) AS policy_present
FROM user_owned_tables t
CROSS JOIN required_cmds c
ORDER BY t.table_name, c.cmd;

-- 6) Optional runtime identity context probes.
SELECT
  current_setting('request.jwt.claim.sub', true) AS request_jwt_sub,
  current_setting('request.jwt.claim.role', true) AS request_jwt_role,
  auth.uid() AS auth_uid_value;
