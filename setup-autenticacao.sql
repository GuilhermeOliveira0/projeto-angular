-- ============================================
-- CONFIGURAÇÃO DE AUTENTICAÇÃO NO SUPABASE
-- ============================================

-- IMPORTANTE: Este script é apenas informativo
-- As configurações abaixo devem ser feitas no painel do Supabase

-- ============================================
-- PASSO 1: CONFIGURAR AUTENTICAÇÃO
-- ============================================
-- 1. Acesse: https://app.supabase.com
-- 2. Selecione seu projeto
-- 3. Vá em "Authentication" > "Providers"
-- 4. Habilite "Email" provider
-- 5. Configure as opções:
--    - Enable Email provider: ✅ ON
--    - Confirm email: ❌ OFF (para testes)
--    - Secure email change: ✅ ON (recomendado)

-- ============================================
-- PASSO 2: DESABILITAR CONFIRMAÇÃO DE EMAIL (PARA TESTES)
-- ============================================
-- 1. Vá em "Authentication" > "Settings"
-- 2. Em "Email Auth", desmarque:
--    - Enable email confirmations: ❌ OFF
--    Isso permite login imediato após o cadastro
-- 3. Em produção, reative esta opção!

-- ============================================
-- PASSO 3: VERIFICAR USUÁRIOS CADASTRADOS
-- ============================================
-- 1. Vá em "Authentication" > "Users"
-- 2. Você verá a lista de usuários cadastrados
-- 3. Cada usuário terá:
--    - Email
--    - Created At
--    - Last Sign In
--    - User Metadata (onde fica o "name")

-- ============================================
-- PASSO 4: CRIAR TABELA DE PERFIS (OPCIONAL)
-- ============================================
-- Se quiser armazenar informações adicionais dos usuários:

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política: usuários podem ver e editar apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Função para criar perfil automaticamente ao cadastrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar a função
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- PASSO 5: VERIFICAR CONFIGURAÇÃO
-- ============================================
-- Execute estas queries para testar:

-- Ver usuários cadastrados
SELECT id, email, created_at, raw_user_meta_data->>'name' as name
FROM auth.users;

-- Ver perfis (se criou a tabela)
SELECT * FROM profiles;

-- ============================================
-- TROUBLESHOOTING
-- ============================================
-- Se não estiver funcionando:
-- 1. Verifique o console do navegador (F12) para erros
-- 2. Verifique se o Email Provider está habilitado
-- 3. Verifique se "Confirm email" está desabilitado (para testes)
-- 4. Verifique suas credenciais em environment.ts
-- 5. Tente cadastrar pelo próprio painel do Supabase para testar
-- ============================================
