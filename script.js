/* INTRO */
(function initIntro() {
    const savedTheme = localStorage.getItem('k7_theme');
    const intro = document.getElementById('introScreen');
    if (savedTheme === 'light') {
        intro.classList.add('intro-light');
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        intro.classList.add('intro-dark');
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    const container = document.getElementById('introParticles');
    for (let i = 0; i < 28; i++) {
        const dot = document.createElement('div');
        dot.className = 'intro-dot';
        dot.style.left = Math.random() * 100 + '%';
        dot.style.top = Math.random() * 100 + '%';
        dot.style.animationDelay = Math.random() * 3 + 's';
        dot.style.animationDuration = (2 + Math.random() * 2) + 's';
        container.appendChild(dot);
    }
})();

/* TEMA */
let isDark = localStorage.getItem('k7_theme') !== 'light';
function toggleTheme() {
    isDark = !isDark;
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    document.querySelector('.theme-toggle').textContent = isDark ? '🌙' : '☀️';
    localStorage.setItem('k7_theme', isDark ? 'dark' : 'light');
}

/* APPLY SAVED THEME */
(function () {
    const saved = localStorage.getItem('k7_theme');
    if (saved === 'light') {
        isDark = false;
        document.documentElement.setAttribute('data-theme', 'light');
        document.querySelector('.theme-toggle').textContent = '☀️';
    }
})();

/* DATA PERSISTEN */
let daftarSiswa = JSON.parse(localStorage.getItem('k7_siswa') || '[]');
let daftarMapel = JSON.parse(localStorage.getItem('k7_mapel') || '[]');
let daftarNilai = JSON.parse(localStorage.getItem('k7_nilai') || '[]');
function simpanState() {
    localStorage.setItem('k7_siswa', JSON.stringify(daftarSiswa));
    localStorage.setItem('k7_mapel', JSON.stringify(daftarMapel));
    localStorage.setItem('k7_nilai', JSON.stringify(daftarNilai));
}

/* EDIT MODE STATE */
let editingSiswaId = null;
let editingMapelId = null;
let editingNilaiId = null;

/* PAGINATION STATE */
let siswaPage = 1, mapelPage = 1, nilaiPage = 1, legerPage = 1;
function setSiswaPage(p) { siswaPage = p; renderSiswaTable(); }
function setMapelPage(p) { mapelPage = p; renderMapelList(); }
function setNilaiPage(p) { nilaiPage = p; renderNilaiTable(); }
function setLegerPage(p) { legerPage = p; renderLeger(); }

/* TOAST */
function showToast(msg, type = 'success') {
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.innerHTML = `<span class="toast-icon">${icons[type] || '✓'}</span> ${msg}`;
    const existingToasts = document.querySelectorAll('.toast.show');
    t.style.bottom = (28 + existingToasts.length * 70) + 'px';
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 100);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 500); }, 3500);
}

/* ANALISIS CEPAT FIELDS */
const inputContainer = document.getElementById('nilaiInputs');
const jumlahInput = document.getElementById('jumlahNilai');
function generateFields() {
    inputContainer.innerHTML = '';
    const count = Math.min(Math.max(parseInt(jumlahInput.value) || 1, 1), 25);
    for (let i = 0; i < count; i++) {
        const wrap = document.createElement('div');
        const lbl = document.createElement('p'); lbl.className = 'label-sm'; lbl.textContent = `Mata Pelajaran ${i + 1}`;
        const inp = document.createElement('input'); inp.type = 'number'; inp.placeholder = '0–100'; inp.className = 'nilai-field'; inp.id = `n-${i}`;
        inp.min = 0; inp.max = 100;
        wrap.appendChild(lbl); wrap.appendChild(inp); inputContainer.appendChild(wrap);
    }
}
jumlahInput.addEventListener('input', generateFields);
window.addEventListener('load', generateFields);

/*  PREDIKAT  */
function hitungPredikat(nilai) {
    if (nilai >= 90) return 'A';
    if (nilai >= 80) return 'B';
    if (nilai >= 70) return 'C';
    if (nilai >= 60) return 'D';
    if (nilai >= 50) return 'E';
    return 'F';
}

/*  ANALISIS & SIMPAN SISWA  */
function processAnalysis() {
    const nama = document.getElementById('nama').value.trim();
    const nisVal = document.getElementById('nisManual').value.trim();
    const kelasVal = document.getElementById('kelasManual').value;
    const inputs = document.querySelectorAll('.nilai-field');
    let total = 0, valid = true, count = 0;

    if (!nama) { showToast('Masukkan Nama Siswa terlebih dahulu!', 'error'); return; }
    if (!nisVal) { showToast('Masukkan NIS Siswa terlebih dahulu!', 'error'); return; }
    if (!kelasVal) { showToast('Pilih Kelas terlebih dahulu!', 'error'); return; }

    inputs.forEach(inp => {
        const v = parseFloat(inp.value);
        if (isNaN(v) || v < 0 || v > 100) { valid = false; inp.classList.add('input-error'); }
        else { inp.classList.remove('input-error'); total += v; count++; }
    });
    if (!valid || count === 0) { showToast('Semua nilai harus antara 0 – 100!', 'error'); return; }

    const rata = total / count;
    const grade = hitungPredikat(rata);
    const status = rata >= 75 ? 'LULUS' : 'TIDAK LULUS';

    const resultDiv = document.getElementById('results');
    resultDiv.style.display = 'block';
    const bar = document.getElementById('bar');
    bar.style.width = '0%';
    setTimeout(() => { bar.style.width = rata + '%'; }, 100);

    const statusTag = document.getElementById('statusTag');
    statusTag.innerText = `STATUS SISWA: ${status}`;
    statusTag.style.background = status === 'LULUS' ? 'rgba(0,242,255,0.1)' : 'rgba(239,68,68,0.1)';
    statusTag.style.color = status === 'LULUS' ? 'var(--accent)' : '#ff4444';
    statusTag.style.borderColor = status === 'LULUS' ? 'var(--accent)' : '#ff4444';

    document.getElementById('resultContent').innerHTML = `
        <div class="result-box"><span style="font-size:0.65rem;opacity:0.55;letter-spacing:2px;">NAMA SISWA</span><span class="val" style="font-size:1.05rem;color:var(--accent)">${nama.toUpperCase()}</span></div>
        <div class="result-box"><span style="font-size:0.65rem;opacity:0.55;letter-spacing:2px;">NIS</span><span class="val" style="font-size:1.1rem;">${nisVal}</span></div>
        <div class="result-box"><span style="font-size:0.65rem;opacity:0.55;letter-spacing:2px;">KELAS</span><span class="val" style="font-size:1.1rem;">${kelasVal}</span></div>
        <div class="result-box"><span style="font-size:0.65rem;opacity:0.55;letter-spacing:2px;">RATA-RATA</span><span class="val">${rata.toFixed(1)}</span></div>
        <div class="result-box"><span style="font-size:0.65rem;opacity:0.55;letter-spacing:2px;">PREDIKAT</span><span class="val" style="color:var(--accent-purple)">${grade}</span></div>
        <div class="result-box"><span style="font-size:0.65rem;opacity:0.55;letter-spacing:2px;">JUMLAH MAPEL</span><span class="val" style="font-size:1.2rem;">${count}</span></div>`;

    if (status === 'LULUS') confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#00f2ff', '#7000ff', '#ffffff'] });
    resultDiv.scrollIntoView({ behavior: 'smooth' });

    if (editingSiswaId) {
        const idx = daftarSiswa.findIndex(s => s.id === editingSiswaId);
        if (idx > -1) {
            if (nisVal) {
                const dupNIS = daftarSiswa.find(s => s.nis === nisVal && s.id !== editingSiswaId);
                if (dupNIS) { showToast(`NIS "${nisVal}" sudah digunakan siswa lain!`, 'error'); return; }
            }
            daftarSiswa[idx] = { ...daftarSiswa[idx], nama: nama.toUpperCase(), nis: nisVal || daftarSiswa[idx].nis, kelas: kelasVal || daftarSiswa[idx].kelas };
            simpanState(); renderSiswaTable(); renderLeger();
            showToast(`Data siswa "${nama.toUpperCase()}" berhasil diperbarui!`, 'success');
            setTimeout(() => {
            document.getElementById('results').style.display = 'none';
            }, 5000);
        }
        
        editingSiswaId = null;
        document.getElementById('siswaBanner').classList.remove('show');
        document.getElementById('btnSiswaSubmit').textContent = 'Analisis & Simpan Data Siswa';
        _resetSiswaForm();
    } else {
        _hookSimpanSiswa(nama, nisVal, kelasVal);
    }
}

function _resetSiswaForm() {
    document.getElementById('nama').value = '';
    document.getElementById('nisManual').value = '';
    document.getElementById('kelasManual').value = '';
    document.querySelectorAll('.nilai-field').forEach(inp => { inp.value = ''; inp.classList.remove('input-error'); });
}

function _hookSimpanSiswa(nama, nisVal, kelasVal) {
    if (!nama) return;
    /* Cek duplikat NIS */
    if (nisVal) {
        const dupNIS = daftarSiswa.find(s => s.nis === nisVal);
        if (dupNIS) { showToast(`NIS "${nisVal}" sudah digunakan oleh ${dupNIS.nama}!`, 'error'); return; }
    }
    /* Cek duplikat nama di kelas yang sama */
    const sudahAda = daftarSiswa.find(s => s.nama.toLowerCase() === nama.toLowerCase() && s.kelas === kelasVal);
    if (sudahAda) {
        showToast(`Siswa "${nama.toUpperCase()}" sudah terdaftar di kelas ${kelasVal}!`, 'warning');
        return;
    }
    const nis = nisVal || 'S' + Date.now().toString().slice(-6);
    const kelas = kelasVal || '—';
    daftarSiswa.push({ id: nis, nis, nama: nama.toUpperCase(), kelas, _ts: Date.now() });
    simpanState(); renderSiswaTable();
    showToast(`Siswa "${nama.toUpperCase()}" berhasil ditambahkan!`, 'success');
    _resetSiswaForm();
    /* Sembunyikan hasil analisis setelah simpan */
    setTimeout(() => { document.getElementById('results').style.display = 'none'; }, 5000);
}

