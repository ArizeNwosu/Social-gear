/* Booking widget — Social Gear AI
   Renders a calendar date picker, time slot selector, and booking form.
   Currently uses demo availability. Wire up the Google Calendar API
   by replacing fetchAvailability() and submitBooking(). */

(function () {
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var viewYear = today.getFullYear();
  var viewMonth = today.getMonth();
  var selectedDate = null;
  var selectedTime = null;

  var monthLabel = document.getElementById('cal-month-label');
  var daysGrid = document.getElementById('cal-days');
  var prevBtn = document.getElementById('cal-prev');
  var nextBtn = document.getElementById('cal-next');
  var tzLabel = document.getElementById('booking-tz');

  var stepDate = document.getElementById('step-date');
  var stepTime = document.getElementById('step-time');
  var stepConfirm = document.getElementById('step-confirm');
  var stepDone = document.getElementById('step-done');

  // Show timezone
  var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  tzLabel.textContent = 'Times shown in ' + tz.replace(/_/g, ' ');

  // Demo availability: weekdays, 9am–4pm, half-hour slots
  // Replace this function with a real API call to your backend
  function fetchAvailability(year, month) {
    var available = {};
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    for (var d = 1; d <= daysInMonth; d++) {
      var date = new Date(year, month, d);
      var day = date.getDay();
      // Skip weekends and past dates
      if (day === 0 || day === 6) continue;
      if (date < today) continue;
      // Skip today if it's after 3pm
      if (date.getTime() === today.getTime() && new Date().getHours() >= 15) continue;
      var key = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
      available[key] = generateSlots(date);
    }
    return available;
  }

  function generateSlots(date) {
    var slots = [];
    var startHour = 9;
    // If today, start from next available half-hour
    if (date.getTime() === today.getTime()) {
      var now = new Date();
      startHour = Math.max(9, now.getHours() + 1);
    }
    for (var h = startHour; h < 16; h++) {
      slots.push(formatTime(h, 0));
      if (h < 15 || (h === 15 && true)) {
        slots.push(formatTime(h, 30));
      }
    }
    return slots;
  }

  function formatTime(h, m) {
    var suffix = h >= 12 ? 'PM' : 'AM';
    var hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return hour + ':' + String(m).padStart(2, '0') + ' ' + suffix;
  }

  var availability = {};

  function renderCalendar() {
    availability = fetchAvailability(viewYear, viewMonth);
    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    monthLabel.textContent = monthNames[viewMonth] + ' ' + viewYear;

    var firstDay = new Date(viewYear, viewMonth, 1).getDay();
    var daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    daysGrid.innerHTML = '';

    // Empty cells for alignment
    for (var i = 0; i < firstDay; i++) {
      var empty = document.createElement('span');
      daysGrid.appendChild(empty);
    }

    for (var d = 1; d <= daysInMonth; d++) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'calendar-day';
      btn.textContent = d;

      var date = new Date(viewYear, viewMonth, d);
      var key = viewYear + '-' + String(viewMonth + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');

      if (date < today) {
        btn.disabled = true;
      } else if (availability[key]) {
        btn.classList.add('calendar-day-available');
        btn.dataset.date = key;
        btn.onclick = selectDate;
      } else {
        btn.disabled = true;
      }

      // Today marker
      if (date.getTime() === today.getTime()) {
        btn.classList.add('calendar-day-today');
      }

      // Selected marker
      if (selectedDate === key) {
        btn.classList.add('calendar-day-selected');
      }

      daysGrid.appendChild(btn);
    }

    // Disable prev if current month
    prevBtn.disabled = viewYear === today.getFullYear() && viewMonth === today.getMonth();
  }

  function selectDate(e) {
    selectedDate = e.currentTarget.dataset.date;
    selectedTime = null;
    renderCalendar();
    showStep('time');
    renderTimeSlots();
  }

  function renderTimeSlots() {
    var container = document.getElementById('time-slots');
    var label = document.getElementById('selected-date-label');

    var parts = selectedDate.split('-');
    var d = new Date(parts[0], parts[1] - 1, parts[2]);
    var options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    label.textContent = d.toLocaleDateString('en-US', options);

    var slots = availability[selectedDate] || [];
    container.innerHTML = '';

    slots.forEach(function (time) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'time-slot';
      btn.textContent = time;
      if (time === selectedTime) btn.classList.add('time-slot-selected');
      btn.onclick = function () {
        selectedTime = time;
        showStep('confirm');
        populateSummary();
      };
      container.appendChild(btn);
    });
  }

  function populateSummary() {
    var parts = selectedDate.split('-');
    var d = new Date(parts[0], parts[1] - 1, parts[2]);
    var dateStr = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    document.getElementById('summary-date').textContent = dateStr;
    document.getElementById('summary-time').textContent = selectedTime + ' · 30 minutes';
  }

  function showStep(step) {
    stepDate.hidden = step !== 'date';
    stepTime.hidden = step !== 'time';
    stepConfirm.hidden = step !== 'confirm';
    stepDone.hidden = step !== 'done';
  }

  // Navigation
  prevBtn.onclick = function () {
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    renderCalendar();
  };
  nextBtn.onclick = function () {
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    renderCalendar();
  };

  // Back buttons
  document.getElementById('back-to-date').onclick = function () {
    showStep('date');
    renderCalendar();
  };
  document.getElementById('back-to-time').onclick = function () {
    showStep('time');
    renderTimeSlots();
  };

  // Form submission
  document.getElementById('booking-form').onsubmit = function (e) {
    e.preventDefault();
    var form = e.target;
    var data = {
      name: form.name.value,
      email: form.email.value,
      company: form.company.value,
      notes: form.notes.value,
      date: selectedDate,
      time: selectedTime
    };

    // Replace this with a real API call to create a Google Calendar event
    submitBooking(data);
  };

  function submitBooking(data) {
    var submitBtn = document.querySelector('.booking-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Booking...';

    // TODO: Replace with real API endpoint
    // fetch('/api/book', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) })
    //   .then(r => r.json())
    //   .then(result => { ... })

    // Demo: simulate API call
    setTimeout(function () {
      var parts = selectedDate.split('-');
      var d = new Date(parts[0], parts[1] - 1, parts[2]);
      var dateStr = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

      document.getElementById('done-summary').textContent = dateStr + ' at ' + selectedTime;
      document.getElementById('done-email').textContent = data.email;
      showStep('done');
    }, 1200);
  }

  // Init
  renderCalendar();
})();
