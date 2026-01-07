// Utility Functions
const showToast = (message, type = 'success') => {
    const toast = document.getElementById('toastNotification');
    if (!toast) return;

    const toastBody = toast.querySelector('.toast-body');
    toastBody.textContent = message;
    toast.classList.remove('bg-success', 'bg-danger', 'bg-warning', 'bg-info'); // Remove previous classes
    toast.classList.add(`bg-${type}`);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
};

// Improved Input Sanitization with additional escaping
const sanitizeInput = (input) => {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML.replace(/[<>&"'"]/g, (char) => { // Extra escaping for safety
        switch (char) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '"': return '&quot;';
            case "'": return '&#39;';
            default: return char;
        }
    });
};

// Enhanced Form Validation with regex patterns
const validateForm = (formId, fields) => {
    const form = document.getElementById(formId);
    if (!form) return false;

    let isValid = true;
    fields.forEach(field => {
        const input = form.querySelector(`#${field.id}`);
        const value = input.value.trim();
        const feedback = input.nextElementSibling;

        input.classList.remove('is-invalid');
        if (!value) {
            isValid = false;
            input.classList.add('is-invalid');
            feedback.textContent = `${field.label} is required`;
        } else if (field.pattern && !field.pattern.test(value)) {
            isValid = false;
            input.classList.add('is-invalid');
            feedback.textContent = field.errorMessage || `Invalid ${field.label.toLowerCase()}`;
        }
    });
    return isValid;
};

// Image Preview with File Size Limit and Error Handling
const handleImageUpload = () => {
    const imageUpload = document.getElementById('itemImages');
    const imagePreview = document.getElementById('imagePreview');
    if (!imageUpload || !imagePreview) return;

    imageUpload.addEventListener('change', () => {
        imagePreview.innerHTML = '';
        const files = Array.from(imageUpload.files);
        if (files.length > 5) {
            showToast('Maximum 5 images allowed', 'danger');
            imageUpload.value = '';
            return;
        }

        files.forEach(file => {
            if (file.type.match('image.*') && file.size <= 5 * 1024 * 1024) { // Limit to 5MB per file
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.classList.add('img-thumbnail', 'me-2', 'mb-2');
                    img.style.width = '80px';
                    img.style.height = '80px';
                    img.alt = 'Uploaded product image';
                    imagePreview.appendChild(img);
                };
                reader.onerror = () => showToast('Error reading image file', 'danger');
                reader.readAsDataURL(file);
            } else {
                showToast('Invalid file type or size exceeds 5MB', 'danger');
            }
        });
    });
};

// Dark Mode Toggle with Media Query Listener
const toggleDarkMode = () => {
    const html = document.documentElement; // Use documentElement for better compatibility
    const toggleButton = document.getElementById('darkModeToggle');
    html.classList.toggle('dark-mode');
    const isDark = html.classList.contains('dark-mode');
    toggleButton.innerHTML = `<i class="fas fa-${isDark ? 'sun' : 'moon'}"></i>`;
    localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
};

// Product Search and Filter with Debounce
const handleProductSearch = () => {
    const searchInput = document.getElementById('productSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    const productList = document.getElementById('productList');
    if (!searchInput || !categoryFilter || !productList) return;

    let debounceTimer;
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

    const debouncedFilter = () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(filterProducts, 300);
    };

    searchInput.addEventListener('input', debouncedFilter);
    categoryFilter.addEventListener('change', filterProducts);
};

// Cookie Consent with Analytics Opt-Out
const handleCookieConsent = () => {
    const cookieBanner = document.getElementById('cookieBanner');
    const cookieAccept = document.getElementById('cookieAccept');
    const cookieDecline = document.getElementById('cookieDecline');

    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
        cookieBanner.classList.add('show');
    }

    cookieAccept.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'accepted');
        cookieBanner.classList.remove('show');
        showToast('Cookies accepted');
        // Enable analytics or tracking here if applicable
    });

    cookieDecline.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'declined');
        cookieBanner.classList.remove('show');
        showToast('Cookies declined');
        // Opt-out of analytics or tracking
    });
};

