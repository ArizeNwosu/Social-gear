/* Booking widget — Social Gear AI
   Uses /api/availability and /api/book endpoints when available,
   falls back to demo mode if the API isn't configured yet. */

(function () {
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var viewYear = today.getFullYear();
  var viewMonth = today.getMonth();
  var selectedDate = null;
  var selectedTime = null;
  var useApi = true; // Will fall back to demo if API returns error

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

  var availability = {};

  // --- API-backed availability ---
  function fetchAvailabilityApi(year, month, callback) {
    fetch('/api/availability?year=' + year + '&month=' + (month + 1))
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.error) throw new Error(data.error);
        callback(data.available || {});
      })
      .catch(function () {
        // API not configured — fall back to demo
        useApi = false;
        callback(fetchAvailabilityDemo(year, month));
      });
  }

  // --- Demo fallback ---
  function fetchAvailabilityDemo(year, month) {
    var available = {};
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    for (var d = 1; d <= daysInMonth; d++) {
      var date = new Date(year, month, d);
      var day = date.getDay();
      if (day === 0 || day === 6) continue;
      if (date < today) continue;
      if (date.getTime() === today.getTime() && new Date().getHours() >= 15) continue;
      var key = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
      available[key] = generateDemoSlots(date);
    }
    return available;
  }

  function generateDemoSlots(date) {
    var slots = [];
    var startHour = 9;
    if (date.getTime() === today.getTime()) {
      startHour = Math.max(9, new Date().getHours() + 1);
    }
    for (var h = startHour; h < 16; h++) {
      slots.push(formatTime(h, 0));
      slots.push(formatTime(h, 30));
    }
    return slots;
  }

  function formatTime(h, m) {
    var suffix = h >= 12 ? 'PM' : 'AM';
    var hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return hour + ':' + String(m).padStart(2, '0') + ' ' + suffix;
  }

  // --- Calendar rendering ---
  function renderCalendar() {
    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    monthLabel.textContent = monthNames[viewMonth] + ' ' + viewYear;
    daysGrid.innerHTML = '<div class="booking-loading">Loading availability...</div>';
    prevBtn.disabled = viewYear === today.getFullYear() && viewMonth === today.getMonth();

    var render = function (avail) {
      availability = avail;
      var firstDay = new Date(viewYear, viewMonth, 1).getDay();
      var daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

      daysGrid.innerHTML = '';

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

        if (date.getTime() === today.getTime()) {
          btn.classList.add('calendar-day-today');
        }

        if (selectedDate === key) {
          btn.classList.add('calendar-day-selected');
        }

        daysGrid.appendChild(btn);
      }
    };

    if (useApi) {
      fetchAvailabilityApi(viewYear, viewMonth, render);
    } else {
      render(fetchAvailabilityDemo(viewYear, viewMonth));
    }
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
    label.textContent = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

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
    // Scroll widget into view on step change
    document.getElementById('booking-widget').scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    submitBooking(data);
  };

  function submitBooking(data) {
    var submitBtn = document.querySelector('.booking-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Booking...';

    if (useApi) {
      fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (r) { return r.json(); })
        .then(function (result) {
          if (result.error) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Confirm booking →';
            alert(result.error);
            return;
          }
          showConfirmation(data);
        })
        .catch(function () {
          // Fall back to demo confirmation
          showConfirmation(data);
        });
    } else {
      // Demo mode
      setTimeout(function () { showConfirmation(data); }, 1200);
    }
  }

  function showConfirmation(data) {
    var parts = selectedDate.split('-');
    var d = new Date(parts[0], parts[1] - 1, parts[2]);
    var dateStr = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    document.getElementById('done-summary').textContent = dateStr + ' at ' + selectedTime;
    document.getElementById('done-email').textContent = data.email;
    showStep('done');
  }

  // Init
  renderCalendar();
})();
