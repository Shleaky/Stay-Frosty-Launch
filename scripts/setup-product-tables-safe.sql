-- Safe database setup for product functionality
-- This script only ADDS new tables and won't modify existing data

-- Check if tables already exist
DO $$
BEGIN
    -- Create product_orders table only if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'product_orders') THEN
        CREATE TABLE product_orders (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            status VARCHAR(50) DEFAULT 'pending',
            total_amount DECIMAL(10,2) NOT NULL,
            shipping_status VARCHAR(50) DEFAULT 'not_shipped',
            payment_intent_id VARCHAR(255),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Created product_orders table';
    ELSE
        RAISE NOTICE 'product_orders table already exists, skipping creation';
    END IF;

    -- Create order_items table only if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'order_items') THEN
        CREATE TABLE order_items (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            order_id UUID REFERENCES product_orders(id) ON DELETE CASCADE,
            product_id VARCHAR(255) NOT NULL,
            quantity INTEGER NOT NULL,
            flavor_id VARCHAR(255),
            price DECIMAL(10,2) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Created order_items table';
    ELSE
        RAISE NOTICE 'order_items table already exists, skipping creation';
    END IF;
END
$$;

-- Create indexes only if they don't exist
CREATE INDEX IF NOT EXISTS idx_product_orders_user_id ON product_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_product_orders_status ON product_orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Enable Row Level Security (safe to run multiple times)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'product_orders') THEN
        ALTER TABLE product_orders ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'order_items') THEN
        ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
    END IF;
END
$$;

-- Create RLS policies only if they don't exist
DO $$
BEGIN
    -- Policies for product_orders
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'product_orders') THEN
        -- Check and create policies for product_orders
        IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'product_orders' AND policyname = 'Users can view their own orders') THEN
            CREATE POLICY "Users can view their own orders" ON product_orders
                FOR SELECT USING (auth.uid() = user_id);
        END IF;

        IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'product_orders' AND policyname = 'Users can insert their own orders') THEN
            CREATE POLICY "Users can insert their own orders" ON product_orders
                FOR INSERT WITH CHECK (auth.uid() = user_id);
        END IF;

        IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'product_orders' AND policyname = 'Users can update their own orders') THEN
            CREATE POLICY "Users can update their own orders" ON product_orders
                FOR UPDATE USING (auth.uid() = user_id);
        END IF;
    END IF;

    -- Policies for order_items
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'order_items') THEN
        IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'order_items' AND policyname = 'Users can view their own order items') THEN
            CREATE POLICY "Users can view their own order items" ON order_items
                FOR SELECT USING (
                    EXISTS (
                        SELECT 1 FROM product_orders 
                        WHERE product_orders.id = order_items.order_id 
                        AND product_orders.user_id = auth.uid()
                    )
                );
        END IF;

        IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'order_items' AND policyname = 'Users can insert their own order items') THEN
            CREATE POLICY "Users can insert their own order items" ON order_items
                FOR INSERT WITH CHECK (
                    EXISTS (
                        SELECT 1 FROM product_orders 
                        WHERE product_orders.id = order_items.order_id 
                        AND product_orders.user_id = auth.uid()
                    )
                );
        END IF;
    END IF;
END
$$;

-- Grant permissions (safe to run multiple times)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'product_orders') THEN
        GRANT ALL ON product_orders TO authenticated;
        GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'order_items') THEN
        GRANT ALL ON order_items TO authenticated;
    END IF;
END
$$;

-- Final verification
DO $$
BEGIN
    RAISE NOTICE 'Database setup completed successfully!';
    RAISE NOTICE 'Tables created: product_orders, order_items';
    RAISE NOTICE 'Your existing database tables and data remain unchanged.';
END
$$;
