// Global variables
let cart = [];
let currentSlide = 0;
let testimonialIndex = 0;
let currentCheckoutStep = 1;
let selectedPaymentMethod = null;

// Products data
const products = [
    {
        id: 1,
        name: "kulambu masala / 50grm",
        description: "Fresh, crispy red apples packed with nutrients and natural sweetness.",
        price: 45,
        image: "003.jpg",
        rating: 4.8,
        badge: "Popular"
    },
    {
        id: 2,
        name: "mutton masala / 50grm",
        description: "Naturally sweet bananas perfect for smoothies and snacking.",
        price: 45,
        image: "004.jpg",
        rating: 4.6,
        badge: "Organic"
    },
    {
        id: 3,
        name: "sambar powder / 50grm",
        description: "Tropical mangoes bursting with flavor and vitamin C.",
        price: 45,
        image: "005.jpg",
        rating: 4.9,
        badge: "Seasonal"
    },
    {
        id: 4,
        name: "Puliyogare powder / 50grm",
        description: "Sweet and seedless grapes perfect for healthy snacking.",
        price: 40,
        image: "006.jpg",
        rating: 4.7,
        badge: "Fresh"
    },
    {
        id: 5,
        name: "Rasam powder / 50grm",
        description: "Juicy oranges packed with vitamin C and natural citrus flavor.",
        price: 45,
        image: "007.jpg",
        rating: 4.5,
        badge: "Vitamin C"
    },
    {
        id: 6,
        name: "chicken masala / 50grm",
        description: "Sweet, red strawberries perfect for desserts and smoothies.",
        price: 45,
        image: "008.jpg",
        rating: 4.8,
        badge: "Premium"
    }
];

// DOM Elements
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartCount = document.getElementById('cart-count');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const productsGrid = document.getElementById('products-grid');
const checkoutModal = document.getElementById('checkout-modal');
const confirmationModal = document.getElementById('confirmation-modal');
const testimonialTrack = document.getElementById('testimonial-track');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadProducts();
    setupEventListeners();
    setupScrollEffects();
});

// Initialize application
function initializeApp() {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('freshFruitsCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartDisplay();
    }
    
    // Set up navigation highlighting
    highlightActiveNavigation();
}

// Setup event listeners
function setupEventListeners() {
    // Mobile menu toggle
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
    
    // Navigation link clicks
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            scrollToSection(targetId);
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
    
    // Newsletter form
    const newsletterForm = document.getElementById('newsletter-form');
    newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    
    // Contact form
    const contactForm = document.getElementById('contact-form');
    contactForm.addEventListener('submit', handleContactSubmit);
    
    // Checkout form
    const checkoutForm = document.getElementById('checkout-form');
    checkoutForm.addEventListener('submit', handleCheckoutSubmit);
    
    // Scroll event for navbar
    window.addEventListener('scroll', handleNavbarScroll);
    
    // Window resize event
    window.addEventListener('resize', handleWindowResize);
    
    // Close modals on overlay click
    checkoutModal.addEventListener('click', (e) => {
        if (e.target === checkoutModal) {
            closeCheckout();
        }
    });
    
    confirmationModal.addEventListener('click', (e) => {
        if (e.target === confirmationModal) {
            closeConfirmation();
        }
    });
}

