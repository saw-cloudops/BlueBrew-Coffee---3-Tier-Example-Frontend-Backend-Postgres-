
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    rating DECIMAL(3,1),
    image_color VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255),
    total DECIMAL(10,2),
    status VARCHAR(20),
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    quantity INT
);

CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50),
    password VARCHAR(200)
);

-- seed products
INSERT INTO products (name, description, price, category, rating, image_color) VALUES
('Midnight Espresso', 'Double shot dark roast.', 4.50, 'Hot Coffee', 4.8, 'bg-blue-900'),
('Blue Velvet Latte', 'Steamed milk with butterfly pea flower.', 5.75, 'Hot Coffee', 4.9, 'bg-blue-600'),
('Arctic Cold Brew', '24-hour steep, served over ice.', 5.00, 'Cold Coffee', 4.7, 'bg-slate-800'),
('Obsidian Americano', 'Rich espresso diluted with hot water.', 3.75, 'Hot Coffee', 4.5, 'bg-black'),
('Glacial Frappe', 'Blended ice coffee with white chocolate.', 6.50, 'Cold Coffee', 4.6, 'bg-blue-400'),
('Noir Croissant', 'Charcoal-infused flaky pastry.', 4.25, 'Pastry', 4.9, 'bg-slate-900'),
('Cloud Cheesecake', 'Classic white cheesecake.', 5.50, 'Pastry', 4.8, 'bg-slate-100'),
('Sapphire Tea', 'Premium Earl Grey with lavender.', 4.00, 'Tea', 4.4, 'bg-indigo-900')
ON CONFLICT DO NOTHING;

-- seed admin user (password is 'admin' - change in prod!)
INSERT INTO admin_users (username, password) VALUES ('admin', 'admin') ON CONFLICT DO NOTHING;
