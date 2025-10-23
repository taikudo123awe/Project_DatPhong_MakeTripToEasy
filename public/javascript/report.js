document.addEventListener("DOMContentLoaded", () => {
  const { revenueData, roomRevenue, roomStatus } = window.reportData;

  // ===== Biểu đồ Doanh thu theo thời gian =====
  const revenueLabels = revenueData.map(r => r.dataValues.time);
  const revenueValues = revenueData.map(r => r.dataValues.total);

  const ctx1 = document.getElementById('revenueChart');
  new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: revenueLabels,
      datasets: [{
        label: 'Doanh thu (VNĐ)',
        data: revenueValues,
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderRadius: 6
      }]
    },
    options: {
      scales: { y: { beginAtZero: true } }
    }
  });

  // ===== Biểu đồ Doanh thu theo từng phòng =====
  const roomNames = roomRevenue.map(r => r.Booking.Room.roomName);
  const roomTotals = roomRevenue.map(r => r.dataValues.total);

  const ctx3 = document.getElementById('roomRevenueChart');
  new Chart(ctx3, {
    type: 'bar',
    data: {
      labels: roomNames,
      datasets: [{
        label: 'Doanh thu phòng (VNĐ)',
        data: roomTotals,
        backgroundColor: ['#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af'],
        borderRadius: 6
      }]
    },
    options: {
      scales: { y: { beginAtZero: true } }
    }
  });

  // ===== Biểu đồ Tình trạng phòng =====
  const roomStatusLabels = roomStatus.map(r => r.dataValues.status);
  const roomStatusCounts = roomStatus.map(r => r.dataValues.count);

  const ctx2 = document.getElementById('roomStatusChart');
  new Chart(ctx2, {
    type: 'bar',
    data: {
      labels: roomStatusLabels,
      datasets: [{
        label: 'Số lượng phòng',
        data: roomStatusCounts,
        backgroundColor: ['#7dd3fc', '#38bdf8', '#0ea5e9', '#0369a1']
      }]
    },
    options: {
      indexAxis: 'y',
      scales: { x: { beginAtZero: true } }
    }
  });
});
