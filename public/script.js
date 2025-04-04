let selectedFlower = null;
let top3 = [];
let tasList = [];
let round = [];
let nextRound = [];

document.addEventListener('DOMContentLoaded', () => {
  const pages = document.querySelectorAll('.page');

  function showPage(id) {
    pages.forEach((page) => page.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
  }

  function updateProgressBar(hash) {
    const steps = ['page-name', 'page-warna', 'page-bunga', 'page-tas', 'page-summary', 'page-hasil'];
    const index = steps.indexOf(hash);
    const percentage = ((index + 1) / steps.length) * 100;
    document.getElementById('progress-fill').style.width = `${percentage}%`;
  }

  function handleHashChange() {
    const hash = window.location.hash.replace('#', '') || 'page-name';
    showPage(hash);
    updateProgressBar(hash); // Tambahkan ini!

    if (hash === 'page-tas') {
      loadTasData();
    }
  }

  window.addEventListener('hashchange', handleHashChange);
  handleHashChange();

  // Panggil loader warna & bunga
  loadColors();
  loadFlowers();

  // Navigasi tombol
  document.getElementById('btn-next-name')?.addEventListener('click', () => {
    location.hash = 'page-warna';
  });

  document.getElementById('btn-next-warna')?.addEventListener('click', () => {
    location.hash = 'page-bunga';
  });

  document.getElementById('btn-next-bunga')?.addEventListener('click', () => {
    location.hash = 'page-tas';
  });

  document.getElementById('btn-next-tas')?.addEventListener('click', () => {
    location.hash = 'page-summary';
    renderTop3Summary();
  });

  document.getElementById('btn-next-summary')?.addEventListener('click', () => {
    location.hash = 'page-hasil';
    renderHasilAkhir();
  });
});

async function loadColors() {
  const res = await fetch('/data/colors');
  const colors = await res.json();

  const color1 = document.getElementById('color-1');
  const color2 = document.getElementById('color-2');

  [color1, color2].forEach((select) => {
    colors.forEach((color) => {
      const opt = document.createElement('option');
      opt.value = color.id;
      opt.textContent = color.label;
      select.appendChild(opt);
    });
  });
}

async function loadFlowers() {
  const res = await fetch('/data/flowers');
  const flowers = await res.json();

  const container = document.getElementById('flower-list');
  container.innerHTML = '';

  flowers.forEach((flower) => {
    const card = document.createElement('div');
    card.className = 'flower-card';
    card.innerHTML = `
      <img src="${flower.url}" alt="${flower.nama}" style="width: 100%; border-radius: 12px;" />
      <p>${flower.emoji} ${flower.nama}</p>
    `;
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      selectedFlower = flower;
      document.querySelectorAll('.flower-card').forEach((c) => (c.style.border = 'none'));
      card.style.border = '3px solid var(--ios-primary)';
      document.getElementById('btn-next-bunga').disabled = false;
    });

    container.appendChild(card);
  });
}

async function loadTasData() {
  const res = await fetch('/data/bags');
  tasList = await res.json();
  startTasBattle();
}

function startTasBattle() {
  round = [...tasList].sort(() => 0.5 - Math.random());
  nextRound = [];
  top3 = [];
  document.getElementById('btn-next-tas').style.display = 'none';
  showNextBattle();
}

function showNextBattle() {
  const container = document.getElementById('tas-battle');
  container.innerHTML = '';

  if (round.length === 1) {
    top3.unshift(round[0]); // final winner
    document.getElementById('btn-next-tas').style.display = 'inline-block';
    return;
  }

  const tas1 = round.shift();
  const tas2 = round.shift();

  [tas1, tas2].forEach((tas) => {
    const img = document.createElement('img');
    img.src = tas.url;
    img.alt = tas.nama;
    img.addEventListener('click', () => {
      nextRound.push(tas);
      if (round.length === 0) {
        if (nextRound.length <= 3) {
          top3.unshift(...nextRound.slice(0, 3));
        }
        round = [...nextRound];
        nextRound = [];
      }
      showNextBattle();
    });
    container.appendChild(img);
  });
}

function renderTop3Summary() {
  const container = document.getElementById('top3-summary');
  container.innerHTML = '';

  top3.slice(0, 3).forEach((tas, index) => {
    const div = document.createElement('div');
    if (index === 0) div.classList.add('top1');
    div.innerHTML = `
      <img src="${tas.url}" alt="${tas.nama}" />
      <p>${tas.nama}</p>
    `;
    container.appendChild(div);
  });
}

function renderHasilAkhir() {
  const resultBox = document.getElementById('personality-result');
  const nama = document.getElementById('username').value || 'Kamu';
  const warna1 = document.getElementById('color-1').value;
  const warna2 = document.getElementById('color-2').value;
  const bunga = selectedFlower;

  const top = top3[0];
  const hasil = `
    <h3>${nama}, kamu cocok dengan <span style="color:var(--ios-primary);">${top.nama}</span> 🌟</h3>
    <p>${top.analisis}</p>
    <p>Warna favoritmu: <b>${warna1}</b> & <b>${warna2}</b></p>
    <p>Bunga pilihanmu: ${bunga.emoji} <b>${bunga.nama}</b></p>
    <p><i>${bunga.arti}</i></p>
  `;

  resultBox.innerHTML = hasil;
}
