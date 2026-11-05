const { google } = require('googleapis');

// Creates a Google Calendar event and returns confirmation
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, company, notes, date, time } = req.body;

    if (!name || !email || !date || !time) {
      return res.status(400).json({ error: 'Missing required fields: name, email, date, time' });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    const calendar = google.calendar({ version: 'v3', auth });
    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    // Parse date and time
    const [yearStr, monthStr, dayStr] = date.split('-');
    const timeMatch = time.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
    if (!timeMatch) {
      return res.status(400).json({ error: 'Invalid time format' });
    }

    let hour = parseInt(timeMatch[1]);
    const minute = parseInt(timeMatch[2]);
    const period = timeMatch[3].toUpperCase();

    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;

    const startDate = new Date(
      parseInt(yearStr),
      parseInt(monthStr) - 1,
      parseInt(dayStr),
      hour,
      minute
    );
    const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);

    // Check the slot is still available
    const conflicts = await calendar.events.list({
      calendarId,
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
    });

    if (conflicts.data.items && conflicts.data.items.length > 0) {
      return res.status(409).json({ error: 'This time slot is no longer available. Please choose another.' });
    }

    // Build event description
    const description = [
      `Booked via Social Gear AI website`,
      ``,
      `Name: ${name}`,
      `Email: ${email}`,
      company ? `Company: ${company}` : null,
      notes ? `\nNotes: ${notes}` : null,
    ].filter(Boolean).join('\n');

    // Create the event
    const event = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: `Social Gear AI — ${name}`,
        description,
        start: {
          dateTime: startDate.toISOString(),
          timeZone: process.env.CALENDAR_TIMEZONE || 'America/New_York',
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: process.env.CALENDAR_TIMEZONE || 'America/New_York',
        },
        attendees: [
          { email },
        ],
        conferenceData: {
          createRequest: {
            requestId: `sgai-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 60 },
            { method: 'popup', minutes: 15 },
          ],
        },
      },
      conferenceDataVersion: 1,
      sendUpdates: 'all',
    });

    res.status(200).json({
      success: true,
      eventId: event.data.id,
      meetLink: event.data.hangoutLink || null,
      start: event.data.start.dateTime,
      end: event.data.end.dateTime,
    });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};
