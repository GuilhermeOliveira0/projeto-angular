-- ============================================
-- SCRIPT DE ATUALIZAÇÃO - ADICIONAR COLUNA DE IMAGEM
-- ============================================

-- Opção 1: Se você JÁ CRIOU a tabela, execute este ALTER TABLE
-- ============================================
ALTER TABLE products ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;

-- Atualizar produtos existentes com imagens de exemplo
UPDATE products SET "imageUrl" = 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400' WHERE name LIKE '%Notebook%';
UPDATE products SET "imageUrl" = 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400' WHERE name LIKE '%Mouse%';
UPDATE products SET "imageUrl" = 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=400' WHERE name LIKE '%Teclado%';
UPDATE products SET "imageUrl" = 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400' WHERE name LIKE '%Monitor%';
UPDATE products SET "imageUrl" = 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400' WHERE name LIKE '%Webcam%';

-- ============================================
-- Opção 2: Se você AINDA NÃO CRIOU a tabela, use este script completo
-- ============================================

-- APENAS SE A TABELA NÃO EXISTIR, descomente e execute:
/*
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  "imageUrl" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
CREATE POLICY "Enable read access for all users" ON products
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON products
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON products
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON products
  FOR DELETE USING (true);

-- Inserir dados de teste COM IMAGENS
INSERT INTO products (name, description, price, "imageUrl") VALUES
  ('Notebook Dell', 'Notebook Dell Inspiron 15, Intel Core i7, 16GB RAM, 512GB SSD', 4500.00, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400'),
  ('Mouse Logitech', 'Mouse sem fio Logitech MX Master 3', 450.00, 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400'),
  ('Teclado Mecânico', 'Teclado mecânico RGB, switches Cherry MX Blue', 650.00, 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=400'),
  ('Monitor LG', 'Monitor LG 27" 4K UHD IPS', 2200.00, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400'),
  ('Webcam Logitech', 'Webcam Full HD 1080p com microfone embutido', 350.00, 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400');
*/

-- ============================================
-- Verificar os dados
-- ============================================
SELECT id, name, price, "imageUrl" FROM products ORDER BY "createdAt" DESC;
