/* ════════════════════════════════════════════
   VELORA FASHION — Charts Module
   ════════════════════════════════════════════ */

const Charts = (() => {
  const instances = {};

  const PALETTE = {
    emerald: '#2dd4a0',
    emeraldD: '#1aab7c',
    primary: '#0a4a3a',
    gold:    '#d4a843',
    rose:    '#e87070',
    blue:    '#60a5fa',
    purple:  '#a78bfa',
    grid:    'rgba(10,74,58,0.06)',
  };

  const font = { family: "'Segoe UI', system-ui, sans-serif" };

  const baseAxes = () => ({
    x: {
      ticks: { color: '#8aa098', font: { size: 11, family: font.family } },
      grid: { display: false },
      border: { display: false },
    },
    y: {
      ticks: { color: '#8aa098', font: { size: 10, family: font.family } },
      grid: { color: PALETTE.grid },
      border: { display: false },
    },
  });

  const destroy = (id) => {
    if (instances[id]) { instances[id].destroy(); delete instances[id]; }
  };

  // ── Revenue Bar Chart ──────────────────────────
  const renderRevenue = (data) => {
    destroy('revenueChart');
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    instances.revenueChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.month),
        datasets: [
          {
            label: '2025',
            data: data.map(d => d.revenue2025),
            backgroundColor: PALETTE.emerald,
            borderRadius: 8,
            borderSkipped: false,
            barPercentage: 0.45,
          },
          {
            label: '2024',
            data: data.map(d => d.revenue2024),
            backgroundColor: 'rgba(10,74,58,0.15)',
            borderRadius: 8,
            borderSkipped: false,
            barPercentage: 0.45,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` $${(ctx.raw / 1000).toFixed(0)}K`,
            },
          },
        },
        scales: {
          ...baseAxes(),
          y: {
            ...baseAxes().y,
            ticks: {
              ...baseAxes().y.ticks,
              callback: (v) => '$' + (v / 1000).toFixed(0) + 'K',
            },
          },
        },
      },
    });
  };

  // ── Category Doughnut ──────────────────────────
  const renderCategory = (data) => {
    destroy('categoryChart');
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    instances.categoryChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map(d => d.name),
        datasets: [{
          data: data.map(d => d.percent),
          backgroundColor: data.map(d => d.color),
          borderWidth: 3,
          borderColor: '#fff',
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.raw}%`,
            },
          },
        },
      },
    });

    // Build category list
    const list = document.getElementById('categoryList');
    if (list) {
      list.innerHTML = data.map(d => `
        <div class="cat-row">
          <div class="cat-swatch" style="background:${d.color}"></div>
          <div class="cat-name">${d.name}</div>
          <div class="cat-pct">${d.percent}%</div>
        </div>`).join('');
    }
  };

  // ── Weekly Traffic Line ────────────────────────
  const renderTraffic = (data) => {
    destroy('trafficChart');
    const ctx = document.getElementById('trafficChart');
    if (!ctx) return;
    instances.trafficChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => d.day),
        datasets: [
          {
            label: 'Tashrif',
            data: data.map(d => d.visitors),
            borderColor: PALETTE.emerald,
            backgroundColor: 'rgba(45,212,160,0.08)',
            borderWidth: 2.5,
            pointBackgroundColor: PALETTE.emerald,
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Buyurtma',
            data: data.map(d => d.orders),
            borderColor: PALETTE.gold,
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointBackgroundColor: PALETTE.gold,
            pointRadius: 3,
            pointHoverRadius: 5,
            fill: false,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: baseAxes(),
      },
    });
  };

  // ── Conversion Rate Bar ────────────────────────
  const renderConversion = (data) => {
    destroy('conversionChart');
    const ctx = document.getElementById('conversionChart');
    if (!ctx) return;
    instances.conversionChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.day),
        datasets: [{
          label: 'Konversiya %',
          data: data.map(d => d.conversion),
          backgroundColor: data.map(d =>
            d.conversion >= 24 ? PALETTE.emerald : 'rgba(10,74,58,0.15)'
          ),
          borderRadius: 6,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => ` ${ctx.raw}%` } },
        },
        scales: {
          ...baseAxes(),
          y: {
            ...baseAxes().y,
            ticks: { ...baseAxes().y.ticks, callback: (v) => v + '%' },
          },
        },
      },
    });
  };

  return { renderRevenue, renderCategory, renderTraffic, renderConversion };
})();
