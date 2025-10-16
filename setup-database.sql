-- ============================================
-- SCRIPT DE CONFIGURAÇÃO DO BANCO DE DADOS
-- Projeto: Angular Supabase Dashboard
-- ============================================

-- 1. CRIAR A TABELA PRODUCTS
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 2. HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 3. CRIAR POLÍTICA DE SEGURANÇA
-- ============================================
-- Esta política permite todas as operações para todos os usuários
-- ATENÇÃO: Em produção, ajuste conforme suas regras de negócio!

-- Política para SELECT (leitura)
CREATE POLICY "Enable read access for all users" ON products
  FOR SELECT USING (true);

-- Política para INSERT (inserção)
CREATE POLICY "Enable insert access for all users" ON products
  FOR INSERT WITH CHECK (true);

-- Política para UPDATE (atualização)
CREATE POLICY "Enable update access for all users" ON products
  FOR UPDATE USING (true);

-- Política para DELETE (exclusão)
CREATE POLICY "Enable delete access for all users" ON products
  FOR DELETE USING (true);

-- 4. INSERIR DADOS DE TESTE (OPCIONAL)
-- ============================================
INSERT INTO products (name, description, price) VALUES
  ('Notebook Dell', 'Notebook Dell Inspiron 15, Intel Core i7, 16GB RAM, 512GB SSD', 4500.00),
  ('Mouse Logitech', 'Mouse sem fio Logitech MX Master 3', 450.00),
  ('Teclado Mecânico', 'Teclado mecânico RGB, switches Cherry MX Blue', 650.00),
  ('Monitor LG', 'Monitor LG 27" 4K UHD IPS', 2200.00),
  ('Webcam Logitech', 'Webcam Full HD 1080p com microfone embutido', 350.00);

-- 5. VERIFICAR OS DADOS
-- ============================================
SELECT * FROM products ORDER BY "createdAt" DESC;

-- ============================================
-- INSTRUÇÕES DE USO
-- ============================================
-- 1. Acesse o painel do Supabase: https://app.supabase.com
-- 2. Selecione seu projeto: lcegnnzqejtblgrlzpqo
-- 3. Vá em "SQL Editor" no menu lateral
-- 4. Cole e execute este script
-- 5. Volte para a aplicação Angular e recarregue a página
-- ============================================
