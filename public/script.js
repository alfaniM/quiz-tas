let selectedFlower = null;
let top3 = [];
let tasList = [];
let voteHistory = [];
let currentIndex = 1;
let currentWinner = null;

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
    updateProgressBar(hash);

    if (hash === 'page-tas') {
      loadTasData();
    }
  }

  window.addEventListener('hashchange', handleHashChange);
  handleHashChange();

  loadColors();
  loadFlowers();

  document.getElementById('btn-next-name')?.addEventListener('click', () => {
    const username = document.getElementById('username');
    if (!username.value.trim()) {
      username.classList.add('input-error');
      username.placeholder = 'Nama harus diisi dulu yaa 😅';
      return;
    }
    username.classList.remove('input-error');
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
    renderTop3Pick();
  });

  document.getElementById('btn-final-next')?.addEventListener('click', () => {
    location.hash = 'page-hasil';
    renderHasilAkhir();
  });

  document.getElementById('btn-restart')?.addEventListener('click', () => {
    location.hash = 'page-name';
    document.getElementById('username').value = '';
    document.getElementById('btn-next-bunga').disabled = true;
    top3 = [];
    tasList = [];
    voteHistory = [];
    currentIndex = 1;
    currentWinner = null;
    document.getElementById('progress-fill').style.width = '0%';
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
  tasList = tasList.sort(() => 0.5 - Math.random()); // shuffle
  currentIndex = 1;
  currentWinner = tasList[0];
  voteHistory = [currentWinner];
  top3 = [];
  document.getElementById('btn-next-tas').style.display = 'none';
  showNextBattle();
}

function showNextBattle() {
  const container = document.getElementById('tas-battle');
  container.innerHTML = '';

  if (currentIndex >= tasList.length) {
    top3 = [currentWinner, ...voteHistory.filter((b) => b !== currentWinner)].slice(0, 3);
    document.getElementById('btn-next-tas').style.display = 'inline-block';
    return;
  }

  const challenger = tasList[currentIndex];
  [currentWinner, challenger].forEach((tas) => {
    const img = document.createElement('img');
    img.src = tas.url;
    img.alt = tas.nama;
    img.addEventListener('click', () => {
      if (tas !== currentWinner) {
        voteHistory.push(tas);
        currentWinner = tas;
      } else {
        voteHistory.push(tas);
      }
      currentIndex++;
      showNextBattle();
    });
    container.appendChild(img);
  });
}

function renderTop3Pick() {
  const container = document.getElementById('top3-pick-list');
  container.innerHTML = '';
  document.getElementById('btn-final-next').style.display = 'none';

  top3.slice(0, 3).forEach((tas, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${tas.url}" alt="${tas.nama}" style="width: 100%; border-radius: 12px;" />
      <p>${tas.nama}</p>
    `;
    card.addEventListener('click', () => {
      document.querySelectorAll('.card').forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      top3.unshift(...top3.splice(index, 1)); // pindahkan ke posisi 0
      document.getElementById('btn-final-next').style.display = 'inline-block';
    });

    container.appendChild(card);
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
    <div style="display: flex; justify-content: center; gap: 20px;">
      <img src="${top.url}" alt="${top.nama}" />
      <img src="${bunga.url}" alt="${bunga.nama}" />
      <div style="background-color: ${warna1}; border-radius: 50%; width: 80px; height: 80px;"></div>
    </div>
    <p>${top.analisis}</p>
    <p>Warna favoritmu: <b>${warna1}</b> & <b>${warna2}</b></p>
    <p>Bunga pilihanmu: ${bunga.emoji} <b>${bunga.nama}</b></p>
    <p><i>${bunga.arti}</i></p>
  `;

  resultBox.innerHTML = hasil;

  // Send data to Google Sheets
  const resultData = {
    nama: nama,
    warna1: warna1,
    warna2: warna2,
    bunga: bunga.nama,
    tas: top3.slice(0, 3),
  };

  fetch('AKfycbxvzFNlqEMIWy7he4NvgcbZhSZdxKh1PufROsXO8vAa97JQbXXKEgU12lJuPefXqL23BQ', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(resultData),
  }).then((response) => {
    if (response.ok) {
      console.log('Data successfully sent to Google Sheets');
    } else {
      console.error('Error sending data to Google Sheets');
    }
  });
}
