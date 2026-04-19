// Utilitários (tempo, DOM, toast, etc.) - Placeholder
/* utils/helpers.js — Utility functions */

const Helpers = {
  /* ── Time ───────────────────────────────────────── */
  timeAgo(date) {
    const now = new Date();
    const d = new Date(date);
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60)   return 'agora';
    if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
    if (diff < 86400)return `${Math.floor(diff / 3600)}h atrás`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d atrás`;
    return d.toLocaleDateString('pt-BR', { day:'2-digit', month:'short' });
  },

  formatDate(date) {
    return new Date(date).toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' });
  },

  /* ── String ─────────────────────────────────────── */
  truncate(str, max = 80) {
    if (!str) return '';
    return str.length > max ? str.slice(0, max) + '...' : str;
  },

  parseTags(str) {
    if (!str) return [];
    return str.split(/\s+/)
      .map(t => t.replace(/^#/, '').toLowerCase().trim())
      .filter(Boolean)
      .slice(0, 15);
  },

  tagsToString(arr) {
    if (!Array.isArray(arr)) return '';
    return arr.map(t => `#${t}`).join(' ');
  },

  initials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  },

  formatFileSize(bytes) {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  },

  /* ── Type icons ─────────────────────────────────── */
  typeIcon(type) {
    const icons = { note: '📝', link: '🔗', file: '📄', code: '💻' };
    return icons[type] || '📄';
  },

  typeLabel(type) {
    const labels = { note: 'Nota', link: 'Link', file: 'Arquivo', code: 'Código' };
    return labels[type] || type;
  },

  /* ── DOM ─────────────────────────────────────────── */
  qs(sel, ctx = document) { return ctx.querySelector(sel); },
  qsa(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; },

  el(tag, cls = '', html = '') {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html) e.innerHTML = html;
    return e;
  },

  /* ── Toast ───────────────────────────────────────── */
  toast(msg, type = 'success', duration = 3000) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.className = `toast ${type} show`;
    t.style.display = 'block';
    clearTimeout(t._timer);
    t._timer = setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => { t.style.display = 'none'; }, 300);
    }, duration);
  },

  /* ── Avatar ──────────────────────────────────────── */
  avatarImg(user, size = 36) {
    if (user?.avatar) {
      return `<img src="${user.avatar}" alt="${user.name}" class="user-chip__avatar" style="width:${size}px;height:${size}px;" />`;
    }
    const initials = Helpers.initials(user?.name || '?');
    return `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:var(--accent-muted);color:var(--accent);
      display:flex;align-items:center;justify-content:center;
      font-family:var(--font-display);font-weight:700;font-size:${Math.floor(size*0.35)}px;
      border:2px solid var(--accent);flex-shrink:0;
    ">${initials}</div>`;
  },

  /* ── Clipboard ───────────────────────────────────── */
  async copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      Helpers.toast('Link copiado! 🔗');
    } catch {
      Helpers.toast('Não foi possível copiar', 'error');
    }
  },

  /* ── Greeting ────────────────────────────────────── */
  greeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia 🌤️';
    if (h < 18) return 'Boa tarde ☀️';
    return 'Boa noite 🌙';
  },

  /* ── Empty State ─────────────────────────────────── */
  emptyState({ icon = '📭', title = 'Nada aqui ainda', desc = '', actionLabel = '', actionId = '' } = {}) {
    return `
      <div class="empty-state">
        <div class="empty-state__icon">${icon}</div>
        <div class="empty-state__title">${title}</div>
        ${desc ? `<p class="empty-state__desc">${desc}</p>` : ''}
        ${actionLabel ? `<button class="btn btn--primary" id="${actionId}">${actionLabel}</button>` : ''}
      </div>`;
  },
};
