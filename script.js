(function () {
  const STORAGE_KEY = 'wedding_guests_daria_alexander';
  const ADMIN_USER = 'DARIY';
  const ADMIN_PASS = 'SASHA';

  function getGuests() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveGuests(guests) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(guests));
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function initCountdown() {
    const target = new Date('2026-06-21T15:00:00').getTime();
    const daysEl = document.getElementById('countdown-days');
    const hoursEl = document.getElementById('countdown-hours');
    const minsEl = document.getElementById('countdown-mins');
    const secsEl = document.getElementById('countdown-secs');

    function update() {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        daysEl.textContent = '0';
        hoursEl.textContent = '0';
        minsEl.textContent = '0';
        secsEl.textContent = '0';
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);
      daysEl.textContent = days;
      hoursEl.textContent = hours;
      minsEl.textContent = mins;
      secsEl.textContent = secs;
    }

    update();
    setInterval(update, 1000);
  }

  function initForm() {
    const form = document.getElementById('guest-form');
    const message = document.getElementById('form-message');

    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const firstName = document.getElementById('guest-firstname').value.trim();
      const lastName = document.getElementById('guest-lastname').value.trim();
      const persons = parseInt(document.getElementById('guest-persons').value, 10) || 1;
      const contact = document.getElementById('guest-contact').value.trim();
      const wishes = document.getElementById('guest-wishes').value.trim();
      const drinkInput = form.querySelector('input[name="drink"]:checked');

      if (!firstName || !lastName) {
        showMessage('Please fill in name and surname', 'error');
        return;
      }

      if (!contact) {
        showMessage('Please provide contact information', 'error');
        return;
      }

      const guest = {
        id: generateId(),
        firstName: firstName,
        lastName: lastName,
        persons: persons,
        contact: contact,
        wishes: wishes,
        drink: drinkInput ? drinkInput.value : '',
        registeredAt: new Date().toISOString()
      };

      const guests = getGuests();
      guests.push(guest);
      saveGuests(guests);

      showMessage('Thank you! Your registration is confirmed.', 'success');
      form.reset();
    });

    function showMessage(text, type) {
      message.textContent = text;
      message.className = 'form-message form-message--' + type;
      setTimeout(function () {
        message.className = 'form-message';
      }, 5000);
    }
  }

  function initAdmin() {
    const adminBtn = document.getElementById('admin-access-btn');
    const adminOverlay = document.getElementById('admin-overlay');
    const loginForm = document.getElementById('admin-login-form');
    const loginError = document.getElementById('admin-login-error');
    const adminPanel = document.getElementById('admin-panel');
    const adminClose = document.getElementById('admin-close');
    const adminLogout = document.getElementById('admin-logout');
    const searchInput = document.getElementById('admin-search');
    const exportBtn = document.getElementById('admin-export');
    const deleteAllBtn = document.getElementById('admin-delete-all');
    const guestCount = document.getElementById('guest-count');
    const totalPersons = document.getElementById('total-persons');
    const drinkStats = document.getElementById('drink-stats');

    if (!adminBtn) return;

    let isLoggedIn = false;

    adminBtn.addEventListener('click', function () {
      adminOverlay.classList.add('active');
    });

    if (adminClose) {
      adminClose.addEventListener('click', function () {
        adminOverlay.classList.remove('active');
      });
    }

    if (loginForm) {
        const loginBtn = document.getElementById('admin-login-btn');
        if (loginBtn) {
          loginBtn.addEventListener('click', function () {
            var username = document.getElementById('admin-username').value;
            var password = document.getElementById('admin-password').value;

            if (username === ADMIN_USER && password === ADMIN_PASS) {
              isLoggedIn = true;
              loginForm.style.display = 'none';
              if (adminPanel) adminPanel.style.display = 'block';
              if (loginError) loginError.style.display = 'none';
              renderGuests();
            } else {
              if (loginError) {
                loginError.textContent = 'Неверный логин или пароль';
                loginError.style.display = 'block';
              }
            }
          });
        }
      }

    if (adminLogout) {
      adminLogout.addEventListener('click', function () {
        isLoggedIn = false;
        if (adminPanel) adminPanel.style.display = 'none';
        if (loginForm) loginForm.style.display = 'block';
        document.getElementById('admin-username').value = '';
        document.getElementById('admin-password').value = '';
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        renderGuests();
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', function () {
        exportToCSV();
      });
    }

    if (deleteAllBtn) {
      deleteAllBtn.addEventListener('click', function () {
        if (confirm('Delete all guest records?')) {
          saveGuests([]);
          renderGuests();
        }
      });
    }

    function renderGuests() {
      const tbody = document.getElementById('guest-tbody');
      const emptyState = document.getElementById('empty-state');
      if (!tbody) return;

      var guests = getGuests();
      var filter = searchInput ? searchInput.value.toLowerCase() : '';

      if (filter) {
        guests = guests.filter(function (g) {
          return (
            g.firstName.toLowerCase().indexOf(filter) !== -1 ||
            g.lastName.toLowerCase().indexOf(filter) !== -1 ||
            g.contact.toLowerCase().indexOf(filter) !== -1
          );
        });
      }

      if (guests.length === 0) {
        tbody.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        updateStats(getGuests());
        return;
      }

      if (emptyState) emptyState.style.display = 'none';

      tbody.innerHTML = guests.map(function (g) {
        var drinkLabel = g.drink ? '<span class="guest-table__drink">' + escapeHtml(g.drink) + '</span>' : '-';
        var wishesText = g.wishes ? '<div class="guest-table__wishes">' + escapeHtml(g.wishes) + '</div>' : '-';
        return '<tr>' +
          '<td>' + escapeHtml(g.firstName) + '</td>' +
          '<td>' + escapeHtml(g.lastName) + '</td>' +
          '<td>' + g.persons + '</td>' +
          '<td>' + escapeHtml(g.contact) + '</td>' +
          '<td>' + drinkLabel + '</td>' +
          '<td>' + wishesText + '</td>' +
          '<td><button class="guest-table__delete" onclick="window.__deleteGuest(\'' + g.id + '\')">Delete</button></td>' +
          '</tr>';
      }).join('');

      updateStats(getGuests());
    }

    function updateStats(allGuests) {
      if (guestCount) guestCount.textContent = allGuests.length;
      if (totalPersons) {
        totalPersons.textContent = allGuests.reduce(function (sum, g) { return sum + (g.persons || 1); }, 0);
      }
      if (drinkStats) {
        var counts = {};
        allGuests.forEach(function (g) {
          var d = g.drink || 'none';
          counts[d] = (counts[d] || 0) + 1;
        });
        drinkStats.textContent = Object.keys(counts).length;
      }
    }

    window.__deleteGuest = function (id) {
      if (!confirm('Delete this guest?')) return;
      var guests = getGuests().filter(function (g) { return g.id !== id; });
      saveGuests(guests);
      renderGuests();
    };

    function exportToCSV() {
      var guests = getGuests();
      if (guests.length === 0) return;

      var headers = ['First Name', 'Last Name', 'Persons', 'Contact', 'Drink', 'Wishes', 'Registered At'];
      var rows = guests.map(function (g) {
        return [
          g.firstName,
          g.lastName,
          g.persons,
          g.contact,
          g.drink || '',
          g.wishes || '',
          g.registeredAt
        ];
      });

      var csvContent = '\uFEFF' + headers.join(',') + '\n' +
        rows.map(function (r) {
          return r.map(function (cell) {
            var str = String(cell);
            if (str.indexOf(',') !== -1 || str.indexOf('"') !== -1) {
              return '"' + str.replace(/"/g, '""') + '"';
            }
            return str;
          }).join(',');
        }).join('\n');

      var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      var link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'wedding_guests_' + new Date().toISOString().slice(0, 10) + '.csv';
      link.click();
      URL.revokeObjectURL(link.href);
    }

    function escapeHtml(str) {
      var div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        var target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initCountdown();
    initForm();
    initAdmin();
    initSmoothScroll();
  });
})();