// Form Handlers with Additional Validations
const handleForms = () => {
    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (validateForm('loginForm', [
                { id: 'loginEmail', label: 'Email or Phone', pattern: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$|^\+?\d{10,15}$/, errorMessage: 'Invalid email or phone' },
                { id: 'loginPassword', label: 'Password', pattern: /^.{8,}$/, errorMessage: 'Password must be at least 8 characters' }
            ])) {
                showToast('Login successful!');
                loginForm.reset();
            }
        });
    }

    // Register Form with Password Strength
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fields = [
                { id: 'registerName', label: 'Full Name', pattern: /^[a-zA-Z\s]{2,}$/, errorMessage: 'Name must be at least 2 characters' },
                { id: 'registerEmail', label: 'Email', pattern: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/, errorMessage: 'Invalid email' },
                { id: 'registerPhone', label: 'Phone Number', pattern: /^\+?\d{10,15}$/, errorMessage: 'Invalid phone number' },
                { id: 'registerPassword', label: 'Password', pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, errorMessage: 'Password must be 8+ chars with upper, lower, number, special' },
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

    // Sell Form with Price Validation
    const sellForm = document.getElementById('sellForm');
    if (sellForm) {
        sellForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (validateForm('sellForm', [
                { id: 'itemName', label: 'Item Name', pattern: /^.{3,}$/, errorMessage: 'Item name must be at least 3 characters' },
                { id: 'itemDescription', label: 'Description', pattern: /^.{10,}$/, errorMessage: 'Description must be at least 10 characters' },
                { id: 'itemCategory', label: 'Category' },
                { id: 'itemPrice', label: 'Price', pattern: /^\d+(\.\d{1,2})?$/, errorMessage: 'Invalid price format' },
                { id: 'itemLocation', label: 'Location', pattern: /^.{5,}$/, errorMessage: 'Location must be at least 5 characters' },
                { id: 'itemImages', label: 'Images' }
            ])) {
                showToast('Item listed successfully!');
                sellForm.reset();
                document.getElementById('imagePreview').innerHTML = '';
            }
        });
    }
};

// Initialize with Error Handling
document.addEventListener('DOMContentLoaded', () => {
    try {
        handleImageUpload();
        handleProductSearch();
        handleCookieConsent();
        handleForms();

        // Dark Mode Initialization and Listener
        const html = document.documentElement;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        const storedMode = localStorage.getItem('darkMode');
        if (storedMode === 'enabled' || (!storedMode && prefersDark.matches)) {
            html.classList.add('dark-mode');
            document.getElementById('darkModeToggle').innerHTML = '<i class="fas fa-sun"></i>';
        }

        prefersDark.addEventListener('change', (e) => {
            if (!localStorage.getItem('darkMode')) {
                html.classList.toggle('dark-mode', e.matches);
                document.getElementById('darkModeToggle').innerHTML = `<i class="fas fa-${e.matches ? 'sun' : 'moon'}"></i>`;
            }
        });

        // Smooth Scrolling with Accessibility
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                if (targetId === '#') return;
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.setAttribute('tabindex', '-1'); // For focus
                    window.scrollTo({
                        top: targetElement.offsetTop - 70,
                        behavior: 'smooth'
                    });
                    targetElement.focus({ preventScroll: true });
                }
            });
        });
    } catch (error) {
        console.error('Initialization error:', error);
        showToast('An error occurred during page load', 'danger');
    }
});

// Export functions if using modules (optional, for future-proofing)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showToast,
        sanitizeInput,
        validateForm,
        handleImageUpload,
        toggleDarkMode,
        handleProductSearch,
        handleCookieConsent,
        handleForms
    };
}
