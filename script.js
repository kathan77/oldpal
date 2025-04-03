// Global variables
let userPhone = '';
let generatedOTP = null;
let guardianProfile = null;
let elderProfiles = [];
const MAX_ELDERS = 5;

// Initialize OTP inputs
function createOTPInputs() {
    const container = document.getElementById('otpInputs');
    container.innerHTML = '';
    
    for(let i = 0; i < 4; i++) {
        const input = document.createElement('input');
        input.className = 'otp-digit';
        input.type = 'text';
        input.inputMode = 'numeric';
        input.maxLength = 1;
        
        input.addEventListener('input', (e) => handleOTPInput(e, i));
        input.addEventListener('keydown', (e) => handleBackspace(e, i));
        
        container.appendChild(input);
    }
}

// Handle OTP input
function handleOTPInput(e, index) {
    const input = e.target;
    const value = e.data || input.value;
    
    if (!/^\d$/.test(value)) {
        input.value = '';
        return;
    }
    
    if (index < 3 && value !== '') {
        const nextInput = input.parentElement.children[index + 1];
        nextInput.focus();
    }
}

// Handle backspace in OTP input
function handleBackspace(e, index) {
    if (e.key === 'Backspace' && e.target.value === '') {
        if (index > 0) {
            const prevInput = e.target.parentElement.children[index - 1];
            prevInput.focus();
        }
    }
}

// Handle phone input
document.getElementById('phoneInput').addEventListener('input', function(e) {
    const value = e.target.value.replace(/\D/g, '');
    e.target.value = value;
    userPhone = value;
    document.getElementById('sendOTPBtn').disabled = value.length !== 10;
});

// Handle photo upload preview
function handlePhotoUpload(input, previewId) {
    const preview = document.getElementById(previewId);
    const file = input.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Profile Photo">`;
        }
        reader.readAsDataURL(file);
    }
}

// Send OTP
document.getElementById('sendOTPBtn').addEventListener('click', function() {
    generatedOTP = Math.floor(1000 + Math.random() * 9000);
    alert(`OTP sent to ${userPhone}: ${generatedOTP}`);
    showSection('otpVerification');
    createOTPInputs();
});

// Verify OTP
function verifyOTP() {
    const inputs = document.querySelectorAll('.otp-digit');
    const enteredOTP = Array.from(inputs).map(input => input.value).join('');
    
    if(enteredOTP == generatedOTP) {
        // Check if user already has a profile
        const savedGuardianProfile = localStorage.getItem('guardianProfile');
        
        if (savedGuardianProfile) {
            // User already has a profile, go to home page
            guardianProfile = JSON.parse(savedGuardianProfile);
            userPhone = guardianProfile.phone;
            
            const savedElderProfiles = localStorage.getItem('elderProfiles');
            if (savedElderProfiles) {
                elderProfiles = JSON.parse(savedElderProfiles);
            }
            
            // Redirect to home page with search functionality
            window.location.href = 'index.html';
        } else {
            // New user, go to profile creation
            showSection('guardianProfile');
        }
    } else {
        alert('Invalid OTP! Please try again.');
        inputs.forEach(input => input.value = '');
        inputs[0].focus();
    }
}

// Handle guardian profile submission
function handleGuardianSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    guardianProfile = {
        name: formData.get('name'),
        age: formData.get('age'),
        gender: formData.get('gender'),
        email: formData.get('email'),
        address: formData.get('address'),
        pinCode: formData.get('pinCode'),
        emergencyContact: formData.get('emergencyContact'),
        phone: userPhone,
        neighbourInfo: {
            name: formData.get('neighbourName'),
            phone: formData.get('neighbourPhone'),
            homeNumber: formData.get('neighbourHomeNumber')
        },
        doctorInfo: {
            name: formData.get('doctorName'),
            phone: formData.get('doctorPhone')
        }
    };
    
    // Save to localStorage
    localStorage.setItem('guardianProfile', JSON.stringify(guardianProfile));
    
    showSection('elderProfile');
}

