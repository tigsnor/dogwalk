const tabs = document.querySelectorAll('.tab');
const panels = {
  owner: document.getElementById('panel-owner'),
  walker: document.getElementById('panel-walker'),
  admin: document.getElementById('panel-admin'),
};

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');

    Object.values(panels).forEach((panel) => panel.classList.remove('active'));
    panels[tab.dataset.tab]?.classList.add('active');
  });
});
