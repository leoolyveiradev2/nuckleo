/* app.js — Main orchestrator */

const App = (() => {

  /* ── Navigation ──────────────────────────────────── */
  function navigateTo(page) {
    Helpers.qsa('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(`page-${page}`);
    if (target) target.classList.add('active');

    Helpers.qsa('.nav-item').forEach(n => {
      n.classList.toggle('active', n.dataset.page === page);
    });

    // Close drawer on mobile
    DrawerMenu.close();

    switch (page) {
      case 'dashboard': DashboardPage.load(); break;
      case 'spaces': SpacesPage.load(); break;
      case 'favorites': FavoritesPage.load(); break;
      case 'friends': FriendsPage.load(); break;
    }
  }

  /* ── Auth ────────────────────────────────────────── */
  function handleAuthSuccess({ token, user }) {
    localStorage.setItem('nuckleo_token', token);
    State.set('user', user);
    showApp(user);
    navigateTo('dashboard');
    SpacesPage.load();
    loadNotifications();
  }

  function showApp(user) {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('main-app').style.display = 'grid';
    updateUserUI(user);
  }

  function updateUserUI(user) {
    const nameEl = document.getElementById('user-name');
    const handleEl = document.getElementById('user-handle');
    const avatarImg = document.getElementById('user-avatar');
    const avatarInit = document.getElementById('user-avatar-initials');

    if (nameEl) nameEl.textContent = user.name || '—';
    if (handleEl) handleEl.textContent = user.username ? `@${user.username}` : user.email || '—';

    if (user.avatar) {
      if (avatarImg) { avatarImg.src = user.avatar; avatarImg.style.display = 'block'; }
      if (avatarInit) avatarInit.style.display = 'none';
    } else {
      if (avatarImg) avatarImg.style.display = 'none';
      if (avatarInit) { avatarInit.style.display = 'flex'; avatarInit.textContent = Helpers.initials(user.name || '?'); }
    }

    DrawerMenu?.updateUser?.(user);
    ProfileFlyout?.render?.();
  }

  async function checkAuth() {
    const token = localStorage.getItem('nuckleo_token');
    if (!token) { showAuthScreen(); return; }
    try {
      const res = await api.auth.me();
      const user = res.data;
      State.set('user', user);
      showApp(user);
      navigateTo('dashboard');
      SpacesPage.load();
      loadNotifications();
    } catch {
      showAuthScreen();
    }
  }

  function showAuthScreen() {
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('main-app').style.display = 'none';
  }

  function logout() {
    localStorage.removeItem('nuckleo_token');
    State.set('user', null);
    showAuthScreen();
    Helpers.toast('Até logo! 👋');
  }

  /* ── Theme ───────────────────────────────────────── */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nuckleo_theme', theme);
    State.set('theme', theme);
    Helpers.qsa('.theme-opt').forEach(o => o.classList.toggle('active', o.dataset.theme === theme));
  }

  function applyAccent(color) {
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) return;
    document.documentElement.style.setProperty('--accent', color);
    document.documentElement.style.setProperty('--accent-light', color + 'CC');
    document.documentElement.style.setProperty('--accent-muted', color + '22');
    document.documentElement.style.setProperty('--accent-hover', color + 'DD');
    document.documentElement.style.setProperty('--border-focus', color + '99');
    localStorage.setItem('nuckleo_accent', color);
    State.set('accentColor', color);
    const hexIn = document.getElementById('custom-color-hex');
    const picker = document.getElementById('custom-color-picker');
    if (hexIn) hexIn.value = color;
    if (picker) picker.value = color;
    // Update drawer color dot
    const drawerColorDot = document.getElementById('drawer-color-dot');
    if (drawerColorDot) drawerColorDot.style.background = color;
  }

  function initTheme() {
    applyTheme(State.get('theme'));
    applyAccent(State.get('accentColor'));

    document.getElementById('btn-open-theme')?.addEventListener('click', () => {
      const panel = document.getElementById('theme-panel');
      const shell = document.getElementById('main-app');
      panel.classList.toggle('open');
      shell.classList.toggle('theme-panel-open');
    });
    document.getElementById('btn-close-theme')?.addEventListener('click', () => {
      document.getElementById('theme-panel').classList.remove('open');
      document.getElementById('main-app').classList.remove('theme-panel-open');
    });

    Helpers.qsa('.theme-opt').forEach(opt => {
      opt.addEventListener('click', () => applyTheme(opt.dataset.theme));
    });
    Helpers.qsa('.accent-swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        applyAccent(sw.dataset.color);
        Helpers.qsa('.accent-swatch').forEach(s => s.classList.remove('active'));
        sw.classList.add('active');
      });
    });

    const picker = document.getElementById('custom-color-picker');
    const hexIn = document.getElementById('custom-color-hex');
    picker?.addEventListener('input', () => { if (hexIn) hexIn.value = picker.value; });
    document.getElementById('btn-apply-color')?.addEventListener('click', () => {
      if (hexIn) applyAccent(hexIn.value);
    });
    hexIn?.addEventListener('keydown', e => { if (e.key === 'Enter') applyAccent(hexIn.value); });
  }

  /* ── Notifications ───────────────────────────────── */
  async function loadNotifications() {
    try {
      const res = await api.notifications.list();
      const { notifications, unreadCount } = res.data || {};
      State.set('notifications', notifications || []);
      State.set('unreadCount', unreadCount || 0);
      updateNotifBadge(unreadCount);
      renderNotifications(notifications || []);
    } catch { }
  }

  function updateNotifBadge(count) {
    const badge = document.getElementById('notif-badge');
    if (!badge) return;
    if (count > 0) { badge.textContent = count > 99 ? '99+' : count; badge.style.display = 'flex'; }
    else { badge.style.display = 'none'; }
  }

  function renderNotifications(notifications) {
    const list = document.getElementById('notif-list');
    if (!list) return;
    if (!notifications.length) {
      list.innerHTML = '<p style="text-align:center;padding:24px;color:var(--text-tertiary);font-size:var(--text-sm);">Nenhuma notificação</p>';
      return;
    }
    list.innerHTML = notifications.map(n => `
      <div class="notif-item ${n.isRead ? '' : 'unread'}" data-notif-id="${n._id}">
        ${n.sender?.avatar
        ? `<img src="${n.sender.avatar}" class="notif-avatar" alt="${n.sender.name}" />`
        : `<div class="notif-avatar" style="display:flex;align-items:center;justify-content:center;font-size:1.25rem;">🔔</div>`
      }
        <div class="notif-item__content">
          <div class="notif-item__title">${n.title}</div>
          <div class="notif-item__time">${Helpers.timeAgo(n.createdAt)}</div>
        </div>
      </div>`).join('');
  }

  function initNotifications() {
    const btn = document.getElementById('btn-notifications');
    const panel = document.getElementById('notif-panel');

    btn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = panel.style.display !== 'none';
      panel.style.display = isOpen ? 'none' : 'flex';
      if (!isOpen) loadNotifications();
    });

    document.addEventListener('click', (e) => {
      if (panel && !panel.contains(e.target) && e.target !== btn) {
        panel.style.display = 'none';
      }
    });

    document.getElementById('btn-read-all-notif')?.addEventListener('click', async () => {
      await api.notifications.readAll();
      updateNotifBadge(0);
      loadNotifications();
    });
  }

  /* ── Global Search ───────────────────────────────── */
  function initSearch() {
    const modal = document.getElementById('modal-search');
    const input = document.getElementById('search-modal-input');
    const results = document.getElementById('search-modal-results');
    let _timeout = null;

    function openSearch() {
      modal.style.display = 'flex';
      setTimeout(() => input?.focus(), 50);
    }
    function closeSearch() {
      modal.style.display = 'none';
      if (input) input.value = '';
      if (results) results.innerHTML = '<p class="search-empty">Digite para buscar...</p>';
    }

    document.getElementById('global-search-trigger')?.addEventListener('click', openSearch);
    document.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); openSearch(); }
      if (e.key === 'Escape') { closeSearch(); Modal.closeAll(); DrawerMenu.close(); }
    });
    modal?.addEventListener('click', e => { if (e.target === modal) closeSearch(); });

    input?.addEventListener('input', () => {
      clearTimeout(_timeout);
      const q = input.value.trim();
      if (q.length < 2) { results.innerHTML = '<p class="search-empty">Digite para buscar...</p>'; return; }

      _timeout = setTimeout(async () => {
        try {
          results.innerHTML = '<p class="search-empty">Buscando...</p>';
          const res = await api.search(q);
          renderSearchResults(res.data || {}, results);
        } catch { results.innerHTML = '<p class="search-empty">Erro na busca.</p>'; }
      }, 350);
    });
  }

  function renderSearchResults({ users = [], spaces = [], items = [] }, container) {
    if (!users.length && !spaces.length && !items.length) {
      container.innerHTML = '<p class="search-empty">Nenhum resultado encontrado.</p>';
      return;
    }
    let html = '';
    if (spaces.length) {
      html += `<div class="search-section-title">Espaços</div>`;
      html += spaces.map(s => `
        <div class="search-result-item" data-space-id="${s._id}">
          <span class="search-result-icon">${s.icon || '📁'}</span>
          <div><div class="search-result-name">${s.name}</div>
          <div class="search-result-meta">${s.itemCount || 0} itens</div></div>
        </div>`).join('');
    }
    if (items.length) {
      html += `<div class="search-section-title">Itens</div>`;
      html += items.map(i => `
        <div class="search-result-item" data-item-id="${i._id}">
          <span class="search-result-icon">${Helpers.typeIcon(i.type)}</span>
          <div><div class="search-result-name">${i.title}</div>
          <div class="search-result-meta">${Helpers.typeLabel(i.type)} · ${Helpers.timeAgo(i.createdAt)}</div></div>
        </div>`).join('');
    }
    if (users.length) {
      html += `<div class="search-section-title">Usuários</div>`;
      html += users.map(u => `
        <div class="search-result-item" data-user-id="${u._id}">
          <span class="search-result-icon">👤</span>
          <div><div class="search-result-name">${u.name}</div>
          <div class="search-result-meta">@${u.username || ''}</div></div>
        </div>`).join('');
    }
    container.innerHTML = html;

    container.querySelectorAll('[data-space-id]').forEach(el => {
      el.addEventListener('click', () => { document.getElementById('modal-search').style.display = 'none'; SpaceDetailPage.open(el.dataset.spaceId); });
    });
    container.querySelectorAll('[data-item-id]').forEach(el => {
      el.addEventListener('click', () => { document.getElementById('modal-search').style.display = 'none'; Modal.openItemDetail(el.dataset.itemId); });
    });
  }

  /* ── Init ────────────────────────────────────────── */
  function init() {
    Helpers.qsa('.nav-item').forEach(item => {
      item.addEventListener('click', () => navigateTo(item.dataset.page));
    });
    Helpers.qsa('[data-page]').forEach(el => {
      if (!el.classList.contains('nav-item')) {
        el.addEventListener('click', () => navigateTo(el.dataset.page));
      }
    });

    document.getElementById('btn-logout')?.addEventListener('click', logout);
    document.getElementById('btn-new-space-main')?.addEventListener('click', () => Modal.openNewSpace());
    document.getElementById('btn-new-space-sidebar')?.addEventListener('click', () => Modal.openNewSpace());

    // Hamburguer — abre o drawer
    document.getElementById('btn-sidebar-toggle')?.addEventListener('click', () => DrawerMenu.toggle());

    // Avatar na bottom nav — abre o drawer
    document.getElementById('user-chip')?.addEventListener('click', () => DrawerMenu.toggle());

    window.addEventListener('auth:expired', showAuthScreen);

    AuthPage.init();
    SpacesPage.initFilters();
    SpaceDetailPage.init();
    FriendsPage.init();
    DrawerMenu.init();
    initTheme();
    initNotifications();
    initSearch();
    Modal.init();

    checkAuth();
  }

  return { init, navigateTo, handleAuthSuccess, applyAccent, logout };
})();


