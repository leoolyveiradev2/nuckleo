// Dashboard principal - Placeholder
/* pages/dashboard.js */

const DashboardPage = (() => {
  async function load() {
    // Greeting
    const user = State.get('user');
    document.getElementById('dashboard-greeting').textContent =
      `${Helpers.greeting()}, ${user?.name?.split(' ')[0] || ''}`;

    await Promise.all([loadStats(), loadRecentSpaces(), loadPinnedItems()]);
  }

  async function loadStats() {
    const spaces = State.get('spaces') || [];
    document.getElementById('stat-spaces').textContent = spaces.length;

    const itemCount = spaces.reduce((acc, s) => acc + (s.itemCount || 0), 0);
    document.getElementById('stat-items').textContent = itemCount;

    try {
      const favRes = await api.items.favorites('limit=1');
      document.getElementById('stat-favorites').textContent = favRes.data?.total || 0;
    } catch { document.getElementById('stat-favorites').textContent = 0; }

    try {
      const friendRes = await api.users.friends();
      document.getElementById('stat-friends').textContent = friendRes.data?.friends?.length || 0;
    } catch { document.getElementById('stat-friends').textContent = 0; }
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

  async function loadPinnedItems() {
    const section   = document.getElementById('pinned-section');
    const container = document.getElementById('pinned-items');

    // Gather pinned items across all spaces
    const spaces = State.get('spaces') || [];
    if (!spaces.length) { section.style.display = 'none'; return; }

    container.innerHTML = ItemCard.renderSkeleton().repeat(3);

    try {
      // Fetch pinned from first 3 spaces (quick approximation)
      const results = [];
      for (const space of spaces.slice(0, 5)) {
        try {
          const res = await api.spaces.items(space._id || space.id, 'limit=10');
          const pinned = (res.data?.items || []).filter(i => i.isPinned);
          results.push(...pinned);
        } catch {}
      }

      if (!results.length) {
        section.style.display = 'none';
        return;
      }

      section.style.display = 'block';
      container.innerHTML = results.slice(0, 6).map(i => ItemCard.render(i)).join('');
      attachItemCardListeners(container);
    } catch {
      section.style.display = 'none';
    }
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
