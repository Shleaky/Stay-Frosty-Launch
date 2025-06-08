-- Create product_orders table
CREATE TABLE IF NOT EXISTS product_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_status VARCHAR(50) DEFAULT 'not_shipped',
    payment_intent_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES product_orders(id) ON DELETE CASCADE,
    product_id VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    flavor_id VARCHAR(255),
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_orders_user_id ON product_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_product_orders_status ON product_orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Enable Row Level Security
ALTER TABLE product_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for product_orders
CREATE POLICY "Users can view their own orders" ON product_orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" ON product_orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" ON product_orders
    FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for order_items
CREATE POLICY "Users can view their own order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM product_orders 
            WHERE product_orders.id = order_items.order_id 
            AND product_orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own order items" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM product_orders 
            WHERE product_orders.id = order_items.order_id 
            AND product_orders.user_id = auth.uid()
        )
    );

-- Grant necessary permissions
GRANT ALL ON product_orders TO authenticated;
GRANT ALL ON order_items TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
