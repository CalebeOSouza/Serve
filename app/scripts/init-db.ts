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
          status ENUM('pendente', 'ativo', 'bloqueado') DEFAULT 'pendente',
          token VARCHAR(255) UNIQUE NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`

CREATE TABLE restaurants (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    parent_id INT NULL,

    name VARCHAR(120) NOT NULL,
    description VARCHAR(255),

    type ENUM('matriz','filial') NOT NULL,

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
    restaurant_id INT NOT NULL,

    type ENUM('gerente', 'cozinha', 'caixa', 'garcom') NOT NULL,

    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NULL,

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
    restaurant_id INT NOT NULL,

    name VARCHAR(120) NULL,
    cpf VARCHAR(50),

    pin VARCHAR(255) NULL,

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
          employee_id INT NOT NULL,
          system_account ENUM('cozinha', 'caixa', 'garçom') NOT NULL,   
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

    parent_id INT NULL,

    name VARCHAR(100) NOT NULL,
    display_order INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,

    FOREIGN KEY (parent_id) REFERENCES menu_categories(id)
    ON DELETE CASCADE
    
);

    `);

    await pool.query(`
  
CREATE TABLE menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
  
    category_id INT NOT NULL,

    name VARCHAR(150) NOT NULL,
    description VARCHAR(255),
    price DECIMAL(10,2) NOT NULL,

    image_url VARCHAR(255),

    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE
);

    `);
    //Tabela dos ambientes
    await pool.query(`

CREATE TABLE environments (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  name         VARCHAR(100) NOT NULL DEFAULT 'Salão principal',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

    `);

    //Tabela das paredes do layout
    await pool.query(`
CREATE TABLE layout_walls (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  environment_id INT NOT NULL,

  wall_type      ENUM('externa','interna','cerca') NOT NULL DEFAULT 'interna',

  pos_x          DECIMAL(8,2) NOT NULL,
  pos_y          DECIMAL(8,2) NOT NULL,

  //Comprimento em pixels (a ponta final = pos_x + length se horizontal,pos_y + length se vertical)
  length         DECIMAL(8,2) NOT NULL,

  is_vertical    BOOLEAN NOT NULL DEFAULT FALSE,

  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (environment_id) REFERENCES environments(id) ON DELETE CASCADE
);
    `);

    //Tabela dos elementos do layout
    await pool.query(`
CREATE TABLE layout_items (
  id INT AUTO_INCREMENT PRIMARY KEY,

  environment_id INT NOT NULL,

  type ENUM('porta') NOT NULL,

  pos_x DECIMAL(8,2) NOT NULL,
  pos_y DECIMAL(8,2) NOT NULL,

  rotation DECIMAL(6,2) NOT NULL DEFAULT 0,

  swing_right BOOLEAN NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (environment_id)
    REFERENCES environments(id)
    ON DELETE CASCADE
);
    `);
    await pool.query(`

CREATE TABLE tables (
  id INT AUTO_INCREMENT PRIMARY KEY,

  environment_id INT NOT NULL,

  number SMALLINT UNSIGNED NOT NULL,

  type ENUM(
    'mesa_quadrada',
    'mesa_redonda',
    'mesa_retangular',
    'mesa_l'
  ) NOT NULL,

  capacity TINYINT UNSIGNED NOT NULL,

  status ENUM(
    'livre',
    'reservada',
    'ocupada',
    'indisponivel'
  ) DEFAULT 'livre',

  pos_x DECIMAL(8,2) NOT NULL,
  pos_y DECIMAL(8,2) NOT NULL,

  rotation DECIMAL(6,2) NOT NULL DEFAULT 0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY unique_table_number (
    environment_id,
    number
  ),

  FOREIGN KEY (environment_id)
    REFERENCES environments(id)
    ON DELETE CASCADE
);

`);

    await pool.query(`
CREATE TABLE table_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,

    table_id INT NOT NULL,

    status ENUM(
        'aberta',
        'conta_solicitada',
        'fechada'
    ) DEFAULT 'aberta',

    total_consumed DECIMAL(10,2) DEFAULT 0,

    total_paid DECIMAL(10,2) DEFAULT 0,

    opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP NULL,

    FOREIGN KEY (table_id)
        REFERENCES tables(id)
);
    `);

    await pool.query(`
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,

    account_id INT NOT NULL,

    waiter_employee_id INT NOT NULL,

    customer_name VARCHAR(120) NOT NULL,

    status ENUM(
        'recebido',
        'em_preparo',
        'pronto',
        'cancelado'
    ) DEFAULT 'recebido',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    canceled_at TIMESTAMP NULL,
    FOREIGN KEY (account_id)
        REFERENCES table_accounts(id),

    FOREIGN KEY (waiter_employee_id)
        REFERENCES employees(id)
);
`);
    await pool.query(`

CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,

    order_id INT NOT NULL,

    menu_item_id INT NOT NULL,

    quantity INT NOT NULL DEFAULT 1,

    unit_price DECIMAL(10,2) NOT NULL,

    observation VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id)
        REFERENCES orders(id),

    FOREIGN KEY (menu_item_id)
        REFERENCES menu_items(id)
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
