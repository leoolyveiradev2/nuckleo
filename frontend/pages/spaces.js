// Listagem de espaços - Placeholder
/* pages/spaces.js */

const SpacesPage = (() => {
  let _filter = 'all';

  async function load() {
    const container = document.getElementById('all-spaces');
    container.innerHTML = SpaceCard.renderSkeleton().repeat(6);

    try {
      const res = await api.spaces.list();
      const spaces = res.data?.spaces || [];
      State.set('spaces', spaces);
      render(spaces);
      updateSidebarSpaces(spaces);
    } catch (err) {
      container.innerHTML = Helpers.emptyState({ icon: '⚠️', title: 'Erro ao carregar espaços' });
    }
  }

  function render(spaces) {
    const container = document.getElementById('all-spaces');
    let filtered = spaces;

    switch (_filter) {
      case 'pinned':  filtered = spaces.filter(s => s.isPinned); break;
      case 'public':  filtered = spaces.filter(s => s.visibility === 'public'); break;
      case 'private': filtered = spaces.filter(s => s.visibility === 'private'); break;
    }

    if (!filtered.length) {
      container.innerHTML = Helpers.emptyState({
        icon: '📁',
        title: 'Nenhum espaço encontrado',
        desc: 'Crie um novo espaço para começar.',
        actionLabel: '+ Novo Espaço',
        actionId: 'spaces-create-btn',
      });
      document.getElementById('spaces-create-btn')?.addEventListener('click', () => Modal.openNewSpace());
      return;
    }

    container.innerHTML = filtered.map(s => SpaceCard.render(s)).join('');
    attachListeners(container);
  }

  function attachListeners(container) {
    container.querySelectorAll('.space-card').forEach(card => {
      card.addEventListener('click', () => SpaceDetailPage.open(card.dataset.spaceId));
    });
  }

  function updateSidebarSpaces(spaces) {
    const sidebar = document.getElementById('sidebar-spaces');
    if (!sidebar) return;
    sidebar.innerHTML = spaces.slice(0, 12).map(s => `
      <div class="sidebar-space-item" data-space-id="${s._id || s.id}">
        <span class="sidebar-space-item__icon">${s.icon || '📁'}</span>
        <span class="sidebar-space-item__name">${Helpers.truncate(s.name, 22)}</span>
      </div>`).join('');

    sidebar.querySelectorAll('.sidebar-space-item').forEach(el => {
      el.addEventListener('click', () => SpaceDetailPage.open(el.dataset.spaceId));
    });
  }

  function initFilters() {
    Helpers.qsa('.filter-chip', document.getElementById('page-spaces')).forEach(chip => {
      chip.addEventListener('click', () => {
        Helpers.qsa('.filter-chip', document.getElementById('page-spaces')).forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        _filter = chip.dataset.filter;
        render(State.get('spaces') || []);
      });
    });

    document.getElementById('btn-new-space-page')?.addEventListener('click', () => Modal.openNewSpace());
  }

  return { load, render, updateSidebarSpaces, initFilters };
})();
