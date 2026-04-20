// Detalhe de espaço + itens - Placeholder
/* pages/spaceDetail.js */

const SpaceDetailPage = (() => {
  let _currentSpace = null;
  let _typeFilter = 'all';

  async function open(spaceId) {
    App.navigateTo('space-detail');

    const header  = document.getElementById('space-detail-header');
    const itemsEl = document.getElementById('space-items');
    header.innerHTML  = '<div class="skeleton" style="height:120px;border-radius:var(--radius-xl);"></div>';
    itemsEl.innerHTML = ItemCard.renderSkeleton().repeat(4);

    // Update sidebar active
    Helpers.qsa('.sidebar-space-item').forEach(el => {
      el.classList.toggle('active', el.dataset.spaceId === spaceId);
    });

    try {
      // Try local cache first
      let space = (State.get('spaces') || []).find(s => (s._id || s.id) === spaceId);
      if (!space) {
        const res = await api.spaces.get(spaceId);
        space = res.data;
      }
      _currentSpace = space;
      State.set('currentSpace', space);

      renderHeader(space);
      await loadItems(spaceId);
    } catch (err) {
      header.innerHTML = `<p style="color:var(--text-secondary);">Erro ao carregar espaço.</p>`;
    }
  }

  function renderHeader(space) {
    const header = document.getElementById('space-detail-header');
    header.style.setProperty('border-left', `4px solid ${space.coverColor || '#81BFB7'}`);

    const tagsHtml = (space.tags || []).map(t => `<span class="tag">#${t}</span>`).join('');

    header.innerHTML = `
      <div class="sdh-emoji">${space.icon || '📁'}</div>
      <h1>${space.name}</h1>
      ${space.description ? `<p style="color:var(--text-secondary);margin-top:8px;font-size:var(--text-sm);">${space.description}</p>` : ''}
      <div style="display:flex;gap:12px;align-items:center;margin-top:12px;">
        <span class="sdh-visibility space-card__badge ${space.visibility === 'public' ? 'badge--public' : 'badge--private'}">
          ${space.visibility === 'public' ? '🌐 Público' : '🔒 Privado'}
        </span>
        <span style="font-size:var(--text-xs);color:var(--text-tertiary);">${space.itemCount || 0} itens</span>
        <span style="font-size:var(--text-xs);color:var(--text-tertiary);">Criado ${Helpers.formatDate(space.createdAt)}</span>
        ${tagsHtml}
      </div>`;
  }

  async function loadItems(spaceId, type = 'all') {
    const container = document.getElementById('space-items');
    container.innerHTML = ItemCard.renderSkeleton().repeat(4);

    try {
      const params = type !== 'all' ? `type=${type}` : '';
      const res = await api.spaces.items(spaceId, params);
      const items = res.data?.items || [];
      State.set('currentSpaceItems', items);

      if (!items.length) {
        container.innerHTML = Helpers.emptyState({
          icon: '📋',
          title: 'Nenhum item ainda',
          desc: 'Adicione notas, links, arquivos e código a este espaço.',
          actionLabel: '+ Adicionar item',
          actionId: 'detail-add-item-btn',
        });
        document.getElementById('detail-add-item-btn')?.addEventListener('click', () => Modal.openNewItem());
        return;
      }

      container.innerHTML = items.map(i => ItemCard.render(i)).join('');
      attachItemListeners(container);
    } catch {
      container.innerHTML = Helpers.emptyState({ icon: '⚠️', title: 'Erro ao carregar itens' });
    }
  }

  function attachItemListeners(container) {
    container.querySelectorAll('.item-card').forEach(card => {
      card.addEventListener('click', () => Modal.openItemDetail(card.dataset.itemId));
    });
  }

  function initTypeFilter() {
    const filterEl = document.getElementById('item-type-filter');
    filterEl?.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        filterEl.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        _typeFilter = chip.dataset.type;
        if (_currentSpace) loadItems(_currentSpace._id || _currentSpace.id, _typeFilter);
      });
    });
  }

  function initActions() {
    document.getElementById('btn-back-spaces')?.addEventListener('click', () => {
      App.navigateTo('spaces');
      Helpers.qsa('.sidebar-space-item').forEach(el => el.classList.remove('active'));
    });

    document.getElementById('btn-new-item')?.addEventListener('click', () => Modal.openNewItem());

    document.getElementById('btn-share-space')?.addEventListener('click', async () => {
      if (!_currentSpace) return;
      if (_currentSpace.visibility !== 'public') {
        Helpers.toast('Torne o espaço público para compartilhar', 'error');
        return;
      }
      const shareUrl = `${location.origin}?space=${_currentSpace.shareToken}`;
      await Helpers.copy(shareUrl);
    });

    document.getElementById('btn-edit-space')?.addEventListener('click', () => {
      if (_currentSpace) Modal.openEditSpace(_currentSpace);
    });
  }

  return {
    open,
    reload() { if (_currentSpace) loadItems(_currentSpace._id || _currentSpace.id, _typeFilter); },
    getCurrentSpace() { return _currentSpace; },
    init() {
      initTypeFilter();
      initActions();
    },
  };
})();
