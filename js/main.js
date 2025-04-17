document.addEventListener('DOMContentLoaded', function() {
    // Form validation for login page
    const loginForm = document.querySelector('.auth-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            if (!validateEmail(email)) {
                showError('email', 'Please enter a valid email address');
                return;
            }
            
            if (password.length < 6) {
                showError('password', 'Password must be at least 6 characters long');
                return;
            }
            
            // Here you would typically make an API call to authenticate the user
            console.log('Login attempt with:', { email, password });
        });
    }
    
    // Form validation for signup page
    const signupForm = document.querySelector('.auth-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const fullname = document.getElementById('fullname').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const terms = document.getElementById('terms').checked;
            
            if (fullname.length < 3) {
                showError('fullname', 'Full name must be at least 3 characters long');
                return;
            }
            
            if (!validateEmail(email)) {
                showError('email', 'Please enter a valid email address');
                return;
            }
            
            if (password.length < 6) {
                showError('password', 'Password must be at least 6 characters long');
                return;
            }
            
            if (password !== confirmPassword) {
                showError('confirm-password', 'Passwords do not match');
                return;
            }
            
            if (!terms) {
                alert('Please agree to the Terms of Service and Privacy Policy');
                return;
            }
            
            // Here you would typically make an API call to register the user
            console.log('Signup attempt with:', { fullname, email, password });
        });
    }
    
    // Helper functions
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    function showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const inputGroup = field.closest('.input-group');
        
        // Remove any existing error message
        const existingError = inputGroup.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = message;
        errorMessage.style.color = '#e74c3c';
        errorMessage.style.fontSize = '0.9rem';
        errorMessage.style.marginTop = '0.5rem';
        
        inputGroup.appendChild(errorMessage);
        
        // Add error styling to input
        field.style.borderColor = '#e74c3c';
        
        // Remove error styling after 3 seconds
        setTimeout(() => {
            field.style.borderColor = '#e0e0e0';
            errorMessage.remove();
        }, 3000);
    }
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}); 