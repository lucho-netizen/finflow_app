create DATABASE finflow;

DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ======================
-- Tabla: users
-- ======================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    passwords_keys VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Índices adicionales
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- ======================
-- Tabla: transactions
-- ======================
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DOUBLE PRECISION NOT NULL,
    type VARCHAR(50) NOT NULL,
    category VARCHAR(255),
    description TEXT,
    date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para acelerar consultas
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_category ON transactions(category);

-- ====================================
-- 🚀 Fin del esquema
-- ====================================
