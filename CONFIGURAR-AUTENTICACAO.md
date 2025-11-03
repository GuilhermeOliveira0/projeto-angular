# 🔧 Configurar Autenticação no Supabase

## ⚠️ IMPORTANTE: O cadastro não funciona sem estas configurações!

### 📋 Passo 1: Acessar o Painel do Supabase

1. Acesse: https://app.supabase.com
2. Faça login
3. Selecione seu projeto: **excqkpukvbvqfixaofoq**

---

### 🔐 Passo 2: Habilitar Autenticação por Email

1. No menu lateral, clique em **Authentication**
2. Clique em **Providers**
3. Encontre **Email** e clique para configurar
4. Certifique-se que está **HABILITADO** (toggle deve estar verde/ativo)

---

### ✅ Passo 3: DESABILITAR Confirmação de Email (para testes)

**ATENÇÃO: Esta é a parte MAIS IMPORTANTE!**

1. No menu lateral, clique em **Authentication**
2. Clique em **Settings** (ou Email Templates)
3. Role até encontrar **"Enable email confirmations"**
4. **DESMARQUE/DESABILITE** esta opção ❌
5. Clique em **Save**

**Por quê?** Por padrão, o Supabase exige que o usuário confirme o email antes de poder fazer login. Desabilitando isso, o usuário pode fazer login imediatamente após o cadastro.

---

### 🧪 Passo 4: Testar o Cadastro

1. Acesse sua aplicação: http://localhost:4200/register
2. Preencha:
   - **Nome**: Seu Nome
   - **Email**: teste@teste.com
   - **Senha**: 123456
   - **Confirmar Senha**: 123456
3. Clique em **Criar Conta**

---

### 🔍 Passo 5: Verificar se o Usuário foi Criado

1. No painel do Supabase, vá em **Authentication** > **Users**
2. Você deve ver o usuário cadastrado na lista
3. Clique no usuário para ver os detalhes
4. Em **User Metadata**, você verá o campo `name` com o nome cadastrado

---

### 🐛 Se Ainda Não Funcionar

#### Abra o Console do Navegador:
1. Pressione **F12** no navegador
2. Vá na aba **Console**
3. Tente cadastrar novamente
4. Veja se aparece algum erro em vermelho
5. Me envie a mensagem de erro

#### Erros Comuns:

**"Email rate limit exceeded"**
- Você tentou cadastrar muitas vezes seguidas
- Aguarde 1 hora ou use outro email

**"User already registered"**
- O email já foi cadastrado
- Use outro email ou delete o usuário no painel

**"Invalid API key"**
- Verifique se as credenciais em `environment.ts` estão corretas
- Use a chave **anon/public** e NÃO a service_role

---

### 📊 OPCIONAL: Criar Tabela de Perfis

Se quiser armazenar mais informações dos usuários, execute este SQL no **SQL Editor**:

```sql
-- Criar tabela de perfis
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

### ✅ Checklist Final

- [ ] Email Provider habilitado
- [ ] "Enable email confirmations" DESABILITADO
- [ ] Credenciais corretas no environment.ts
- [ ] Projeto Angular rodando (npm start)
- [ ] Console do navegador sem erros

**Após seguir estes passos, o cadastro funcionará perfeitamente!** 🎉
