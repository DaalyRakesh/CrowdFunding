document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.auth-form');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the default form submission

        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');

        const email = emailInput.value;
        const password = passwordInput.value;

        try {
            const response = await fetch('/api/auth/login', { // Backend API endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Login successful
                console.log('Login successful:', data);
                // Redirect the user to the dashboard or another protected page
                window.location.href = '/dashboard.html'; // Replace with your desired URL
            } else {
                // Login failed
                console.error('Login failed:', data);
                alert(data.message || 'Login failed. Please try again.');
                // Optionally display the error message on the page
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred during login. Please try again.');
        }
    });
});