/*  EDIT SISWA  */
function editSiswa(id) {
    const s = daftarSiswa.find(x => x.id === id);
    if (!s) return;
    editingSiswaId = id;
    document.getElementById('nama').value = s.nama;
    document.getElementById('nisManual').value = s.nis;
    document.getElementById('kelasManual').value = s.kelas || '';
    document.getElementById('siswaBannerNama').textContent = s.nama;
    document.getElementById('siswaBanner').classList.add('show');
    document.getElementById('btnSiswaSubmit').textContent = 'Update Data Siswa';
    switchTab('tab-siswa');
    document.getElementById('nama').scrollIntoView({ behavior: 'smooth' });
    showToast(`Mode edit: ${s.nama}`, 'info');
}
function batalEditSiswa() {
    editingSiswaId = null;
    document.getElementById('siswaBanner').classList.remove('show');
    document.getElementById('btnSiswaSubmit').textContent = 'Analisis & Simpan Data Siswa';
    _resetSiswaForm();
    showToast('Edit siswa dibatalkan.', 'warning');
}

/*  HAPUS SISWA  */
function hapusSiswa(id) {
    const s = daftarSiswa.find(x => x.id === id);
    const jumlahNilaiSiswa = daftarNilai.filter(n => n.siswaId === id).length;
    const warningNilai = jumlahNilaiSiswa > 0 ? ` (termasuk ${jumlahNilaiSiswa} data nilai)` : '';
    if (!confirm(`Hapus siswa "${s ? s.nama : ''}"${warningNilai}? Tindakan ini tidak dapat dibatalkan.`)) return;
    daftarSiswa = daftarSiswa.filter(x => x.id !== id);
    daftarNilai = daftarNilai.filter(n => n.siswaId !== id);
    simpanState(); renderLeger(); renderSiswaTable(); renderNilaiTable();
    showToast(`Data siswa "${s ? s.nama : ''}" berhasil dihapus.`, 'success');
}

