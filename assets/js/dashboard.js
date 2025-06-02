// Single instance check
let dashboardInitialized = false;

document.addEventListener("DOMContentLoaded", function () {
  // Prevent multiple initializations
  if (dashboardInitialized) {
    console.warn("Dashboard already initialized");
    return;
  }
  dashboardInitialized = true;

  let updateInterval = null;
  let salesChart = null;
  let productsChart = null;

  // Initialize Sales Overview Chart
  const salesCtx = document.getElementById("salesChart");
  if (salesCtx) {
    try {
      salesChart = new Chart(salesCtx.getContext("2d"), {
        type: "line",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [
            {
              label: "Sales",
              data: [1200, 1900, 1500, 2100, 1800, 2400],
              borderColor: "#0d6efd",
              backgroundColor: "rgba(13, 110, 253, 0.1)",
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                drawBorder: false,
              },
            },
            x: {
              grid: {
                display: false,
              },
            },
          },
        },
      });
    } catch (error) {
      console.error("Failed to initialize sales chart:", error);
    }
  }

  // Initialize Top Products Chart
  const productsCtx = document.getElementById("productsChart");
  if (productsCtx) {
    try {
      productsChart = new Chart(productsCtx.getContext("2d"), {
        type: "doughnut",
        data: {
          labels: ["Product A", "Product B", "Product C", "Others"],
          datasets: [
            {
              data: [35, 25, 20, 20],
              backgroundColor: ["#0d6efd", "#198754", "#ffc107", "#6c757d"],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
            },
          },
        },
      });
    } catch (error) {
      console.error("Failed to initialize products chart:", error);
    }
  }

  // Handle logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (confirm("Are you sure you want to logout?")) {
        cleanupDashboard();
        window.location.href = "index.html";
      }
    });
  }

  // Cleanup function
  function cleanupDashboard() {
    if (updateInterval) {
      clearInterval(updateInterval);
      updateInterval = null;
    }
    if (salesChart) {
      salesChart.destroy();
      salesChart = null;
    }
    if (productsChart) {
      productsChart.destroy();
      productsChart = null;
    }
  }

  // Fetch and update real-time data
  function updateDashboardData() {
    // Simulate API call to fetch updated data
    const mockData = {
      totalSales: "$12,450",
      transactions: "245",
      activeBuyers: "128",
      products: "56",
    };

    // Update dashboard statistics
    updateStatistics(mockData);

    // Update charts with new data (if needed)
    if (salesChart && salesChart.data) {
      salesChart.update("none"); // Use 'none' for better performance
    }
    if (productsChart && productsChart.data) {
      productsChart.update("none"); // Use 'none' for better performance
    }
  }

  function updateStatistics(data) {
    const elements = {
      totalSales: document.querySelector(".bg-primary .card-body h3"),
      transactions: document.querySelector(".bg-success .card-body h3"),
      activeBuyers: document.querySelector(".bg-info .card-body h3"),
      products: document.querySelector(".bg-warning .card-body h3"),
    };

    // Only update if elements exist
    if (elements.totalSales) elements.totalSales.textContent = data.totalSales;
    if (elements.transactions)
      elements.transactions.textContent = data.transactions;
    if (elements.activeBuyers)
      elements.activeBuyers.textContent = data.activeBuyers;
    if (elements.products) elements.products.textContent = data.products;
  }

  // Initial update
  updateDashboardData();

  // Start interval for updates - only if not already running
  if (!updateInterval) {
    updateInterval = setInterval(updateDashboardData, 300000); // Update every 5 minutes
  }

  // Cleanup on page unload
  window.addEventListener("unload", cleanupDashboard);

  // Cleanup on page hide
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      cleanupDashboard();
    }
  });
});
