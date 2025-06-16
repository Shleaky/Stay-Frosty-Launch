-- Create products table if it doesn't exist
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    has_flavors BOOLEAN DEFAULT false,
    in_stock BOOLEAN DEFAULT true,
    image VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for category searches
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view products" ON products
    FOR SELECT USING (true);

-- Only admins can insert/update/delete products
-- This is enforced in the application code by checking admin status
