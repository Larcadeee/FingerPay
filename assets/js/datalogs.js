document.addEventListener("DOMContentLoaded", function () {
  // Initialize date range filter
  const dateRangeSelect = document.querySelector('select[class="form-select"]');
  if (dateRangeSelect) {
    dateRangeSelect.addEventListener("change", function (e) {
      const selectedRange = e.target.value;
      filterLogs();
    });
  }

  // Initialize log type filter
  const logTypeSelect = document.querySelectorAll(
    'select[class="form-select"]'
  )[1];
  if (logTypeSelect) {
    logTypeSelect.addEventListener("change", function (e) {
      const selectedType = e.target.value;
      filterLogs();
    });
  }

  // Initialize status filter
  const statusSelect = document.querySelectorAll(
    'select[class="form-select"]'
  )[2];
  if (statusSelect) {
    statusSelect.addEventListener("change", function (e) {
      const selectedStatus = e.target.value;
      filterLogs();
    });
  }

  // Initialize search functionality
  const searchInput = document.querySelector(
    'input[placeholder="Search logs..."]'
  );
  if (searchInput) {
    searchInput.addEventListener("input", function (e) {
      filterLogs();
    });
  }

  // Filter logs based on all criteria
  function filterLogs() {
    const dateRange = dateRangeSelect.value;
    const logType = logTypeSelect.value;
    const status = statusSelect.value;
    const searchTerm = searchInput.value.toLowerCase();

    // Simulate API call with filters
    console.log("Filtering logs:", {
      dateRange,
      logType,
      status,
      searchTerm,
    });

    // In a real application, this would make an API call and update the table
    showNotification("Logs filtered successfully", "info");
  }

  // Handle export logs
  document
    .querySelector(".btn-outline-primary")
    .addEventListener("click", function () {
      // Simulate export process
      showNotification("Exporting logs...", "info");

      // In a real application, this would trigger a file download
      setTimeout(() => {
        showNotification("Logs exported successfully!", "success");
      }, 1500);
    });

  // Handle view details
  document.querySelectorAll('[data-bs-toggle="modal"]').forEach((button) => {
    button.addEventListener("click", function () {
      // In a real application, this would fetch transaction details
      console.log("Viewing transaction details");
    });
  });

  // Handle print functionality
  document.querySelectorAll(".btn-secondary").forEach((button) => {
    button.addEventListener("click", function () {
      // In a real application, this would open print dialog
      window.print();
    });
  });

  // Show notification function
  function showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    notification.role = "alert";
    notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

    // Add to document
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Handle pagination
  document.querySelectorAll(".pagination .page-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      // Remove active class from all pages
      document.querySelectorAll(".pagination .page-item").forEach((item) => {
        item.classList.remove("active");
      });

      // Add active class to clicked page
      if (!this.parentElement.classList.contains("disabled")) {
        this.parentElement.classList.add("active");

        // In a real application, this would fetch the next page of logs
        console.log("Loading page:", this.textContent);
        filterLogs();
      }
    });
  });

  // Handle logout
  document.getElementById("logoutBtn").addEventListener("click", function (e) {
    e.preventDefault();
    if (confirm("Are you sure you want to logout?")) {
      // Perform logout action
      window.location.href = "index.html";
    }
  });

  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Handle custom date range
  dateRangeSelect.addEventListener("change", function (e) {
    if (e.target.value === "custom") {
      // In a real application, this would show a date picker
      showNotification("Custom date range picker would appear here", "info");
    }
  });

  // Initial load
  filterLogs();
});
