import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    // First, check what tables already exist
    const { data: existingTables, error: checkError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .in("table_name", ["product_orders", "order_items"])

    if (checkError) {
      console.error("Error checking existing tables:", checkError)
    }

    const existingTableNames = existingTables?.map((t) => t.table_name) || []

    console.log("Existing product tables:", existingTableNames)

    // Only create tables that don't exist
    const tablesToCreate = []

    if (!existingTableNames.includes("product_orders")) {
      tablesToCreate.push("product_orders")
    }

    if (!existingTableNames.includes("order_items")) {
      tablesToCreate.push("order_items")
    }

    if (tablesToCreate.length === 0) {
      return NextResponse.json({
        success: true,
        message: "All product tables already exist. No changes made to your database.",
        existingTables: existingTableNames,
      })
    }

    // Create the safe SQL script
    const safeSQL = `
      -- Safe database setup for product functionality
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
          END IF;
      END
      $$;

      -- Create indexes only if they don't exist
      CREATE INDEX IF NOT EXISTS idx_product_orders_user_id ON product_orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_product_orders_status ON product_orders(status);
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

      -- Enable RLS and create policies safely
      DO $$
      BEGIN
          IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'product_orders') THEN
              ALTER TABLE product_orders ENABLE ROW LEVEL SECURITY;
              
              -- Create policies only if they don't exist
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

          IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'order_items') THEN
              ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
              
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

          -- Grant permissions
          IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'product_orders') THEN
              GRANT ALL ON product_orders TO authenticated;
          END IF;
          
          IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'order_items') THEN
              GRANT ALL ON order_items TO authenticated;
          END IF;
          
          GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
      END
      $$;
    `

    // Execute the safe SQL
    const { error: sqlError } = await supabase.rpc("exec_sql", { sql: safeSQL })

    if (sqlError) {
      console.error("Error executing SQL:", sqlError)
      return NextResponse.json({
        success: false,
        error: sqlError.message,
        details: "Failed to create product tables",
      })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully created ${tablesToCreate.join(", ")} table(s). Your existing database remains unchanged.`,
      createdTables: tablesToCreate,
      existingTables: existingTableNames,
    })
  } catch (error) {
    console.error("Error setting up product tables:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    })
  }
}
