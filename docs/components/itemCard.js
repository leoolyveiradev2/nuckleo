// Componente de cartão de item - Placeholder
/* components/itemCard.js */

const ItemCard = {
  render(item) {
    const icon    = Helpers.typeIcon(item.type);
    const label   = Helpers.typeLabel(item.type);
    const pinned  = item.isPinned  ? '<span class="pin-indicator">📌</span>' : '';
    const fav     = item.isFavorite ? '<span class="fav-indicator">⭐</span>' : '';

    const tagsHtml = (item.tags || []).slice(0, 3)
      .map(t => `<span class="tag">#${t}</span>`).join('');

    let contentHtml = '';
    switch (item.type) {
      case 'note':
        contentHtml = item.content
          ? `<div class="item-card__preview">${Helpers.truncate(item.content.replace(/<[^>]*>/g, ''), 140)}</div>`
          : '';
        break;
      case 'link':
        contentHtml = `
          <div class="item-card__link-preview">
            🔗 ${Helpers.truncate(item.meta?.url || '', 60)}
          </div>`;
        break;
      case 'code':
        contentHtml = item.meta?.code
          ? `<div class="item-card__code-preview">${Helpers.truncate(item.meta.code, 200)}</div>`
          : '';
        break;
      case 'file':
        contentHtml = `
          <div class="item-card__link-preview">
            📄 ${item.meta?.fileName || 'Arquivo'} · ${Helpers.formatFileSize(item.meta?.fileSize)}
          </div>`;
        break;
    }

    return `
      <div class="item-card" data-item-id="${item._id || item.id}">
        <div class="item-card__header">
          <span class="item-card__type-icon">${icon}</span>
          <div style="flex:1;overflow:hidden;">
            <div class="item-card__title">${Helpers.truncate(item.title, 80)}</div>
          </div>
          <div style="display:flex;gap:4px;align-items:center;">
            ${pinned}${fav}
          </div>
        </div>
        ${contentHtml}
        ${tagsHtml ? `<div class="space-card__tags">${tagsHtml}</div>` : ''}
        <div class="item-card__footer">
          <span class="item-card__time">${Helpers.timeAgo(item.updatedAt || item.createdAt)}</span>
          <span class="space-card__badge ${item.visibility === 'public' ? 'badge--public' : 'badge--private'}">
            ${item.visibility === 'public' ? '🌐' : '🔒'}
          </span>
        </div>
      </div>`;
  },

  renderSkeleton() {
    return `
      <div class="item-card" style="cursor:default;">
        <div style="display:flex;gap:10px;align-items:center;">
          <div class="skeleton" style="width:24px;height:24px;border-radius:4px;flex-shrink:0;"></div>
          <div class="skeleton" style="height:16px;flex:1;border-radius:4px;"></div>
        </div>
        <div class="skeleton" style="height:12px;width:85%;border-radius:4px;"></div>
        <div class="skeleton" style="height:12px;width:60%;border-radius:4px;"></div>
      </div>`;
  },
};
