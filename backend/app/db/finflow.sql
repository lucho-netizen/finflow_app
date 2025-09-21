-- ==============================
-- Finflow DB - Versión Mejorada
-- ==============================

-- Crear base de datos (si no existe)
CREATE DATABASE IF NOT EXISTS finflow;

-- Conectarse a la base de datos
\c finflow;

-- ==============================
-- Tabla: users
-- ==============================
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    passwords_keys TEXT NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    timezone VARCHAR(50) DEFAULT 'America/Bogota',
    failed_logins INT DEFAULT 0,
    last_failed_login TIMESTAMP,
    password_changed_at TIMESTAMP,
    refresh_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- ==============================
-- Tabla: categories
-- ==============================
DROP TABLE IF EXISTS categories CASCADE;

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL, -- income/expense
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==============================
-- Tabla: transactions
-- ==============================
DROP TABLE IF EXISTS transactions CASCADE;

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DOUBLE PRECISION NOT NULL,
    type VARCHAR(50) NOT NULL, -- income/expense
    category_id INT REFERENCES categories(id),
    description TEXT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    currency CHAR(3) DEFAULT 'COP',
    tags TEXT[],
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_category ON transactions(category_id);

-- ==============================
-- Tabla: budgets
-- ==============================
DROP TABLE IF EXISTS budgets CASCADE;

CREATE TABLE budgets (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INT NOT NULL REFERENCES categories(id),
    amount_limit DOUBLE PRECISION NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==============================
-- Tabla: transactions_log (auditoría)
-- ==============================
DROP TABLE IF EXISTS transactions_log CASCADE;

CREATE TABLE transactions_log (
    id SERIAL PRIMARY KEY,
    transaction_id INT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    user_id INT NOT NULL,
    old_amount DOUBLE PRECISION,
    old_type VARCHAR(50),
    old_category_id INT,
    old_description TEXT,
    old_date TIMESTAMP,
    new_amount DOUBLE PRECISION,
    new_type VARCHAR(50),
    new_category_id INT,
    new_description TEXT,
    new_date TIMESTAMP,
    action VARCHAR(20) NOT NULL, -- INSERT/UPDATE/DELETE
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==============================
-- Row Level Security
-- ==============================
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY select_own ON transactions
  FOR SELECT
  USING (user_id = current_setting('request.user_id')::INT);

CREATE POLICY insert_own ON transactions
  FOR INSERT
  WITH CHECK (user_id = current_setting('request.user_id')::INT);

CREATE POLICY update_own ON transactions
  FOR UPDATE
  USING (user_id = current_setting('request.user_id')::INT);

CREATE POLICY delete_own ON transactions
  FOR DELETE
  USING (user_id = current_setting('request.user_id')::INT);

-- ==============================
-- Trigger: auditoría de transactions
-- ==============================
CREATE OR REPLACE FUNCTION log_transaction_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO transactions_log(
      transaction_id, user_id, 
      old_amount, old_type, old_category_id, old_description, old_date,
      new_amount, new_type, new_category_id, new_description, new_date,
      action
    ) VALUES (
      OLD.id, OLD.user_id,
      OLD.amount, OLD.type, OLD.category_id, OLD.description, OLD.date,
      NEW.amount, NEW.type, NEW.category_id, NEW.description, NEW.date,
      'UPDATE'
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO transactions_log(
      transaction_id, user_id,
      old_amount, old_type, old_category_id, old_description, old_date,
      action
    ) VALUES (
      OLD.id, OLD.user_id,
      OLD.amount, OLD.type, OLD.category_id, OLD.description, OLD.date,
      'DELETE'
    );
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO transactions_log(
      transaction_id, user_id,
      new_amount, new_type, new_category_id, new_description, new_date,
      action
    ) VALUES (
      NEW.id, NEW.user_id,
      NEW.amount, NEW.type, NEW.category_id, NEW.description, NEW.date,
      'INSERT'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_transaction
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW EXECUTE FUNCTION log_transaction_changes();

-- ==============================
-- Fin del script
-- ==============================
