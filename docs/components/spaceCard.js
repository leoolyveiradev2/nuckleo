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

    const collaborators = (space.members || []).slice(0, 3).map(m => 
      `<img class="space-card__avatar" src="${m.avatar}" alt="${m.name}" title="${m.name}" style="width:22px;height:22px;border-radius:50%;border:2px solid var(--card-bg);margin-left:-8px;object-fit:cover;" />`
    ).join('');

    return `
      <div class="space-card" data-space-id="${space._id || space.id}">
        <div class="space-card__cover" style="background: linear-gradient(135deg, ${space.coverColor || '#81BFB7'} 0%, ${space.coverColor || '#81BFB7'}dd 100%);">
          <span class="space-card__icon">${space.icon || '📁'}</span>
        </div>
        <div class="space-card__body">
          <div class="space-card__name">${Helpers.truncate(space.name, 50)}</div>
          <div class="space-card__meta-count">${space.itemCount || 0} item${space.itemCount !== 1 ? 's' : ''}</div>
          ${tagsHtml ? `<div class="space-card__tags">${tagsHtml}</div>` : ''}
        </div>
        <div class="space-card__footer">
          <div class="space-card__members" style="display:flex;align-items:center;gap:4px;">
            ${collaborators}
          </div>
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