/* ═══════════════════════════════════════════════════
   Drawer Menu — menu lateral que abre pelo hambúrguer
   ═══════════════════════════════════════════════════ */
const DrawerMenu = (() => {
  let _drawer = null;
  let _overlay = null;

  function build() {
    // Overlay
    _overlay = document.createElement('div');
    _overlay.id = 'drawer-overlay';
    _overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,0.5);
      z-index:149;display:none;backdrop-filter:blur(2px);
    `;
    _overlay.addEventListener('click', close);

    // Drawer
    _drawer = document.createElement('div');
    _drawer.id = 'drawer-menu';
    _drawer.style.cssText = `
      position:fixed;top:0;left:0;bottom:0;width:280px;
      background:var(--sidebar-bg);border-right:1px solid var(--border);
      z-index:150;transform:translateX(-100%);
      transition:transform 0.25s cubic-bezier(0.16,1,0.3,1);
      display:flex;flex-direction:column;overflow:hidden;
    `;

    _drawer.innerHTML = `
      <!-- Header -->
      <div style="display:flex;align-items:center;justify-content:space-between;padding:20px 20px 16px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <img src="./photos/faviconNuckleo.svg" alt="Nuckleo"
               style="width:36px;height:36px;border-radius:10px;"
               onerror="this.style.display='none'" />
          <span style="font-family:var(--font-display);font-weight:800;font-size:1.25rem;letter-spacing:-0.03em;">Nuckleo</span>
        </div>
        <button id="drawer-avatar-btn" style="
          width:40px;height:40px;border-radius:50%;
          background:var(--accent-muted);border:2px solid var(--accent);
          display:flex;align-items:center;justify-content:center;
          font-weight:700;font-size:0.875rem;color:var(--accent);cursor:pointer;
          overflow:hidden;flex-shrink:0;
        ">?</button>
      </div>

      <!-- Nav items -->
      <nav style="flex:1;padding:8px 12px;overflow-y:auto;">
        <a class="drawer-item active" data-page="dashboard">
          <span class="drawer-item__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          </span>
          <span>Dashboard</span>
        </a>
        <a class="drawer-item" data-page="spaces">
          <span class="drawer-item__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h6v6H3zM15 3h6v6h-6zM15 15h6v6h-6zM3 15h6v6H3z"/></svg>
          </span>
          <span>Espaços</span>
        </a>
        <a class="drawer-item" data-page="favorites">
          <span class="drawer-item__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </span>
          <span>Favoritos</span>
        </a>
        <a class="drawer-item" data-page="friends">
          <span class="drawer-item__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </span>
          <span>Amigos</span>
        </a>

        <div style="height:1px;background:var(--border);margin:12px 8px;"></div>

        <a class="drawer-item" id="drawer-edit-profile">
          <span class="drawer-item__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </span>
          <span>Editar perfil</span>
        </a>
        <a class="drawer-item" id="drawer-theme">
          <span class="drawer-item__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
          </span>
          <span>Personalização</span>
        </a>
        <a class="drawer-item drawer-item--danger" id="drawer-logout">
          <span class="drawer-item__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </span>
          <span>Sair</span>
        </a>
      </nav>

      <!-- Footer: Background color -->
      <div style="
        padding:16px 20px;border-top:1px solid var(--border);
        display:flex;align-items:center;justify-content:space-between;
      ">
        <span style="font-size:0.875rem;color:var(--text-secondary);font-weight:500;">Background color</span>
        <button id="drawer-color-dot" style="
          width:32px;height:32px;border-radius:50%;
          background:var(--accent);border:2px solid var(--border);
          cursor:pointer;transition:transform 0.15s;
        " title="Mudar cor de destaque"></button>
      </div>
    `;

    // CSS for drawer items
    const style = document.createElement('style');
    style.textContent = `
      .drawer-item {
        display:flex;align-items:center;gap:14px;
        padding:12px 16px;border-radius:12px;
        font-size:1rem;font-weight:500;color:var(--text-secondary);
        cursor:pointer;transition:background 0.15s,color 0.15s;
        text-decoration:none;margin-bottom:2px;
      }
      .drawer-item:hover { background:var(--bg-hover);color:var(--text-primary); }
      .drawer-item.active { background:var(--accent-muted);color:var(--accent); }
      .drawer-item--danger { color:#F06292 !important; }
      .drawer-item--danger:hover { background:rgba(240,98,146,0.1) !important; }
      .drawer-item__icon { width:24px;height:24px;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
    `;
    document.head.appendChild(style);

    document.body.appendChild(_overlay);
    document.body.appendChild(_drawer);

    attachListeners();
  }

  function attachListeners() {
    // Nav items
    _drawer.querySelectorAll('[data-page]').forEach(item => {
      item.addEventListener('click', () => {
        App.navigateTo(item.dataset.page);
        // Update active
        _drawer.querySelectorAll('.drawer-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      });
    });

    // Edit profile
    document.getElementById('drawer-edit-profile')?.addEventListener('click', () => {
      close();
      Modal.openEditProfile();
    });

    // Theme
    document.getElementById('drawer-theme')?.addEventListener('click', () => {
      close();
      const panel = document.getElementById('theme-panel');
      const shell = document.getElementById('main-app');
      panel.classList.add('open');
      shell.classList.add('theme-panel-open');
    });

    // Logout
    document.getElementById('drawer-logout')?.addEventListener('click', () => {
      close();
      if (confirm('Deseja sair da conta?')) App.logout();
    });

    // Color dot — abre theme panel
    document.getElementById('drawer-color-dot')?.addEventListener('click', () => {
      close();
      const panel = document.getElementById('theme-panel');
      const shell = document.getElementById('main-app');
      panel.classList.add('open');
      shell.classList.add('theme-panel-open');
    });

    // Avatar btn no drawer — abre edit profile
    document.getElementById('drawer-avatar-btn')?.addEventListener('click', () => {
      close();
      Modal.openEditProfile();
    });
  }

  function updateUser(user) {
    if (!_drawer) return;
    const avatarBtn = document.getElementById('drawer-avatar-btn');
    if (!avatarBtn) return;
    if (user?.avatar) {
      avatarBtn.innerHTML = `<img src="${user.avatar}" style="width:100%;height:100%;object-fit:cover;" />`;
    } else {
      avatarBtn.textContent = Helpers.initials(user?.name || '?');
    }
  }

  function open() {
    if (!_drawer) return;
    _overlay.style.display = 'block';
    _drawer.style.transform = 'translateX(0)';
  }

  function close() {
    if (!_drawer) return;
    _overlay.style.display = 'none';
    _drawer.style.transform = 'translateX(-100%)';
  }

  function toggle() {
    if (!_drawer) return;
    const isOpen = _drawer.style.transform === 'translateX(0px)' || _drawer.style.transform === 'translateX(0)';
    isOpen ? close() : open();
  }

  function init() {
    build();
    // Sync color dot
    const dot = document.getElementById('drawer-color-dot');
    if (dot) dot.style.background = State.get('accentColor') || '#81BFB7';
  }

  return { init, open, close, toggle, updateUser };
})();


/* ═══════════════════════════════════════════════════
   Modal Manager
   ═══════════════════════════════════════════════════ */
const Modal = (() => {
  function open(id) { const m = document.getElementById(id); if (m) m.style.display = 'flex'; }
  function close(id) { const m = document.getElementById(id); if (m) m.style.display = 'none'; }
  function closeAll() { Helpers.qsa('.modal-overlay').forEach(m => m.style.display = 'none'); }

  /* ── New Space ───────────────────────────────────── */
  let _selectedEmoji = '📁';
  let _selectedColor = '#81BFB7';
  let _spaceVisibility = 'private';

  function openNewSpace() {
    // Reset form
    const title = document.querySelector('#modal-new-space .modal__title');
    if (title) title.textContent = 'Criar novo espaço';
    const btn = document.getElementById('btn-create-space');
    if (btn) { btn.textContent = 'Criar espaço'; btn._editId = null; }
    document.getElementById('space-name').value = '';
    document.getElementById('space-desc').value = '';
    document.getElementById('space-tags').value = '';
    _selectedEmoji = '📁';
    _selectedColor = '#81BFB7';
    _spaceVisibility = 'private';
    open('modal-new-space');
  }

  function initNewSpace() {
    Helpers.qsa('.emoji-opt', document.getElementById('modal-new-space')).forEach(opt => {
      opt.addEventListener('click', () => {
        Helpers.qsa('.emoji-opt').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        _selectedEmoji = opt.dataset.emoji;
      });
    });

    Helpers.qsa('.color-dot', document.getElementById('modal-new-space')).forEach(dot => {
      dot.addEventListener('click', () => {
        Helpers.qsa('.color-dot').forEach(d => d.classList.remove('selected'));
        dot.classList.add('selected');
        _selectedColor = dot.dataset.color;
      });
    });

    const newSpaceModal = document.getElementById('modal-new-space');
    newSpaceModal?.querySelectorAll('.toggle-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        newSpaceModal.querySelectorAll('.toggle-opt').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        _spaceVisibility = opt.dataset.val;
      });
    });

    document.getElementById('btn-create-space')?.addEventListener('click', async () => {
      const btn = document.getElementById('btn-create-space');
      const name = document.getElementById('space-name').value.trim();
      const desc = document.getElementById('space-desc').value.trim();
      const tagsRaw = document.getElementById('space-tags').value.trim();
      if (!name) return Helpers.toast('Nome é obrigatório', 'error');

      try {
        // Edit mode
        if (btn._editId) {
          await api.spaces.update(btn._editId, {
            name, description: desc,
            icon: _selectedEmoji, coverColor: _selectedColor,
            visibility: _spaceVisibility,
            tags: Helpers.parseTags(tagsRaw),
          });
          close('modal-new-space');
          Helpers.toast('Espaço atualizado! ✨');
          const spaces = await api.spaces.list();
          State.set('spaces', spaces.data?.spaces || []);
          SpacesPage.updateSidebarSpaces(spaces.data?.spaces || []);
          SpaceDetailPage.reload();
          return;
        }

        const res = await api.spaces.create({
          name, description: desc,
          icon: _selectedEmoji, coverColor: _selectedColor,
          visibility: _spaceVisibility,
          tags: Helpers.parseTags(tagsRaw),
        });
        close('modal-new-space');
        Helpers.toast('Espaço criado! ✨');
        const spaces = await api.spaces.list();
        State.set('spaces', spaces.data?.spaces || []);
        SpacesPage.updateSidebarSpaces(spaces.data?.spaces || []);
        SpaceDetailPage.open(res.data._id || res.data.id);
      } catch (err) {
        Helpers.toast(err.message || 'Erro ao salvar espaço', 'error');
      }
    });
  }

  function openEditSpace(space) {
    document.getElementById('space-name').value = space.name || '';
    document.getElementById('space-desc').value = space.description || '';
    document.getElementById('space-tags').value = Helpers.tagsToString(space.tags);
    _selectedEmoji = space.icon || '📁';
    _selectedColor = space.coverColor || '#81BFB7';
    _spaceVisibility = space.visibility || 'private';

    const title = document.querySelector('#modal-new-space .modal__title');
    if (title) title.textContent = 'Editar espaço';

    const createBtn = document.getElementById('btn-create-space');
    if (createBtn) { createBtn.textContent = 'Salvar alterações'; createBtn._editId = space._id || space.id; }

    open('modal-new-space');
  }

  /* ── Edit Profile ────────────────────────────────── */
  function openEditProfile() {
    const user = State.get('user');
    if (!user) return;

    // Check if modal exists, create if not
    let modal = document.getElementById('modal-edit-profile');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-edit-profile';
      modal.className = 'modal-overlay';
      modal.style.display = 'none';
      modal.innerHTML = `
        <div class="modal">
          <div class="modal__header">
            <h2 class="modal__title">Editar perfil</h2>
            <button class="btn-icon modal-close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal__body">
            <div class="field">
              <label class="field__label">Nome</label>
              <input type="text" class="input" id="profile-name" placeholder="Seu nome" />
            </div>
            <div class="field">
              <label class="field__label">Username</label>
              <input type="text" class="input" id="profile-username" placeholder="@username" />
            </div>
            <div class="field">
              <label class="field__label">Bio</label>
              <textarea class="input textarea" id="profile-bio" rows="3" placeholder="Conte um pouco sobre você..." maxlength="300"></textarea>
            </div>
            <div class="field">
              <label class="field__label">Website</label>
              <input type="url" class="input" id="profile-website" placeholder="https://..." />
            </div>
            <div class="field">
              <label class="field__label">URL do avatar</label>
              <input type="url" class="input" id="profile-avatar" placeholder="https://..." />
            </div>
          </div>
          <div class="modal__footer">
            <button class="btn btn--ghost modal-close">Cancelar</button>
            <button class="btn btn--primary" id="btn-save-profile">Salvar</button>
          </div>
        </div>`;
      document.body.appendChild(modal);

      // Close handlers
      modal.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => { modal.style.display = 'none'; });
      });
      modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });

      // Save
      document.getElementById('btn-save-profile')?.addEventListener('click', async () => {
        const name = document.getElementById('profile-name').value.trim();
        const username = document.getElementById('profile-username').value.trim().replace('@', '');
        const bio = document.getElementById('profile-bio').value.trim();
        const website = document.getElementById('profile-website').value.trim();
        const avatar = document.getElementById('profile-avatar').value.trim();

        if (!name) return Helpers.toast('Nome é obrigatório', 'error');

        try {
          const res = await api.users.updateProfile({ name, username, bio, website, avatar });
          State.set('user', { ...State.get('user'), ...res.data });
          App.updateUserUI ? App.updateUserUI(res.data) : null;
          // Update UI
          const nameEl = document.getElementById('user-name');
          const handleEl = document.getElementById('user-handle');
          if (nameEl) nameEl.textContent = res.data.name || name;
          if (handleEl) handleEl.textContent = username ? `@${username}` : res.data.email || '';
          modal.style.display = 'none';
          Helpers.toast('Perfil atualizado! ✅');
        } catch (err) {
          Helpers.toast(err.message || 'Erro ao salvar perfil', 'error');
        }
      });
    }

    // Prefill
    document.getElementById('profile-name').value = user.name || '';
    document.getElementById('profile-username').value = user.username || '';
    document.getElementById('profile-bio').value = user.bio || '';
    document.getElementById('profile-website').value = user.website || '';
    document.getElementById('profile-avatar').value = user.avatar || '';

    modal.style.display = 'flex';
  }

  /* ── New Item ────────────────────────────────────── */
  let _itemType = 'note';
  let _itemVisibility = 'private';
  let _selectedFile = null;

  function openNewItem() {
    // Reset form completamente
    _itemType = 'note';
    _itemVisibility = 'private';
    _selectedFile = null;

    document.getElementById('item-title').value = '';
    document.getElementById('note-editor').innerHTML = '';
    document.getElementById('item-url').value = '';
    document.getElementById('item-code').value = '';
    document.getElementById('item-tags').value = '';
    document.getElementById('item-lang').value = 'javascript';

    // Reset tabs
    Helpers.qsa('.item-type-tab').forEach(t => t.classList.toggle('active', t.dataset.type === 'note'));
    Helpers.qsa('.item-fields').forEach(f => f.style.display = 'none');
    const noteFields = document.getElementById('item-fields-note');
    if (noteFields) noteFields.style.display = 'block';

    // Reset visibility
    const itemModal = document.getElementById('modal-new-item');
    itemModal?.querySelectorAll('.toggle-opt').forEach(o => {
      o.classList.toggle('active', o.dataset.val === 'private');
    });

    // Reset file upload
    const uploadArea = document.getElementById('upload-area');
    const filePreview = document.getElementById('file-preview');
    if (uploadArea) uploadArea.style.display = 'flex';
    if (filePreview) filePreview.style.display = 'none';

    open('modal-new-item');
  }

  function initNewItem() {
    Helpers.qsa('.item-type-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        Helpers.qsa('.item-type-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        _itemType = tab.dataset.type;
        Helpers.qsa('.item-fields').forEach(f => f.style.display = 'none');
        const fieldsEl = document.getElementById(`item-fields-${_itemType}`);
        if (fieldsEl) fieldsEl.style.display = 'block';
      });
    });

    const itemModal = document.getElementById('modal-new-item');
    itemModal?.querySelectorAll('.toggle-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        itemModal.querySelectorAll('.toggle-opt').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        _itemVisibility = opt.dataset.val;
      });
    });

    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const filePreview = document.getElementById('file-preview');

    uploadArea?.addEventListener('click', () => fileInput?.click());
    uploadArea?.addEventListener('dragover', e => { e.preventDefault(); uploadArea.classList.add('dragover'); });
    uploadArea?.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
    uploadArea?.addEventListener('drop', e => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    });
    fileInput?.addEventListener('change', () => {
      if (fileInput.files[0]) handleFile(fileInput.files[0]);
    });

    function handleFile(file) {
      _selectedFile = file;
      uploadArea.style.display = 'none';
      filePreview.style.display = 'flex';
      filePreview.innerHTML = `
        <span style="font-size:1.5rem;">📄</span>
        <span class="file-preview__name">${file.name}</span>
        <span class="file-preview__size">${Helpers.formatFileSize(file.size)}</span>
        <button class="btn btn--ghost btn--sm" id="btn-clear-file">×</button>`;
      document.getElementById('btn-clear-file')?.addEventListener('click', () => {
        _selectedFile = null;
        uploadArea.style.display = 'flex';
        filePreview.style.display = 'none';
      });
    }

    document.getElementById('btn-create-item')?.addEventListener('click', async () => {
      const space = SpaceDetailPage.getCurrentSpace();
      if (!space) return Helpers.toast('Abra um espaço primeiro', 'error');

      const title = document.getElementById('item-title').value.trim();
      if (!title) return Helpers.toast('Título é obrigatório', 'error');

      const tags = Helpers.parseTags(document.getElementById('item-tags').value);
      const payload = { title, type: _itemType, visibility: _itemVisibility, tags };

      switch (_itemType) {
        case 'note':
          payload.content = document.getElementById('note-editor').innerHTML;
          break;
        case 'link':
          payload.meta = { url: document.getElementById('item-url').value.trim() };
          break;
        case 'code':
          payload.meta = {
            language: document.getElementById('item-lang').value,
            code: document.getElementById('item-code').value,
          };
          break;
        case 'file':
          if (!_selectedFile) return Helpers.toast('Selecione um arquivo', 'error');
          payload.meta = { fileName: _selectedFile.name, fileSize: _selectedFile.size, mimeType: _selectedFile.type };
          break;
      }

      try {
        await api.spaces.addItem(space._id || space.id, payload);
        close('modal-new-item');
        Helpers.toast('Item adicionado! 🎉');
        SpaceDetailPage.reload();
      } catch (err) {
        Helpers.toast(err.message || 'Erro ao criar item', 'error');
      }
    });
  }

  /* ── Item Detail ─────────────────────────────────── */
  async function openItemDetail(itemId) {
    open('modal-item-detail');
    const body = document.getElementById('item-detail-body');
    body.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-secondary);">Carregando...</div>';

    try {
      let item = (State.get('currentSpaceItems') || []).find(i => (i._id || i.id) === itemId);
      if (!item) {
        const res = await api.items.get(itemId);
        item = res.data;
      }
      renderItemDetail(item);
    } catch {
      body.innerHTML = '<p style="color:var(--text-secondary);">Erro ao carregar item.</p>';
    }
  }

  function renderItemDetail(item) {
    const typeBadge = document.getElementById('item-detail-type-badge');
    if (typeBadge) typeBadge.textContent = `${Helpers.typeIcon(item.type)} ${Helpers.typeLabel(item.type)}`;

    const body = document.getElementById('item-detail-body');
    const tagsHtml = (item.tags || []).map(t => `<span class="tag">#${t}</span>`).join('');

    let contentHtml = '';
    switch (item.type) {
      case 'note':
        contentHtml = `<div class="item-detail-content">${item.content || '<em style="color:var(--text-tertiary);">Nota vazia</em>'}</div>`;
        break;
      case 'link':
        contentHtml = `
          <a href="${item.meta?.url}" target="_blank" rel="noopener" class="item-detail-link-card">
            <span style="flex:1;overflow:hidden;text-overflow:ellipsis;">${item.meta?.url}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>`;
        break;
      case 'code':
        contentHtml = `
          <div>
            <div style="font-size:var(--text-xs);color:var(--text-tertiary);margin-bottom:8px;">${item.meta?.language || 'code'}</div>
            <pre class="item-detail-code">${item.meta?.code || ''}</pre>
          </div>`;
        break;
      case 'file':
        contentHtml = `
          <div style="display:flex;align-items:center;gap:12px;padding:20px;background:var(--input-bg);border-radius:var(--radius-lg);">
            <span style="font-size:2rem;"></span>
            <div>
              <div style="font-weight:600;">${item.meta?.fileName}</div>
              <div style="font-size:var(--text-xs);color:var(--text-tertiary);">${Helpers.formatFileSize(item.meta?.fileSize)} · ${item.meta?.mimeType || ''}</div>
            </div>
          </div>`;
        break;
    }

    body.innerHTML = `
      <h2 class="item-detail-title">${item.title}</h2>
      <div class="item-detail-meta">
        <span>${Helpers.formatDate(item.createdAt)}</span>
        <span>·</span>
        <span>${item.viewCount || 0} visualizações</span>
        <span>·</span>
        <span>${item.visibility === 'public' ? 'Público' : 'Privado'}</span>
      </div>
      ${contentHtml}
      ${tagsHtml ? `<div class="item-detail-tags">${tagsHtml}</div>` : ''}`;

    const favBtn = document.getElementById('btn-item-fav');
    const pinBtn = document.getElementById('btn-item-pin');
    const shareBtn = document.getElementById('btn-item-share');
    const delBtn = document.getElementById('btn-item-delete');

    if (favBtn) {
      favBtn.textContent = item.isFavorite ? '⭐ Desfavoritar' : '☆ Favoritar';
      favBtn.onclick = async () => {
        await api.items.update(item._id, { isFavorite: !item.isFavorite });
        item.isFavorite = !item.isFavorite;
        favBtn.textContent = item.isFavorite ? '⭐ Desfavoritar' : '☆ Favoritar';
        Helpers.toast(item.isFavorite ? 'Adicionado aos favoritos ⭐' : 'Removido dos favoritos');
        SpaceDetailPage.reload();
      };
    }
    if (pinBtn) {
      pinBtn.textContent = item.isPinned ? '📌 Desafixar' : '📌 Fixar';
      pinBtn.onclick = async () => {
        await api.items.update(item._id, { isPinned: !item.isPinned });
        item.isPinned = !item.isPinned;
        pinBtn.textContent = item.isPinned ? '📌 Desafixar' : '📌 Fixar';
        Helpers.toast(item.isPinned ? 'Item fixado' : 'Item desafixado');
        SpaceDetailPage.reload();
      };
    }
    if (shareBtn) {
      shareBtn.onclick = async () => {
        if (item.visibility !== 'public') { Helpers.toast('Torne o item público para compartilhar', 'error'); return; }
        if (item.shareToken) await Helpers.copy(`${location.origin}?item=${item.shareToken}`);
      };
    }
    if (delBtn) {
      delBtn.onclick = async () => {
        if (!confirm('Deletar este item permanentemente?')) return;
        await api.items.delete(item._id);
        close('modal-item-detail');
        Helpers.toast('Item deletado.');
        SpaceDetailPage.reload();
      };
    }
  }

  /* ── Close handlers ──────────────────────────────── */
  function initCloseHandlers() {
    Helpers.qsa('.modal-close').forEach(btn => {
      btn.addEventListener('click', closeAll);
    });
    Helpers.qsa('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', e => { if (e.target === overlay) closeAll(); });
    });
  }

  return {
    init() {
      initCloseHandlers();
      initNewSpace();
      initNewItem();
    },
    openNewSpace,
    openNewItem,
    openEditSpace,
    openEditProfile,
    openItemDetail,
    closeAll,
  };
})();

/* ── Boot ─────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => App.init());