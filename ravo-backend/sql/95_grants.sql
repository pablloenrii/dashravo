-- Permissões finais (depois de todas as tabelas/funções existirem)
GRANT USAGE ON SCHEMA public TO ravo_anon, ravo_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ravo_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ravo_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO ravo_user;
REVOKE ALL ON TABLE public.usuarios FROM ravo_anon, ravo_user;
-- login() é a única função que o anônimo pode chamar
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM ravo_anon;
GRANT EXECUTE ON FUNCTION public.login(text, text) TO ravo_anon, ravo_user;
-- Objetos criados no futuro por quem aplica as migrations
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ravo_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO ravo_user;
