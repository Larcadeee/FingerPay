document.addEventListener("DOMContentLoaded", function () {
  // Handle buyer form submissions
  const addBuyerForm = document.getElementById("addBuyerForm");
  const editBuyerForm = document.getElementById("editBuyerForm");

  if (addBuyerForm) {
    addBuyerForm.addEventListener("submit", function (e) {
      e.preventDefault();
      // Get form data
      const formData = new FormData(this);

      // Simulate API call to add buyer
      console.log("Adding new buyer:", Object.fromEntries(formData));

      // Close modal and reset form
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("addBuyerModal")
      );
      modal.hide();
      this.reset();

      // Show success message
      showNotification("Buyer added successfully!", "success");
    });
  }

  if (editBuyerForm) {
    editBuyerForm.addEventListener("submit", function (e) {
      e.preventDefault();
      // Get form data
      const formData = new FormData(this);

      // Simulate API call to update buyer
      console.log("Updating buyer:", Object.fromEntries(formData));

      // Close modal
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("editBuyerModal")
      );
      modal.hide();

      // Show success message
      showNotification("Buyer updated successfully!", "success");
    });
  }

  // Handle buyer deletion
  document.querySelectorAll(".btn-danger").forEach((button) => {
    button.addEventListener("click", function () {
      if (confirm("Are you sure you want to delete this buyer?")) {
        // Simulate API call to delete buyer
        console.log("Deleting buyer");

        // Show success message
        showNotification("Buyer deleted successfully!", "success");
      }
    });
  });

  // Handle fingerprint registration
  let fingerprintProgress = 0;
  const fingerprintModal = document.getElementById("fingerprintModal");
  if (fingerprintModal) {
    fingerprintModal.addEventListener("show.bs.modal", function () {
      // Reset progress
      fingerprintProgress = 0;
      const progressBar = this.querySelector(".progress-bar");
      const statusText = this.querySelector(".text-muted");

      // Simulate fingerprint scanning process
      const scanInterval = setInterval(() => {
        fingerprintProgress += 20;
        progressBar.style.width = `${fingerprintProgress}%`;

        if (fingerprintProgress < 100) {
          statusText.textContent = "Scanning fingerprint...";
        } else {
          statusText.textContent = "Fingerprint registered successfully!";
          clearInterval(scanInterval);

          // Show success message and close modal after delay
          setTimeout(() => {
            const modal = bootstrap.Modal.getInstance(fingerprintModal);
            modal.hide();
            showNotification("Fingerprint registered successfully!", "success");
          }, 1000);
        }
      }, 500);
    });
  }

  // Handle buyer search
  const searchInput = document.querySelector(
    'input[placeholder="Search buyers..."]'
  );
  if (searchInput) {
    searchInput.addEventListener("input", function (e) {
      const searchTerm = e.target.value.toLowerCase();

      // Simulate buyer filtering
      // In a real application, this would filter actual buyer data
      console.log("Searching for:", searchTerm);
    });
  }

  // Handle status filter
  const statusFilter = document.querySelector("select.form-select");
  if (statusFilter) {
    statusFilter.addEventListener("change", function (e) {
      const selectedStatus = e.target.value;

      // Simulate status filtering
      // In a real application, this would filter buyers by status
      console.log("Filtering by status:", selectedStatus);
    });
  }

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

  // Handle logout
  document.getElementById("logoutBtn").addEventListener("click", function (e) {
    e.preventDefault();
    if (confirm("Are you sure you want to logout?")) {
      // Perform logout action
      window.location.href = "index.html";
    }
  });
});
