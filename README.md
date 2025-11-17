# Angular E-commerce com Supabase

Sistema completo de e-commerce com Angular 17, autenticação de usuários e carrinho de compras integrado ao Supabase.

## 🚀 Tecnologias

- **Angular 17** - Framework frontend
- **Angular Material** - Componentes UI
- **Supabase** - Backend (autenticação + banco de dados)
- **TypeScript** - Linguagem principal

## 🌐 URL do Projeto

**Acesse:** `http://localhost:4200`

## ⚡ Como Rodar o Projeto

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Supabase

Crie um arquivo `src/environments/environment.ts` com suas credenciais:

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'SUA_URL_SUPABASE',
  supabaseKey: 'SUA_CHAVE_PUBLICA_SUPABASE'
};
```

### 3. Configurar Banco de Dados

Execute os seguintes scripts SQL no SQL Editor do Supabase **na ordem**:

#### 3.1. Tabela de Produtos
```sql
-- setup-database.sql
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  "imageUrl" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all operations" ON products FOR ALL USING (true);
```

#### 3.2. Autenticação
```sql
-- setup-autenticacao.sql
-- A autenticação é gerenciada automaticamente pelo Supabase Auth
-- Certifique-se de habilitar "Email" em Authentication > Providers
```

#### 3.3. Carrinho de Compras
```sql
-- setup-carrinho.sql
-- Tabela de itens do carrinho
CREATE TABLE IF NOT EXISTS cart_items (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de itens do pedido
CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Políticas de segurança
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Políticas para cart_items
CREATE POLICY "Users can view their own cart items"
  ON cart_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items"
  ON cart_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items"
  ON cart_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items"
  ON cart_items FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para orders
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas para order_items
CREATE POLICY "Users can view their own order items"
  ON order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  ));

CREATE POLICY "Users can create order items for their orders"
  ON order_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  ));
```

### 4. Iniciar o Servidor
```bash
npm start
```

## ✨ Funcionalidades

### Produtos
- ✅ Listagem de produtos
- ✅ Visualização de detalhes
- ✅ CRUD completo (admin)
- ✅ Upload de imagens via URL
- ✅ Interface Material Design

### Autenticação
- ✅ Registro de usuários
- ✅ Login/Logout
- ✅ Proteção de rotas
- ✅ Gerenciamento de sessão

### Carrinho de Compras
- ✅ Adicionar produtos ao carrinho
- ✅ Remover produtos do carrinho
- ✅ Ajustar quantidade
- ✅ Cálculo automático de totais
- ✅ Persistência no Supabase
- ✅ Finalização de pedidos
- ✅ Histórico de compras

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── auth/              # Componentes de autenticação
│   │   ├── login/
│   │   └── register/
│   ├── cart/              # Carrinho de compras
│   ├── checkout/          # Finalização de pedidos
│   ├── guards/            # Guards de rota
│   ├── home/              # Página inicial
│   ├── models/            # Interfaces TypeScript
│   ├── products/          # Listagem de produtos
│   ├── product-dialog/    # Modal de detalhes
│   └── services/          # Serviços (Supabase, Cart)
└── environments/          # Configurações de ambiente
```

## 🔑 Configuração do Supabase

1. Crie uma conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Copie a URL e a chave pública (anon key)
4. Cole em `src/environments/environment.ts`
5. Execute os scripts SQL fornecidos acima
6. Habilite "Email" em Authentication > Providers

## 📄 Licença

MIT
