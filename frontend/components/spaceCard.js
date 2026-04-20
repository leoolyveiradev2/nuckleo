// Componente de cartão de espaço - Placeholder
/* components/spaceCard.js */

const SpaceCard = {
  render(space) {
    const tagsHtml = (space.tags || []).slice(0, 3)
      .map(t => `<span class="tag">#${t}</span>`).join('');

    const visibilityBadge = space.visibility === 'public'
      ? `<span class="space-card__badge badge--public">🌐 Público</span>`
      : `<span class="space-card__badge badge--private">🔒 Privado</span>`;

    const pinned = space.isPinned ? '📌' : '';
    const fav = space.isFavorite ? '⭐' : '';

    return `
      <div class="space-card" data-space-id="${space._id || space.id}">
        <div class="space-card__cover" style="background: ${space.coverColor || '#81BFB7'};">
          <span class="space-card__icon">${space.icon || '📁'}</span>
          ${pinned || fav ? `<span style="position:absolute;top:8px;right:10px;z-index:1;font-size:0.75rem;">${pinned}${fav}</span>` : ''}
        </div>
        <div class="space-card__body">
          <div class="space-card__name">${Helpers.truncate(space.name, 50)}</div>
          ${space.description ? `<div class="space-card__desc">${Helpers.truncate(space.description, 100)}</div>` : ''}
          ${tagsHtml ? `<div class="space-card__tags">${tagsHtml}</div>` : ''}
        </div>
        <div class="space-card__footer">
          <span class="space-card__meta">
            <span>${space.itemCount || 0} itens</span>
            <span>${Helpers.timeAgo(space.updatedAt || space.createdAt)}</span>
          </span>
          ${visibilityBadge}
        </div>
      </div>`;
  },

  renderSkeleton() {
    return `
      <div class="space-card" style="cursor:default;">
        <div class="skeleton" style="height:80px;border-radius:var(--radius-lg) var(--radius-lg) 0 0;"></div>
        <div class="space-card__body" style="gap:8px;display:flex;flex-direction:column;">
          <div class="skeleton" style="height:16px;width:70%;border-radius:4px;"></div>
          <div class="skeleton" style="height:12px;width:90%;border-radius:4px;"></div>
        </div>
        <div class="space-card__footer">
          <div class="skeleton" style="height:10px;width:50%;border-radius:4px;"></div>
        </div>
      </div>`;
  },
};
