document.addEventListener("DOMContentLoaded", function () {
  // Initialize cart and first add flag
  let cart = new Map();
  let isFirstAdd = true;
  const products = {
    matcha: {
      name: "Matcha",
      price: 120,
      description: "Premium green tea latte with a smooth, creamy texture",
      image: "matcha.jpg",
    },
    "iced-latte": {
      name: "Iced Latte",
      price: 125,
      description: "Espresso mixed with cold milk and ice",
      image: "iced-latte.jpg",
    },
    frappe: {
      name: "Frappe",
      price: 135,
      description: "Blended coffee drink topped with whipped cream",
      image: "frappe.jpg",
    },
    "coffee-jelly": {
      name: "Coffee Jelly",
      price: 125,
      description: "Coffee-flavored jelly in sweet cream",
      image: "coffee-jelly.jpg",
    },
    shade: {
      name: "Shade",
      price: 130,
      description: "Our signature layered coffee drink",
      image: "shade.jpg",
    },
    caramel: {
      name: "Caramel",
      price: 125,
      description: "Rich coffee with caramel syrup and milk",
      image: "caramel.jpg",
    },
    "pumpkin-coffee": {
      name: "Pumpkin Coffee",
      price: 135,
      description: "Seasonal coffee with pumpkin spice",
      image: "pumpkin-coffee.jpg",
    },
    "choco-coffee": {
      name: "Choco Coffee",
      price: 140,
      description: "Coffee blended with premium chocolate",
      image: "choco-coffee.jpg",
    },
  };

  // Initialize cart button
  const viewCartBtn = document.getElementById("viewCartBtn");
  viewCartBtn.addEventListener("click", function () {
    const cartOffcanvas = new bootstrap.Offcanvas(
      document.getElementById("cartModal")
    );
    cartOffcanvas.show();
  });

  // View details function
  window.viewDetails = function (productId) {
    const product = products[productId];
    const modal = new bootstrap.Modal(document.getElementById("productModal"));

    document.getElementById("productModalLabel").textContent = product.name;
    document.getElementById(
      "productModalImage"
    ).src = `assets/img/${product.image}`;
    document.getElementById(
      "productModalPrice"
    ).textContent = `₱${product.price}`;
    document.getElementById("productModalDescription").textContent =
      product.description;

    // Set the product ID for the Add to Cart button
    document
      .querySelector("#productModal .btn-success")
      .setAttribute("data-product-id", productId);

    modal.show();
  };

  // Update quantity function
  window.updateQuantity = function (productId, change) {
    const input = document.getElementById(`qty-${productId}`);
    let value = parseInt(input.value) + change;
    value = Math.max(1, value); // Minimum quantity is 1
    input.value = value;
  };

  // Add to cart function
  window.addToCart = function (productId) {
    const product = products[productId];

    if (cart.has(productId)) {
      const currentQty = cart.get(productId).quantity;
      cart.set(productId, {
        name: product.name,
        price: product.price,
        quantity: currentQty + 1,
        image: product.image,
      });
    } else {
      cart.set(productId, {
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
      });
    }

    updateCartUI();
    showNotification(`Added ${product.name} to cart`, "success");

    // Only show cart panel on first add
    if (isFirstAdd) {
      const cartOffcanvas = new bootstrap.Offcanvas(
        document.getElementById("cartModal")
      );
      cartOffcanvas.show();
      isFirstAdd = false;
    }
  };

  // Update cart UI
  function updateCartUI() {
    const cartCount = document.getElementById("cartCount");
    const cartItemsContainer = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");
    const buyButton = document.getElementById("buyButton");

    let totalQuantity = 0;
    let totalAmount = 0;
    let cartHTML = "";

    cart.forEach((item, productId) => {
      totalQuantity += item.quantity;
      const itemTotal = item.price * item.quantity;
      totalAmount += itemTotal;

      cartHTML += `
        <div class="cart-item">
          <img src="assets/img/${item.image}" class="cart-item-image" alt="${item.name}">
          <div class="cart-item-details">
            <h6 class="cart-item-title">${item.name}</h6>
            <div class="cart-item-price">₱${item.price}</div>
            <div class="cart-item-quantity">
              <button class="quantity-btn" onclick="updateCartQuantity('${productId}', -1)">-</button>
              <input type="number" class="quantity-input" value="${item.quantity}" min="1" 
                onchange="updateCartQuantity('${productId}', 0, this.value)">
              <button class="quantity-btn" onclick="updateCartQuantity('${productId}', 1)">+</button>
            </div>
          </div>
          <div class="cart-item-total">₱${itemTotal}</div>
        </div>
      `;
    });

    if (cart.size === 0) {
      cartHTML =
        '<div class="text-center p-4 text-muted">Your cart is empty</div>';
    }

    cartCount.textContent = totalQuantity;
    cartItemsContainer.innerHTML = cartHTML;
    cartTotal.textContent = `₱${totalAmount}`;

    // Update cart buttons
    const cartButtons = document.getElementById("cartButtons");
    if (cart.size > 0) {
      cartButtons.innerHTML = `
        <button class="btn w-100 mb-2" style="background-color: #2F5851; color: white;" onclick="proceedToBuy()">
          Buy
        </button>
        <button class="btn w-100" style="border: 1px solid #2F5851; background: white; color: #2F5851;" data-bs-dismiss="offcanvas">
          Close
        </button>
      `;
    } else {
      cartButtons.innerHTML = `
        <button class="btn w-100" style="border: 1px solid #2F5851; background: white; color: #2F5851;" data-bs-dismiss="offcanvas">
          Close
        </button>
      `;
    }

    // Update proceed to buy button visibility
    const proceedToBuyBtn = document.getElementById("proceedToBuyBtn");
    if (proceedToBuyBtn) {
      proceedToBuyBtn.style.display = cart.size > 0 ? "block" : "none";
    }
  }

  // Update cart quantity
  window.updateCartQuantity = function (productId, change, newValue = null) {
    if (!cart.has(productId)) return;

    const item = cart.get(productId);
    if (newValue !== null) {
      item.quantity = Math.max(0, parseInt(newValue));
    } else {
      item.quantity = Math.max(0, item.quantity + change);
    }

    if (item.quantity === 0) {
      cart.delete(productId);
    } else {
      cart.set(productId, item);
    }

    updateCartUI();
  };

  // Remove from cart
  window.removeFromCart = function (productId) {
    cart.delete(productId);
    updateCartUI();
    showNotification("Item removed from cart", "info");
  };

  // Proceed to buy
  window.proceedToBuy = function () {
    if (cart.size === 0) return;

    const cartOffcanvas = bootstrap.Offcanvas.getInstance(
      document.getElementById("cartModal")
    );
    cartOffcanvas.hide();

    const fingerprintModal = new bootstrap.Modal(
      document.getElementById("fingerprintModal")
    );
    fingerprintModal.show();

    // Simulate fingerprint verification
    const progressBar = document.querySelector(
      "#fingerprintModal .progress-bar"
    );
    const statusText = document.querySelector("#fingerprintModal .text-muted");
    let progress = 0;

    const verificationInterval = setInterval(() => {
      progress += 20;
      progressBar.style.width = `${progress}%`;

      if (progress < 100) {
        statusText.textContent = "Scanning fingerprint...";
      } else {
        statusText.textContent = "Fingerprint verified!";
        clearInterval(verificationInterval);

        setTimeout(() => {
          fingerprintModal.hide();
          showSuccessModal();
        }, 500);
      }
    }, 500);
  };

  // Show success modal
  function showSuccessModal() {
    const total = Array.from(cart.values()).reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const date = new Date().toLocaleDateString();

    document.getElementById("transactionDate").textContent = date;
    document.getElementById("transactionAmount").textContent = `₱${total}`;

    const successModal = new bootstrap.Modal(
      document.getElementById("successModal")
    );
    successModal.show();

    // Clear cart after successful purchase
    cart.clear();
    updateCartUI();
  }

  // Print receipt
  window.printReceipt = function () {
    window.print();
  };

  // Show notification function
  function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    notification.style.zIndex = "1050";
    notification.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }

  // Handle search
  const searchInput = document.querySelector(
    'input[placeholder="Search drinks..."]'
  );
  if (searchInput) {
    searchInput.addEventListener("input", function (e) {
      const searchTerm = e.target.value.toLowerCase();
      document.querySelectorAll(".card").forEach((card) => {
        const title = card
          .querySelector(".card-title")
          .textContent.toLowerCase();
        const shouldShow = title.includes(searchTerm);
        card.closest(".col-md-3").style.display = shouldShow ? "" : "none";
      });
    });
  }

  // Handle logout
  document.getElementById("logoutBtn").addEventListener("click", function (e) {
    e.preventDefault();
    if (confirm("Are you sure you want to logout?")) {
      window.location.href = "index.html";
    }
  });

  // Initialize cart UI
  updateCartUI();

  // Initialize proceed to buy button
  const proceedToBuyBtn = document.getElementById("proceedToBuyBtn");
  if (proceedToBuyBtn) {
    proceedToBuyBtn.addEventListener("click", proceedToBuy);
  }
});
