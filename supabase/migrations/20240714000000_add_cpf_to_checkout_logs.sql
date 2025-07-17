-- Adiciona a coluna cpf na tabela checkout_logs se não existir
ALTER TABLE public.checkout_logs 
ADD COLUMN IF NOT EXISTS cpf TEXT; 