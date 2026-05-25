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
      <div class="item-card recent-item-row" data-item-id="${item._id || item.id}" data-type="${item.type}">
        <div class="recent-item-icon">${icon}</div>
        <div class="recent-item-content">
          <div class="recent-item-title">${Helpers.truncate(item.title, 80)}</div>
          <div class="recent-item-project" style="color:var(--text-tertiary);font-size:var(--text-xs);">${item.spaceName || 'Sem espaço'}</div>
        </div>
        <div class="recent-item-badge">${label}</div>
        <div class="recent-item-time">${Helpers.timeAgo(item.updatedAt || item.createdAt)}</div>
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
