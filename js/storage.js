const Storage = {
  save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  load(key) {
    return JSON.parse(localStorage.getItem(key));
  },
  clear(key) {
    localStorage.removeItem(key);
  }
};