// Handle elder profile submission
function handleElderSubmit(event) {
    event.preventDefault();
    
    if (elderProfiles.length >= MAX_ELDERS) {
        alert(`You can only add up to ${MAX_ELDERS} elders to your profile.`);
        return;
    }
    
    const formData = new FormData(event.target);
    
    // Get all selected care types
    const personalCare = Array.from(formData.getAll('personalCare'));
    const medicalCare = Array.from(formData.getAll('medicalCare'));
    const householdSupport = Array.from(formData.getAll('householdSupport'));
    const specialisedCare = Array.from(formData.getAll('specialisedCare'));
    const respiteCare = Array.from(formData.getAll('respiteCare'));
    
    // Get medical history
    const medicalHistory = Array.from(formData.getAll('medicalHistory'));
    const otherMedicalHistory = formData.get('otherMedicalHistory');
    
    const elderProfile = {
        name: formData.get('elderName'),
        age: formData.get('age'),
        relationType: formData.get('relationType'),
        address: formData.get('address'),
        pinCode: formData.get('pinCode'),
        medicalHistory: {
            conditions: medicalHistory,
            other: otherMedicalHistory
        },
        careRequired: {
            personalCare,
            medicalCare,
            householdSupport,
            specialisedCare,
            respiteCare
        },
        neighbourInfo: {
            name: formData.get('neighbourName'),
            phone: formData.get('neighbourPhone'),
            homeNumber: formData.get('neighbourHomeNumber')
        }
    };
    
    elderProfiles.push(elderProfile);
    
    // Save to localStorage
    localStorage.setItem('elderProfiles', JSON.stringify(elderProfiles));
    
    // After creating the first elder profile, redirect to home page
    if (elderProfiles.length === 1) {
        // Redirect to home page with search functionality
        window.location.href = 'index.html';
    } else {
        // If adding more elders, show profile view
        updateProfileView();
        showSection('profileView');
    }
    
    // Update add elder button state
    document.getElementById('addElderBtn').disabled = elderProfiles.length >= MAX_ELDERS;
}

// Add new elder profile
function addNewElder() {
    if (elderProfiles.length >= MAX_ELDERS) {
        alert(`You can only add up to ${MAX_ELDERS} elders to your profile.`);
        return;
    }
    document.getElementById('elderForm').reset();
    document.getElementById('elderPhotoPreview').innerHTML = '';
    showSection('elderProfile');
}