/*  RENDER TABEL SISWA  */
function renderSiswaTable() {
    const tbody = document.getElementById('siswaTableBody');
    if (!tbody) return;
    const q = (document.getElementById('siswaSearchInput')?.value || '').toLowerCase().trim();
    const fKelas = document.getElementById('siswaFilterKelas')?.value || '';
    const sortVal = document.getElementById('siswaSort')?.value || 'nis-az';
    const perPage = parseInt(document.getElementById('siswaEntriesPerPage')?.value || 10);

    let filtered = daftarSiswa.filter(s => {
        const matchQ = !q || s.nama.toLowerCase().includes(q) || s.nis.toLowerCase().includes(q) || (s.kelas || '').toLowerCase().includes(q);
        const matchK = !fKelas || s.kelas === fKelas;
        return matchQ && matchK;
    });

    filtered.sort((a, b) => {
        if (sortVal === 'nama-az') return a.nama.localeCompare(b.nama);
        if (sortVal === 'nama-za') return b.nama.localeCompare(a.nama);
        if (sortVal === 'nis-az') return a.nis.localeCompare(b.nis, undefined, { numeric: true });
        if (sortVal === 'nis-za') return b.nis.localeCompare(a.nis, undefined, { numeric: true });
        if (sortVal === 'kelas-az') return (a.kelas || '').localeCompare(b.kelas || '', undefined, { numeric: true });
        if (sortVal === 'kelas-za') return (b.kelas || '').localeCompare(a.kelas || '', undefined, { numeric: true });
        if (sortVal === 'terbaru') return (b._ts || 0) - (a._ts || 0);
        if (sortVal === 'terlama') return (a._ts || 0) - (b._ts || 0);
        return 0;
    });

    const total = daftarSiswa.length, filteredN = filtered.length;
    const totalPages = Math.max(1, Math.ceil(filteredN / perPage));
    if (siswaPage > totalPages) siswaPage = totalPages;
    const start = (siswaPage - 1) * perPage, end = Math.min(start + perPage, filteredN);
    const page = filtered.slice(start, end);

    if (filteredN === 0) {
        tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="empty-state-icon"><img src="https://cdn-icons-png.flaticon.com/128/16769/16769643.png" width="50px"/></div><div class="empty-state-text">${total === 0 ? 'Belum ada data siswa' : 'Tidak ada data yang cocok'}</div></div></td></tr>`;
        buildShowingInfo('siswaShowingInfo', 0, 0, total, 0);
        buildPagination('siswaPagination', siswaPage, 0, 'setSiswaPage'); return;
    }

    tbody.innerHTML = page.map((s, i) => `
        <tr>
            <td style="color:var(--text-muted);font-size:0.78rem;">${start + i + 1}</td>
            <td style="font-family:'Space Grotesk',sans-serif;color:var(--text-muted);font-size:0.82rem;">${s.nis}</td>
            <td style="font-weight:600;">${s.nama}</td>
            <td style="color:var(--text-muted);font-size:0.82rem;">${s.kelas || '—'}</td>
            <td style="display:flex;gap:5px;flex-wrap:wrap;">
                <button class="btn-action btn-edit" onclick="editSiswa('${s.id}')">✏ Edit</button>
                <button class="btn-action" onclick="hapusSiswa('${s.id}')">Hapus</button>
            </td>
        </tr>`).join('');

    buildShowingInfo('siswaShowingInfo', start + 1, end, total, filteredN);
    buildPagination('siswaPagination', siswaPage, totalPages, 'setSiswaPage');
}

/*  MAPEL: TAMBAH / EDIT  */
function tambahMapel() {
    const nama = document.getElementById('namaMapel').value.trim();
    const guru = document.getElementById('namaGuru').value.trim();
    const nip = document.getElementById('nipGuru').value.trim();
    const kelas = document.getElementById('kelasMapel').value;
    const kkmRaw = parseInt(document.getElementById('kkm').value);

    if (!nama) { showToast('Nama Mata Pelajaran wajib diisi!', 'error'); return; }
    if (!guru) { showToast('Nama Guru Pengampu wajib diisi!', 'error'); return; }
    if (!nip) { showToast('NIP Guru wajib diisi!', 'error'); return; }

    /* FIX: Validasi KKM range */
    if (isNaN(kkmRaw) || kkmRaw < 1 || kkmRaw > 100) {
        showToast('KKM harus berupa angka antara 1 – 100!', 'error');
        document.getElementById('kkm').classList.add('input-error');
        return;
    }
    document.getElementById('kkm').classList.remove('input-error');
    const kkm = kkmRaw;

    if (editingMapelId) {
        const idx = daftarMapel.findIndex(m => m.id === editingMapelId);
        if (idx > -1) {
            /* Cek NIP duplikat (exclude self) */
            const dupNIP = daftarMapel.find(m => m.nip === nip && m.id !== editingMapelId);
            if (dupNIP) { showToast(`NIP "${nip}" sudah digunakan guru mapel "${dupNIP.nama}"!`, 'error'); return; }
            daftarMapel[idx] = { ...daftarMapel[idx], nama, guru, nip, kelas, kkm };
            simpanState(); renderMapelList(); refreshAllSelects();
            showToast(`Mapel "${nama}" berhasil diperbarui!`, 'success');
        }
        editingMapelId = null;
        document.getElementById('mapelBanner').classList.remove('show');
        document.getElementById('btnMapelSubmit').textContent = 'Simpan Mata Pelajaran & Guru';
        _resetMapelForm();
        return;
    }

    /* Cek duplikat NIP */
    const dupNIP = daftarMapel.find(m => m.nip === nip);
    if (dupNIP) { showToast(`NIP "${nip}" sudah digunakan guru mapel "${dupNIP.nama}"!`, 'error'); return; }

    /* Cek duplikat mapel di kelas yang sama */
    const sudahAda = daftarMapel.find(m => m.nama.toLowerCase() === nama.toLowerCase() && m.kelas === kelas);
    if (sudahAda) { showToast('Mata Pelajaran ini sudah ada untuk kelas tersebut!', 'warning'); return; }

    daftarMapel.push({ id: 'MP' + Date.now(), nama, guru, nip, kelas, kkm, _ts: Date.now() });
    simpanState(); renderMapelList(); refreshAllSelects();
    _resetMapelForm();
    showToast(`Mapel "${nama}" berhasil disimpan!`, 'success');
}

function _resetMapelForm() {
    document.getElementById('namaMapel').value = '';
    document.getElementById('namaGuru').value = '';
    document.getElementById('nipGuru').value = '';
    document.getElementById('kkm').value = '';
    document.getElementById('kelasMapel').value = '';
    document.getElementById('kkm').classList.remove('input-error');
}

function editMapel(id) {
    const m = daftarMapel.find(x => x.id === id);
    if (!m) return;
    editingMapelId = id;
    document.getElementById('namaMapel').value = m.nama;
    document.getElementById('namaGuru').value = m.guru;
    document.getElementById('nipGuru').value = m.nip || '';
    document.getElementById('kelasMapel').value = m.kelas || '';
    document.getElementById('kkm').value = m.kkm;
    document.getElementById('mapelBannerNama').textContent = m.nama;
    document.getElementById('mapelBanner').classList.add('show');
    document.getElementById('btnMapelSubmit').textContent = 'Update Mata Pelajaran & Guru';
    switchTab('tab-mapel');
    document.getElementById('namaMapel').scrollIntoView({ behavior: 'smooth' });
    showToast(`Mode edit mapel: ${m.nama}`, 'info');
}

function batalEditMapel() {
    editingMapelId = null;
    document.getElementById('mapelBanner').classList.remove('show');
    document.getElementById('btnMapelSubmit').textContent = 'Simpan Mata Pelajaran & Guru';
    _resetMapelForm();
    showToast('Edit mapel dibatalkan.', 'warning');
}

function hapusMapel(id) {
    const m = daftarMapel.find(x => x.id === id);
    const jumlahNilaiMapel = daftarNilai.filter(n => n.mapelId === id).length;
    const warningNilai = jumlahNilaiMapel > 0 ? ` (${jumlahNilaiMapel} data nilai terkait tidak ikut terhapus)` : '';
    if (!confirm(`Hapus mapel "${m ? m.nama : ''}"${warningNilai}?`)) return;
    daftarMapel = daftarMapel.filter(x => x.id !== id);
    simpanState(); renderMapelList(); refreshAllSelects();
    showToast(`Mapel "${m ? m.nama : ''}" berhasil dihapus.`, 'success');
}

/*  RENDER MAPEL LIST  */
function renderMapelList() {
    const el = document.getElementById('mapelList');
    if (!el) return;
    const q = (document.getElementById('mapelSearchInput')?.value || '').toLowerCase().trim();
    const fKelas = document.getElementById('mapelFilterKelas')?.value || '';
    const sortVal = document.getElementById('mapelSort')?.value || 'nama-az';
    const perPage = parseInt(document.getElementById('mapelEntriesPerPage')?.value || 10);

    let filtered = daftarMapel.filter(m => {
        const matchQ = !q || m.nama.toLowerCase().includes(q) || m.guru.toLowerCase().includes(q)
            || (m.nip || '').toLowerCase().includes(q) || (m.kelas || '').toLowerCase().includes(q);
        const matchK = !fKelas || m.kelas === fKelas;
        return matchQ && matchK;
    });

    filtered.sort((a, b) => {
        if (sortVal === 'nip-az') return (a.nip || '').localeCompare(b.nip || '', undefined, { numeric: true });
        if (sortVal === 'nip-za') return (b.nip || '').localeCompare(a.nip || '', undefined, { numeric: true });
        if (sortVal === 'nama-az') return a.nama.localeCompare(b.nama);
        if (sortVal === 'nama-za') return b.nama.localeCompare(a.nama);
        if (sortVal === 'guru-az') return a.guru.localeCompare(b.guru);
        if (sortVal === 'guru-za') return b.guru.localeCompare(a.guru);
        if (sortVal === 'kelas-az') return (a.kelas || '').localeCompare(b.kelas || '', undefined, { numeric: true });
        if (sortVal === 'kelas-za') return (b.kelas || '').localeCompare(a.kelas || '', undefined, { numeric: true });
        if (sortVal === 'kkm-tinggi') return b.kkm - a.kkm;
        if (sortVal === 'kkm-rendah') return a.kkm - b.kkm;
        if (sortVal === 'terbaru') return (b._ts || 0) - (a._ts || 0);
        if (sortVal === 'terlama') return (a._ts || 0) - (b._ts || 0);
        return 0;
    });

    const total = daftarMapel.length, filteredN = filtered.length;
    const totalPages = Math.max(1, Math.ceil(filteredN / perPage));
    if (mapelPage > totalPages) mapelPage = totalPages;
    const start = (mapelPage - 1) * perPage, end = Math.min(start + perPage, filteredN);
    const page = filtered.slice(start, end);

    if (filteredN === 0) {
        el.innerHTML = `<div class="empty-state" style="padding:30px;"><div class="empty-state-icon"><img src="https://cdn-icons-png.flaticon.com/128/9585/9585435.png" width="50px"/></div><div class="empty-state-text">${total === 0 ? 'Belum ada mata pelajaran' : 'Tidak ada data yang cocok'}</div></div>`;
        buildShowingInfo('mapelShowingInfo', 0, 0, total, 0);
        buildPagination('mapelPagination', mapelPage, 0, 'setMapelPage'); return;
    }

    el.innerHTML = page.map((m, i) => `
        <div class="mapel-card">
            <div class="mapel-num">${String(start + i + 1).padStart(2, '0')}</div>
            <div class="mapel-info">
                <div class="mapel-nama">${m.nama}</div>
                <div class="mapel-detail">
                    ${m.nip ? `<span class="mapel-nip">NIP: ${m.nip}</span><span class="mapel-detail-sep">•</span>` : ''}
                    <span>${m.guru}</span>
                    <span class="mapel-detail-sep">•</span>
                    <span>${m.kelas || '—'}</span>
                    <span class="mapel-detail-sep">•</span>
                    <span class="mapel-kkm">KKM ${m.kkm}</span>
                </div>
            </div>
            <div style="display:flex;gap:5px;">
                <button class="btn-action btn-edit" onclick="editMapel('${m.id}')">✏ Edit</button>
                <button class="btn-action" onclick="hapusMapel('${m.id}')">Hapus</button>
            </div>
        </div>`).join('');

    buildShowingInfo('mapelShowingInfo', start + 1, end, total, filteredN);
    buildPagination('mapelPagination', mapelPage, totalPages, 'setMapelPage');
}

/*  REFRESH SEMUA SELECT (FIX: refreshSelectMapel tidak lagi mengisi exportSiswaSelect)  */
function refreshAllSelects() {
    refreshSelectSiswa();
    refreshSelectMapelOnly();
    refreshExportSiswaSelect();
}

function refreshSelectSiswa() {
    const sel = document.getElementById('nilaiSiswaSelect');
    if (!sel) return;
    const prev = sel.value;
    sel.innerHTML = '<option value="">— Pilih Siswa —</option>' +
        daftarSiswa.map(s => `<option value="${s.id}">(${s.nis}) ${s.nama} — ${s.kelas || '—'}</option>`).join('');
    if (prev) sel.value = prev;
}

function refreshSelectMapelOnly() {
    const sel = document.getElementById('nilaiMapelSelect');
    if (!sel) return;
    const prev = sel.value;
    sel.innerHTML = '<option value="">— Pilih Mata Pelajaran —</option>' +
        daftarMapel.map(m => `<option value="${m.id}">${m.nama}${m.guru ? ' · ' + m.guru : ''}${m.kelas ? ' · ' + m.kelas : ''}</option>`).join('');
    if (prev) sel.value = prev;
}

function refreshExportSiswaSelect() {
    const expSel = document.getElementById('exportSiswaSelect');
    if (expSel) {
        expSel.innerHTML = '<option value="">— Pilih Siswa —</option>' +
            daftarSiswa.map(s => `<option value="${s.id}">(${s.nis}) ${s.nama} — ${s.kelas || '—'}</option>`).join('');
    }
}

/*  PREVIEW NILAI (FIX: reset saat field kosong, tampilkan KKM mapel)  */
function previewNilai() {
    const t = parseFloat(document.getElementById('nilaiTugas')?.value);
    const u = parseFloat(document.getElementById('nilaiUTS')?.value);
    const a = parseFloat(document.getElementById('nilaiUAS')?.value);
    const preview = document.getElementById('previewNilaiAkhir');

    const allEmpty = document.getElementById('nilaiTugas')?.value === '' &&
                     document.getElementById('nilaiUTS')?.value === '' &&
                     document.getElementById('nilaiUAS')?.value === '';
    if (allEmpty) { if (preview) preview.style.display = 'none'; return; }
    if (preview) preview.style.display = 'block';

    const akhir = ((isNaN(t) ? 0 : t) * 0.3) + ((isNaN(u) ? 0 : u) * 0.3) + ((isNaN(a) ? 0 : a) * 0.4);
    const predikat = hitungPredikat(akhir);
    const mapelId = document.getElementById('nilaiMapelSelect')?.value;
    const mapel = daftarMapel.find(m => m.id === mapelId);
    const kkm = mapel ? mapel.kkm : 75;
    const lulus = akhir >= kkm;

    const el = document.getElementById('prevNilaiAkhir');
    const ep = document.getElementById('prevPredikat');
    const ek = document.getElementById('prevKKM');
    const ekv = document.getElementById('prevKKMVal');

    if (el) { el.textContent = akhir.toFixed(1); el.style.color = lulus ? 'var(--accent)' : '#f87171'; }
    if (ep) ep.textContent = predikat;
    if (ek) { ek.textContent = lulus ? '✓ LULUS KKM' : '✗ BELUM KKM'; ek.style.color = lulus ? '#4ade80' : '#f87171'; }
    if (ekv) { ekv.textContent = `KKM: ${kkm}${mapel ? '' : ' (default)'}`; }
}

/*  SIMPAN NILAI  */
function simpanNilai() {
    const siswaId = document.getElementById('nilaiSiswaSelect')?.value;
    const mapelId = document.getElementById('nilaiMapelSelect')?.value;
    const tVal = document.getElementById('nilaiTugas')?.value;
    const uVal = document.getElementById('nilaiUTS')?.value;
    const aVal = document.getElementById('nilaiUAS')?.value;
    const t = parseFloat(tVal);
    const u = parseFloat(uVal);
    const a = parseFloat(aVal);

    if (!siswaId) { showToast('Pilih Siswa terlebih dahulu!', 'error'); return; }
    if (!mapelId) { showToast('Pilih Mata Pelajaran terlebih dahulu!', 'error'); return; }
    if (tVal === '' || isNaN(t) || t < 0 || t > 100) { showToast('Nilai Tugas tidak valid! Harus antara 0 – 100', 'error'); document.getElementById('nilaiTugas').classList.add('input-error'); return; }
    else document.getElementById('nilaiTugas').classList.remove('input-error');
    if (uVal === '' || isNaN(u) || u < 0 || u > 100) { showToast('Nilai UTS tidak valid! Harus antara 0 – 100', 'error'); document.getElementById('nilaiUTS').classList.add('input-error'); return; }
    else document.getElementById('nilaiUTS').classList.remove('input-error');
    if (aVal === '' || isNaN(a) || a < 0 || a > 100) { showToast('Nilai UAS tidak valid! Harus antara 0 – 100', 'error'); document.getElementById('nilaiUAS').classList.add('input-error'); return; }
    else document.getElementById('nilaiUAS').classList.remove('input-error');

    const akhir = (t * 0.3) + (u * 0.3) + (a * 0.4);
    const predikat = hitungPredikat(akhir);
    const isUpdate = daftarNilai.some(n => n.siswaId === siswaId && n.mapelId === mapelId);

    /* Update jika sudah ada (upsert) */
    daftarNilai = daftarNilai.filter(n => !(n.siswaId === siswaId && n.mapelId === mapelId));
    daftarNilai.push({ id: 'N' + Date.now(), siswaId, mapelId, tugas: t, uts: u, uas: a, akhir: parseFloat(akhir.toFixed(2)), predikat, _ts: Date.now() });
    simpanState(); renderNilaiTable(); renderLeger();

    /* Reset form */
    ['nilaiTugas', 'nilaiUTS', 'nilaiUAS'].forEach(id => { document.getElementById(id).value = ''; document.getElementById(id).classList.remove('input-error'); });
    document.getElementById('nilaiSiswaSelect').value = '';
    document.getElementById('nilaiMapelSelect').value = '';
    setTimeout(() => {
    document.getElementById('previewNilaiAkhir').style.display = 'none';
    }, 5000);

    const siswa = daftarSiswa.find(s => s.id === siswaId);
    const mapel = daftarMapel.find(m => m.id === mapelId);
    if (isUpdate) {
        showToast(`Nilai "${mapel ? mapel.nama : ''}" untuk ${siswa ? siswa.nama : ''} diperbarui! (${akhir.toFixed(1)} / ${predikat})`, 'success');
    } else {
        showToast(`Nilai "${mapel ? mapel.nama : ''}" berhasil disimpan! Akhir: ${akhir.toFixed(1)} (${predikat})`, 'success');
    }

    if (editingNilaiId) {
        editingNilaiId = null;
        document.getElementById('nilaiBanner').classList.remove('show');
        document.getElementById('btnNilaiSubmit').textContent = 'Simpan Nilai';
    }

    if (predikat === 'A') confetti({ particleCount: 80, spread: 55, origin: { y: 0.6 }, colors: ['#00f2ff', '#7000ff', '#fff'] });
}

/*  EDIT NILAI  */
function editNilai(id) {
    const n = daftarNilai.find(x => x.id === id);
    if (!n) return;
    editingNilaiId = id;
    switchTab('tab-nilai');
    refreshSelectSiswa(); refreshSelectMapelOnly();
    setTimeout(() => {
        document.getElementById('nilaiSiswaSelect').value = n.siswaId;
        document.getElementById('nilaiMapelSelect').value = n.mapelId;
        document.getElementById('nilaiTugas').value = n.tugas;
        document.getElementById('nilaiUTS').value = n.uts;
        document.getElementById('nilaiUAS').value = n.uas;
        previewNilai();
        const siswa = daftarSiswa.find(s => s.id === n.siswaId);
        const mapel = daftarMapel.find(m => m.id === n.mapelId);
        const bannerEl = document.getElementById('nilaiBanner');
        bannerEl.classList.add('show');
        bannerEl.querySelector('.edit-mode-text').textContent =
            `✏ MODE EDIT — ${siswa ? siswa.nama : ''} · ${mapel ? mapel.nama : ''}`;
        document.getElementById('btnNilaiSubmit').textContent = 'Update Nilai';
        document.getElementById('nilaiSiswaSelect').scrollIntoView({ behavior: 'smooth' });
        showToast(`Mode edit nilai: ${siswa ? siswa.nama : ''} — ${mapel ? mapel.nama : ''}`, 'info');
    }, 100);
}

function batalEditNilai() {
    editingNilaiId = null;
    document.getElementById('nilaiBanner').classList.remove('show');
    document.getElementById('btnNilaiSubmit').textContent = 'Simpan Nilai';
    ['nilaiTugas', 'nilaiUTS', 'nilaiUAS'].forEach(id => { document.getElementById(id).value = ''; document.getElementById(id).classList.remove('input-error'); });
    document.getElementById('nilaiSiswaSelect').value = '';
    document.getElementById('nilaiMapelSelect').value = '';
    document.getElementById('previewNilaiAkhir').style.display = 'none';
    showToast('Edit nilai dibatalkan.', 'warning');
}

/*  HAPUS NILAI  */
function hapusNilai(id) {
    const n = daftarNilai.find(x => x.id === id);
    const siswa = n ? daftarSiswa.find(s => s.id === n.siswaId) : null;
    const mapel = n ? daftarMapel.find(m => m.id === n.mapelId) : null;
    if (!confirm(`Hapus nilai "${mapel ? mapel.nama : ''}" untuk "${siswa ? siswa.nama : ''}"?`)) return;
    daftarNilai = daftarNilai.filter(x => x.id !== id);
    simpanState(); renderNilaiTable(); renderLeger();
    showToast(`Nilai "${mapel ? mapel.nama : ''}" untuk ${siswa ? siswa.nama : ''} berhasil dihapus.`, 'success');
}

/*  RENDER TABEL NILAI  */
function renderNilaiTable() {
    const tbody = document.getElementById('nilaiTableBody');
    if (!tbody) return;
    const q = (document.getElementById('nilaiSearchInput')?.value || '').toLowerCase().trim();
    const fPredikat = document.getElementById('nilaiFilterPredikat')?.value || '';
    const sortVal = document.getElementById('nilaiSort')?.value || 'terbaru';
    const perPage = parseInt(document.getElementById('nilaiEntriesPerPage')?.value || 10);

    let filtered = daftarNilai.filter(n => {
        const siswa = daftarSiswa.find(s => s.id === n.siswaId);
        const mapel = daftarMapel.find(m => m.id === n.mapelId);
        const namaSiswa = siswa ? siswa.nama.toLowerCase() : '';
        const nisSiswa = siswa ? siswa.nis.toLowerCase() : '';
        const kelasSiswa = siswa ? (siswa.kelas || '').toLowerCase() : '';
        const namaMapel = mapel ? mapel.nama.toLowerCase() : '';
        const matchQ = !q || namaSiswa.includes(q) || namaMapel.includes(q) || nisSiswa.includes(q) || kelasSiswa.includes(q);
        const matchP = !fPredikat || n.predikat === fPredikat;
        return matchQ && matchP;
    });

    filtered.sort((a, b) => {
        const sA = daftarSiswa.find(s => s.id === a.siswaId);
        const sB = daftarSiswa.find(s => s.id === b.siswaId);
        const mA = daftarMapel.find(m => m.id === a.mapelId);
        const mB = daftarMapel.find(m => m.id === b.mapelId);
        if (sortVal === 'nilai-tinggi') return b.akhir - a.akhir;
        if (sortVal === 'nilai-rendah') return a.akhir - b.akhir;
        if (sortVal === 'nis-az') return (sA?.nis||'').localeCompare(sB?.nis||'', undefined, {numeric:true});
        if (sortVal === 'nis-za') return (sB?.nis||'').localeCompare(sA?.nis||'', undefined, {numeric:true});
        if (sortVal === 'kelas-az') return (sA?.kelas||'').localeCompare(sB?.kelas||'', undefined, {numeric:true});
        if (sortVal === 'kelas-za') return (sB?.kelas||'').localeCompare(sA?.kelas||'', undefined, {numeric:true});
        if (sortVal === 'siswa-az') return (sA?.nama||'').localeCompare(sB?.nama||'');
        if (sortVal === 'siswa-za') return (sB?.nama||'').localeCompare(sA?.nama||'');
        if (sortVal === 'mapel-az') return (mA?.nama||'').localeCompare(mB?.nama||'');
        if (sortVal === 'mapel-za') return (mB?.nama||'').localeCompare(mA?.nama||'');
        if (sortVal === 'terlama') return (a._ts || 0) - (b._ts || 0);
        return (b._ts || 0) - (a._ts || 0);
    });

    const total = daftarNilai.length, filteredN = filtered.length;
    const totalPages = Math.max(1, Math.ceil(filteredN / perPage));
    if (nilaiPage > totalPages) nilaiPage = totalPages;
    const start = (nilaiPage - 1) * perPage, end = Math.min(start + perPage, filteredN);
    const page = filtered.slice(start, end);

    if (filteredN === 0) {
        tbody.innerHTML = `<tr><td colspan="11"><div class="empty-state"><div class="empty-state-icon"><img src="https://cdn-icons-png.flaticon.com/128/10786/10786354.png" width="50px"/></div><div class="empty-state-text">${total === 0 ? 'Belum ada nilai tersimpan' : 'Tidak ada data yang cocok'}</div></div></td></tr>`;
        buildShowingInfo('nilaiShowingInfo', 0, 0, total, 0);
        buildPagination('nilaiPagination', nilaiPage, 0, 'setNilaiPage'); return;
    }

    tbody.innerHTML = page.map((n, idx) => {
        const siswa = daftarSiswa.find(s => s.id === n.siswaId);
        const mapel = daftarMapel.find(m => m.id === n.mapelId);
        const kkm = mapel ? mapel.kkm : 75;
        const lulus = n.akhir >= kkm;
        return `<tr>
            <td style="color:var(--text-muted);font-size:0.78rem;">${start + idx + 1}</td>
            <td style="font-family:'Space Grotesk',sans-serif;color:var(--text-muted);font-size:0.8rem;">${siswa ? siswa.nis : '—'}</td>
            <td style="font-weight:600;">${siswa ? siswa.nama : n.siswaId}</td>
            <td style="color:var(--text-muted);font-size:0.8rem;">${siswa ? (siswa.kelas || '—') : '—'}</td>
            <td>${mapel ? mapel.nama : n.mapelId}</td>
            <td style="text-align:center">${n.tugas}</td>
            <td style="text-align:center">${n.uts}</td>
            <td style="text-align:center">${n.uas}</td>
            <td style="text-align:center;font-weight:700;color:${lulus ? 'var(--accent)' : '#f87171'}">${n.akhir.toFixed(1)}</td>
            <td style="text-align:center"><span class="badge-predikat badge-${n.predikat}">${n.predikat}</span></td>
            <td style="display:flex;gap:5px;flex-wrap:wrap;">
                <button class="btn-action btn-edit" onclick="editNilai('${n.id}')">✏ Edit</button>
                <button class="btn-action" onclick="hapusNilai('${n.id}')">Hapus</button>
            </td>
        </tr>`;
    }).join('');

    buildShowingInfo('nilaiShowingInfo', start + 1, end, total, filteredN);
    buildPagination('nilaiPagination', nilaiPage, totalPages, 'setNilaiPage');
}

/*  RENDER LEGER  */
function renderLeger() {
    const body = document.getElementById('legerBody');
    if (!body) return;
    const q = (document.getElementById('legerSearchInput')?.value || '').toLowerCase().trim();
    const fKelas = document.getElementById('legerFilterKelas')?.value || '';
    const fPredikat = document.getElementById('legerFilterPredikat')?.value || '';
    const sortVal = document.getElementById('legerSort')?.value || 'nilai-tinggi';
    const perPage = parseInt(document.getElementById('legerEntriesPerPage')?.value || 10);

    const allRows = daftarSiswa.map(s => {
        const ns = daftarNilai.filter(n => n.siswaId === s.id);
        const rataAll = ns.length > 0 ? ns.reduce((sum, n) => sum + n.akhir, 0) / ns.length : null;
        const predikat = rataAll !== null ? hitungPredikat(rataAll) : '—';
        const latestNilaiTs = ns.length > 0 ? Math.max(...ns.map(n => n._ts || 0)) : 0;
        return { ...s, _ts: latestNilaiTs > 0 ? latestNilaiTs : (s._ts || 0), rataAll, predikat, jumlahMapel: ns.length };
    });

    /* Stat berdasarkan filter kelas saja */
    const kelasStat = fKelas ? allRows.filter(r => r.kelas === fKelas) : allRows;
    updateStatLeger(kelasStat, fKelas);

    allRows.sort((a, b) => {
        if (sortVal === 'nilai-tinggi') return (b.rataAll || 0) - (a.rataAll || 0);
        if (sortVal === 'nilai-rendah') return (a.rataAll || 0) - (b.rataAll || 0);
        if (sortVal === 'nama-az') return a.nama.localeCompare(b.nama);
        if (sortVal === 'nama-za') return b.nama.localeCompare(a.nama);
        if (sortVal === 'nis-az') return a.nis.localeCompare(b.nis, undefined, { numeric: true });
        if (sortVal === 'nis-za') return b.nis.localeCompare(a.nis, undefined, { numeric: true });
        if (sortVal === 'terbaru') return (b._ts || 0) - (a._ts || 0);
        if (sortVal === 'terlama') return (a._ts || 0) - (b._ts || 0);
        if (sortVal === 'kelas-az') return (a.kelas || '').localeCompare(b.kelas || '', undefined, { numeric: true });
        if (sortVal === 'kelas-za') return (b.kelas || '').localeCompare(a.kelas || '', undefined, { numeric: true });
        return 0;
    });

    let filtered = allRows.filter(s => {
        const matchQ = !q || s.nama.toLowerCase().includes(q) || s.nis.toLowerCase().includes(q) || (s.kelas || '').toLowerCase().includes(q);
        const matchK = !fKelas || s.kelas === fKelas;
        const matchP = !fPredikat || s.predikat === fPredikat;
        return matchQ && matchK && matchP;
    });

    const total = allRows.length, filteredN = filtered.length;
    const totalPages = Math.max(1, Math.ceil(filteredN / perPage));
    if (legerPage > totalPages) legerPage = totalPages;
    const start = (legerPage - 1) * perPage, end = Math.min(start + perPage, filteredN);
    const page = filtered.slice(start, end);

    if (filteredN === 0) {
        body.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-state-icon"><img src="https://cdn-icons-png.flaticon.com/128/16312/16312812.png" width="50px"/></div><div class="empty-state-text">${total === 0 ? 'Belum ada data siswa & nilai' : 'Tidak ada data yang cocok'}</div></div></td></tr>`;
        buildShowingInfo('legerShowingInfo', 0, 0, total, 0);
        buildPagination('legerPagination', legerPage, 0, 'setLegerPage'); return;
    }

    body.innerHTML = page.map((s, i) => `
        <tr>
            <td style="color:var(--text-muted);font-size:0.78rem;">${start + i + 1}</td>
            <td style="font-family:'Space Grotesk',sans-serif;color:var(--text-muted);font-size:0.8rem;">${s.nis}</td>
            <td style="font-weight:600;">${s.nama}</td>
            <td style="color:var(--text-muted);font-size:0.8rem;">${s.kelas || '—'}</td>
            <td style="text-align:center;font-weight:700;color:${s.rataAll !== null ? 'var(--accent)' : 'var(--text-muted)'}">
                ${s.rataAll !== null ? s.rataAll.toFixed(1) : '—'}
                <span style="font-size:0.62rem;opacity:0.4;margin-left:3px;">${s.jumlahMapel > 0 ? s.jumlahMapel + ' mapel' : ''}</span>
            </td>
            <td style="text-align:center">
                ${s.rataAll !== null ? `<span class="badge-predikat badge-${s.predikat}">${s.predikat}</span>` : '<span style="opacity:0.3;font-size:0.76rem;">—</span>'}
            </td>
            <td style="display:flex;gap:5px;flex-wrap:wrap;">
                <button class="btn-action btn-rapor" onclick="lihatRapor('${s.id}')">Rapor</button>
                <button class="btn-action" onclick="hapusSiswa('${s.id}')">Hapus</button>
            </td>
        </tr>`).join('');

    buildShowingInfo('legerShowingInfo', start + 1, end, total, filteredN);
    buildPagination('legerPagination', legerPage, totalPages, 'setLegerPage');
}

