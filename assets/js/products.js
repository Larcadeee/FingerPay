import supabase from "../../config/supabase.js";

// Fetch all products
async function getProducts() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("name");

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching products:", error.message);
    return [];
  }
}

// Add a new product (admin only)
async function addProduct(product) {
  try {
    const { data, error } = await supabase
      .from("products")
      .insert([product])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding product:", error.message);
    throw error;
  }
}

// Update a product (admin only)
async function updateProduct(productId, updates) {
  try {
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("product_id", productId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating product:", error.message);
    throw error;
  }
}

// Delete a product (admin only)
async function deleteProduct(productId) {
  try {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("product_id", productId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting product:", error.message);
    throw error;
  }
}

export { getProducts, addProduct, updateProduct, deleteProduct };

document.addEventListener("DOMContentLoaded", function () {
  // Initialize product carousel
  if (document.getElementById("productCarousel")) {
    new bootstrap.Carousel(document.getElementById("productCarousel"), {
      interval: 3000,
      wrap: true,
    });
  }

  // Handle product form submissions
  const addProductForm = document.getElementById("addProductForm");
  const editProductForm = document.getElementById("editProductForm");

  if (addProductForm) {
    addProductForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const formData = new FormData(this);

      // Simulate API call to add product
      const productData = {
        name: formData.get("name"),
        price: formData.get("price"),
        image: formData.get("image")?.name,
      };
      console.log("Adding new product:", productData);

      // Close modal and reset form
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("addProductModal")
      );
      modal.hide();
      this.reset();

      showNotification("Product added successfully!", "success");
    });
  }

  if (editProductForm) {
    editProductForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const formData = new FormData(this);

      // Simulate API call to update product
      const productData = {
        name: formData.get("name"),
        price: formData.get("price"),
        image: formData.get("image")?.name,
      };
      console.log("Updating product:", productData);

      // Close modal
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("editProductModal")
      );
      modal.hide();

      showNotification("Product updated successfully!", "success");
    });
  }

  // Handle product deletion
  document.querySelectorAll(".btn-danger").forEach((button) => {
    button.addEventListener("click", function () {
      if (confirm("Are you sure you want to delete this product?")) {
        // Simulate API call to delete product
        console.log("Deleting product");
        showNotification("Product deleted successfully!", "success");
      }
    });
  });

  // Handle image preview
  document.querySelectorAll('input[type="file"]').forEach((input) => {
    input.addEventListener("change", function (e) {
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const preview =
            this.closest(".modal").querySelector(".preview-image");
          if (preview) {
            preview.src = e.target.result;
          }
        }.bind(this);
        reader.readAsDataURL(e.target.files[0]);
      }
    });
  });

  // Show notification function
  function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    notification.role = "alert";
    notification.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }

  // Handle product search
  const searchInput = document.querySelector(
    'input[placeholder="Search products..."]'
  );
  if (searchInput) {
    searchInput.addEventListener("input", function (e) {
      const searchTerm = e.target.value.toLowerCase();
      // Filter products
      document.querySelectorAll(".product-card").forEach((card) => {
        const productName = card
          .querySelector(".card-title")
          .textContent.toLowerCase();
        card.closest(".col-md-4").style.display = productName.includes(
          searchTerm
        )
          ? ""
          : "none";
      });
    });
  }

  // Handle logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (confirm("Are you sure you want to logout?")) {
        window.location.href = "index.html";
      }
    });
  }
});
