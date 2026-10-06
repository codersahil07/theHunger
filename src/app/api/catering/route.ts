import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Validate required fields
    const requiredFields = ['fullName', 'phone', 'email', 'eventType', 'guests', 'eventDate', 'venueName', 'venueAddress', 'city'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }
    
    const supabase = await createClient();

    const { data: enquiry, error } = await supabase
      .from('catering_enquiries')
      .insert([
        {
          full_name: data.fullName,
          phone: data.phone,
          email: data.email,
          event_type: data.eventType,
          guests: parseInt(data.guests, 10),
          event_date: data.eventDate,
          start_time: data.startTime || null,
          venue_name: data.venueName,
          venue_address: data.venueAddress,
          city: data.city,
          catering_requirements: data.cateringRequirements || null,
          dietary_requirements: data.dietaryRequirements || null,
          notes: data.notes || null,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error inserting catering enquiry:', error);
      return NextResponse.json({ error: 'Failed to create catering enquiry' }, { status: 500 });
    }

    return NextResponse.json({ success: true, enquiry }, { status: 201 });
  } catch (error) {
    console.error('Error creating catering enquiry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
