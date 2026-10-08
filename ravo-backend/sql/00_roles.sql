-- RAVO CRM — papéis do banco (rodar como superusuário, no banco ravo_db)
--   authenticator : único que loga; o PostgREST assume ravo_anon / ravo_user por requisição
--   ravo_anon     : sem JWT; só pode chamar login()
--   ravo_user     : usuário autenticado (role do JWT emitido por login())
-- Variável psql esperada: -v auth_pw='<senha do authenticator>'
SELECT 'CREATE ROLE ravo_anon NOLOGIN'  WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='ravo_anon') \gexec
SELECT 'CREATE ROLE ravo_user NOLOGIN'  WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='ravo_user') \gexec
SELECT format('CREATE ROLE authenticator LOGIN NOINHERIT PASSWORD %L', :'auth_pw')
  WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticator') \gexec
SELECT format('ALTER ROLE authenticator PASSWORD %L', :'auth_pw') \gexec
GRANT ravo_anon, ravo_user TO authenticator;
GRANT USAGE ON SCHEMA public TO ravo_anon, ravo_user;
