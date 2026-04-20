// Componente de cartão de usuário - Placeholder
/* components/userCard.js */

const UserCard = {
  render(user, { showAdd = false, showAccept = false, showRemove = false } = {}) {
    const avatarHtml = user.avatar
      ? `<img src="${user.avatar}" alt="${user.name}" class="user-card__avatar" />`
      : `<div class="user-card__avatar" style="display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1rem;background:var(--accent-muted);color:var(--accent);">
           ${Helpers.initials(user.name)}
         </div>`;

    const actionsHtml = `
      <div class="user-card__actions">
        ${showAdd    ? `<button class="btn btn--ghost btn--sm btn-add-friend"    data-uid="${user._id || user.id}">+ Adicionar</button>` : ''}
        ${showAccept ? `<button class="btn btn--primary btn--sm btn-accept-friend" data-uid="${user._id || user.id}">✓ Aceitar</button>` : ''}
        ${showRemove ? `<button class="btn btn--danger btn--sm btn-remove-friend"  data-uid="${user._id || user.id}">Remover</button>` : ''}
      </div>`;

    return `
      <div class="user-card" data-user-id="${user._id || user.id}">
        ${avatarHtml}
        <div class="user-card__info">
          <div class="user-card__name">${user.name}</div>
          <div class="user-card__handle">@${user.username || '—'}</div>
          ${user.bio ? `<div style="font-size:var(--text-xs);color:var(--text-secondary);margin-top:2px;">${Helpers.truncate(user.bio, 60)}</div>` : ''}
        </div>
        ${actionsHtml}
      </div>`;
  },
};
