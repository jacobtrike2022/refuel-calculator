import { kv } from '@vercel/kv';

const CALCULATOR_KEY = 'refuel-calculator-data';

export async function GET() {
  try {
    const data = await kv.get(CALCULATOR_KEY);
    if (data) {
      return Response.json(data);
    }
    return Response.json({ exists: false });
  } catch (error) {
    console.error('Error loading data:', error);
    return Response.json({ error: 'Failed to load data' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    data.timestamp = new Date().toISOString();
    await kv.set(CALCULATOR_KEY, data);
    return Response.json({ success: true, timestamp: data.timestamp });
  } catch (error) {
    console.error('Error saving data:', error);
    return Response.json({ error: 'Failed to save data' }, { status: 500 });
  }
}
