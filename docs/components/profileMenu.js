/* components/profileMenu.js */

const ProfileMenu = (() => {
    let _isOpen = false;

    function render(user) {
        const existing = document.getElementById('profile-menu');
        if (existing) existing.remove();

        const menu = document.createElement('div');
        menu.id = 'profile-menu';
        menu.className = 'profile-menu';
        menu.innerHTML = `
      <!-- Header -->
      <div class="profile-menu__header">
        ${user.avatar
                ? `<img src="${user.avatar}" class="profile-menu__avatar" alt="${user.name}" />`
                : `<div class="profile-menu__avatar profile-menu__avatar--initials">${Helpers.initials(user.name)}</div>`
            }
        <div class="profile-menu__info">
          <span class="profile-menu__name">${user.name}</span>
          <span class="profile-menu__email">${user.email || ''}</span>
        </div>
      </div>

      <div class="profile-menu__divider"></div>

      <!-- Edit Profile -->
      <button class="profile-menu__item" id="pm-edit-profile">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        Editar perfil
      </button>

      <!-- Preferences -->
      <button class="profile-menu__item" id="pm-preferences">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
        </svg>
        Personalização
      </button>

      <div class="profile-menu__divider"></div>

      <!-- Logout -->
      <button class="profile-menu__item profile-menu__item--danger" id="pm-logout">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Sair da conta
      </button>
    `;

        document.body.appendChild(menu);
        positionMenu();
        attachMenuListeners();

        requestAnimationFrame(() => menu.classList.add('open'));
    }

    function positionMenu() {
        const chip = document.getElementById('user-chip');
        const menu = document.getElementById('profile-menu');
        if (!chip || !menu) return;

        const rect = chip.getBoundingClientRect();
        menu.style.bottom = `${window.innerHeight - rect.top + 8}px`;
        menu.style.left = `${rect.left}px`;
    }

    function attachMenuListeners() {
        document.getElementById('pm-edit-profile')?.addEventListener('click', () => {
            close();
            Modal.openEditProfile();
        });

        document.getElementById('pm-preferences')?.addEventListener('click', () => {
            close();
            const panel = document.getElementById('theme-panel');
            const shell = document.getElementById('main-app');
            panel.classList.add('open');
            shell.classList.add('theme-panel-open');
        });

        document.getElementById('pm-logout')?.addEventListener('click', () => {
            close();
            if (confirm('Deseja sair da conta?')) {
                localStorage.removeItem('nuckleo_token');
                State.set('user', null);
                document.getElementById('auth-screen').style.display = 'flex';
                document.getElementById('main-app').style.display = 'none';
                Helpers.toast('Até logo! 👋');
            }
        });

        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', onOutsideClick);
        }, 50);
    }

    function onOutsideClick(e) {
        const menu = document.getElementById('profile-menu');
        const chip = document.getElementById('user-chip');
        if (menu && !menu.contains(e.target) && !chip.contains(e.target)) {
            close();
        }
    }

    function close() {
        const menu = document.getElementById('profile-menu');
        if (menu) {
            menu.classList.remove('open');
            setTimeout(() => menu.remove(), 200);
        }
        document.removeEventListener('click', onOutsideClick);
        _isOpen = false;
    }

    function toggle() {
        if (_isOpen) {
            close();
        } else {
            _isOpen = true;
            render(State.get('user') || {});
        }
    }

    return { toggle, close };
})();