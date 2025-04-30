/**
 * Digital Business Card Generator
 * Main JavaScript file for handling form inputs, validation, 
 * live preview, and generating downloadable business cards.
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const cardForm = document.getElementById('card-form');
    const cardPreview = document.getElementById('card-preview');
    const generateBtn = document.getElementById('generate-btn');
    const downloadBtn = document.getElementById('download-btn');
    const saveBtn = document.getElementById('save-btn');
    const resetBtn = document.getElementById('reset-btn');
    const colorSchemeSelect = document.getElementById('color-scheme');
    const customColorsDiv = document.getElementById('custom-colors');
    const templateSelect = document.getElementById('template');
    const darkModeToggle = document.getElementById('dark-mode');
    const profilePicInput = document.getElementById('profile-pic');
    const statusMessage = document.getElementById('status-message');
    const loadingOverlay = document.getElementById('loading-overlay');
    const savedDesigns = document.getElementById('saved-designs');
    
    // Form Inputs
    const fullNameInput = document.getElementById('full-name');
    const jobTitleInput = document.getElementById('job-title');
    const companyInput = document.getElementById('company');
    const phoneInput = document.getElementById('phone');
    const emailInput = document.getElementById('email');
    const websiteInput = document.getElementById('website');
    const twitterInput = document.getElementById('twitter');
    const instagramInput = document.getElementById('instagram');
    const githubInput = document.getElementById('github');
    const primaryColorInput = document.getElementById('primary-color');
    const secondaryColorInput = document.getElementById('secondary-color');
    
    // Preview Elements
    const previewName = document.getElementById('preview-name');
    const previewTitle = document.getElementById('preview-title');
    const previewCompany = document.getElementById('preview-company');
    const previewPhone = document.getElementById('preview-phone');
    const previewEmail = document.getElementById('preview-email');
    const previewWebsite = document.getElementById('preview-website');
    const previewTwitter = document.getElementById('preview-twitter');
    const previewInstagram = document.getElementById('preview-instagram');
    const previewGithub = document.getElementById('preview-github');
    const previewProfilePic = document.getElementById('preview-profile-pic');
    
    // Error message elements
    const fullNameError = document.getElementById('full-name-error');
    const phoneError = document.getElementById('phone-error');
    const emailError = document.getElementById('email-error');
    const websiteError = document.getElementById('website-error');
    const profilePicError = document.getElementById('profile-pic-error');
    
    // Set up initial state
    let cardGenerated = false;
    let savedDesignsData = loadSavedDesigns();
    
    // Initialize form and event listeners
    init();
    
    /**
     * Initialize the application
     */
    function init() {
        // Set up event listeners
        setupFormListeners();
        setupButtonListeners();
        
        // Update preview on input changes
        setupLivePreview();
        
        // Display saved designs if any exist
        if (savedDesignsData.length > 0) {
            displaySavedDesigns();
        }
        
        // Set current year in footer
        document.getElementById('current-year').textContent = new Date().getFullYear();
    }
    
    /**
     * Set up form-related event listeners
     */
    function setupFormListeners() {
        // Toggle custom colors visibility based on color scheme selection
        colorSchemeSelect.addEventListener('change', function() {
            customColorsDiv.classList.toggle('hidden', this.value !== 'custom');
            updateCardPreview();
        });
        
        // Change template class on template selection
        templateSelect.addEventListener('change', function() {
            cardPreview.className = `card ${this.value}`;
            // Re-apply color scheme class
            if (colorSchemeSelect.value) {
                cardPreview.classList.add(colorSchemeSelect.value);
            }
            if (darkModeToggle.checked) {
                cardPreview.classList.add('dark-mode');
            }
            updateCardPreview();
        });
        
        // Toggle dark mode class on checkbox change
        darkModeToggle.addEventListener('change', function() {
            cardPreview.classList.toggle('dark-mode', this.checked);
            document.body.classList.toggle('dark-mode', this.checked); // Apply dark mode to whole body
            updateCardPreview();
        });
        
        // Handle profile picture upload
        profilePicInput.addEventListener('change', handleProfilePicUpload);
    }
    
    /**
     * Set up button event listeners
     */
    function setupButtonListeners() {
        // Generate button - validate and generate card
        generateBtn.addEventListener('click', function() {
            if (validateForm()) {
                generateCard();
            }
        });
        
        // Download button - create and download an image of the card
        downloadBtn.addEventListener('click', downloadCard);
        
        // Save button - save the current design
        saveBtn.addEventListener('click', saveDesign);
        
        // Reset button - clear the form
        resetBtn.addEventListener('click', resetForm);
    }
    
    /**
     * Set up live preview update handlers
     */
    function setupLivePreview() {
        // Update preview on input changes
        const textInputs = [
            { input: fullNameInput, preview: previewName },
            { input: jobTitleInput, preview: previewTitle },
            { input: companyInput, preview: previewCompany },
            { input: phoneInput, preview: previewPhone.querySelector('span') },
            { input: emailInput, preview: previewEmail.querySelector('span') },
            { input: websiteInput, preview: previewWebsite.querySelector('span') }
        ];
        
        // Update text input previews
        textInputs.forEach(item => {
            item.input.addEventListener('input', function() {
                item.preview.textContent = this.value || item.preview.dataset.placeholder || '';
                // Hide the element if no content and it's optional (not fullName or phone)
                const parentElement = item.preview.closest('p') || item.preview;
                if (this.id !== 'full-name' && this.id !== 'phone') {
                    parentElement.style.display = this.value ? 'block' : 'none';
                }
            });
            // Initial update
            item.input.dispatchEvent(new Event('input'));
        });
        
        // Set up social media previews
        setupSocialMediaPreviews();
        
        // Update card colors on color input changes
        primaryColorInput.addEventListener('input', updateCardPreview);
        secondaryColorInput.addEventListener('input', updateCardPreview);
    }
    
    /**
     * Set up social media preview links
     */
    function setupSocialMediaPreviews() {
        /**
         * Toggle visibility and set href for social media links
         * @param {HTMLInputElement} input - The input element containing username
         * @param {HTMLAnchorElement} preview - The preview link element
         * @param {string} baseUrl - The base URL for the social platform
         */
        function toggleSocialLink(input, preview, baseUrl) {
            const username = input.value.trim();
            if (username) {
                preview.href = `${baseUrl}${username}`;
                preview.style.display = 'inline-flex';
            } else {
                preview.style.display = 'none';
            }
        }
        
        // Set up event listeners for social media inputs
        twitterInput.addEventListener('input', () =>
            toggleSocialLink(twitterInput, previewTwitter, 'https://twitter.com/')
        );
        
        instagramInput.addEventListener('input', () =>
            toggleSocialLink(instagramInput, previewInstagram, 'https://instagram.com/')
        );
        
        githubInput.addEventListener('input', () =>
            toggleSocialLink(githubInput, previewGithub, 'https://github.com/')
        );
        
        // Initialize social links display
        twitterInput.dispatchEvent(new Event('input'));
        instagramInput.dispatchEvent(new Event('input'));
        githubInput.dispatchEvent(new Event('input'));
    }
    
    /**
     * Handle profile picture upload and preview
     */
    function handleProfilePicUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Clear previous error
        profilePicError.textContent = '';
        
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            profilePicError.textContent = 'Please select a valid image file (JPEG, PNG, GIF)';
            return;
        }
        
        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            profilePicError.textContent = 'Image is too large. Please select an image under 2MB.';
            return;
        }
        
        // Create preview
        const reader = new FileReader();
        reader.onload = function(e) {
            previewProfilePic.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    /**
     * Update card preview with current color scheme
     */
    function updateCardPreview() {
        const colorScheme = colorSchemeSelect.value;
        
        // Reset all color scheme classes
        cardPreview.classList.remove('classic', 'modern', 'minimal', 'custom');
        
        // Apply selected color scheme class
        cardPreview.classList.add(colorScheme);
        
        // Apply custom colors if selected
        if (colorScheme === 'custom') {
            cardPreview.style.setProperty('--primary-color', primaryColorInput.value);
            cardPreview.style.setProperty('--secondary-color', secondaryColorInput.value);
        } else {
            cardPreview.style.removeProperty('--primary-color');
            cardPreview.style.removeProperty('--secondary-color');
        }
        
        // Make email optional - hide if empty
        if (!emailInput.value) {
            previewEmail.style.display = 'none';
        } else {
            previewEmail.style.display = 'block';
        }
        
        // Make website optional - hide if empty
        if (!websiteInput.value) {
            previewWebsite.style.display = 'none';
        } else {
            previewWebsite.style.display = 'block';
        }
    }
    
    /**
     * Validate the form inputs
     * @returns {boolean} - Whether the form is valid
     */
    function validateForm() {
        let isValid = true;
        
        // Clear all error messages
        fullNameError.textContent = '';
        phoneError.textContent = '';
        emailError.textContent = '';
        websiteError.textContent = '';
        
        // Validate required fields
        if (!fullNameInput.value.trim()) {
            fullNameError.textContent = 'Name is required';
            isValid = false;
        }
        
        if (!phoneInput.value.trim()) {
            phoneError.textContent = 'Phone number is required';
            isValid = false;
        } else if (!isValidPhoneNumber(phoneInput.value)) {
            phoneError.textContent = 'Please enter a valid phone number';
            isValid = false;
        }
        
        // Validate email if provided
        if (emailInput.value.trim() && !isValidEmail(emailInput.value)) {
            emailError.textContent = 'Please enter a valid email address';
            isValid = false;
        }
        
        // Validate website URL if provided
        if (websiteInput.value.trim() && !isValidURL(websiteInput.value)) {
            websiteError.textContent = 'Please enter a valid URL (e.g., https://example.com)';
            isValid = false;
        }
        
        return isValid;
    }
    
    /**
     * Generate the business card
     */
    function generateCard() {
        // Show loading overlay
        loadingOverlay.classList.remove('hidden');
        
        // Apply final styles for generation
        updateCardPreview();
        
        // Short timeout to ensure UI updates before capturing
        setTimeout(() => {
            // Check if html2canvas is available
            if (typeof html2canvas === 'undefined') {
                console.error('html2canvas is not loaded');
                statusMessage.textContent = 'Error: Required library is missing. Please check console for details.';
                statusMessage.className = 'status-message error';
                loadingOverlay.classList.add('hidden');
                return;
            }
            
            html2canvas(cardPreview, {
                scale: 2,  // Higher quality
                logging: false,
                useCORS: true,
                allowTaint: true
            }).then(function(canvas) {
                // Enable download and save buttons
                downloadBtn.disabled = false;
                saveBtn.disabled = false;
                
                // Mark card as generated
                cardGenerated = true;
                
                // Show success message
                statusMessage.textContent = 'Card generated successfully! You can now download or save it.';
                statusMessage.className = 'status-message success';
                
                // Hide loading overlay
                loadingOverlay.classList.add('hidden');
            }).catch(function(error) {
                console.error('Error generating card:', error);
                statusMessage.textContent = 'Error generating card. Please try again.';
                statusMessage.className = 'status-message error';
                loadingOverlay.classList.add('hidden');
            });
        }, 200);
    }
    
    /**
     * Download the generated card as an image
     */
    function downloadCard() {
        if (!cardGenerated) {
            statusMessage.textContent = 'Please generate the card first!';
            statusMessage.className = 'status-message error';
            return;
        }
        
        // Check if html2canvas is available
        if (typeof html2canvas === 'undefined') {
            console.error('html2canvas is not loaded');
            statusMessage.textContent = 'Error: Required library is missing. Please check console for details.';
            statusMessage.className = 'status-message error';
            return;
        }
        
        // Re-generate canvas for download
        html2canvas(cardPreview, {
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true
        }).then(function(canvas) {
            // Create download link
            const link = document.createElement('a');
            link.download = `${fullNameInput.value.replace(/\s+/g, '_')}_business_card.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            // Show success message
            statusMessage.textContent = 'Card downloaded successfully!';
            statusMessage.className = 'status-message success';
        }).catch(function(error) {
            console.error('Error downloading card:', error);
            statusMessage.textContent = 'Error downloading card. Please try again.';
            statusMessage.className = 'status-message error';
        });
    }
    
    /**
     * Save the current card design to local storage
     */
    function saveDesign() {
        if (!cardGenerated) {
            statusMessage.textContent = 'Please generate the card first!';
            statusMessage.className = 'status-message error';
            return;
        }
        
        // Capture current state
        const design = {
            id: Date.now(),
            name: fullNameInput.value,
            title: jobTitleInput.value,
            company: companyInput.value,
            phone: phoneInput.value,
            email: emailInput.value,
            website: websiteInput.value,
            twitter: twitterInput.value,
            instagram: instagramInput.value,
            github: githubInput.value,
            template: templateSelect.value,
            colorScheme: colorSchemeSelect.value,
            darkMode: darkModeToggle.checked,
            primaryColor: primaryColorInput.value,
            secondaryColor: secondaryColorInput.value,
            timestamp: new Date().toISOString()
        };
        
        // Add to saved designs
        savedDesignsData.push(design);
        
        try {
            localStorage.setItem('savedBusinessCards', JSON.stringify(savedDesignsData));
            
            // Update saved designs section
            displaySavedDesigns();
            
            // Show success message
            statusMessage.textContent = 'Design saved successfully!';
            statusMessage.className = 'status-message success';
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            statusMessage.textContent = 'Error saving design. Local storage may be full.';
            statusMessage.className = 'status-message error';
        }
    }
    
    /**
     * Reset the form to default values
     */
    function resetForm() {
        // Reset form values
        cardForm.reset();
        
        // Reset profile picture
        previewProfilePic.src = './assets/default-avatar.png';
        
        // Reset card styles
        cardPreview.className = 'card template1';
        cardPreview.style.removeProperty('--primary-color');
        cardPreview.style.removeProperty('--secondary-color');
        
        // Apply default color scheme
        cardPreview.classList.add('classic');
        
        // Hide custom colors
        customColorsDiv.classList.add('hidden');
        
        // Reset preview texts
        previewName.textContent = 'Your Name';
        previewTitle.textContent = 'Job Title';
        previewCompany.textContent = 'Company Name';
        previewPhone.querySelector('span').textContent = '+1 (123) 456-7890';
        previewEmail.querySelector('span').textContent = 'your@email.com';
        previewWebsite.querySelector('span').textContent = 'example.com';
        
        // Show all preview elements initially
        previewEmail.style.display = 'block';
        previewWebsite.style.display = 'block';
        
        // Hide all social links
        previewTwitter.style.display = 'none';
        previewInstagram.style.display = 'none';
        previewGithub.style.display = 'none';
        
        // Reset buttons
        downloadBtn.disabled = true;
        saveBtn.disabled = true;
        cardGenerated = false;
        
        // Clear status message
        statusMessage.textContent = '';
        statusMessage.className = 'status-message';
        
        // Clear errors
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(error => error.textContent = '');
    }
    
    /**
     * Display saved designs in the UI
     */
    function displaySavedDesigns() {
        const designsContainer = savedDesigns.querySelector('.designs-container');
        designsContainer.innerHTML = '';
        
        // Show saved designs section
        savedDesigns.classList.remove('hidden');
        
        // Create UI for each saved design
        savedDesignsData.forEach(design => {
            const designCard = document.createElement('div');
            designCard.className = 'saved-design-card';
            
            designCard.innerHTML = `
                <h4>${escapeHTML(design.name)}</h4>
                <p>${escapeHTML(design.title || '')} ${design.company ? '- ' + escapeHTML(design.company) : ''}</p>
                <div class="saved-design-actions">
                    <button class="btn small-btn load-design" data-id="${design.id}">
                        <i class="fas fa-upload"></i> Load
                    </button>
                    <button class="btn small-btn delete-design" data-id="${design.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            
            designsContainer.appendChild(designCard);
        });
        
        // Add event listeners to load/delete buttons
        document.querySelectorAll('.load-design').forEach(button => {
            button.addEventListener('click', function() {
                loadDesign(this.getAttribute('data-id'));
            });
        });
        
        document.querySelectorAll('.delete-design').forEach(button => {
            button.addEventListener('click', function() {
                deleteDesign(this.getAttribute('data-id'));
            });
        });
    }
    
    /**
     * Load a saved design
     * @param {string} id - The ID of the design to load
     */
    function loadDesign(id) {
        const design = savedDesignsData.find(d => d.id.toString() === id);
        if (!design) return;
        
        // Reset form first
        resetForm();
        
        // Fill in form values
        fullNameInput.value = design.name || '';
        jobTitleInput.value = design.title || '';
        companyInput.value = design.company || '';
        phoneInput.value = design.phone || '';
        emailInput.value = design.email || '';
        websiteInput.value = design.website || '';
        twitterInput.value = design.twitter || '';
        instagramInput.value = design.instagram || '';
        githubInput.value = design.github || '';
        templateSelect.value = design.template || 'template1';
        colorSchemeSelect.value = design.colorScheme || 'classic';
        darkModeToggle.checked = design.darkMode || false;
        primaryColorInput.value = design.primaryColor || '#0066cc';
        secondaryColorInput.value = design.secondaryColor || '#ffffff';
        
        // Show/hide custom colors
        customColorsDiv.classList.toggle('hidden', design.colorScheme !== 'custom');
        
        // Update template class
        cardPreview.className = `card ${design.template}`;
        
        // Apply color scheme class
        cardPreview.classList.add(design.colorScheme);
        
        if (design.darkMode) {
            cardPreview.classList.add('dark-mode');
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        // Trigger input events to update preview
        const inputs = [
            fullNameInput, jobTitleInput, companyInput, phoneInput, 
            emailInput, websiteInput, twitterInput, instagramInput, githubInput
        ];
        inputs.forEach(input => input.dispatchEvent(new Event('input')));
        
        // Update card preview with colors
        updateCardPreview();
        
        // Show success message
        statusMessage.textContent = 'Design loaded successfully!';
        statusMessage.className = 'status-message success';
    }
    
    /**
     * Delete a saved design
     * @param {string} id - The ID of the design to delete
     */
    function deleteDesign(id) {
        // Filter out the design with the matching ID
        savedDesignsData = savedDesignsData.filter(d => d.id.toString() !== id);
        
        // Update local storage
        try {
            localStorage.setItem('savedBusinessCards', JSON.stringify(savedDesignsData));
            
            // Update UI
            if (savedDesignsData.length === 0) {
                savedDesigns.classList.add('hidden');
            } else {
                displaySavedDesigns();
            }
            
            // Show success message
            statusMessage.textContent = 'Design deleted successfully!';
            statusMessage.className = 'status-message success';
        } catch (e) {
            console.error('Error updating localStorage:', e);
            statusMessage.textContent = 'Error deleting design. Please try again.';
            statusMessage.className = 'status-message error';
        }
    }
    
    /**
     * Load saved designs from local storage
     * @returns {Array} - Array of saved designs
     */
    function loadSavedDesigns() {
        try {
            const saved = localStorage.getItem('savedBusinessCards');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Error loading saved designs:', e);
            return [];
        }
    }
    
    /**
     * Escape HTML special characters to prevent XSS
     * @param {string} unsafe - Potentially unsafe string
     * @returns {string} - Safe string with HTML entities escaped
     */
    function escapeHTML(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
    
    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} - Whether the email is valid
     */
    function isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email.toLowerCase());
    }
    
    /**
     * Validate URL format
     * @param {string} url - URL to validate
     * @returns {boolean} - Whether the URL is valid
     */
    function isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch (e) {
            // Add http:// prefix and try again if no protocol specified
            if (!url.match(/^[a-zA-Z]+:\/\//)) {
                try {
                    new URL('http://' + url);
                    return true;
                } catch (e2) {
                    return false;
                }
            }
            return false;
        }
    }
    
    /**
     * Validate phone number format
     * @param {string} phone - Phone number to validate
     * @returns {boolean} - Whether the phone number is valid
     */
    function isValidPhoneNumber(phone) {
        // Basic validation: at least 10 digits, allowing for country codes, brackets, spaces, dashes
        const digitsOnly = phone.replace(/\D/g, '');
        return digitsOnly.length >= 10;
    }
});