// Load and display products
function loadProducts() {
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

// Create product card element
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            <div class="product-badge">${product.badge}</div>
        </div>
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-details">
                <span class="product-price">₹${product.price.toFixed(2)}</span>
                <div class="product-rating">
                    ${generateStarRating(product.rating)}
                    <span class="rating-text">(${product.rating})</span>
                </div>
            </div>
            <button class="add-to-cart" onclick="addToCart(${product.id})">
                <i class="fas fa-shopping-cart"></i> Add to Cart
            </button>
        </div>
    `;
    return card;
}

// Generate star rating HTML
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// Cart functionality
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    updateCartDisplay();
    saveCartToLocalStorage();
    showCartAnimation();
    
    // Show notification
    showNotification(`${product.name} added to cart!`, 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
    saveCartToLocalStorage();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        updateCartDisplay();
        saveCartToLocalStorage();
    }
}

function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const cartCountElement = document.getElementById('cart-count');
    const checkoutBtnElement = document.getElementById('checkout-btn');
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.textContent = totalItems;
    
    // Update cart items display
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        checkoutBtnElement.disabled = true;
    } else {
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">₹${item.price.toFixed(2)}</div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                        <button class="remove-item" onclick="removeFromCart(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        checkoutBtnElement.disabled = false;
    }
    
    // Update cart total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalElement.textContent = total.toFixed(2);
}

function toggleCart() {
    cartSidebar.classList.toggle('active');
    cartOverlay.classList.toggle('active');
    document.body.style.overflow = cartSidebar.classList.contains('active') ? 'hidden' : 'auto';
}

function saveCartToLocalStorage() {
    localStorage.setItem('freshFruitsCart', JSON.stringify(cart));
}

function showCartAnimation() {
    const cartBtn = document.querySelector('.cart-btn');
    cartBtn.style.transform = 'scale(1.2)';
    setTimeout(() => {
        cartBtn.style.transform = 'scale(1)';
    }, 200);
}

// Testimonial slider
function moveTestimonial(direction) {
    const testimonials = document.querySelectorAll('.testimonial');
    const totalTestimonials = testimonials.length;
    
    testimonialIndex = (testimonialIndex + direction + totalTestimonials) % totalTestimonials;
    
    const translateX = -testimonialIndex * 100;
    testimonialTrack.style.transform = `translateX(${translateX}%)`;
}

// Auto-rotate testimonials
setInterval(() => {
    moveTestimonial(1);
}, 8000);

// Checkout functionality
function showCheckout() {
    if (cart.length === 0) return;
    
    checkoutModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    currentCheckoutStep = 1;
    selectedPaymentMethod = null;
    updateCheckoutDisplay();
    populateOrderSummary();
    resetPaymentSelection();
}

function closeCheckout() {
    checkoutModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    currentCheckoutStep = 1;
    selectedPaymentMethod = null;
    resetCheckoutForm();
    resetPaymentSelection();
}

function nextStep() {
    if (validateCurrentStep()) {
        currentCheckoutStep++;
        updateCheckoutDisplay();
        
        // If moving to step 3 (payment), update payment method display
        if (currentCheckoutStep === 3) {
            updatePaymentMethodDisplay();
        }
        
        // If moving to step 4 (review), update all information
        if (currentCheckoutStep === 4) {
            updateReviewStep();
        }
    }
}

function prevStep() {
    currentCheckoutStep--;
    updateCheckoutDisplay();
}

function updateCheckoutDisplay() {
    // Update step indicators
    const steps = document.querySelectorAll('.step');
    const checkoutSteps = document.querySelectorAll('.checkout-step');
    
    steps.forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index + 1 === currentCheckoutStep) {
            step.classList.add('active');
        } else if (index + 1 < currentCheckoutStep) {
            step.classList.add('completed');
        }
    });
    
    // Show current step content
    checkoutSteps.forEach((step, index) => {
        step.classList.remove('active');
        if (index + 1 === currentCheckoutStep) {
            step.classList.add('active');
        }
    });
}

function validateCurrentStep() {
    const currentStep = document.querySelector(`[data-step="${currentCheckoutStep}"]`);
    const inputs = currentStep.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        const formGroup = input.closest('.form-group');
        const errorMessage = formGroup.querySelector('.error-message');
        
        if (!input.value.trim()) {
            formGroup.classList.add('error');
            errorMessage.textContent = 'This field is required';
            isValid = false;
        } else if (input.type === 'email' && !isValidEmail(input.value)) {
            formGroup.classList.add('error');
            errorMessage.textContent = 'Please enter a valid email address';
            isValid = false;
        } else if (input.type === 'tel' && !isValidPhone(input.value)) {
            formGroup.classList.add('error');
            errorMessage.textContent = 'Please enter a valid phone number';
            isValid = false;
        } else {
            formGroup.classList.remove('error');
            errorMessage.textContent = '';
        }
    });
    
    // Special validation for step 3 (payment)
    if (currentCheckoutStep === 3 && !selectedPaymentMethod) {
        showNotification('Please select a payment method', 'error');
        isValid = false;
    }
    
    return isValid;
}

function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    
    // Remove selected class from all payment options
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selected class to chosen option
    document.getElementById(`${method}-payment`).classList.add('selected');
    
    // Show payment details
    const paymentDetails = document.getElementById('payment-details');
    paymentDetails.style.display = 'block';
    
    // Hide all payment detail sections
    document.getElementById('upi-details').style.display = 'none';
    document.getElementById('card-details').style.display = 'none';
    document.getElementById('cod-details').style.display = 'none';
    
    // Show selected payment detail section
    document.getElementById(`${method}-details`).style.display = 'block';
    
    // Update payment method label
    const labels = {
        'upi': 'UPI Payment Details',
        'card': 'Card Payment Details',
        'cod': 'Cash on Delivery'
    };
    document.getElementById('payment-method-label').textContent = labels[method];
    
    updatePaymentMethodDisplay();
}

function resetPaymentSelection() {
    selectedPaymentMethod = null;
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.getElementById('payment-details').style.display = 'none';
    document.getElementById('payment-method-display').textContent = 'None selected';
}

function updatePaymentMethodDisplay() {
    if (selectedPaymentMethod) {
        const methodNames = {
            'upi': 'UPI Payment',
            'card': 'Credit/Debit Card',
            'cod': 'Cash on Delivery'
        };
        document.getElementById('payment-method-display').textContent = methodNames[selectedPaymentMethod];
    }
}

function populateOrderSummary() {
    const orderSummary = document.getElementById('order-summary');
    const subtotalElement = document.getElementById('subtotal');
    const deliveryFeeElement = document.getElementById('delivery-fee');
    const finalTotalElement = document.getElementById('final-total');
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 50;
    const finalTotal = subtotal + deliveryFee;
    
    orderSummary.innerHTML = cart.map(item => `
        <div class="order-item">
            <div class="item-info">
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p>Quantity: ${item.quantity}</p>
                </div>
            </div>
            <div class="item-price">₹${(item.price * item.quantity).toFixed(2)}</div>
        </div>
    `).join('');
    
    subtotalElement.textContent = subtotal.toFixed(2);
    deliveryFeeElement.textContent = deliveryFee.toFixed(2);
    finalTotalElement.textContent = finalTotal.toFixed(2);
}

function updateReviewStep() {
    // Update payment method display in review step
    updatePaymentMethodDisplay();
    
    // You could also update other review information here
}

function resetCheckoutForm() {
    document.getElementById('checkout-form').reset();
    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('error');
    });
    document.querySelectorAll('.error-message').forEach(error => {
        error.textContent = '';
    });
}

function handleCheckoutSubmit(e) {
    e.preventDefault();
    
    if (validateCurrentStep()) {
        if (!selectedPaymentMethod) {
            showNotification('Please select a payment method', 'error');
            return;
        }
        
        // Generate order number
        const orderNumber = 'FF' + Date.now().toString().slice(-8);
        
        // Calculate delivery date (2-3 days from now)
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + Math.floor(Math.random() * 2) + 2);
        const deliveryDateString = deliveryDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        // Show confirmation
        document.getElementById('order-number').textContent = orderNumber;
        document.getElementById('delivery-date').textContent = deliveryDateString;
        
        closeCheckout();
        confirmationModal.classList.add('active');
        
        // Clear cart
        cart = [];
        updateCartDisplay();
        saveCartToLocalStorage();
        
        // Hide confirmation after 10 seconds
        setTimeout(() => {
            closeConfirmation();
        }, 10000);
    }
}

function closeConfirmation() {
    confirmationModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Form handlers
function handleNewsletterSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('newsletter-email').value;
    const messageElement = document.getElementById('newsletter-message');
    
    if (!isValidEmail(email)) {
        messageElement.textContent = 'Please enter a valid email address';
        messageElement.className = 'newsletter-message error';
        return;
    }
    
    // Simulate API call
    messageElement.textContent = 'Subscribing...';
    messageElement.className = 'newsletter-message';
    
    setTimeout(() => {
        messageElement.textContent = 'Thank you for subscribing to our newsletter!';
        messageElement.className = 'newsletter-message success';
        document.getElementById('newsletter-form').reset();
        
        setTimeout(() => {
            messageElement.textContent = '';
        }, 3000);
    }, 1000);
}

function handleContactSubmit(e) {
    e.preventDefault();
    const messageElement = document.getElementById('contact-message');
    
    // Simulate API call
    messageElement.textContent = 'Sending message...';
    messageElement.className = 'contact-message';
    
    setTimeout(() => {
        messageElement.textContent = 'Thank you! Your message has been sent successfully.';
        messageElement.className = 'contact-message success';
        document.getElementById('contact-form').reset();
        
        setTimeout(() => {
            messageElement.textContent = '';
        }, 5000);
    }, 1000);
}

// Utility functions
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const navHeight = document.querySelector('.navbar').offsetHeight;
        const sectionTop = section.offsetTop - navHeight - 20;
        
        window.scrollTo({
            top: sectionTop,
            behavior: 'smooth'
        });
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '100px',
        right: '20px',
        padding: '15px 20px',
        background: type === 'success' ? '#4CAF50' : type === 'error' ? '#dc3545' : '#2196F3',
        color: 'white',
        borderRadius: '8px',
        zIndex: '5000',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        transform: 'translateX(400px)',
        transition: 'transform 0.3s ease'
    });
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function highlightActiveNavigation() {
    const sections = ['home', 'about', 'products', 'contact'];
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach((sectionId, index) => {
            const section = document.getElementById(sectionId);
            if (section) {
                const sectionTop = section.offsetTop;
                const sectionBottom = sectionTop + section.offsetHeight;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    const activeLink = document.querySelector(`[href="#${sectionId}"]`);
                    if (activeLink) activeLink.classList.add('active');
                }
            }
        });
    });
}

function handleNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

function handleWindowResize() {
    // Close mobile menu on desktop
    if (window.innerWidth > 768) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    }
    
    // Adjust cart sidebar width on mobile
    if (window.innerWidth <= 480) {
        cartSidebar.style.width = '100%';
    } else {
        cartSidebar.style.width = '400px';
    }
}

function setupScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for scroll animations
    document.querySelectorAll('.product-card, .feature, .testimonial, .contact-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Keyboard navigation support
document.addEventListener('keydown', (e) => {
    // Escape key to close modals
    if (e.key === 'Escape') {
        if (checkoutModal.classList.contains('active')) {
            closeCheckout();
        }
        if (confirmationModal.classList.contains('active')) {
            closeConfirmation();
        }
        if (cartSidebar.classList.contains('active')) {
            toggleCart();
        }
    }
});

// Performance optimization: Lazy loading for images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Export functions for global access
window.toggleCart = toggleCart;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.moveTestimonial = moveTestimonial;
window.showCheckout = showCheckout;
window.closeCheckout = closeCheckout;
window.nextStep = nextStep;
window.prevStep = prevStep;
window.closeConfirmation = closeConfirmation;
window.scrollToSection = scrollToSection;
window.selectPaymentMethod = selectPaymentMethod;
