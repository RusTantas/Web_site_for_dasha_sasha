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
    const displayEl = document.getElementById('countdown-display');

    function update() {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        if (displayEl) displayEl.textContent = '0 дней';
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      if (displayEl) {
        displayEl.textContent = days + ' дней';
      }
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

      const name = document.getElementById('guest-name').value.trim();
      const attendance = form.querySelector('input[name="attendance"]:checked');
      const transferCheckboxes = form.querySelectorAll('input[name="transfer"]:checked');
      const drinkCheckboxes = form.querySelectorAll('input[name="drink"]:checked');
      const wishes = document.getElementById('guest-wishes').value.trim();

      if (!name) {
        showMessage('Пожалуйста, укажите имя и фамилию', 'error');
        return;
      }

      if (!attendance) {
        showMessage('Пожалуйста, выберите: сможете ли вы присутствовать', 'error');
        return;
      }

      const guest = {
        id: generateId(),
        name: name,
        attendance: attendance.value,
        transfer: Array.from(transferCheckboxes).map(function (el) { return el.value; }),
        drinks: Array.from(drinkCheckboxes).map(function (el) { return el.value; }),
        wishes: wishes,
        registeredAt: new Date().toISOString()
      };

      const guests = getGuests();
      guests.push(guest);
      saveGuests(guests);

      showMessage('Спасибо! Ваше участие подтверждено.', 'success');
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
        if (confirm('Удалить все записи о гостях?')) {
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
            g.name.toLowerCase().indexOf(filter) !== -1 ||
            (g.wishes && g.wishes.toLowerCase().indexOf(filter) !== -1)
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
        var drinkLabel = g.drinks && g.drinks.length > 0 
          ? g.drinks.map(function (d) { return '<span class="guest-table__drink">' + escapeHtml(d) + '</span>'; }).join(' ') 
          : '-';
        var wishesText = g.wishes ? '<div class="guest-table__wishes">' + escapeHtml(g.wishes) + '</div>' : '-';
        return '<tr>' +
          '<td>' + escapeHtml(g.name) + '</td>' +
          '<td>' + (g.attendance || '-') + '</td>' +
          '<td>' + (g.transfer && g.transfer.length > 0 ? g.transfer.join(', ') : '-') + '</td>' +
          '<td>' + drinkLabel + '</td>' +
          '<td>' + wishesText + '</td>' +
          '<td><button class="guest-table__delete" onclick="window.__deleteGuest(\'' + g.id + '\')">Удалить</button></td>' +
          '</tr>';
      }).join('');

      updateStats(getGuests());
    }

    function updateStats(allGuests) {
      if (guestCount) guestCount.textContent = allGuests.length;
      if (drinkStats) {
        var counts = {};
        allGuests.forEach(function (g) {
          if (g.drinks) {
            g.drinks.forEach(function (d) {
              var drink = d || 'none';
              counts[drink] = (counts[drink] || 0) + 1;
            });
          }
        });
        drinkStats.textContent = Object.keys(counts).length;
      }
    }

    window.__deleteGuest = function (id) {
      if (!confirm('Удалить этого гостя?')) return;
      var guests = getGuests().filter(function (g) { return g.id !== id; });
      saveGuests(guests);
      renderGuests();
    };

    function exportToCSV() {
      var guests = getGuests();
      if (guests.length === 0) return;

      var headers = ['Name', 'Attendance', 'Transfer', 'Drinks', 'Wishes', 'Registered At'];
      var rows = guests.map(function (g) {
        return [
          g.name,
          g.attendance || '',
          g.transfer ? g.transfer.join('; ') : '',
          g.drinks ? g.drinks.join('; ') : '',
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
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  document.addEventListener('DOMContentLoaded', function () {
    initCountdown();
    initForm();
    initAdmin();
  });
})();
