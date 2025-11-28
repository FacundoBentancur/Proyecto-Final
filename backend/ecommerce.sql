-- =============================================
--   BASE DE DATOS ECOMMERCE - PROYECTO FINAL
-- =============================================

DROP DATABASE IF EXISTS ecommerce;
CREATE DATABASE ecommerce;
USE ecommerce;

-- =============================================
--   TABLA DE USUARIOS (opcional para login real)
-- =============================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

INSERT INTO users (usuario, password)
VALUES 
("admin", "admin123"),
("anthony", "Admin123!"),
("test", "Test123!");

-- =============================================
--   TABLA carts (carritos realizados)
-- =============================================
CREATE TABLE carts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
--   TABLA cart_items (productos del carrito)
-- =============================================
CREATE TABLE cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL,
    currency VARCHAR(5) NOT NULL,
    quantity INT NOT NULL,

    FOREIGN KEY (cart_id) REFERENCES carts(id)
        ON DELETE CASCADE
);

-- =============================================
--   TABLA orders (orden FINAL del usuario)
-- =============================================
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    street VARCHAR(255),
    number VARCHAR(50),
    corner VARCHAR(255),
    locality VARCHAR(255),
    city VARCHAR(255),
    shipping_type VARCHAR(50),
    shipping_cost_usd DECIMAL(10,2),
    shipping_cost_uyu DECIMAL(10,2),
    subtotal_usd DECIMAL(10,2),
    subtotal_uyu DECIMAL(10,2),
    total_usd DECIMAL(10,2),
    total_uyu DECIMAL(10,2),
    payment_method VARCHAR(50),
    payment_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
--   TABLA order_items (ítems de la orden final)
-- =============================================
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL,
    currency VARCHAR(5) NOT NULL,
    quantity INT NOT NULL,

    FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE CASCADE
);

-- =============================================
-- FIN DEL SCRIPT
-- =============================================
