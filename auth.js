// Initialize Firebase
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Google Sign-In
function initGoogleSignIn() {
    gapi.signin2.render('google-signin-btn', {
        'scope': 'profile email',
        'width': 240,
        'height': 50,
        'longtitle': true,
        'theme': 'dark',
        'onsuccess': onGoogleSignInSuccess,
        'onfailure': onGoogleSignInFailure
    });
}

// Handle successful Google Sign-In
function onGoogleSignInSuccess(googleUser) {
    const profile = googleUser.getBasicProfile();
    const idToken = googleUser.getAuthResponse().id_token;

    // Send token to server to verify
    fetch('/auth/google', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken })
    })
    .then(response => response.json())
    .then(data => {
        // Handle successful authentication
        console.log('User signed in:', data);
        // Redirect to dashboard or booking page
        window.location.href = '/bookings.html';
    })
    .catch(error => console.error('Error:', error));
}

// Handle Google Sign-In failure
function onGoogleSignInFailure(error) {
    console.error('Google Sign-In Error:', error);
}

// Check if user is already signed in
function checkAuthStatus() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            // User is signed in
            updateUI(user);
        } else {
            // User is signed out
            updateUI(null);
        }
    });
}

// Update UI based on authentication status
function updateUI(user) {
    const signInBtn = document.getElementById('google-signin-btn');
    const signOutBtn = document.getElementById('sign-out-btn');
    const bookingForm = document.getElementById('appointmentForm');
    
    if (user) {
        signInBtn.style.display = 'none';
        signOutBtn.style.display = 'block';
        bookingForm.style.display = 'block';
    } else {
        signInBtn.style.display = 'block';
        signOutBtn.style.display = 'none';
        bookingForm.style.display = 'none';
    }
}

// Sign out function
document.getElementById('sign-out-btn').addEventListener('click', () => {
    firebase.auth().signOut()
        .then(() => {
            console.log('User signed out');
            updateUI(null);
        })
        .catch(error => console.error('Sign out error:', error));
});
