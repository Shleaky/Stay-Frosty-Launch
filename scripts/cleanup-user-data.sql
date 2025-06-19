-- Clean up all user-related data
-- This script will remove all users and their associated data

-- Delete user profiles
DELETE FROM profiles;

-- Delete user bookings
DELETE FROM bookings;

-- Delete user orders
DELETE FROM product_orders;
DELETE FROM order_items;

-- Delete user sessions (this will force re-authentication)
-- Note: This affects the auth.sessions table which requires service role
-- You may need to run this separately with admin privileges

-- Reset any sequences if needed
-- ALTER SEQUENCE profiles_id_seq RESTART WITH 1;
-- ALTER SEQUENCE bookings_id_seq RESTART WITH 1;
-- ALTER SEQUENCE product_orders_id_seq RESTART WITH 1;

-- Verify cleanup
SELECT 'Profiles remaining: ' || COUNT(*) FROM profiles;
SELECT 'Bookings remaining: ' || COUNT(*) FROM bookings;
SELECT 'Orders remaining: ' || COUNT(*) FROM product_orders;
