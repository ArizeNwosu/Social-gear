const { google } = require('googleapis');

// Returns available 30-minute slots for a given month
// Query: ?year=2026&month=11
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    });

    const calendar = google.calendar({ version: 'v3', auth });
    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    const year = parseInt(req.query.year);
    const month = parseInt(req.query.month); // 1-based

    if (!year || !month || month < 1 || month > 12) {
      return res.status(400).json({ error: 'Provide year and month (1-12)' });
    }

    const timeMin = new Date(year, month - 1, 1).toISOString();
    const timeMax = new Date(year, month, 0, 23, 59, 59).toISOString();

    // Get existing events to find busy times
    const events = await calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const busySlots = (events.data.items || []).map(event => ({
      start: new Date(event.start.dateTime || event.start.date),
      end: new Date(event.end.dateTime || event.end.date),
    }));

    // Generate available slots: weekdays, 9am-4pm, 30-minute increments
    const available = {};
    const now = new Date();
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month - 1, d);
      const day = date.getDay();

      // Skip weekends
      if (day === 0 || day === 6) continue;

      // Skip past dates
      if (date < new Date(now.getFullYear(), now.getMonth(), now.getDate())) continue;

      const key = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const slots = [];

      for (let h = 9; h < 16; h++) {
        for (let m = 0; m < 60; m += 30) {
          const slotStart = new Date(year, month - 1, d, h, m);
          const slotEnd = new Date(year, month - 1, d, h, m + 30);

          // Skip if in the past (with 1-hour buffer)
          if (slotStart < new Date(now.getTime() + 60 * 60 * 1000)) continue;

          // Check if slot conflicts with any existing event
          const isBusy = busySlots.some(busy =>
            slotStart < busy.end && slotEnd > busy.start
          );

          if (!isBusy) {
            const suffix = h >= 12 ? 'PM' : 'AM';
            const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
            slots.push(`${hour}:${String(m).padStart(2, '0')} ${suffix}`);
          }
        }
      }

      if (slots.length > 0) {
        available[key] = slots;
      }
    }

    res.status(200).json({ available });
  } catch (err) {
    console.error('Availability error:', err);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
};