/*  UPDATE STAT LEGER  */
function updateStatLeger(rows, fKelas) {
    const dN = rows.filter(r => r.rataAll !== null);
    const rataKelas = dN.length > 0 ? dN.reduce((s, r) => s + r.rataAll, 0) / dN.length : null;
    const tertinggi = dN.length > 0 ? Math.max(...dN.map(r => r.rataAll)) : null;
    const lulusCount = dN.filter(r => r.rataAll >= 75).length;
    document.getElementById('statTotalSiswa').textContent = rows.length;
    document.getElementById('statRataKelas').textContent = rataKelas !== null ? rataKelas.toFixed(1) : '—';
    document.getElementById('statTertinggi').textContent = tertinggi !== null ? tertinggi.toFixed(1) : '—';
    document.getElementById('statLulus').textContent = dN.length > 0 ? `${lulusCount}/${dN.length}` : '—';
    const labelEl = document.getElementById('statKelasLabel');
    if (labelEl) labelEl.textContent = fKelas ? `Kelas ${fKelas}` : '';
}

/*  PAGINATION HELPERS (FIX: logika ellipsis lebih bersih)  */
function buildPagination(containerId, currentPage, totalPages, setPageFn) {
    const wrap = document.getElementById(containerId);
    if (!wrap) return;
    if (totalPages <= 1) { wrap.innerHTML = ''; return; }

    let pages = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
            pages.push(i);
        } else if (pages[pages.length - 1] !== '…') {
            pages.push('…');
        }
    }

    let html = `<button class="page-btn" onclick="${setPageFn}(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>‹ Prev</button>`;
    pages.forEach(p => {
        if (p === '…') html += `<button class="page-btn" disabled style="cursor:default">…</button>`;
        else html += `<button class="page-btn ${p === currentPage ? 'active' : ''}" onclick="${setPageFn}(${p})">${p}</button>`;
    });
    html += `<button class="page-btn" onclick="${setPageFn}(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Next ›</button>`;
    wrap.innerHTML = html;
}

