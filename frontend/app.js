// Orquestrador principal + Modal Manager - Placeholder
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

    // Load page data
    switch (page) {
      case 'dashboard': DashboardPage.load(); break;
      case 'spaces':    SpacesPage.load(); break;
      case 'favorites': FavoritesPage.load(); break;
      case 'friends':   FriendsPage.load(); break;
    }
  }

  /* ── Auth ────────────────────────────────────────── */
  function handleAuthSuccess({ token, user }) {
    localStorage.setItem('nuckleo_token', token);
    State.set('user', user);
    showApp(user);
    navigateTo('dashboard');
    SpacesPage.load(); // preload spaces
    loadNotifications();
  }

  function showApp(user) {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('main-app').style.display = 'grid';
    updateUserUI(user);
  }

  function updateUserUI(user) {
    const nameEl   = document.getElementById('user-name');
    const handleEl = document.getElementById('user-handle');
    const avatarEl = document.getElementById('user-avatar');

    if (nameEl)   nameEl.textContent   = user.name || '—';
    if (handleEl) handleEl.textContent = user.username ? `@${user.username}` : user.email || '—';
    if (avatarEl) {
      if (user.avatar) {
        avatarEl.src = user.avatar;
        avatarEl.style.display = 'block';
      } else {
        avatarEl.style.display = 'none';
        // Replace with initials
        const parent = avatarEl.parentElement;
        let init = parent.querySelector('.avatar-initials');
        if (!init) {
          init = document.createElement('div');
          init.className = 'avatar-initials user-chip__avatar';
          init.style.cssText = 'display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.75rem;background:var(--accent-muted);color:var(--accent);';
          parent.insertBefore(init, avatarEl);
        }
        init.textContent = Helpers.initials(user.name);
      }
    }
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
    // Derive lighter version
    document.documentElement.style.setProperty('--accent-light', color + 'CC');
    document.documentElement.style.setProperty('--accent-muted', color + '22');
    document.documentElement.style.setProperty('--accent-hover', color + 'DD');
    document.documentElement.style.setProperty('--border-focus', color + '99');
    localStorage.setItem('nuckleo_accent', color);
    State.set('accentColor', color);
    document.getElementById('custom-color-hex').value = color;
    document.getElementById('custom-color-picker').value = color;
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
    const hexIn  = document.getElementById('custom-color-hex');
    picker?.addEventListener('input', () => { hexIn.value = picker.value; });
    document.getElementById('btn-apply-color')?.addEventListener('click', () => {
      applyAccent(hexIn.value);
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
    } catch {}
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
    const btn   = document.getElementById('btn-notifications');
    const panel = document.getElementById('notif-panel');

    btn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = panel.style.display !== 'none';
      panel.style.display = isOpen ? 'none' : 'flex';
      if (!isOpen) loadNotifications();
    });

    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target) && e.target !== btn) {
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
    const modal  = document.getElementById('modal-search');
    const input  = document.getElementById('search-modal-input');
    const results= document.getElementById('search-modal-results');
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
      if (e.key === 'Escape') { closeSearch(); Modal.closeAll(); }
    });
    modal?.addEventListener('click', e => { if (e.target === modal) closeSearch(); });

    input?.addEventListener('input', () => {
      clearTimeout(_timeout);
      const q = input.value.trim();
      if (q.length < 2) { results.innerHTML = '<p class="search-empty">Digite para buscar...</p>'; return; }

      _timeout = setTimeout(async () => {
        try {
          results.innerHTML = '<p class="search-empty" style="animation: pulse-dot 1s infinite;">Buscando...</p>';
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
    // Nav links
    Helpers.qsa('.nav-item').forEach(item => {
      item.addEventListener('click', () => navigateTo(item.dataset.page));
    });

    // Buttons that also navigate
    Helpers.qsa('[data-page]').forEach(el => {
      if (!el.classList.contains('nav-item')) {
        el.addEventListener('click', () => navigateTo(el.dataset.page));
      }
    });

    document.getElementById('btn-logout')?.addEventListener('click', logout);
    document.getElementById('btn-new-space-main')?.addEventListener('click', () => Modal.openNewSpace());
    document.getElementById('btn-new-space-sidebar')?.addEventListener('click', () => Modal.openNewSpace());

    // Auth token expiry
    window.addEventListener('auth:expired', showAuthScreen);

    // Page-specific inits
    AuthPage.init();
    SpacesPage.initFilters();
    SpaceDetailPage.init();
    FriendsPage.init();
    initTheme();
    initNotifications();
    initSearch();
    Modal.init();

    // Check session
    checkAuth();
  }

  return { init, navigateTo, handleAuthSuccess };
})();


/* ═══════════════════════════════════════════════════
   Modal Manager
   ═══════════════════════════════════════════════════ */
const Modal = (() => {
  /* ── Helpers ─────────────────────────────────────── */
  function open(id)  { const m = document.getElementById(id); if (m) m.style.display = 'flex'; }
  function close(id) { const m = document.getElementById(id); if (m) m.style.display = 'none'; }
  function closeAll() {
    Helpers.qsa('.modal-overlay').forEach(m => m.style.display = 'none');
  }

  /* ── New Space ───────────────────────────────────── */
  let _selectedEmoji = '📁';
  let _selectedColor = '#81BFB7';
  let _spaceVisibility = 'private';

  function openNewSpace() { open('modal-new-space'); }

  function initNewSpace() {
    // Emoji picker
    Helpers.qsa('.emoji-opt', document.getElementById('modal-new-space')).forEach(opt => {
      opt.addEventListener('click', () => {
        Helpers.qsa('.emoji-opt').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        _selectedEmoji = opt.dataset.emoji;
      });
    });

    // Color picker
    Helpers.qsa('.color-dot', document.getElementById('modal-new-space')).forEach(dot => {
      dot.addEventListener('click', () => {
        Helpers.qsa('.color-dot').forEach(d => d.classList.remove('selected'));
        dot.classList.add('selected');
        _selectedColor = dot.dataset.color;
      });
    });

    // Visibility toggle
    const newSpaceModal = document.getElementById('modal-new-space');
    newSpaceModal?.querySelectorAll('.toggle-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        newSpaceModal.querySelectorAll('.toggle-opt').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        _spaceVisibility = opt.dataset.val;
      });
    });

    // Create
    document.getElementById('btn-create-space')?.addEventListener('click', async () => {
      const name = document.getElementById('space-name').value.trim();
      const desc = document.getElementById('space-desc').value.trim();
      const tagsRaw = document.getElementById('space-tags').value.trim();
      if (!name) return Helpers.toast('Nome é obrigatório', 'error');

      try {
        const res = await api.spaces.create({
          name, description: desc,
          icon: _selectedEmoji,
          coverColor: _selectedColor,
          visibility: _spaceVisibility,
          tags: Helpers.parseTags(tagsRaw),
        });
        close('modal-new-space');
        Helpers.toast('Espaço criado! ✨');
        // Reset
        document.getElementById('space-name').value = '';
        document.getElementById('space-desc').value = '';
        document.getElementById('space-tags').value = '';
        // Reload and open
        const spaces = await api.spaces.list();
        State.set('spaces', spaces.data?.spaces || []);
        SpacesPage.updateSidebarSpaces(spaces.data?.spaces || []);
        SpaceDetailPage.open(res.data._id || res.data.id);
      } catch (err) {
        Helpers.toast(err.message || 'Erro ao criar espaço', 'error');
      }
    });
  }

  /* ── Edit Space ──────────────────────────────────── */
  function openEditSpace(space) {
    // Reuse create modal prefilled
    document.getElementById('space-name').value = space.name || '';
    document.getElementById('space-desc').value = space.description || '';
    document.getElementById('space-tags').value = Helpers.tagsToString(space.tags);
    _selectedEmoji = space.icon || '📁';
    _selectedColor = space.coverColor || '#81BFB7';
    _spaceVisibility = space.visibility || 'private';

    const title = document.querySelector('#modal-new-space .modal__title');
    if (title) title.textContent = 'Editar espaço';

    const createBtn = document.getElementById('btn-create-space');
    if (createBtn) {
      createBtn.textContent = 'Salvar alterações';
      createBtn._editId = space._id || space.id;
    }

    open('modal-new-space');
  }

  /* ── New Item ────────────────────────────────────── */
  let _itemType = 'note';
  let _itemVisibility = 'private';

  function openNewItem() { open('modal-new-item'); }

  function initNewItem() {
    // Type tabs
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

    // Visibility
    const itemModal = document.getElementById('modal-new-item');
    itemModal?.querySelectorAll('.toggle-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        itemModal.querySelectorAll('.toggle-opt').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        _itemVisibility = opt.dataset.val;
      });
    });

    // File upload
    const uploadArea = document.getElementById('upload-area');
    const fileInput  = document.getElementById('file-input');
    const filePreview = document.getElementById('file-preview');
    let _selectedFile = null;

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

    // Create item
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
        // Reset form
        document.getElementById('item-title').value = '';
        document.getElementById('note-editor').innerHTML = '';
        document.getElementById('item-url').value = '';
        document.getElementById('item-code').value = '';
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
      // Try cache first
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
            🔗 <span style="flex:1;overflow:hidden;text-overflow:ellipsis;">${item.meta?.url}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>`;
        break;
      case 'code':
        contentHtml = `
          <div style="position:relative;">
            <div style="font-size:var(--text-xs);color:var(--text-tertiary);margin-bottom:8px;">${item.meta?.language || 'code'}</div>
            <pre class="item-detail-code">${item.meta?.code || ''}</pre>
          </div>`;
        break;
      case 'file':
        contentHtml = `
          <div style="display:flex;align-items:center;gap:12px;padding:20px;background:var(--input-bg);border-radius:var(--radius-lg);">
            <span style="font-size:2rem;">📄</span>
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
        <span>${item.visibility === 'public' ? '🌐 Público' : '🔒 Privado'}</span>
      </div>
      ${contentHtml}
      ${tagsHtml ? `<div class="item-detail-tags">${tagsHtml}</div>` : ''}`;

    // Action buttons
    const favBtn   = document.getElementById('btn-item-fav');
    const pinBtn   = document.getElementById('btn-item-pin');
    const shareBtn = document.getElementById('btn-item-share');
    const delBtn   = document.getElementById('btn-item-delete');

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
        if (item.visibility !== 'public') {
          Helpers.toast('Torne o item público para compartilhar', 'error');
          return;
        }
        if (item.shareToken) {
          await Helpers.copy(`${location.origin}?item=${item.shareToken}`);
        }
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
    openItemDetail,
    closeAll,
  };
})();

/* ── Boot ─────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => App.init());
