// Utility Functions
const showToast = (message, type = 'success') => {
    const toast = document.getElementById('toastNotification');
    const toastBody = toast.querySelector('.toast-body');
    toastBody.textContent = message;
    toast.classList.add(`bg-${type}`);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
};

// Input Sanitization
const sanitizeInput = (input) => {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
};

// Form Validation
const validateForm = (formId, fields) => {
    const form = document.getElementById(formId);
    if (!form) return false;

    let isValid = true;
    fields.forEach(field => {
        const input = form.querySelector(`#${field.id}`);
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('is-invalid');
            input.nextElementSibling.textContent = `${field.label} is required`;
        } else {
            input.classList.remove('is-invalid');
        }
    });
    return isValid;
};

// Image Preview
const handleImageUpload = () => {
    const imageUpload = document.getElementById('itemImages');
    const imagePreview = document.getElementById('imagePreview');
    if (!imageUpload || !imagePreview) return;

    imageUpload.addEventListener('change', () => {
        imagePreview.innerHTML = '';
        if (imageUpload.files.length > 5) {
            showToast('Maximum 5 images allowed', 'danger');
            imageUpload.value = '';
            return;
        }

        Array.from(imageUpload.files).forEach(file => {
            if (file.type.match('image.*')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.classList.add('img-thumbnail');
                    img.style.width = '80px';
                    img.style.height = '80px';
                    img.alt = 'Uploaded product image';
                    imagePreview.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        });
    });
};

// Dark Mode Toggle
const toggleDarkMode = () => {
    const html = document.getElementById('html-root');
    const toggleButton = document.getElementById('darkModeToggle');
    html.classList.toggle('dark-mode');
    const isDark = html.classList.contains('dark-mode');
    toggleButton.innerHTML = `<i class="fas fa-${isDark ? 'sun' : 'moon'}"></i>`;
    localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
};

// Product Search and Filter
const handleProductSearch = () => {
    const searchInput = document.getElementById('productSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    const productList = document.getElementById('productList');
    if (!searchInput || !categoryFilter || !productList) return;

    const filterProducts = () => {
        const searchTerm = sanitizeInput(searchInput.value.toLowerCase());
        const category = categoryFilter.value;
        const products = productList.querySelectorAll('.col-md-6');

        products.forEach(product => {
            const title = product.querySelector('.card-title').textContent.toLowerCase();
            const productCategory = product.dataset.category;
            const matchesSearch = !searchTerm || title.includes(searchTerm);
            const matchesCategory = !category || productCategory === category;
            product.style.display = matchesSearch && matchesCategory ? '' : 'none';
        });
    };

    searchInput.addEventListener('input', filterProducts);
    categoryFilter.addEventListener('change', filterProducts);
};

// Cookie Consent
const handleCookieConsent = () => {
    const cookieBanner = document.getElementById('cookieBanner');
    const cookieAccept = document.getElementById('cookieAccept');
    const cookieDecline = document.getElementById('cookieDecline');

    if (!localStorage.getItem('cookieConsent')) {
        cookieBanner.classList.add('show');
    }

    cookieAccept.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'accepted');
        cookieBanner.classList.remove('show');
        showToast('Cookies accepted');
    });

    cookieDecline.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'declined');
        cookieBanner.classList.remove('show');
        showToast('Cookies declined');
    });
};

// Form Handlers
const handleForms = () => {
    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (validateForm('loginForm', [
                { id: 'loginEmail', label: 'Email or Phone' },
                { id: 'loginPassword', label: 'Password' }
            ])) {
                showToast('Login successful!');
                loginForm.reset();
            }
        });
    }

    // Register Form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fields = [
                { id: 'registerName', label: 'Full Name' },
                { id: 'registerEmail', label: 'Email' },
                { id: 'registerPhone', label: 'Phone Number' },
                { id: 'registerPassword', label: 'Password' },
                { id: 'registerConfirmPassword', label: 'Confirm Password' }
            ];
            if (!validateForm('registerForm', fields)) return;

            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;
            if (password !== confirmPassword) {
                showToast('Passwords do not match', 'danger');
                return;
            }

            const verificationModal = new bootstrap.Modal(document.getElementById('verificationModal'));
            const userEmail = document.getElementById('userEmail');
            userEmail.textContent = sanitizeInput(document.getElementById('registerEmail').value);
            verificationModal.show();
        });
    }

    // Sell Form
    const sellForm = document.getElementById('sellForm');
    if (sellForm) {
        sellForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (validateForm('sellForm', [
                { id: 'itemName', label: 'Item Name' },
                { id: 'itemDescription', label: 'Description' },
                { id: 'itemCategory', label: 'Category' },
                { id: 'itemPrice', label: 'Price' },
                { id: 'itemLocation', label: 'Location' },
                { id: 'itemImages', label: 'Images' }
            ])) {
                showToast('Item listed successfully!');
                sellForm.reset();
                document.getElementById('imagePreview').innerHTML = '';
            }
        });
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    handleImageUpload();
    handleDarkMode();
    handleProductSearch();
    handleCookieConsent();
    handleForms();

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Initialize dark mode based on preference
    if (localStorage.getItem('darkMode') === 'enabled' || window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.getElementById('html-root').classList.add('dark-mode');
        document.getElementById('darkModeToggle').innerHTML = '<i class="fas fa-sun"></i>';
    }
});
