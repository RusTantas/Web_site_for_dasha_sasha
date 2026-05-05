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

  // Таймер для блока Тайминг дня (до 21 июня 2026 15:30)
  function initCountdown() {
    const target = new Date('2026-06-21T15:30:00').getTime();
    const daysEl = document.getElementById('countdown-days');
    const hoursEl = document.getElementById('countdown-hours');
    const minsEl = document.getElementById('countdown-mins');
    const secsEl = document.getElementById('countdown-secs');

    if (!daysEl) return;

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

  // Плавная прокрутка при клике на стрелку
  function initScrollHint() {
    const scrollHint = document.getElementById('scrollHint');
    if (!scrollHint) return;
    
    scrollHint.addEventListener('click', function() {
      const nextSection = document.querySelector('.section');
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  // Форма RSVP
  function initForm() {
    const form = document.getElementById('guest-form');
    const message = document.getElementById('form-message');
    const attendanceNo = document.getElementById('attendance-no');
    const wishesGroup = document.getElementById('wishes-group');

    if (!form) return;

    // Показываем/скрываем поле пожеланий при выборе "не смогу"
    if (attendanceNo && wishesGroup) {
      const attendanceRadios = document.querySelectorAll('input[name="attendance"]');
      attendanceRadios.forEach(function(radio) {
        radio.addEventListener('change', function() {
          if (attendanceNo.checked) {
            wishesGroup.style.display = 'block';
          } else {
            wishesGroup.style.display = 'none';
          }
        });
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const fullname = document.getElementById('guest-fullname').value.trim();
      const persons = parseInt(document.getElementById('guest-persons').value, 10) || 1;
      const attendanceInput = form.querySelector('input[name="attendance"]:checked');
      const transportCheckboxes = form.querySelectorAll('input[name="transport"]:checked');
      const drinkCheckboxes = form.querySelectorAll('input[name="drinks"]:checked');
      const wishes = document.getElementById('guest-wishes') ? document.getElementById('guest-wishes').value.trim() : '';
      
      const attendance = attendanceInput ? attendanceInput.value : '';
      const transport = Array.from(transportCheckboxes).map(cb => cb.value).join(', ');
      const drinks = Array.from(drinkCheckboxes).map(cb => cb.value).join(', ');

      if (!fullname) {
        showMessage('Пожалуйста, укажите ваше имя', 'error');
        return;
      }

      if (!attendance) {
        showMessage('Пожалуйста, укажите, сможете ли вы присутствовать', 'error');
        return;
      }

      // Если гость не может приехать, пожелания становятся обязательными
      if (attendance === 'no' && !wishes) {
        showMessage('Пожалуйста, напишите пожелания молодожёнам 🤍', 'error');
        return;
      }

      const guest = {
        id: generateId(),
        fullname: fullname,
        persons: persons,
        attendance: attendance,
        transport: transport || '',
        drinks: drinks || '',
        wishes: wishes || '',
        registeredAt: new Date().toISOString()
      };

      const guests = getGuests();
      guests.push(guest);
      saveGuests(guests);

      if (attendance === 'yes') {
        showMessage('Спасибо! Ваш ответ сохранен. Ждем встречи! 🎉', 'success');
      } else {
        showMessage('Спасибо за пожелания! Нам очень жаль, что не сможем увидеться, но ваши теплые слова мы обязательно прочитаем 🤍', 'success');
      }
      form.reset();
      if (wishesGroup) wishesGroup.style.display = 'none';
    });

    function showMessage(text, type) {
      if (!message) return;
      message.textContent = text;
      message.className = 'form-message form-message--' + type;
      setTimeout(function () {
        message.className = 'form-message';
      }, 5000);
    }
  }

  // Админ-панель
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
        if (adminPanel) adminPanel.style.display = 'none';
        if (loginForm) loginForm.style.display = 'block';
        var usernameInput = document.getElementById('admin-username');
        var passwordInput = document.getElementById('admin-password');
        if (usernameInput) usernameInput.value = '';
        if (passwordInput) passwordInput.value = '';
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
        if (confirm('Удалить всех гостей?')) {
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
          return (g.fullname && g.fullname.toLowerCase().indexOf(filter) !== -1);
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
        var attendanceHtml = '';
        if (g.attendance === 'yes') {
          attendanceHtml = '<span class="guest-table__attendance--yes">✅ Да</span>';
        } else if (g.attendance === 'no') {
          attendanceHtml = '<span class="guest-table__attendance--no">❌ Нет</span>';
        } else {
          attendanceHtml = '-';
        }
        
        var transportHtml = g.transport ? '<div class="guest-table__transport">🚗 ' + escapeHtml(g.transport) + '</div>' : '-';
        var drinksHtml = g.drinks ? '<div class="guest-table__drinks">🍷 ' + escapeHtml(g.drinks) + '</div>' : '-';
        var wishesHtml = g.wishes ? '<div class="guest-table__wishes">💝 ' + escapeHtml(g.wishes) + '</div>' : '-';
        
        return '<tr>' +
          '<td><strong>' + escapeHtml(g.fullname) + '</strong><br><span class="guest-table__persons">👥 ' + g.persons + ' чел.</span></td>' +
          '<td>' + attendanceHtml + '</td>' +
          '<td>' + transportHtml + '</td>' +
          '<td>' + drinksHtml + '</td>' +
          '<td>' + wishesHtml + '</td>' +
          '<td>' + new Date(g.registeredAt).toLocaleDateString('ru-RU') + '</td>' +
          '<td><button class="guest-table__delete" onclick="window.__deleteGuest(\'' + g.id + '\')">🗑 Удалить</button></td>' +
          '</tr>';
      }).join('');

      updateStats(getGuests());
    }

    function updateStats(allGuests) {
      if (guestCount) guestCount.textContent = allGuests.length;
      if (totalPersons) {
        var total = allGuests.reduce(function (sum, g) { 
          return sum + (parseInt(g.persons) || 1); 
        }, 0);
        totalPersons.textContent = total;
      }
      if (drinkStats) {
        var drinkCount = 0;
        allGuests.forEach(function (g) {
          if (g.drinks && g.drinks.length > 0) drinkCount++;
        });
        drinkStats.textContent = drinkCount;
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

      var headers = ['ФИО + гости', 'Кол-во персон', 'Присутствие', 'Трансфер', 'Напитки', 'Пожелания', 'Дата регистрации'];
      var rows = guests.map(function (g) {
        var attendanceText = g.attendance === 'yes' ? 'Да' : (g.attendance === 'no' ? 'Нет' : '');
        return [
          g.fullname,
          g.persons || 1,
          attendanceText,
          g.transport || '',
          g.drinks || '',
          g.wishes || '',
          new Date(g.registeredAt).toLocaleString('ru-RU')
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
      if (!str) return '';
      var div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }
  }

  // Запуск всего при загрузке страницы
  document.addEventListener('DOMContentLoaded', function () {
    initCountdown();
    initForm();
    initAdmin();
    initScrollHint();
  });
})();