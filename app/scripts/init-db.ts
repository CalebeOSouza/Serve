import mysql from "mysql2/promise";
import "dotenv/config";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function main() {
  try {
    await pool.query(`CREATE DATABASE IF NOT EXISTS db_serve`);
    await pool.query(`USE db_serve`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(150) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          user_type ENUM('admin', 'gerente', 'cliente') NULL,
          status ENUM('pendente', 'ativo', 'bloqueado') DEFAULT 'pendente',
          token VARCHAR(255) UNIQUE NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`

CREATE TABLE restaurants (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    name VARCHAR(120) NOT NULL,
    description VARCHAR(255),

    type ENUM('matriz','filial') NOT NULL,

    parent_id INT NULL,

    zipcode VARCHAR(10),
    street VARCHAR(150),
    number VARCHAR(10),
    neighborhood VARCHAR(100),
    city VARCHAR(100),
    state CHAR(2),

    status ENUM('configurando', 'operacional', 'pausado') 
    DEFAULT 'configurando',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    onboarding_step INT DEFAULT 2,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

    `);

    await pool.query(`
CREATE TABLE restaurant_hours (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,

  day_of_week ENUM(
    'segunda',
    'terca',
    'quarta',
    'quinta',
    'sexta',
    'sabado',
    'domingo'
  ) NOT NULL,

  enabled BOOLEAN DEFAULT TRUE,
  open_time TIME NULL,
  close_time TIME NULL,

  UNIQUE KEY unique_day (restaurant_id, day_of_week),

  FOREIGN KEY (restaurant_id)
    REFERENCES restaurants(id)
    ON DELETE CASCADE
);
`);

    await pool.query(`
  CREATE TABLE restaurant_media (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT NOT NULL,

    logo_url VARCHAR(255),
    banner_url VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

    `);

    await pool.query(`
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,

    type ENUM('gerente', 'cozinha', 'caixa', 'garcom') NOT NULL,

    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NULL,

    restaurant_id INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY unique_role_per_restaurant (restaurant_id, type),

    FOREIGN KEY (restaurant_id) 
        REFERENCES restaurants(id) 
        ON DELETE CASCADE
);
`);

    await pool.query(`
      CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(120) NULL,
    cpf VARCHAR(50),

    pin VARCHAR(255) NULL,

    restaurant_id INT NOT NULL,

    status ENUM('ativo', 'inativo') DEFAULT 'ativo',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (restaurant_id)
        REFERENCES restaurants(id)
        ON DELETE CASCADE
);
    `);

    await pool.query(`
CREATE TABLE employee_roles (
    id INT AUTO_INCREMENT PRIMARY KEY,

    employee_id INT NOT NULL,
    role_id INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY unique_employee_role (employee_id, role_id),

    FOREIGN KEY (employee_id)
        REFERENCES employees(id)
        ON DELETE CASCADE,

    FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE CASCADE
);
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS employee_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          restaurant_id INT NOT NULL,
          system_account ENUM('cozinha', 'caixa', 'garçom') NOT NULL,
          employee_id INT NOT NULL,
          action_description VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (employee_id) REFERENCES employees(id),
          FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
      );
    `);

    await pool.query(`
  CREATE TABLE menu_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT NOT NULL,

    name VARCHAR(100) NOT NULL,
    display_order INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

    `);

    await pool.query(`
  
CREATE TABLE menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT NOT NULL,
    category_id INT NOT NULL,

    name VARCHAR(150) NOT NULL,
    description VARCHAR(255),
    price DECIMAL(10,2) NOT NULL,

    image_url VARCHAR(255),

    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE
);

    `);

    console.log("Banco e tabelas criados com sucesso!");
  } catch (error) {
    console.error("Erro ao criar banco/tabelas:", error);
  } finally {
    await pool.end();
    process.exit();
  }
}

main();
