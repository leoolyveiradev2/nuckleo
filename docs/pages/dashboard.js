// Dashboard principal - Placeholder
/* pages/dashboard.js */

const DashboardPage = (() => {
  async function load() {
    // Greeting no formato: "Bom dia, Leo!"
    const user = State.get('user');
    const firstName = user?.name?.split(' ')[0] || '';
    document.getElementById('dashboard-greeting').textContent =
      `${Helpers.greeting()}, ${firstName}!`;

    await Promise.all([loadRecentSpaces(), loadRecentItems()]);
  }

  async function loadStats() {
    // Deprecated - stats section removed from dashboard
  }

  async function loadRecentSpaces() {
    const container = document.getElementById('recent-spaces');
    const spaces = (State.get('spaces') || []).slice(0, 6);

    if (!spaces.length) {
      container.innerHTML = Helpers.emptyState({
        icon: '📁',
        title: 'Nenhum espaço ainda',
        desc: 'Crie seu primeiro espaço para começar a organizar.',
        actionLabel: '+ Criar espaço',
        actionId: 'dash-create-space-btn',
      });
      document.getElementById('dash-create-space-btn')?.addEventListener('click', () => {
        Modal.openNewSpace();
      });
      return;
    }

    container.innerHTML = spaces.map(s => SpaceCard.render(s)).join('');
    attachSpaceCardListeners(container);
  }

  async function loadRecentItems() {
    const container = document.getElementById('recent-items');
    if (!container) return;

    container.innerHTML = ItemCard.renderSkeleton().repeat(3);

    try {
      // Fetch recent items across all spaces
      const spaces = State.get('spaces') || [];
      if (!spaces.length) { container.innerHTML = ''; return; }

      const results = [];
      for (const space of spaces.slice(0, 5)) {
        try {
          const res = await api.spaces.items(space._id || space.id, 'limit=20&sort=-updatedAt');
          const items = (res.data?.items || []).map(i => ({
            ...i,
            spaceName: space.name
          }));
          results.push(...items);
        } catch { }
      }

      // Sort by date and get top 10
      results.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      const topItems = results.slice(0, 10);

      if (!topItems.length) {
        container.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--text-tertiary);">Nenhum item recente</div>';
        return;
      }

      container.innerHTML = topItems.map(i => ItemCard.render(i)).join('');
      attachItemCardListeners(container);

      // Tab filtering
      const tabs = document.querySelectorAll('.recent-tab');
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          
          const filterType = tab.textContent.trim().toLowerCase();
          filterRecentItems(topItems, filterType);
        });
      });
    } catch {
      container.innerHTML = '';
    }
  }

  function filterRecentItems(items, filterType) {
    const container = document.getElementById('recent-items');
    if (!container) return;

    let filtered = items;
    if (filterType !== 'todos') {
      const typeMap = {
        'links': 'link',
        'textos': 'note',
        'arquivos': 'file',
        'códigos': 'code',
        'imagens': 'image',
        'pastas': 'folder'
      };
      const type = typeMap[filterType];
      if (type) filtered = items.filter(i => i.type === type);
    }

    if (!filtered.length) {
      container.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--text-tertiary);">Nenhum item neste tipo</div>';
      return;
    }

    container.innerHTML = filtered.map(i => ItemCard.render(i)).join('');
    attachItemCardListeners(container);
  }

  async function loadPinnedItems() {
    // Deprecated - moved to loadRecentItems
  }

  function attachSpaceCardListeners(container) {
    container.querySelectorAll('.space-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.spaceId;
        SpaceDetailPage.open(id);
      });
    });
  }

  function attachItemCardListeners(container) {
    container.querySelectorAll('.item-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.itemId;
        Modal.openItemDetail(id);
      });
    });
  }

  return { load };
})();