function buildShowingInfo(containerId, from, to, total, filteredTotal) {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (total === 0) { el.innerHTML = ''; return; }
    const filterNote = filteredTotal < total ? ` (difilter dari <span>${total}</span> total data)` : '';
    el.innerHTML = `Menampilkan <span>${from}</span> – <span>${to}</span> dari <span>${filteredTotal}</span> data${filterNote}`;
}

/*  NAVIGASI TAB  */
function switchTab(tabId) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
    const panel = document.getElementById(tabId);
    if (panel) panel.classList.add('active');
    const btn = document.querySelector(`[data-tab="${tabId}"]`);
    if (btn) btn.classList.add('active');
    if (tabId === 'tab-siswa') renderSiswaTable();
    if (tabId === 'tab-mapel') renderMapelList();
    if (tabId === 'tab-nilai') { refreshSelectSiswa(); refreshSelectMapelOnly(); renderNilaiTable(); }
    if (tabId === 'tab-leger') renderLeger();
}

/*  INISIALISASI  */
window.addEventListener('DOMContentLoaded', () => {
    renderSiswaTable(); renderMapelList(); renderNilaiTable(); renderLeger();
    refreshSelectSiswa(); refreshSelectMapelOnly();
});

/*  LIHAT RAPOR (MODAL)  */
function lihatRapor(siswaId) {
    const siswa = daftarSiswa.find(s => s.id === siswaId);
    if (!siswa) return;
    const ns = daftarNilai.filter(n => n.siswaId === siswaId);
    const rataAll = ns.length > 0 ? ns.reduce((s, n) => s + n.akhir, 0) / ns.length : null;
    const predikat = rataAll !== null ? hitungPredikat(rataAll) : '—';
    const tanggal = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

    const nilaiRows = ns.map(n => {
        const mapel = daftarMapel.find(m => m.id === n.mapelId);
        const kkm = mapel ? mapel.kkm : 75;
        const lulus = n.akhir >= kkm;
        return `<tr>
            <td style="text-align:left">${mapel ? mapel.nama : '—'}</td>
            <td>${mapel ? mapel.guru : '—'}</td>
            <td>${n.tugas}</td><td>${n.uts}</td><td>${n.uas}</td>
            <td style="font-weight:700;color:${lulus ? 'var(--accent)' : '#e53e3e'}">${n.akhir.toFixed(1)}</td>
            <td><span class="badge-predikat badge-${n.predikat}">${n.predikat}</span></td>
            <td style="font-size:0.75rem;font-weight:700;color:${lulus?'#4ade80':'#f87171'}">${lulus ? '✓ Lulus' : '✗ Remedial'}</td>
        </tr>`;
    }).join('');

    const emptyNilai = ns.length === 0 ? `<tr><td colspan="8" style="text-align:center;opacity:0.4;padding:20px;">Belum ada nilai</td></tr>` : '';

    document.getElementById('modalRaporContent').innerHTML = `
        <div class="rapor-header"><div class="rapor-logo">RAPOR NILAI SISWA</div><div class="rapor-sub">PENGOLAHAN NILAI SISWA — KELOMPOK 7</div></div>
        <div class="rapor-divider"></div>
        <div class="rapor-siswa-info">
            <div class="rapor-info-item"><div class="rapor-info-label">Nama Siswa</div><div class="rapor-info-val">${siswa.nama}</div></div>
            <div class="rapor-info-item"><div class="rapor-info-label">NIS</div><div class="rapor-info-val">${siswa.nis}</div></div>
            <div class="rapor-info-item"><div class="rapor-info-label">Kelas</div><div class="rapor-info-val">${siswa.kelas || '—'}</div></div>
            <div class="rapor-info-item"><div class="rapor-info-label">Tanggal Cetak</div><div class="rapor-info-val">${tanggal}</div></div>
        </div>
        <div class="rapor-divider"></div>
        <p style="font-size:0.65rem;letter-spacing:2px;color:var(--text-muted);margin-bottom:10px;">RINCIAN NILAI PER MATA PELAJARAN</p>
        <div class="data-table-wrap" style="margin-bottom:0">
            <table class="rapor-nilai-table">
                <thead><tr><th style="text-align:left">Mata Pelajaran</th><th>Guru</th><th>Tugas</th><th>UTS</th><th>UAS</th><th>Akhir</th><th>Predikat</th><th>Ket.</th></tr></thead>
                <tbody>${nilaiRows}${emptyNilai}</tbody>
            </table>
        </div>
        <div class="rapor-summary">
            <div class="rapor-sum-box"><div class="rapor-sum-label">Rata-rata</div><div class="rapor-sum-val" style="color:var(--accent)">${rataAll !== null ? rataAll.toFixed(1) : '—'}</div></div>
            <div class="rapor-sum-box"><div class="rapor-sum-label">Predikat Akhir</div><div class="rapor-sum-val" style="color:var(--accent-purple)">${predikat}</div></div>
            <div class="rapor-sum-box"><div class="rapor-sum-label">Total Mapel</div><div class="rapor-sum-val" style="color:var(--text)">${ns.length}</div></div>
        </div>`;
    document.getElementById('modalRapor').classList.add('open');
}
function tutupRapor() { document.getElementById('modalRapor').classList.remove('open'); }

