import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Validate required fields
    const requiredFields = ['fullName', 'phone', 'bookingDate', 'bookingTime', 'guests', 'seatingPreference'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }
    
    const supabase = await createClient();

    const { data: booking, error } = await supabase
      .from('table_bookings')
      .insert([
        {
          full_name: data.fullName,
          phone: data.phone,
          email: data.email || null,
          booking_date: data.bookingDate,
          booking_time: data.bookingTime,
          guests: parseInt(data.guests, 10),
          seating_preference: data.seatingPreference,
          special_request: data.specialRequest || null,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error inserting booking:', error);
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
    }

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error) {
    console.error('Error creating table booking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
