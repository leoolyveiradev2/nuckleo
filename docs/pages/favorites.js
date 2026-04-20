// Itens favoritos - Placeholder
/* pages/favorites.js */

const FavoritesPage = (() => {
  async function load() {
    const container = document.getElementById('favorites-list');
    container.innerHTML = ItemCard.renderSkeleton().repeat(4);

    try {
      const res = await api.items.favorites();
      const items = res.data?.items || [];

      if (!items.length) {
        container.innerHTML = Helpers.emptyState({
          icon: '⭐',
          title: 'Nenhum favorito ainda',
          desc: 'Marque itens como favoritos para acessá-los rapidamente aqui.',
        });
        return;
      }

      container.innerHTML = items.map(i => ItemCard.render(i)).join('');
      container.querySelectorAll('.item-card').forEach(card => {
        card.addEventListener('click', () => Modal.openItemDetail(card.dataset.itemId));
      });
    } catch {
      container.innerHTML = Helpers.emptyState({ icon: '⚠️', title: 'Erro ao carregar favoritos' });
    }
  }

  return { load };
})();