// Update profile view
function updateProfileView() {
    // Update guardian info
    const guardianInfo = document.getElementById('guardianInfo');
    guardianInfo.innerHTML = `
        <p><strong>Name:</strong> ${guardianProfile.name}</p>
        <p><strong>Age:</strong> ${guardianProfile.age}</p>
        <p><strong>Gender:</strong> ${guardianProfile.gender}</p>
        <p><strong>Email:</strong> ${guardianProfile.email}</p>
        <p><strong>Phone:</strong> ${guardianProfile.phone}</p>
        <p><strong>Address:</strong> ${guardianProfile.address}</p>
        <p><strong>Pin Code:</strong> ${guardianProfile.pinCode}</p>
        <p><strong>Emergency Contact:</strong> ${guardianProfile.emergencyContact}</p>
        <div class="contact-info">
            <h4>Neighbour Information</h4>
            <p><strong>Name:</strong> ${guardianProfile.neighbourInfo.name}</p>
            <p><strong>Phone:</strong> ${guardianProfile.neighbourInfo.phone}</p>
            <p><strong>Home Number:</strong> ${guardianProfile.neighbourInfo.homeNumber}</p>
        </div>
        <div class="contact-info">
            <h4>Doctor Information</h4>
            <p><strong>Name:</strong> ${guardianProfile.doctorInfo.name}</p>
            <p><strong>Phone:</strong> ${guardianProfile.doctorInfo.phone}</p>
        </div>
    `;
    
    // Update elders list
    const eldersList = document.getElementById('eldersList');
    if (elderProfiles.length > 0) {
        eldersList.innerHTML = elderProfiles.map((elder, index) => `
            <div class="elder-card">
                <h4>${elder.name}</h4>
                <p><strong>Age:</strong> ${elder.age}</p>
                <p><strong>Relation:</strong> ${elder.relationType}</p>
                <p><strong>Address:</strong> ${elder.address}</p>
                <p><strong>Pin Code:</strong> ${elder.pinCode}</p>
                
                <div class="medical-info">
                    <h4>Medical History</h4>
                    <div class="care-tags">
                        ${elder.medicalHistory.conditions.map(condition => 
                            `<span class="care-tag">${condition}</span>`
                        ).join('')}
                        ${elder.medicalHistory.other ? 
                            `<span class="care-tag">${elder.medicalHistory.other}</span>` : 
                            ''}
                    </div>
                </div>
                
                <div class="care-required">
                    <h4>Care Required</h4>
                    ${Object.entries(elder.careRequired).map(([category, services]) => 
                        services.length ? `
                            <div class="care-category">
                                <h5>${category}</h5>
                                <div class="care-tags">
                                    ${services.map(service => 
                                        `<span class="care-tag">${service}</span>`
                                    ).join('')}
                                </div>
                            </div>
                        ` : ''
                    ).join('')}
                </div>
                
                <div class="contact-info">
                    <h4>Neighbour Information</h4>
                    <p><strong>Name:</strong> ${elder.neighbourInfo.name}</p>
                    <p><strong>Phone:</strong> ${elder.neighbourInfo.phone}</p>
                    <p><strong>Home Number:</strong> ${elder.neighbourInfo.homeNumber}</p>
                </div>
            </div>
        `).join('');
    } else {
        eldersList.innerHTML = '<p>No elder profiles added yet.</p>';
    }
    
    // Update add elder button state
    document.getElementById('addElderBtn').disabled = elderProfiles.length >= MAX_ELDERS;
    
    // Update elder select dropdown in search form
    updateElderSelect();
}

// Update elder select dropdown in search form
function updateElderSelect() {
    const elderSelect = document.getElementById('elderSelect');
    if (elderSelect) {
        elderSelect.innerHTML = '<option value="">Select an elder</option>';
        
        elderProfiles.forEach((elder, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = elder.name;
            elderSelect.appendChild(option);
        });
    }
}

// Handle search form submission
function handleSearch(event) {
    event.preventDefault();
    
    // Check if user is logged in
    if (!guardianProfile) {
        alert('Please log in to search for caregivers.');
        showSection('phoneLogin');
        return;
    }
    
    const formData = new FormData(event.target);
    const elderIndex = formData.get('elderSelect');
    const careTypes = Array.from(formData.getAll('careType'));
    const startDate = formData.get('startDate');
    const endDate = formData.get('endDate');
    const budgetRange = formData.get('budgetRange');
    const location = formData.get('location');
    
    if (!elderIndex) {
        alert('Please select an elder to search for caregivers.');
        return;
    }
    
    if (careTypes.length === 0) {
        alert('Please select at least one type of care required.');
        return;
    }
    
    // In a real application, this would make an API call to search for caregivers
    // For this demo, we'll simulate search results
    simulateSearchResults(elderIndex, careTypes, startDate, endDate, budgetRange, location);
}

