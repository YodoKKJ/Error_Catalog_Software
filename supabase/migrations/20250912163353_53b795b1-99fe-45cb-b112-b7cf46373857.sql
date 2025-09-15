-- Desabilitar confirmação de email para permitir login com emails fictícios
-- Nota: Esta configuração deve ser feita no painel do Supabase em Auth > Settings
-- Mas também podemos confirmar automaticamente os usuários existentes

-- Confirmar todos os usuários não confirmados
UPDATE auth.users 
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  confirmed_at = COALESCE(confirmed_at, now())
WHERE email_confirmed_at IS NULL OR confirmed_at IS NULL;