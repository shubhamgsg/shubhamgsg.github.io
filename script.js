const root = document.documentElement;
const versionButtons = [...document.querySelectorAll('[data-version-choice]')];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

document.getElementById('year').textContent = new Date().getFullYear();

function setVersion(version, remember = true) {
  const selected = version === 'classic' ? 'classic' : 'interactive';
  root.dataset.version = selected;
  versionButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.versionChoice === selected)));
  if (remember) localStorage.setItem('portfolio-version', selected);
}

versionButtons.forEach((button) => button.addEventListener('click', () => setVersion(button.dataset.versionChoice)));
setVersion(localStorage.getItem('portfolio-version') || root.dataset.version || 'interactive', false);

const hero = document.querySelector('.hero');
hero.addEventListener('pointermove', (event) => {
  if (root.dataset.version !== 'interactive' || reduceMotion.matches || event.pointerType === 'touch') return;
  const bounds = hero.getBoundingClientRect();
  hero.style.setProperty('--pointer-x', `${((event.clientX - bounds.left) / bounds.width) * 100}%`);
  hero.style.setProperty('--pointer-y', `${((event.clientY - bounds.top) / bounds.height) * 100}%`);
});

let bugInjected = false;
let checksRunning = false;
const runChecks = document.getElementById('run-checks');
const injectBug = document.getElementById('inject-bug');
const releaseChecks = [...document.querySelectorAll('[data-release-check]')];
const labResult = document.getElementById('lab-result');

injectBug.addEventListener('click', () => {
  bugInjected = !bugInjected;
  injectBug.setAttribute('aria-pressed', String(bugInjected));
  injectBug.textContent = bugInjected ? 'Remove bug' : 'Inject a bug';
  releaseChecks.forEach((check) => { check.textContent = 'READY'; check.parentElement.classList.remove('is-updated'); });
  labResult.textContent = bugInjected ? 'A simulated API validation bug is active. Run the checks to catch it.' : 'Bug removed. Run the checks again.';
});

runChecks.addEventListener('click', () => {
  if (checksRunning) return;
  checksRunning = true;
  runChecks.disabled = true;
  injectBug.disabled = true;
  runChecks.textContent = 'Checking…';
  labResult.textContent = 'Running the simulated release checks…';
  releaseChecks.forEach((check) => { check.textContent = 'QUEUED'; check.parentElement.classList.remove('is-updated'); });
  let index = 0;
  const finishCheck = () => {
    const check = releaseChecks[index];
    check.textContent = bugInjected && index === 1 ? '✕ FAILED' : '✓ PASSED';
    check.parentElement.classList.add('is-updated');
    index += 1;
    if (index < releaseChecks.length) { window.setTimeout(finishCheck, reduceMotion.matches ? 0 : 420); return; }
    labResult.textContent = bugInjected ? 'Release blocked · API validation failed. Remove the bug and retry.' : 'All 3 simulated checks passed · Ready for review.';
    runChecks.textContent = 'Run again ↗';
    runChecks.disabled = false;
    injectBug.disabled = false;
    checksRunning = false;
  };
  window.setTimeout(finishCheck, reduceMotion.matches ? 0 : 250);
});

const bookingForm = document.getElementById('booking-demo');
const seatCount = document.getElementById('seat-count');
const apiResponse = document.getElementById('api-response');
document.querySelectorAll('[data-seats]').forEach((button) => button.addEventListener('click', () => {
  seatCount.value = button.dataset.seats;
  apiResponse.textContent = `POST /demo/bookings\n{ "seats": ${button.dataset.seats} }\n\nReady to send a simulated request.`;
}));
bookingForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const rawValue = seatCount.value.trim();
  const seats = Number(rawValue);
  const valid = rawValue !== '' && Number.isInteger(seats) && seats >= 1 && seats <= 6;
  const requestValue = rawValue === '' ? '""' : Number.isFinite(seats) ? seats : JSON.stringify(rawValue);
  apiResponse.textContent = valid ? `POST /demo/bookings\n{ "seats": ${requestValue} }\n\n201 Created · Booking accepted\nInput validation passed.` : `POST /demo/bookings\n{ "seats": ${requestValue} }\n\n400 Bad Request · Booking rejected\nSeats must be a whole number from 1 to 6.`;
  apiResponse.classList.remove('is-updated');
  void apiResponse.offsetWidth;
  apiResponse.classList.add('is-updated');
});

const answerButtons = [...document.querySelectorAll('[data-test-answer]')];
const choiceResult = document.getElementById('choice-result');
answerButtons.forEach((button) => button.addEventListener('click', () => {
  answerButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
  choiceResult.textContent = button.dataset.testAnswer === '1' ? 'Exactly. Retries and double-clicks can create duplicates. Verify that repeated requests do not create an unintended second booking.' : 'That checks presentation. To expose duplicate bookings, repeat the request and inspect the resulting records.';
}));

if ('IntersectionObserver' in window && !reduceMotion.matches) {
  const revealItems = document.querySelectorAll('.section-heading, .focus-card, .timeline-item, .project-card, .skill-group, .play-card');
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    observer.unobserve(entry.target);
  }), { threshold: 0.12 });
  revealItems.forEach((item) => { item.classList.add('reveal-ready'); observer.observe(item); });
}