/*  HELPER RAPOR FOOTER  */
function _raporFooterHTML(namaFile, tanggal) {
    const predList = [['A','100–90','Sangat Baik','#0891b2'],['B','89–80','Baik','#7c3aed'],['C','79–70','Cukup','#d97706'],['D','69–60','Kurang','#dc2626'],['E','59–50','Sangat Kurang','#6b7280'],['F','<50','Tidak Lulus','#374151']];
    return `<div style="margin-top:20px;page-break-inside:avoid;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
            <div><div style="font-size:0.6rem;letter-spacing:2px;color:#9ca3af;text-transform:uppercase;margin-bottom:12px;">Keterangan Predikat</div>
            <div style="display:flex;flex-direction:column;gap:5px;">
                ${predList.map(([p,r,k,c]) => `<div style="display:flex;align-items:center;gap:8px;"><span style="background:${c}22;color:${c};border:1px solid ${c}44;padding:2px 10px;border-radius:100px;font-weight:800;font-size:0.7rem;min-width:32px;text-align:center;">${p}</span><span style="font-size:0.78rem;color:#555;">${r} — <em>${k}</em></span></div>`).join('')}
            </div></div>
            <div style="display:flex;flex-direction:column;align-items:center;text-align:center;">
                <div style="font-size:0.6rem;letter-spacing:2px;color:#9ca3af;text-transform:uppercase;margin-bottom:50px;">Tanda Tangan Wali Kelas</div>
                <div style="border-bottom:2px solid #1e1e4a;width:200px;margin-bottom:8px;"></div>
                <div style="font-size:0.78rem;color:#333;font-weight:600;">(_____________________________)</div>
            </div>
        </div>
        <div style="margin-top:16px;padding-top:16px;border-top:1px solid #e8eef8;display:flex;justify-content:space-between;align-items:center;font-size:0.7rem;color:#bbb;">
            <span>${namaFile}</span><span>Dicetak: ${tanggal}</span>
        </div>
    </div>`;
}

/*  CETAK RAPOR (satu siswa dari modal) — gunakan layout _bukaWindowRapor agar sama dengan cetak semua rapor  */
function printRapor() {
    const content = document.getElementById('modalRaporContent');
    const vals = content.querySelectorAll('.rapor-info-val');
    if (!vals || vals.length < 1) { showToast('Gagal menemukan data siswa!', 'error'); return; }
    const namaSiswa = vals[0].textContent;
    const siswa = daftarSiswa.find(s => s.nama === namaSiswa);
    if (!siswa) { showToast('Gagal menemukan data siswa!', 'error'); return; }
    tutupRapor();
    _bukaWindowRapor([siswa]);
}

function _cetakRaporSiswa(siswa) {
    const ns = daftarNilai.filter(n => n.siswaId === siswa.id);
    const rataAll = ns.length > 0 ? ns.reduce((s, n) => s + n.akhir, 0) / ns.length : null;
    const predikat = rataAll !== null ? hitungPredikat(rataAll) : '—';
    const tanggal = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    function wP(p){return p==='A'?'#0891b2':p==='B'?'#7c3aed':p==='C'?'#d97706':p==='D'?'#dc2626':p==='E'?'#6b7280':'#374151';}
    function bP(p){return p==='A'?'#e0fffe':p==='B'?'#f3e8ff':p==='C'?'#fffbeb':p==='D'?'#fef2f2':p==='E'?'#f9fafb':'#f3f4f6';}
    const predColor = wP(predikat);
    const nilaiRows = ns.map((n, i) => {
        const mapel = daftarMapel.find(m => m.id === n.mapelId);
        const kkm = mapel ? mapel.kkm : 75; const lulus = n.akhir >= kkm; const pred = n.predikat;
        return `<tr style="background:${i%2===0?'#fff':'#f8faff'}">
            <td style="padding:10px 14px;border-bottom:1px solid #e8eef8;text-align:left;font-weight:600;color:#1e1e4a;">${mapel?mapel.nama:'—'}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e8eef8;text-align:center;color:#555;">${mapel?mapel.guru:'—'}</td>
            <td style="padding:10px 8px;border-bottom:1px solid #e8eef8;text-align:center;">${Number(n.tugas).toFixed(1)}</td>
            <td style="padding:10px 8px;border-bottom:1px solid #e8eef8;text-align:center;">${Number(n.uts).toFixed(1)}</td>
            <td style="padding:10px 8px;border-bottom:1px solid #e8eef8;text-align:center;">${Number(n.uas).toFixed(1)}</td>
            <td style="padding:10px 8px;border-bottom:1px solid #e8eef8;text-align:center;font-weight:800;font-size:1.05rem;color:${lulus?'#0891b2':'#dc2626'}">${n.akhir.toFixed(1)}</td>
            <td style="padding:10px 8px;border-bottom:1px solid #e8eef8;text-align:center;"><span style="background:${bP(pred)};color:${wP(pred)};padding:3px 12px;border-radius:100px;font-size:0.75rem;font-weight:800;border:1px solid ${wP(pred)}22;">${pred}</span></td>
            <td style="padding:10px 8px;border-bottom:1px solid #e8eef8;text-align:center;font-size:0.78rem;font-weight:700;color:${lulus?'#059669':'#dc2626'}">${lulus?'✓ Lulus':'✗ Remedial'}</td>
        </tr>`;
    }).join('');
    const kosong = ns.length===0?`<tr><td colspan="8" style="text-align:center;padding:30px;color:#aaa;">Belum ada data nilai</td></tr>`:'';
    const win = window.open('','_blank');
    if (!win) { showToast('Pop-up diblokir! Izinkan pop-up untuk mencetak.', 'error'); return; }
    win.document.write(`<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>Rapor — ${siswa.nama}</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Syne:wght@700;800&display=swap" rel="stylesheet">
<style>*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Plus Jakarta Sans',sans-serif;background:#f0f4ff;color:#12123a;padding:20px 16px;}.rapor-wrapper{max-width:800px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 60px rgba(0,0,100,0.12);}@media print{@page{size:A4;margin:10mm 8mm;}*,*::before,*::after{-webkit-print-color-adjust:exact;print-color-adjust:exact;}html,body{background:#fff;padding:0;}.rapor-wrapper{max-width:100%;border-radius:0;box-shadow:none;}}</style>
</head><body><div class="rapor-wrapper">
<div style="background:linear-gradient(135deg,#0a0a2e 0%,#1a0050 40%,#003040 100%);padding:36px 44px 30px;">
<div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:24px;">
<div><div style="font-size:0.6rem;letter-spacing:4px;color:rgba(0,242,255,0.7);text-transform:uppercase;margin-bottom:8px;">Dokumen Resmi Akademik</div>
<div style="font-family:'Syne',sans-serif;font-size:2rem;font-weight:800;color:#fff;letter-spacing:-1px;">RAPOR NILAI SISWA</div>
<div style="font-size:0.72rem;letter-spacing:3px;color:rgba(255,255,255,0.4);margin-top:6px;text-transform:uppercase;">Kelompok 7 · Sistem Pengelolaan Nilai</div></div>
<div style="text-align:center;"><div style="background:rgba(0,242,255,0.12);border:1px solid rgba(0,242,255,0.3);border-radius:12px;padding:14px 24px;display:inline-block;">
<div style="font-size:0.6rem;letter-spacing:2px;color:rgba(0,242,255,0.7);text-transform:uppercase;margin-bottom:4px;">Predikat Akhir</div>
<div style="font-family:'Syne',sans-serif;font-size:3rem;font-weight:800;color:#00f2ff;line-height:1;">${predikat}</div></div></div></div>
<div style="height:1px;background:linear-gradient(to right,transparent,rgba(0,242,255,0.4),transparent);margin-bottom:22px;"></div>
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">
<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:12px;"><div style="font-size:0.6rem;letter-spacing:2px;color:rgba(255,255,255,0.4);text-transform:uppercase;margin-bottom:5px;">Nama Siswa</div><div style="font-weight:700;color:#fff;font-size:0.88rem;">${siswa.nama}</div></div>
<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:12px;"><div style="font-size:0.6rem;letter-spacing:2px;color:rgba(255,255,255,0.4);text-transform:uppercase;margin-bottom:5px;">NIS</div><div style="font-weight:700;color:#00f2ff;font-size:0.88rem;">${siswa.nis}</div></div>
<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:12px;"><div style="font-size:0.6rem;letter-spacing:2px;color:rgba(255,255,255,0.4);text-transform:uppercase;margin-bottom:5px;">Kelas</div><div style="font-weight:700;color:#a78bfa;font-size:0.88rem;">${siswa.kelas||'—'}</div></div>
<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:12px;"><div style="font-size:0.6rem;letter-spacing:2px;color:rgba(255,255,255,0.4);text-transform:uppercase;margin-bottom:5px;">Tanggal Cetak</div><div style="font-weight:600;color:rgba(255,255,255,0.8);font-size:0.82rem;">${tanggal}</div></div>
</div></div>
<div style="background:#f8faff;padding:20px 44px;display:grid;grid-template-columns:repeat(3,1fr);gap:16px;border-bottom:1px solid #e8eef8;">
<div style="background:#fff;border:1px solid #e8eef8;border-radius:16px;padding:16px;text-align:center;"><div style="font-size:0.6rem;letter-spacing:2px;color:#888;text-transform:uppercase;margin-bottom:8px;">Rata-rata Nilai</div><div style="font-family:'Syne',sans-serif;font-size:2rem;font-weight:800;color:#0891b2;">${rataAll!==null?rataAll.toFixed(1):'—'}</div></div>
<div style="background:#fff;border:1px solid #e8eef8;border-radius:16px;padding:16px;text-align:center;"><div style="font-size:0.6rem;letter-spacing:2px;color:#888;text-transform:uppercase;margin-bottom:8px;">Predikat Akhir</div><div style="font-family:'Syne',sans-serif;font-size:2rem;font-weight:800;color:${predColor};">${predikat}</div></div>
<div style="background:#fff;border:1px solid #e8eef8;border-radius:16px;padding:16px;text-align:center;"><div style="font-size:0.6rem;letter-spacing:2px;color:#888;text-transform:uppercase;margin-bottom:8px;">Total Mata Pelajaran</div><div style="font-family:'Syne',sans-serif;font-size:2rem;font-weight:800;color:#1e1e4a;">${ns.length}</div></div>
</div>
<div style="padding:24px 44px 36px;">
<div style="font-size:0.65rem;letter-spacing:3px;color:#9ca3af;text-transform:uppercase;margin-bottom:14px;font-weight:700;">Rincian Nilai Per Mata Pelajaran</div>
<div style="border-radius:16px;overflow:hidden;border:1px solid #e8eef8;">
<table style="width:100%;border-collapse:collapse;font-size:0.82rem;table-layout:fixed;">
<colgroup><col style="width:21%"><col style="width:15%"><col style="width:8%"><col style="width:8%"><col style="width:8%"><col style="width:10%"><col style="width:10%"><col style="width:20%"></colgroup>
<thead><tr style="background:linear-gradient(135deg,#0a0a2e,#1a0050);">
${['Mata Pelajaran','Guru','Tugas','UTS','UAS','Nilai Akhir','Predikat','Keterangan'].map((h,i)=>`<th style="padding:12px ${i===0?'14px':'8px'};text-align:${i===0?'left':'center'};color:#00f2ff;font-size:0.6rem;letter-spacing:2px;text-transform:uppercase;font-weight:700;white-space:nowrap;">${h}</th>`).join('')}
</tr></thead>
<tbody>${nilaiRows}${kosong}</tbody>
</table></div>
${_raporFooterHTML('Rapor Nilai Siswa — '+siswa.nama, tanggal)}
</div></div>
<script>document.fonts.ready.then(function(){window.print();});<\/script>
</body></html>`);
    win.document.close();
}

