# Angular Supabase Dashboard

Dashboard de gerenciamento de produtos com Angular 17 e Supabase.

## 🚀 Tecnologias

Angular 17 • Angular Material • Supabase • TypeScript

## ⚡ Início Rápido

```bash
# Instalar dependências
npm install

# Iniciar servidor
npm start
```

Acesse: `http://localhost:4200`

## �️ Configurar Banco de Dados

Execute no SQL Editor do Supabase:

```sql
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

## ✨ Funcionalidades

✅ CRUD completo de produtos  
✅ Upload de imagens via URL  
✅ Preview em tempo real  
✅ Interface Material Design  
✅ Confirmação antes de excluir  

## � Licença

MIT
