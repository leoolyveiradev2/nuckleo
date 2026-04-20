// State manager reativo simples - Placeholder
/* utils/state.js — Simple reactive state store */
const State = (() => {
  const _state = {
    user: null,
    spaces: [],
    currentSpace: null,
    currentSpaceItems: [],
    favorites: [],
    friends: [],
    notifications: [],
    unreadCount: 0,
    theme: localStorage.getItem('nuckleo_theme') || 'dark',
    accentColor: localStorage.getItem('nuckleo_accent') || '#81BFB7',
  };
  const _listeners = {};

  return {
    get: (key) => _state[key],
    set(key, value) {
      _state[key] = value;
      (_listeners[key] || []).forEach(fn => fn(value));
    },
    on(key, fn) {
      if (!_listeners[key]) _listeners[key] = [];
      _listeners[key].push(fn);
    },
    off(key, fn) {
      if (_listeners[key]) _listeners[key] = _listeners[key].filter(f => f !== fn);
    },
  };
})();
