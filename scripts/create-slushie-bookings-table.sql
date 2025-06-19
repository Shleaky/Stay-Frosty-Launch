-- Create slushie_bookings table
CREATE TABLE IF NOT EXISTS slushie_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  machine_type TEXT NOT NULL CHECK (machine_type IN ('single', 'double', 'triple')),
  package_type TEXT NOT NULL CHECK (package_type IN ('basic', 'standard', 'premium')),
  flavors TEXT[] DEFAULT '{}',
  event_type TEXT,
  guest_count INTEGER DEFAULT 0,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT,
  address TEXT NOT NULL,
  comments TEXT,
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_intent_id TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_slushie_bookings_user_id ON slushie_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_slushie_bookings_booking_date ON slushie_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_slushie_bookings_status ON slushie_bookings(status);
CREATE INDEX IF NOT EXISTS idx_slushie_bookings_payment_intent ON slushie_bookings(payment_intent_id);

-- Enable Row Level Security
ALTER TABLE slushie_bookings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own bookings" ON slushie_bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookings" ON slushie_bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" ON slushie_bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_slushie_bookings_updated_at 
  BEFORE UPDATE ON slushie_bookings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
