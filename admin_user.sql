-- Criar usuário administrador padrão
-- Usuário: admin@vidanavida.com.br
-- Senha: pedrao
INSERT INTO User (id, name, email, password, role, active, updatedAt) 
VALUES ('admin-001', 'Administrador', 'admin@vidanavida.com.br', '$2b$10$F0hUgtksnYORdWy9jq2wAu.gaQqX434Wor.5RS8LzQbW6Vg8SVruS', 'ADMIN', 1, NOW());
