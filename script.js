const menu = document.getElementById("menu");
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const closeModalBtn = document.getElementById("close-btn");
const cartCounter = document.getElementById("cart-count");
const addressInput = document.getElementById("address");
const nameInput = document.getElementById("name");
const typePaymentForm = document.getElementById("type_payment");
const inputWarn = document.getElementById("warning");

let cart = [];

// Open cart modal
cartBtn.addEventListener("click", function() {
    updateCartModal();
    cartModal.style.display = "flex";
});

// Close modal when clicking away
cartModal.addEventListener("click", function(event) {
    if (event.target === cartModal) {
        cartModal.style.display = "none";
    }
});

// Close modal when clicking the close button
closeModalBtn.addEventListener("click", function() {
    cartModal.style.display = "none";
});

// Add to cart
menu.addEventListener("click", function(event) {
    const parentButton = event.target.closest(".add-to-cart-btn");
    if (parentButton) {
        const name = parentButton.getAttribute("data-name");
        const price = parseFloat(parentButton.getAttribute("data-price"));
        addToCart(name, price);
    }
});

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }

    Toastify({
        text: "Item Adicionado",
        duration: 3000,
        close: true,
        gravity: "top", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
          background: "#008000",
        },
      }).showToast();
    updateCartModal();
}

// Update cart
function updateCartModal() {
    cartItemsContainer.innerHTML = "";
    let total = 0;
    let totalItems = 0;

    cart.forEach(item => {
        const cartItemElement = document.createElement("div");
        cartItemElement.classList.add("flex", "justify-between", "mb-4", "flex-col");

        cartItemElement.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <p class="font-medium">${item.name}</p>
                    <p>Qtd: ${item.quantity}</p>
                    <p class="font-medium mt-2">${item.price.toFixed(2)}</p>
                </div>
                <div>
                    <button class="remove-btn" data-name="${item.name}">
                        Remover
                    </button>
                </div>
            </div>
        `;

        total += item.price * item.quantity;
        totalItems += item.quantity;

        cartItemsContainer.appendChild(cartItemElement);
    });

    cartTotal.textContent = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

    cartCounter.textContent = totalItems;
}

cartItemsContainer.addEventListener("click", function(event) {
    if (event.target.classList.contains("remove-btn")) {
        const name = event.target.getAttribute("data-name");
        removeItem(name);
    }
});

function removeItem(name) {
    const index = cart.findIndex(item => item.name === name);
    if (index !== -1) {
        const item = cart[index];
        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            cart.splice(index, 1);
        }

        Toastify({
            text: "Item Removido",
            duration: 3000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "right", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
              background: "#ef4444",
            },
          }).showToast();
        updateCartModal();
    }
}

addressInput.addEventListener("input", function(event) {
    const inputValue = event.target.value;
    if (inputValue.trim() !== "") {
        addressInput.classList.remove("border-red-500");
        inputWarn.classList.add("hidden");
    } else {
        addressInput.classList.add("border-red-500");
    }
});

checkoutBtn.addEventListener("click", function() {
    const isOpen = isDeliveryOpen();
    if (!isOpen) {

        Toastify({
            text: "O delivery do Careca está fechado😢",
            duration: 3000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "right", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
              background: "#ef4444",
            },
          }).showToast();
        return;
    }

    const name = nameInput.value.trim();
    const address = addressInput.value.trim();
    const paymentTypeSelected = typePaymentForm.querySelector('input[name="payment"]:checked');

    let valid = true;

    if (name === "") {
        nameInput.classList.add("border-red-500");
        valid = false;
    } else {
        nameInput.classList.remove("border-red-500");
    }

    if (address === "") {
        addressInput.classList.add("border-red-500");
        valid = false;
    } else {
        addressInput.classList.remove("border-red-500");
    }

    if (!paymentTypeSelected) {
        inputWarn.classList.remove("hidden");
        valid = false;
    } else {
        inputWarn.classList.add("hidden");
    }

    if (!valid || cart.length === 0) {
        alert("Por favor, preencha todos os campos e adicione itens ao carrinho.");
        return;
    }

    const cartItems = cart.map((item) => {
        return `(${item.quantity}) - ${item.name}   R$${item.price.toFixed(2)}`;
    }).join("\n");

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

    const message = encodeURIComponent(
        `Pedido Delivery
-----------------------------------------------
Nome: ${name}
Endereço: ${address}
________________
                           PEDIDO

${cartItems}

----------------------------------------------------
Total: ${total}
Forma de pagamento: ${paymentTypeSelected.value}
`
    );
    const phone = "+558186386663";

    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");

    cart = [];
    updateCartModal();
});

function isRestaurantOpen() {
    const data = new Date();
    const day = data.getDay(); // 0 (Sunday) to 6 (Saturday)
    const hour = data.getHours();
    return (day >= 4 && day <= 6) && (hour >= 19 || hour < 3); // Thursday (4) to Saturday (6)
}

const restaurantSpan = document.getElementById("restaurant-span");
const restaurantOpen = isRestaurantOpen();

if (restaurantOpen) {
    restaurantSpan.classList.remove("bg-red-500");
    restaurantSpan.classList.add("bg-green-600");
} else {
    restaurantSpan.classList.remove("bg-green-600");
    restaurantSpan.classList.add("bg-red-500");
}

function isDeliveryOpen() {
    const data = new Date();
    const day = data.getDay(); // 0 (Sunday) to 6 (Saturday)
    const hour = data.getHours();
    return (day >= 1 && day <= 3) && (hour >= 19 && hour < 23); // Monday (1) to Wednesday (3)
}

const deliverySpan = document.getElementById("delivery-span");
const deliveryOpen = isDeliveryOpen();

if (deliveryOpen) {
    deliverySpan.classList.remove("bg-red-500");
    deliverySpan.classList.add("bg-green-600");
} else {
    deliverySpan.classList.remove("bg-green-600");
    deliverySpan.classList.add("bg-red-500");
}
