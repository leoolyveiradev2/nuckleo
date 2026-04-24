/* components/profileFlyout.js
   Menu que abre no canto superior direito ao clicar no avatar
   Igual ao Instagram — flyout, não drawer
*/

const ProfileFlyout = (() => {
    let _flyout = null;
    let _isOpen = false;

    function build() {
        _flyout = document.createElement('div');
        _flyout.id = 'profile-flyout';
        _flyout.className = 'profile-flyout';

        document.body.appendChild(_flyout);

        // Fecha ao clicar fora
        document.addEventListener('click', (e) => {
            const avatarBtns = [
                document.getElementById('user-chip'),
                document.getElementById('bottom-nav-profile'),
            ];
            if (_isOpen && !_flyout.contains(e.target) && !avatarBtns.some(b => b?.contains(e.target))) {
                close();
            }
        });
    }

    function render() {
        const user = State.get('user') || {};

        const avatarHtml = user.avatar
            ? `<img src="${user.avatar}" class="profile-flyout__avatar" alt="${user.name}" />`
            : `<div class="profile-flyout__avatar">${Helpers.initials(user.name || '?')}</div>`;

        _flyout.innerHTML = `
      <div class="profile-flyout__header">
        ${avatarHtml}
        <div style="overflow:hidden;">
          <div class="profile-flyout__name">${user.name || '—'}</div>
          <div class="profile-flyout__handle">${user.username ? '@' + user.username : user.email || ''}</div>
        </div>
      </div>

      <button class="profile-flyout__item" id="pf-edit-profile">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        Editar perfil
      </button>

      <button class="profile-flyout__item" id="pf-theme">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
        Personalização
      </button>

      <button class="profile-flyout__item" id="pf-notifications-settings">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        Notificações
      </button>

      <button class="profile-flyout__item" id="pf-privacy">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        Privacidade
      </button>

      <div class="profile-flyout__divider"></div>

      <button class="profile-flyout__item profile-flyout__item--danger" id="pf-logout">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Sair da conta
      </button>
    `;

        // Listeners
        document.getElementById('pf-edit-profile')?.addEventListener('click', () => {
            close();
            Modal.openEditProfile();
        });
        document.getElementById('pf-theme')?.addEventListener('click', () => {
            close();
            const panel = document.getElementById('theme-panel');
            const shell = document.getElementById('main-app');
            panel?.classList.add('open');
            shell?.classList.add('theme-panel-open');
        });
        document.getElementById('pf-notifications-settings')?.addEventListener('click', () => {
            close();
            Helpers.toast('Configurações de notificações em breve!');
        });
        document.getElementById('pf-privacy')?.addEventListener('click', () => {
            close();
            Helpers.toast('Configurações de privacidade em breve!');
        });
        document.getElementById('pf-logout')?.addEventListener('click', () => {
            close();
            if (confirm('Deseja sair da conta?')) App.logout();
        });
    }

    function open() {
        render();
        _flyout.classList.add('open');
        _isOpen = true;
    }

    function close() {
        _flyout.classList.remove('open');
        _isOpen = false;
    }

    function toggle() {
        _isOpen ? close() : open();
    }

    function init() {
        build();

        ProfileFlyout.init();

        // Desktop: clica no avatar da sidebar
        document.getElementById('user-chip')?.addEventListener('click', (e) => {
            e.stopPropagation();
            toggle();
        });

        // Mobile: clica no avatar da bottom nav
        document.getElementById('bottom-nav-profile')?.addEventListener('click', (e) => {
            e.stopPropagation();
            toggle();
        });
        
    }

    return { init, open, close, toggle };
})();