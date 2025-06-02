export type Profile = {
  id: string
  email: string
  full_name: string
  phone: string | null
  receive_marketing: boolean
  created_at: string
  updated_at: string
}

export type VehicleMake = {
  id: number
  name: string
}

export type VehicleModel = {
  id: number
  name: string
  make_id: number
}

export type ServiceType = {
  id: number
  name: string
  description: string
  base_price: number
}

export type Booking = {
  id: string
  user_id: string
  booking_date: string
  status: string
  service_type_id: number
  vehicle_make_id: number
  vehicle_model_id: number
  vehicle_year: number
  quote_amount: number
  created_at: string
  updated_at: string
}

export type TimeSlot = {
  id: number
  date_time: string
  is_available: boolean
}