// Simulate search results
function simulateSearchResults(elderIndex, careTypes, startDate, endDate, budgetRange, location) {
    const elder = elderProfiles[elderIndex];
    const searchResults = document.getElementById('searchResults');
    
    // Clear previous results
    searchResults.innerHTML = '';
    
    // Add a heading
    searchResults.innerHTML = `<h3>Search Results for ${elder.name}</h3>`;
    
    // Simulate 3 caregiver results
    const caregivers = [
        {
            name: 'Priya Sharma',
            rating: 4.8,
            skills: ['Personal Care', 'Medical Care', 'Household Support'],
            price: '₹800/day',
            image: 'https://randomuser.me/api/portraits/women/44.jpg'
        },
        {
            name: 'Rajesh Kumar',
            rating: 4.5,
            skills: ['Personal Care', 'Specialised Care', 'Respite Care'],
            price: '₹1200/day',
            image: 'https://randomuser.me/api/portraits/men/32.jpg'
        },
        {
            name: 'Anita Patel',
            rating: 4.9,
            skills: ['Medical Care', 'Household Support', 'Respite Care'],
            price: '₹1500/day',
            image: 'https://randomuser.me/api/portraits/women/68.jpg'
        }
    ];
    
    // Display caregiver cards
    caregivers.forEach(caregiver => {
        const card = document.createElement('div');
        card.className = 'caregiver-card';
        
        card.innerHTML = `
            <div class="caregiver-image">
                <img src="${caregiver.image}" alt="${caregiver.name}">
            </div>
            <div class="caregiver-info">
                <div class="caregiver-name">${caregiver.name}</div>
                <div class="caregiver-rating">
                    ${'★'.repeat(Math.floor(caregiver.rating))}${caregiver.rating % 1 >= 0.5 ? '½' : ''}${'☆'.repeat(5 - Math.ceil(caregiver.rating))} (${caregiver.rating})
                </div>
                <div class="caregiver-skills">
                    ${caregiver.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
                <div class="caregiver-price">${caregiver.price}</div>
                <div class="caregiver-actions">
                    <button onclick="bookCaregiver('${caregiver.name}')">Book Now</button>
                </div>
            </div>
        `;
        
        searchResults.appendChild(card);
    });
}

// Book a caregiver
function bookCaregiver(caregiverName) {
    alert(`Booking request sent to ${caregiverName}. They will contact you shortly.`);
}

// Show specific section
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    createOTPInputs();
    
    // Add photo upload preview handlers
    document.querySelector('input[name="profilePhoto"]').addEventListener('change', function(e) {
        handlePhotoUpload(e.target, 'guardianPhotoPreview');
    });
    
    document.querySelector('input[name="elderPhoto"]').addEventListener('change', function(e) {
        handlePhotoUpload(e.target, 'elderPhotoPreview');
    });

    // Navigation bar functionality
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }
    
    // Load profile data from localStorage
    const savedGuardianProfile = localStorage.getItem('guardianProfile');
    const savedElderProfiles = localStorage.getItem('elderProfiles');
    
    if (savedGuardianProfile) {
        guardianProfile = JSON.parse(savedGuardianProfile);
        userPhone = guardianProfile.phone;
        
        if (savedElderProfiles) {
            elderProfiles = JSON.parse(savedElderProfiles);
            updateProfileView();
        }
        
        // Show logout button and profile link
        if (logoutBtn) {
            logoutBtn.style.display = 'block';
        }
        const profileLink = document.querySelector('a[href="profile.html"]');
        if (profileLink) {
            profileLink.parentElement.style.display = 'block';
        }
        
        // If on index page and has profile, show home search
        if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
            showSection('homeSearch');
        }
    } else {
        // Hide logout button and profile link
        if (logoutBtn) {
            logoutBtn.style.display = 'none';
        }
        const profileLink = document.querySelector('a[href="profile.html"]');
        if (profileLink) {
            profileLink.parentElement.style.display = 'none';
        }
        
        // If no profile exists and on index page, show login
        if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
            showSection('phoneLogin');
        } else if (!window.location.pathname.endsWith('contact.html') && 
                   !window.location.pathname.endsWith('caregiver-register.html')) {
            // If on profile page without a profile, redirect to login
            window.location.href = 'index.html';
        }
    }

    // Logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }
});

function handleLogout() {
    // Clear all stored data
    localStorage.removeItem('guardianProfile');
    localStorage.removeItem('elderProfiles');
    
    // Reset global variables
    guardianProfile = null;
    elderProfiles = [];
    userPhone = '';
    
    // Redirect to login page
    window.location.href = 'index.html#phoneLogin';
} 