/*  CETAK RAPOR SEMUA  */
function cetakRaporSemua() {
    if (daftarSiswa.length === 0) { showToast('Tidak ada data siswa!', 'warning'); return; }
    const fKelas = document.getElementById('legerFilterKelas')?.value || '';
    let sorted = fKelas ? daftarSiswa.filter(s => s.kelas === fKelas) : [...daftarSiswa];
    sorted.sort((a,b)=>{
        const nA=daftarNilai.filter(n=>n.siswaId===a.id);
        const nB=daftarNilai.filter(n=>n.siswaId===b.id);
        const rA=nA.length>0?nA.reduce((s,n)=>s+n.akhir,0)/nA.length:0;
        const rB=nB.length>0?nB.reduce((s,n)=>s+n.akhir,0)/nB.length:0;
        return rB-rA;
    });
    if (sorted.length === 0) { showToast('Tidak ada siswa ditemukan!', 'warning'); return; }
    _bukaWindowRapor(sorted);
    showToast(`Membuka rapor ${sorted.length} siswa${fKelas?' kelas '+fKelas:''}...`, 'info');
}

function _bukaWindowRapor(listSiswa) {
    const tanggal = new Date().toLocaleDateString('id-ID', { year:'numeric', month:'long', day:'numeric' });
    function wP(p){return p==='A'?'#0891b2':p==='B'?'#7c3aed':p==='C'?'#d97706':p==='D'?'#dc2626':p==='E'?'#6b7280':'#374151';}
    function bP(p){return p==='A'?'#e0fffe':p==='B'?'#f3e8ff':p==='C'?'#fffbeb':p==='D'?'#fef2f2':p==='E'?'#f9fafb':'#f3f4f6';}

    const semuaRapor = listSiswa.map(siswa => {
        const ns=daftarNilai.filter(n=>n.siswaId===siswa.id);
        const rataAll=ns.length>0?ns.reduce((s,n)=>s+n.akhir,0)/ns.length:null;
        const predikat=rataAll!==null?hitungPredikat(rataAll):'—';
        const predColor=wP(predikat);
        const nilaiRows=ns.map((n,i)=>{
            const mapel=daftarMapel.find(m=>m.id===n.mapelId);
            const kkm=mapel?mapel.kkm:75; const lulus=n.akhir>=kkm; const pred=n.predikat;
            return `<tr style="background:${i%2===0?'#fff':'#f8faff'}">
<td style="padding:9px 14px;border-bottom:1px solid #e8eef8;text-align:left;font-weight:600;color:#1e1e4a;">${mapel?mapel.nama:'—'}</td>
<td style="padding:9px 8px;border-bottom:1px solid #e8eef8;text-align:center;color:#555;">${mapel?mapel.guru:'—'}</td>
<td style="padding:9px 8px;border-bottom:1px solid #e8eef8;text-align:center;">${Number(n.tugas).toFixed(1)}</td>
<td style="padding:9px 8px;border-bottom:1px solid #e8eef8;text-align:center;">${Number(n.uts).toFixed(1)}</td>
<td style="padding:9px 8px;border-bottom:1px solid #e8eef8;text-align:center;">${Number(n.uas).toFixed(1)}</td>
<td style="padding:9px 8px;border-bottom:1px solid #e8eef8;text-align:center;font-weight:800;color:${lulus?'#0891b2':'#dc2626'}">${n.akhir.toFixed(1)}</td>
<td style="padding:9px 8px;border-bottom:1px solid #e8eef8;text-align:center;"><span style="background:${bP(pred)};color:${wP(pred)};padding:2px 10px;border-radius:100px;font-size:0.72rem;font-weight:800;border:1px solid ${wP(pred)}22;">${pred}</span></td>
<td style="padding:9px 8px;border-bottom:1px solid #e8eef8;text-align:center;font-size:0.76rem;font-weight:700;color:${lulus?'#059669':'#dc2626'}">${lulus?'✓ Lulus':'✗ Remedial'}</td></tr>`;
        }).join('');
        const kosong=ns.length===0?`<tr><td colspan="8" style="text-align:center;padding:20px;color:#aaa;">Belum ada data nilai</td></tr>`:'';
        return `<div class="rapor-page"><div class="rapor-wrapper">
<div style="background:linear-gradient(135deg,#0a0a2e 0%,#1a0050 40%,#003040 100%);padding:28px 36px 22px;">
<div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:18px;">
<div><div style="font-size:0.56rem;letter-spacing:4px;color:rgba(0,242,255,0.7);text-transform:uppercase;margin-bottom:5px;">Dokumen Resmi Akademik</div>
<div style="font-family:'Syne',sans-serif;font-size:1.6rem;font-weight:800;color:#fff;letter-spacing:-0.5px;">RAPOR NILAI SISWA</div>
<div style="font-size:0.65rem;letter-spacing:2px;color:rgba(255,255,255,0.4);margin-top:4px;">Kelompok 7 · Sistem Pengelolaan Nilai</div></div>
<div style="background:rgba(0,242,255,0.12);border:1px solid rgba(0,242,255,0.3);border-radius:10px;padding:10px 18px;text-align:center;">
<div style="font-size:0.55rem;letter-spacing:2px;color:rgba(0,242,255,0.7);text-transform:uppercase;margin-bottom:3px;">Predikat Akhir</div>
<div style="font-family:'Syne',sans-serif;font-size:2.2rem;font-weight:800;color:#00f2ff;line-height:1;">${predikat}</div></div></div>
<div style="height:1px;background:linear-gradient(to right,transparent,rgba(0,242,255,0.4),transparent);margin-bottom:14px;"></div>
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:8px;"><div style="font-size:0.56rem;letter-spacing:2px;color:rgba(255,255,255,0.4);text-transform:uppercase;margin-bottom:3px;">Nama</div><div style="font-weight:700;color:#fff;font-size:0.8rem;">${siswa.nama}</div></div>
<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:8px;"><div style="font-size:0.56rem;letter-spacing:2px;color:rgba(255,255,255,0.4);text-transform:uppercase;margin-bottom:3px;">NIS</div><div style="font-weight:700;color:#00f2ff;font-size:0.8rem;">${siswa.nis}</div></div>
<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:8px;"><div style="font-size:0.56rem;letter-spacing:2px;color:rgba(255,255,255,0.4);text-transform:uppercase;margin-bottom:3px;">Kelas</div><div style="font-weight:700;color:#a78bfa;font-size:0.8rem;">${siswa.kelas||'—'}</div></div>
<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:8px;"><div style="font-size:0.56rem;letter-spacing:2px;color:rgba(255,255,255,0.4);text-transform:uppercase;margin-bottom:3px;">Tanggal</div><div style="font-weight:600;color:rgba(255,255,255,0.8);font-size:0.75rem;">${tanggal}</div></div>
</div></div>
<div style="background:#f8faff;padding:14px 36px;display:grid;grid-template-columns:repeat(3,1fr);gap:12px;border-bottom:1px solid #e8eef8;">
<div style="background:#fff;border:1px solid #e8eef8;border-radius:12px;padding:12px;text-align:center;"><div style="font-size:0.56rem;letter-spacing:2px;color:#888;text-transform:uppercase;margin-bottom:5px;">Rata-rata</div><div style="font-family:'Syne',sans-serif;font-size:1.7rem;font-weight:800;color:#0891b2;">${rataAll!==null?rataAll.toFixed(1):'—'}</div></div>
<div style="background:#fff;border:1px solid #e8eef8;border-radius:12px;padding:12px;text-align:center;"><div style="font-size:0.56rem;letter-spacing:2px;color:#888;text-transform:uppercase;margin-bottom:5px;">Predikat</div><div style="font-family:'Syne',sans-serif;font-size:1.7rem;font-weight:800;color:${predColor};">${predikat}</div></div>
<div style="background:#fff;border:1px solid #e8eef8;border-radius:12px;padding:12px;text-align:center;"><div style="font-size:0.56rem;letter-spacing:2px;color:#888;text-transform:uppercase;margin-bottom:5px;">Total Mapel</div><div style="font-family:'Syne',sans-serif;font-size:1.7rem;font-weight:800;color:#1e1e4a;">${ns.length}</div></div>
</div>
<div style="padding:18px 36px 26px;">
<div style="font-size:0.6rem;letter-spacing:3px;color:#9ca3af;text-transform:uppercase;margin-bottom:10px;font-weight:700;">Rincian Nilai Per Mata Pelajaran</div>
<div style="border-radius:12px;overflow:hidden;border:1px solid #e8eef8;">
<table style="width:100%;border-collapse:collapse;font-size:0.78rem;table-layout:fixed;">
<colgroup><col style="width:22%"><col style="width:14%"><col style="width:8%"><col style="width:8%"><col style="width:8%"><col style="width:10%"><col style="width:10%"><col style="width:20%"></colgroup>
<thead><tr style="background:linear-gradient(135deg,#0a0a2e,#1a0050);">
${['Mata Pelajaran','Guru','Tugas','UTS','UAS','Nilai Akhir','Predikat','Keterangan'].map((h,i)=>`<th style="padding:10px ${i===0?'12px':'7px'};text-align:${i===0?'left':'center'};color:#00f2ff;font-size:0.56rem;letter-spacing:2px;text-transform:uppercase;font-weight:700;white-space:nowrap;">${h}</th>`).join('')}
</tr></thead>
<tbody>${nilaiRows}${kosong}</tbody>
</table></div>
${_raporFooterHTML('Rapor — '+siswa.nama, tanggal)}
</div></div></div></div>`;
    }).join('');

    const win = window.open('','_blank');
    if (!win) { showToast('Pop-up diblokir! Izinkan pop-up untuk mencetak.', 'error'); return; }
    win.document.write(`<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>Rapor — ${tanggal}</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Syne:wght@700;800&display=swap" rel="stylesheet">
<style>*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Plus Jakarta Sans',sans-serif;background:#f0f4ff;color:#12123a;}
.rapor-page{width:210mm;min-height:297mm;max-height:297mm;margin:0 auto;display:flex;align-items:flex-start;justify-content:center;padding:8mm;overflow:hidden;}
.rapor-wrapper{width:100%;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 30px rgba(0,0,100,0.10);}
@media screen{body{padding:20px 0;background:#e8edf8;}.rapor-page{margin-bottom:20px;}}
@media print{@page{size:A4 portrait;margin:0;}*,*::before,*::after{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
html,body{background:#fff;margin:0;padding:0;}.rapor-page{width:210mm;min-height:297mm;page-break-before:always;break-before:page;page-break-after:always;break-after:page;page-break-inside:avoid;overflow:hidden;padding:8mm;margin:0;}
.rapor-page:first-child{page-break-before:auto;break-before:auto;}.rapor-wrapper{border-radius:0;box-shadow:none;width:100%;}}
</style></head><body>${semuaRapor}<script>document.fonts.ready.then(function(){window.print();});<\/script></body></html>`);
    win.document.close();
}

