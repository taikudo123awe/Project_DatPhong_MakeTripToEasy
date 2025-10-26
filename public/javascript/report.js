document.addEventListener("DOMContentLoaded", () => {
  const { revenueData, roomRevenue, roomStatus } = window.reportData;
  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get("type") || "month";

  // ===== 1️⃣ Biểu đồ doanh thu theo thời gian =====
  const revenueLabels = revenueData.map(r => {
    if (type === "month" || type === "week") {
      const date = new Date(r.time);
      return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
    } else if (type === "year") {
      return "Tháng " + r.time;
    } else if (type === "all") {
      return r.time.toString();
    }
    return r.time;
  });

  const revenueTotals = revenueData.map(r => r.total);

  new Chart(document.getElementById("revenueChart"), {
    type: "bar",
    data: {
      labels: revenueLabels,
      datasets: [{
        label: "Doanh thu (VNĐ)",
        data: revenueTotals,
        backgroundColor: "rgba(54, 162, 235, 0.7)",
        borderRadius: 6
      }]
    },
    options: {
      scales: { y: { beginAtZero: true } },
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => ctx.parsed.y.toLocaleString("vi-VN") + " VNĐ"
          }
        }
      }
    }
  });

  // ===== 2️⃣ Biểu đồ doanh thu theo từng phòng =====
  const roomNames = roomRevenue.map(r => r.Booking.Room.roomName);
  const roomTotals = roomRevenue.map(r => r.total);

  new Chart(document.getElementById("roomRevenueChart"), {
    type: "bar",
    data: {
      labels: roomNames,
      datasets: [{
        label: "Doanh thu phòng (VNĐ)",
        data: roomTotals,
        backgroundColor: ["#60a5fa", "#38bdf8", "#0ea5e9", "#0284c7", "#0369a1"]
      }]
    },
    options: { scales: { y: { beginAtZero: true } } }
  });

  // ===== 3️⃣ Biểu đồ tình trạng phòng =====
  const statusLabels = roomStatus.map(r => r.status);
  const statusCounts = roomStatus.map(r => r.count);

  new Chart(document.getElementById("roomStatusChart"), {
    type: "bar",
    data: {
      labels: statusLabels,
      datasets: [{
        label: "Số lượng phòng",
        data: statusCounts,
        backgroundColor: ["#4ade80", "#22c55e", "#16a34a", "#15803d", "#166534"]
      }]
    },
    options: {
      indexAxis: "y",
      scales: { x: { beginAtZero: true } }
    }
  });
});
