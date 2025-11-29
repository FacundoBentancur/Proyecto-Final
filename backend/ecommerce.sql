-- =============================================
--   BASE DE DATOS ECOMMERCE - PROYECTO FINAL
--   SOLO CARRITOS (carts + cart_items)
-- =============================================

DROP DATABASE IF EXISTS ecommerce;
CREATE DATABASE ecommerce;
USE ecommerce;

-- =============================================
--   TABLA carts (carritos del usuario)
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
        ON UPDATE CASCADE
);

-- =============================================
-- FIN DEL SCRIPT
-- =============================================
