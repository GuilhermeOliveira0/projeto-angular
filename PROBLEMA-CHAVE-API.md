# ⚠️ PROBLEMA IDENTIFICADO: Chave Incorreta!

## 🔴 O PROBLEMA

Você está usando a chave **service_role** no arquivo `environment.ts`, mas para autenticação de usuários você DEVE usar a chave **anon** (pública).

### Por quê?
- **service_role**: Chave de administrador, usado apenas no backend (servidor)
- **anon**: Chave pública, usada no frontend para autenticação de usuários

---

## ✅ SOLUÇÃO

### Passo 1: Obter a Chave Correta

1. Acesse: https://app.supabase.com
2. Selecione seu projeto: **excqkpukvbvqfixaofoq**
3. No menu lateral, clique em **Settings** (ícone de engrenagem)
4. Clique em **API**
5. Role até **Project API keys**
6. Copie a chave **anon** / **public** (NÃO a service_role!)

---

### Passo 2: Atualizar os Arquivos

Abra os seguintes arquivos e substitua a chave:

#### `src/environments/environment.ts`
```typescript
export const environment = {
  production: false,
  supabaseUrl: 'https://excqkpukvbvqfixaofoq.supabase.co',
  supabaseKey: 'COLE_AQUI_A_CHAVE_ANON'  // ← Substitua!
};
```

#### `src/environments/environment.development.ts`
```typescript
export const environment = {
  production: false,
  supabaseUrl: 'https://excqkpukvbvqfixaofoq.supabase.co',
  supabaseKey: 'COLE_AQUI_A_CHAVE_ANON'  // ← Substitua!
};
```

#### `src/environments/environment.prod.ts`
```typescript
export const environment = {
  production: true,
  supabaseUrl: 'https://excqkpukvbvqfixaofoq.supabase.co',
  supabaseKey: 'COLE_AQUI_A_CHAVE_ANON'  // ← Substitua!
};
```

---

### Passo 3: Reiniciar o Servidor

Após substituir a chave:

```bash
# Pare o servidor (Ctrl+C no terminal)
# Inicie novamente:
npm start
```

---

### Passo 4: Testar Novamente

1. Acesse: http://localhost:4200/register
2. Cadastre um novo usuário
3. Deve funcionar! 🎉

---

## 🔍 Como Saber se Funcionou?

1. Após cadastrar, vá no painel do Supabase
2. **Authentication** > **Users**
3. O usuário deve aparecer na lista!

---

## ⚠️ IMPORTANTE: Segurança

**NUNCA compartilhe sua chave service_role publicamente!**
- A chave service_role tem acesso total ao banco
- Use APENAS no backend/servidor
- No frontend, use SEMPRE a chave anon

Como você já compartilhou a service_role aqui, RECOMENDO:
1. Ir em Settings > API
2. Clicar em "Reset service_role key"
3. Gerar uma nova chave service_role
4. Manter ela segura e privada
