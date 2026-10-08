-- =============================================================================
-- RAVO CRM — login multi-usuário (versão sem segredo no arquivo)
-- O jwt-secret fica em private.config (sem acesso para ravo_anon/ravo_user);
-- quem grava é o setup.sh, com um segredo gerado na VPS.
-- Variável psql esperada: -v jwt_secret='<segredo>'
-- =============================================================================
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
CREATE TABLE IF NOT EXISTS private.config (chave text PRIMARY KEY, valor text NOT NULL);
SELECT format('INSERT INTO private.config (chave, valor) VALUES (%L, %L) ON CONFLICT (chave) DO UPDATE SET valor = EXCLUDED.valor', 'jwt_secret', :'jwt_secret') \gexec

CREATE TABLE IF NOT EXISTS public.usuarios (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text UNIQUE NOT NULL,
  nome          text NOT NULL,
  senha_hash    text NOT NULL,
  role          text NOT NULL DEFAULT 'ravo_user',
  ativo         boolean NOT NULL DEFAULT true,
  criado_em     timestamptz NOT NULL DEFAULT now(),
  ultimo_login  timestamptz
);

CREATE OR REPLACE FUNCTION private._b64url(data bytea) RETURNS text AS $$
  SELECT translate(encode(data, 'base64'), E'+/=\n', '-_');
$$ LANGUAGE sql IMMUTABLE;

CREATE OR REPLACE FUNCTION private.sign_jwt(payload json, secret text) RETURNS text AS $$
DECLARE
  header text := private._b64url(convert_to('{"alg":"HS256","typ":"JWT"}', 'utf8'));
  body   text := private._b64url(convert_to(payload::text, 'utf8'));
  sig    text;
BEGIN
  sig := private._b64url(hmac(header || '.' || body, secret, 'sha256'));
  RETURN header || '.' || body || '.' || sig;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Limpa as versões antigas (migration_usuarios.sql) se existirem em public
DROP FUNCTION IF EXISTS public.sign_jwt(json, text);
DROP FUNCTION IF EXISTS public._b64url(bytea);

CREATE OR REPLACE FUNCTION public.login(email text, senha text) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
DECLARE
  u            usuarios%ROWTYPE;
  v_jwt_secret text;
BEGIN
  SELECT valor INTO v_jwt_secret FROM private.config WHERE chave = 'jwt_secret';
  IF v_jwt_secret IS NULL THEN
    RAISE EXCEPTION 'jwt_secret nao configurado';
  END IF;

  SELECT * INTO u FROM usuarios
  WHERE usuarios.email = lower(trim(login.email)) AND ativo = true;

  IF NOT FOUND OR u.senha_hash <> crypt(senha, u.senha_hash) THEN
    RAISE EXCEPTION 'Email ou senha incorretos' USING ERRCODE = '28P01';
  END IF;

  UPDATE usuarios SET ultimo_login = now() WHERE id = u.id;

  RETURN json_build_object(
    'token', private.sign_jwt(
      json_build_object(
        'role', u.role, 'user_id', u.id, 'email', u.email, 'nome', u.nome,
        'exp', extract(epoch FROM (now() + interval '12 hours'))::int
      ), v_jwt_secret),
    'email', u.email,
    'nome', u.nome);
END;
$$;

REVOKE ALL ON FUNCTION public.login(text, text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.login(text, text) TO ravo_anon, ravo_user;
REVOKE ALL ON TABLE public.usuarios FROM ravo_anon, ravo_user;

COMMIT;
