const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelectorAll('.site-nav a');

const toggleHeaderState = () => {
  header.classList.toggle('is-scrolled', window.scrollY > 18);
};

toggleHeaderState();
window.addEventListener('scroll', toggleHeaderState, { passive: true });

menuToggle?.addEventListener('click', () => {
  const isOpen = header.classList.toggle('nav-open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks.forEach((link) => link.addEventListener('click', () => {
  header.classList.remove('nav-open');
  menuToggle?.setAttribute('aria-expanded', 'false');
}));

const calendarDays = document.querySelector('#calendar-days');
const calendarMonth = document.querySelector('#calendar-month');
const selectedDateLabel = document.querySelector('#selected-date');
const timeSlots = document.querySelectorAll('.time-slots button');
const bookingSummary = document.querySelector('#booking-summary strong');
const continueButton = document.querySelector('#book-continue');
const eventDateInput = document.querySelector('#event-date');
const monthBack = document.querySelector('#previous-month');
const monthNext = document.querySelector('#next-month');

let displayedDate = new Date(2026, 7, 1);
let selectedDay = null;
let selectedTime = null;

const availableDates = {
  '2026-7': [4, 7, 11, 14, 18, 20, 25, 28],
  '2026-8': [1, 3, 8, 10, 15, 17, 22, 26, 29],
  '2026-9': [2, 5, 9, 12, 16, 19, 23, 26, 30],
  '2026-10': [3, 6, 10, 14, 17, 21, 24, 28, 31],
};

const limitedDates = {
  '2026-7': [20, 28],
  '2026-8': [10, 22],
  '2026-9': [9, 23],
  '2026-10': [14, 28],
};

const monthFormat = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
const selectedDateFormat = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

function calendarKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function updateBookingSummary() {
  const hasSelection = selectedDay && selectedTime;
  bookingSummary.textContent = hasSelection ? `${selectedDateFormat.format(selectedDay)} · ${selectedTime}` : '—';
  continueButton.disabled = !hasSelection;
}

function resetTimeSelection() {
  selectedTime = null;
  timeSlots.forEach((slot) => {
    slot.classList.remove('is-selected');
    slot.disabled = !selectedDay;
  });
  updateBookingSummary();
}

function renderCalendar() {
  const year = displayedDate.getFullYear();
  const month = displayedDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const key = calendarKey(displayedDate);
  const monthAvailable = availableDates[key] || [];
  const monthLimited = limitedDates[key] || [];

  calendarMonth.textContent = monthFormat.format(displayedDate);
  calendarDays.innerHTML = '';

  for (let spacer = 0; spacer < firstDay; spacer += 1) {
    const blank = document.createElement('span');
    blank.className = 'calendar-spacer';
    blank.setAttribute('aria-hidden', 'true');
    calendarDays.append(blank);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const isAvailable = monthAvailable.includes(day);
    const isLimited = monthLimited.includes(day);
    const date = new Date(year, month, day);
    const dateIsSelected = selectedDay && date.toDateString() === selectedDay.toDateString();
    const button = document.createElement('button');

    button.type = 'button';
    button.textContent = String(day);
    button.className = `calendar-day${isAvailable ? ' is-available' : ''}${isLimited ? ' is-limited' : ''}${dateIsSelected ? ' is-selected' : ''}`;
    button.disabled = !isAvailable;
    button.setAttribute('role', 'gridcell');
    button.setAttribute('aria-label', `${selectedDateFormat.format(date)}${isAvailable ? ', available' : ', unavailable'}`);
    button.setAttribute('aria-selected', String(Boolean(dateIsSelected)));

    if (isAvailable) {
      button.addEventListener('click', () => {
        selectedDay = date;
        selectedDateLabel.textContent = `${selectedDateFormat.format(date)} · select a time`;
        resetTimeSelection();
        renderCalendar();
      });
    }

    calendarDays.append(button);
  }
}

monthBack?.addEventListener('click', () => {
  displayedDate = new Date(displayedDate.getFullYear(), displayedDate.getMonth() - 1, 1);
  selectedDay = null;
  selectedDateLabel.textContent = 'Choose an available date';
  resetTimeSelection();
  renderCalendar();
});

monthNext?.addEventListener('click', () => {
  displayedDate = new Date(displayedDate.getFullYear(), displayedDate.getMonth() + 1, 1);
  selectedDay = null;
  selectedDateLabel.textContent = 'Choose an available date';
  resetTimeSelection();
  renderCalendar();
});

timeSlots.forEach((slot) => slot.addEventListener('click', () => {
  selectedTime = slot.dataset.time;
  timeSlots.forEach((item) => item.classList.toggle('is-selected', item === slot));
  updateBookingSummary();
}));

continueButton?.addEventListener('click', () => {
  if (!selectedDay || !selectedTime) return;
  eventDateInput.value = `${selectedDateFormat.format(selectedDay)} · Intro at ${selectedTime}`;
  document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  window.setTimeout(() => eventDateInput.focus(), 550);
});

renderCalendar();
updateBookingSummary();

const form = document.querySelector('#contact-form');
const formSuccess = document.querySelector('#form-success');

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const submitBtn = form.querySelector('.submit-button');
  submitBtn.textContent = 'Sending…';
  submitBtn.disabled = true;

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    });

    if (response.ok) {
      formSuccess.hidden = false;
      submitBtn.textContent = 'Inquiry sent · thank you';
    } else {
      submitBtn.textContent = 'Send inquiry ↗';
      submitBtn.disabled = false;
    }
  } catch (_) {
    submitBtn.textContent = 'Send inquiry ↗';
    submitBtn.disabled = false;
  }
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealItems = document.querySelectorAll('.reveal');

if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach((item) => observer.observe(item));
}
