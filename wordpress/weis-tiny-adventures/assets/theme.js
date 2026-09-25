// Enhance editable field-guide sections without hiding content when JavaScript is absent.
document.querySelectorAll('.tips-field-guide').forEach((guide) => {
  const panels = [...guide.querySelectorAll('.wei-tip-collection')];
  const links = [...guide.querySelectorAll('.tips-topic-buttons a')];
  if (panels.length < 2 || !links.length) return;
  function select(id) {
    if (!panels.some((panel) => panel.id === id)) return;
    panels.forEach((panel) => { panel.hidden = panel.id !== id; });
    links.forEach((link) => { link.setAttribute('aria-current', link.hash === '#' + id ? 'true' : 'false'); });
  }
  links.forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault(); select(link.hash.slice(1));
    history.replaceState(null, '', link.hash);
  }));
  select(panels.some((panel) => '#' + panel.id === location.hash) ? location.hash.slice(1) : panels[0].id);
  window.addEventListener('hashchange', () => select(location.hash.slice(1)));
});
