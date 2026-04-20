// Sistema social - Placeholder

const FriendsPage = (() => {
  let _searchTimeout = null;

  async function load() {
    try {
      const res = await api.users.friends();
      const { friends = [], pendingRequests = [] } = res.data || {};

      renderFriends(friends);
      renderPending(pendingRequests);
    } catch {
      document.getElementById('friends-list').innerHTML =
        Helpers.emptyState({ icon: '⚠️', title: 'Erro ao carregar amigos' });
    }
  }

  function renderFriends(friends) {
    const container = document.getElementById('friends-list');
    if (!friends.length) {
      container.innerHTML = Helpers.emptyState({
        icon: '👥',
        title: 'Você ainda não tem amigos',
        desc: 'Busque por usuários e envie solicitações de amizade.',
      });
      return;
    }
    container.innerHTML = friends.map(u => UserCard.render(u, { showRemove: true })).join('');
    attachFriendActions(container);
  }

  function renderPending(pending) {
    const section   = document.getElementById('pending-requests-section');
    const container = document.getElementById('pending-requests-list');
    if (!pending.length) { section.style.display = 'none'; return; }
    section.style.display = 'block';
    container.innerHTML = pending.map(u => UserCard.render(u, { showAccept: true })).join('');
    attachFriendActions(container);
  }

  function attachFriendActions(container) {
    container.querySelectorAll('.btn-add-friend').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const uid = btn.dataset.uid;
        try {
          await api.users.sendRequest(uid);
          btn.textContent = '✓ Enviado';
          btn.disabled = true;
          Helpers.toast('Solicitação enviada!');
        } catch (err) {
          Helpers.toast(err.message || 'Erro ao enviar solicitação', 'error');
        }
      });
    });

    container.querySelectorAll('.btn-accept-friend').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const uid = btn.dataset.uid;
        try {
          await api.users.acceptRequest(uid);
          Helpers.toast('Amigo adicionado! 🎉');
          load();
        } catch (err) {
          Helpers.toast(err.message || 'Erro ao aceitar solicitação', 'error');
        }
      });
    });

    container.querySelectorAll('.btn-remove-friend').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!confirm('Remover este amigo?')) return;
        const uid = btn.dataset.uid;
        try {
          await api.users.removeFriend(uid);
          Helpers.toast('Amigo removido.');
          load();
        } catch (err) {
          Helpers.toast(err.message || 'Erro ao remover amigo', 'error');
        }
      });
    });
  }

  function initSearch() {
    const input   = document.getElementById('user-search-input');
    const results = document.getElementById('user-search-results');

    input?.addEventListener('input', () => {
      clearTimeout(_searchTimeout);
      const q = input.value.trim();
      if (q.length < 2) { results.innerHTML = ''; return; }

      _searchTimeout = setTimeout(async () => {
        try {
          const res = await api.users.search(q);
          const users = res.data || [];
          if (!users.length) {
            results.innerHTML = '<p style="font-size:var(--text-sm);color:var(--text-tertiary);padding:8px 0;">Nenhum usuário encontrado.</p>';
            return;
          }
          results.innerHTML = users.map(u => UserCard.render(u, { showAdd: true })).join('');
          attachFriendActions(results);
        } catch {}
      }, 400);
    });
  }

  return {
    load,
    init() { initSearch(); },
  };
})();
