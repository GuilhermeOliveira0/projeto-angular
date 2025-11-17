-- ============================================
-- CONFIGURAÇÃO DO CARRINHO NO SUPABASE
-- ============================================

-- 1. CRIAR TABELA DE ITENS DO CARRINHO
-- ============================================
CREATE TABLE IF NOT EXISTS cart_items (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 2. CRIAR ÍNDICES PARA MELHOR PERFORMANCE
-- ============================================
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);

-- 3. HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR POLÍTICAS DE SEGURANÇA
-- ============================================

-- Usuários podem ver apenas seus próprios itens do carrinho
CREATE POLICY "Users can view own cart items" ON cart_items
  FOR SELECT USING (auth.uid() = user_id);

-- Usuários podem inserir itens no próprio carrinho
CREATE POLICY "Users can insert own cart items" ON cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar apenas seus próprios itens
CREATE POLICY "Users can update own cart items" ON cart_items
  FOR UPDATE USING (auth.uid() = user_id);

-- Usuários podem deletar apenas seus próprios itens
CREATE POLICY "Users can delete own cart items" ON cart_items
  FOR DELETE USING (auth.uid() = user_id);

-- 5. FUNÇÃO PARA ATUALIZAR O TIMESTAMP
-- ============================================
CREATE OR REPLACE FUNCTION update_cart_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. TRIGGER PARA ATUALIZAR AUTOMATICAMENTE
-- ============================================
DROP TRIGGER IF EXISTS cart_items_updated_at ON cart_items;
CREATE TRIGGER cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_cart_items_updated_at();

-- 7. CRIAR TABELA DE PEDIDOS (OPCIONAL - PARA HISTÓRICO)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total NUMERIC(10, 2) NOT NULL,
  shipping_cost NUMERIC(10, 2) DEFAULT 0,
  cep TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CRIAR TABELA DE ITENS DO PEDIDO
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id),
  product_name TEXT NOT NULL,
  product_price NUMERIC(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. HABILITAR RLS NAS TABELAS DE PEDIDOS
-- ============================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 10. POLÍTICAS PARA ORDERS
-- ============================================
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 11. POLÍTICAS PARA ORDER_ITEMS
-- ============================================
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- ============================================
-- VERIFICAR DADOS
-- ============================================

-- Ver itens do carrinho do usuário atual
SELECT 
  ci.id,
  ci.quantity,
  p.name,
  p.price,
  (p.price * ci.quantity) as subtotal,
  ci.created_at
FROM cart_items ci
JOIN products p ON p.id = ci.product_id
WHERE ci.user_id = auth.uid()
ORDER BY ci.created_at DESC;

-- Ver todos os pedidos do usuário
SELECT * FROM orders WHERE user_id = auth.uid() ORDER BY created_at DESC;

-- ============================================
-- INSTRUÇÕES DE USO
-- ============================================
-- 1. Acesse o painel do Supabase: https://app.supabase.com
-- 2. Selecione seu projeto
-- 3. Vá em "SQL Editor" no menu lateral
-- 4. Cole e execute este script completo
-- 5. Verifique se as tabelas foram criadas em "Table Editor"
-- 6. O carrinho agora será sincronizado com o banco!
-- ============================================
