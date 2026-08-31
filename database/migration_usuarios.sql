-- =============================================================================
-- RAVO OS — Migration: autenticação multi-usuário real
-- =============================================================================
-- Substitui o gate client-side (VITE_AUTH_EMAIL/VITE_AUTH_PASSWORD, que ficava
-- em texto puro no bundle JS público) por login validado no servidor:
--   - tabela `usuarios` com senha em hash (pgcrypto/bcrypt)
--   - função `login(email, senha)` que confere a senha no banco e devolve um
--     JWT assinado com o mesmo `jwt-secret` do PostgREST
--     (/opt/postgrest/postgrest.conf), então o token já é aceito por todas as
--     rotas existentes sem precisar mudar nada no PostgREST.
--
-- Não depende da extensão `pgjwt` (nem sempre disponível em VPS self-hosted) —
-- a assinatura HS256 é feita só com `pgcrypto` (hmac + base64url).
--
-- IMPORTANTE: troque o `v_jwt_secret` abaixo pelo valor exato de `jwt-secret`
-- do seu /opt/postgrest/postgrest.conf antes de rodar, se for diferente do
-- que já está preenchido aqui.
-- =============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -----------------------------------------------------------------------------
-- Tabela de usuários
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text UNIQUE NOT NULL,
  nome          text NOT NULL,
  senha_hash    text NOT NULL,
  role          text NOT NULL DEFAULT 'ravo_user',
  ativo         boolean NOT NULL DEFAULT true,
  criado_em     timestamptz NOT NULL DEFAULT now(),
  ultimo_login  timestamptz
);

-- -----------------------------------------------------------------------------
-- Helpers de JWT HS256 (sem depender da extensão pgjwt)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION _b64url(data bytea) RETURNS text AS $$
  SELECT translate(encode(data, 'base64'), E'+/=\n', '-_');
$$ LANGUAGE sql IMMUTABLE;

CREATE OR REPLACE FUNCTION sign_jwt(payload json, secret text) RETURNS text AS $$
DECLARE
  header text := _b64url(convert_to('{"alg":"HS256","typ":"JWT"}', 'utf8'));
  body   text := _b64url(convert_to(payload::text, 'utf8'));
  sig    text;
BEGIN
  sig := _b64url(hmac(header || '.' || body, secret, 'sha256'));
  RETURN header || '.' || body || '.' || sig;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

REVOKE ALL ON FUNCTION _b64url(bytea) FROM PUBLIC;
REVOKE ALL ON FUNCTION sign_jwt(json, text) FROM PUBLIC;

-- -----------------------------------------------------------------------------
-- RPC de login — chamada pelo frontend via POST /rpc/login
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION login(email text, senha text) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  u             usuarios%ROWTYPE;
  v_jwt_secret  text := 'q8JASc1Xa1pcUQEy0OkRNYHEqoE6vpu5csVBFe1tTgrQB03W73qQrSD6HcfkhW-O';
  v_token       text;
BEGIN
  SELECT * INTO u
  FROM usuarios
  WHERE usuarios.email = lower(trim(login.email))
    AND ativo = true;

  IF NOT FOUND OR u.senha_hash <> crypt(senha, u.senha_hash) THEN
    RAISE EXCEPTION 'Email ou senha incorretos';
  END IF;

  UPDATE usuarios SET ultimo_login = now() WHERE id = u.id;

  v_token := sign_jwt(
    json_build_object(
      'role',    u.role,
      'user_id', u.id,
      'email',   u.email,
      'nome',    u.nome,
      'exp',     extract(epoch FROM (now() + interval '12 hours'))::int
    ),
    v_jwt_secret
  );

  RETURN json_build_object('token', v_token, 'email', u.email, 'nome', u.nome);
END;
$$;

GRANT EXECUTE ON FUNCTION login(text, text) TO ravo_user;

-- -----------------------------------------------------------------------------
-- Usuário inicial: migra a credencial atual do Pablo (mesma senha de hoje) para
-- a tabela, em hash. A senha continua sendo "RavoOS2026" até você trocá-la
-- (agora dá pra trocar com um simples UPDATE, sem precisar redeploy).
-- -----------------------------------------------------------------------------
INSERT INTO usuarios (email, nome, senha_hash, role) VALUES
  ('pablocnhenrique@gmail.com', 'Pablo', crypt('RavoOS2026', gen_salt('bf')), 'ravo_user')
ON CONFLICT (email) DO NOTHING;

COMMIT;

-- =============================================================================
-- Para adicionar o 2º usuário, rode isto (ajuste email/nome/senha):
--
--   INSERT INTO usuarios (email, nome, senha_hash, role) VALUES
--     ('email@exemplo.com', 'Nome da Pessoa', crypt('SENHA_AQUI', gen_salt('bf')), 'ravo_user');
--
-- Para trocar uma senha existente:
--
--   UPDATE usuarios SET senha_hash = crypt('NOVA_SENHA', gen_salt('bf'))
--   WHERE email = 'pablocnhenrique@gmail.com';
--
-- Para desativar um usuário sem apagar (ele não consegue mais logar):
--
--   UPDATE usuarios SET ativo = false WHERE email = 'email@exemplo.com';
-- =============================================================================