/*  EXPORT MODAL  */
let _exportFormat = 'csv';
let _exportScope = 'semua';

function bukaModalExport() {
    if (daftarSiswa.length === 0) { showToast('Tidak ada data siswa untuk diekspor!', 'warning'); return; }
    _exportFormat = 'csv'; _exportScope = 'semua';
    ['exportBtnCSV','exportBtnXLSX','exportBtnPDF'].forEach(id => document.getElementById(id)?.classList.remove('selected'));
    ['exportBtnSemua','exportBtnKelas','exportBtnSiswa'].forEach(id => document.getElementById(id)?.classList.remove('selected'));
    document.getElementById('exportBtnCSV')?.classList.add('selected');
    document.getElementById('exportBtnSemua')?.classList.add('selected');
    document.getElementById('exportKelasWrap').style.display = 'none';
    document.getElementById('exportSiswaWrap').style.display = 'none';
    refreshExportSiswaSelect();
    document.getElementById('modalExport').classList.add('open');
}

function tutupExport() { document.getElementById('modalExport').classList.remove('open'); }

function pilihExportFormat(f) {
    _exportFormat = f;
    ['exportBtnCSV','exportBtnXLSX','exportBtnPDF'].forEach(id => document.getElementById(id)?.classList.remove('selected'));
    document.getElementById({csv:'exportBtnCSV',xlsx:'exportBtnXLSX',pdf:'exportBtnPDF'}[f])?.classList.add('selected');
}

function pilihExportScope(s) {
    _exportScope = s;
    ['exportBtnSemua','exportBtnKelas','exportBtnSiswa'].forEach(id => document.getElementById(id)?.classList.remove('selected'));
    document.getElementById({semua:'exportBtnSemua',kelas:'exportBtnKelas',siswa:'exportBtnSiswa'}[s])?.classList.add('selected');
    document.getElementById('exportKelasWrap').style.display = s === 'kelas' ? 'block' : 'none';
    document.getElementById('exportSiswaWrap').style.display = s === 'siswa' ? 'block' : 'none';
}

function doExport() {
    let targetSiswa = [...daftarSiswa];
    if (_exportScope === 'kelas') {
        const kelas = document.getElementById('exportKelasSelect')?.value;
        if (!kelas) { showToast('Pilih kelas terlebih dahulu!', 'error'); return; }
        targetSiswa = daftarSiswa.filter(s => s.kelas === kelas);
        if (targetSiswa.length === 0) { showToast(`Tidak ada siswa di kelas "${kelas}"!`, 'warning'); return; }
    } else if (_exportScope === 'siswa') {
        const siswaId = document.getElementById('exportSiswaSelect')?.value;
        if (!siswaId) { showToast('Pilih siswa terlebih dahulu!', 'error'); return; }
        targetSiswa = daftarSiswa.filter(s => s.id === siswaId);
    }
    tutupExport();
    if (_exportFormat === 'csv') exportCSV(targetSiswa);
    else if (_exportFormat === 'xlsx') exportXLSX(targetSiswa);
    else if (_exportFormat === 'pdf') _bukaWindowRapor(targetSiswa);
}

/*  EXPORT CSV (FIX: keterangan predikat tidak lagi rusak formatnya)  */
function exportCSV(targetSiswa) {
    const BOM = '\uFEFF', sep = ',';
    const tanggal = new Date().toLocaleDateString('id-ID', { year:'numeric', month:'long', day:'numeric' });
    const mapelHeaders = daftarMapel.flatMap(m => [`${m.nama} (Tugas)`,`${m.nama} (UTS)`,`${m.nama} (UAS)`,`${m.nama} (Akhir)`]);
    let rows = [
        ['REKAP DATA NILAI SISWA'],
        [`Dicetak: ${tanggal}`],
        [],
        ['No','NIS','Nama Siswa','Kelas',...mapelHeaders,'Rata-rata','Predikat','Keterangan']
    ];
    targetSiswa.forEach((s,i) => {
        const ns = daftarNilai.filter(n => n.siswaId === s.id);
        let row = [`${i+1}`, s.nis, s.nama, s.kelas || '-'];
        daftarMapel.forEach(m => {
            const n = ns.find(x => x.mapelId === m.id);
            row.push(...(n ? [Number(n.tugas).toFixed(1), Number(n.uts).toFixed(1), Number(n.uas).toFixed(1), Number(n.akhir).toFixed(1)] : ['-','-','-','-']));
        });
        const rataRaw = ns.length > 0 ? ns.reduce((s,n) => s+n.akhir, 0) / ns.length : null;
        row.push(
            rataRaw !== null ? rataRaw.toFixed(1) : '-',
            rataRaw !== null ? hitungPredikat(rataRaw) : '-',
            rataRaw !== null ? (rataRaw >= 75 ? 'Lulus' : 'Belum Lulus') : '-'
        );
        rows.push(row);
    });
    /* FIX: Keterangan predikat sebagai baris terpisah (tidak dengan koma campur) */
    rows.push([]);
    rows.push(['Keterangan Predikat']);
    rows.push(['A = 100-90','Sangat Baik']);
    rows.push(['B = 89-80','Baik']);
    rows.push(['C = 79-70','Cukup']);
    rows.push(['D = 69-60','Kurang']);
    rows.push(['E = 59-50','Sangat Kurang']);
    rows.push(['F = < 50','Tidak Lulus']);

    const csv = BOM + rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(sep)).join('\r\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `REKAP_NILAI_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Berhasil export ${targetSiswa.length} siswa ke CSV!`, 'success');
}

/*  EXPORT EXCEL (XLSX)  */
function exportXLSX(targetSiswa) {
    if (typeof XLSX === 'undefined') { showToast('Library Excel belum termuat! Refresh halaman.', 'error'); return; }
    const tanggal = new Date().toLocaleDateString('id-ID', { year:'numeric', month:'long', day:'numeric' });
    const wb = XLSX.utils.book_new();

    /* Sheet 1: Rekap */
    const mapelHeaders = daftarMapel.flatMap(m => [`${m.nama} (Tugas)`,`${m.nama} (UTS)`,`${m.nama} (UAS)`,`${m.nama} (Akhir)`]);
    const header = ['No','NIS','Nama Siswa','Kelas',...mapelHeaders,'Rata-rata','Predikat','Keterangan'];
    const aoa = [['REKAP DATA NILAI SISWA'],['Dicetak: '+tanggal],[],header];
    targetSiswa.forEach((s,i) => {
        const ns = daftarNilai.filter(n => n.siswaId === s.id);
        let row = [i+1, s.nis, s.nama, s.kelas||'-'];
        daftarMapel.forEach(m => {
            const n = ns.find(x => x.mapelId === m.id);
            row.push(...(n ? [Number(n.tugas),Number(n.uts),Number(n.uas),parseFloat(n.akhir.toFixed(2))] : ['','','','']));
        });
        const rataRaw = ns.length>0 ? ns.reduce((s,n)=>s+n.akhir,0)/ns.length : null;
        row.push(
            rataRaw !== null ? parseFloat(rataRaw.toFixed(2)) : '-',
            rataRaw !== null ? hitungPredikat(rataRaw) : '-',
            rataRaw !== null ? (rataRaw>=75?'Lulus':'Belum Lulus') : '-'
        );
        aoa.push(row);
    });
    const ws1 = XLSX.utils.aoa_to_sheet(aoa);
    ws1['!cols'] = [{wch:4},{wch:12},{wch:22},{wch:12},...daftarMapel.flatMap(()=>[{wch:8},{wch:8},{wch:8},{wch:8}]),{wch:10},{wch:9},{wch:12}];
    XLSX.utils.book_append_sheet(wb, ws1, 'Rekap Nilai');

    /* Sheet 2: Data Siswa */
    const aoa2 = [['No','NIS','Nama','Kelas']];
    targetSiswa.forEach((s,i) => aoa2.push([i+1,s.nis,s.nama,s.kelas||'-']));
    const ws2 = XLSX.utils.aoa_to_sheet(aoa2);
    ws2['!cols'] = [{wch:4},{wch:12},{wch:22},{wch:12}];
    XLSX.utils.book_append_sheet(wb, ws2, 'Data Siswa');

    /* Sheet 3: Mata Pelajaran */
    const aoa3 = [['No','Nama Mapel','Guru','NIP','Kelas','KKM']];
    daftarMapel.forEach((m,i) => aoa3.push([i+1,m.nama,m.guru,m.nip||'-',m.kelas||'-',m.kkm]));
    const ws3 = XLSX.utils.aoa_to_sheet(aoa3);
    ws3['!cols'] = [{wch:4},{wch:20},{wch:22},{wch:18},{wch:12},{wch:6}];
    XLSX.utils.book_append_sheet(wb, ws3, 'Mata Pelajaran');

    XLSX.writeFile(wb, `REKAP_NILAI_${new Date().toISOString().slice(0,10)}.xlsx`);
    showToast(`Berhasil export ${targetSiswa.length} siswa ke Excel (.xlsx)!`, 'success');
}

/*  MODAL CLOSE ON OVERLAY CLICK  */
document.getElementById('modalRapor')?.addEventListener('click', function(e) { if (e.target === this) tutupRapor(); });
document.getElementById('modalExport')?.addEventListener('click', function(e) { if (e.target === this) tutupExport(); });

/*  ESC KEY UNTUK TUTUP MODAL  */
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        tutupRapor();
        tutupExport();
    }
});