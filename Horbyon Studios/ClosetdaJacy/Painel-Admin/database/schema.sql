-- Create database
CREATE DATABASE IF NOT EXISTS closet_admin DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE closet_admin;

-- Users table for admin login
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin (password: admin123 hashed with bcrypt)
INSERT INTO usuarios (username, password) VALUES ('admin', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'); -- admin123

-- Products table
CREATE TABLE produtos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL,
  estoque INT DEFAULT 0,
  categoria VARCHAR(100),
  imagem VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sample products
INSERT INTO produtos (nome, descricao, preco, estoque, categoria, imagem) VALUES
('Vestido Floral', 'Vestido leve e elegante com estampa floral vibrante.', 129.90, 25, 'Vestidos', 'vestidofloral.jpg'),
('Calça Wide Cargo Jeans', 'Calça jeans cargo com modelagem wide leg.', 89.90, 5, 'Calças', 'calca-wide.jpg'),
('Body', 'Body versátil em tecido macio.', 49.90, 15, 'Roupas íntimas', 'body.jpg'),
('Blazer de Alfaiataria', 'Blazer clássico de alfaiataria.', 64.90, 8, 'Blazers', 'blazer.jpg');

