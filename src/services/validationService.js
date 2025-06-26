class ValidationService {
    // Email validation
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Password validation
    validatePassword(password) {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    }

    // Phone validation
    validatePhone(phone) {
        // Remove all non-digits for validation
        const cleanPhone = phone.replace(/\D/g, '');
        // Should be at least 10 digits
        return cleanPhone.length >= 10 && cleanPhone.length <= 15;
    }

    // CNIC validation (Pakistani format: XXXXX-XXXXXXX-X)
    validateCNIC(cnic) {
        const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
        return cnicRegex.test(cnic);
    }

    // Passport validation (basic format)
    validatePassport(passport) {
        // Basic passport validation - alphanumeric, 6-9 characters
        const passportRegex = /^[A-Z0-9]{6,9}$/;
        return passportRegex.test(passport.toUpperCase());
    }

    // Name validation
    validateName(name) {
        return name && name.trim().length >= 2 && name.trim().length <= 50;
    }    // Age validation (must be 18+ for landlord/food provider, 16+ for student)
    validateAge(dateOfBirth, role) {
        if (!dateOfBirth) return false;
        
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (role === 'student') {
            return age >= 16;
        } else if (role === 'landlord' || role === 'food_provider') {
            return age >= 18;
        }

        return age >= 16; // Default minimum age
    }

    // Registration form validation
    validateRegistrationForm(formData) {
        const errors = {};

        // Name validation
        if (!this.validateName(formData.name)) {
            errors.name = 'Name must be between 2-50 characters';
        }

        // Email validation
        if (!this.validateEmail(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!this.validatePassword(formData.password)) {
            errors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
        }

        // Confirm password validation
        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }        // Phone validation
        if (!this.validatePhone(formData.phone)) {
            errors.phone = 'Please enter a valid phone number';
        }

        // Country Code validation
        if (!formData.countryCode) {
            errors.countryCode = 'Please select a country code';
        }

        // Gender validation
        if (!formData.gender) {
            errors.gender = 'Please select a gender';
        }

        // Role validation
        if (!formData.role) {
            errors.role = 'Please select a role';
        }

        // CNIC/Passport validation
        if (!formData.cnicPassport) {
            errors.cnicPassport = 'CNIC or Passport is required';
        } else {
            // Check if it's CNIC format first, then passport
            if (!this.validateCNIC(formData.cnicPassport) && !this.validatePassport(formData.cnicPassport)) {
                errors.cnicPassport = 'Please enter a valid CNIC (XXXXX-XXXXXXX-X) or Passport number';
            }
        }

        // Date of birth validation
        if (!formData.dateOfBirth) {
            errors.dateOfBirth = 'Date of birth is required';
        } else if (!this.validateAge(formData.dateOfBirth, formData.role)) {
            const minAge = formData.role === 'student' ? 16 : 18;
            errors.dateOfBirth = `You must be at least ${minAge} years old for this role`;
        }

        // Country validation
        if (!formData.country) {
            errors.country = 'Please select a country';
        }

        // City validation
        if (!formData.city) {
            errors.city = 'Please select a city';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    // Get password strength
    getPasswordStrength(password) {
        let strength = 0;
        let feedback = [];

        if (password.length >= 8) strength++;
        else feedback.push('At least 8 characters');

        if (/[a-z]/.test(password)) strength++;
        else feedback.push('One lowercase letter');

        if (/[A-Z]/.test(password)) strength++;
        else feedback.push('One uppercase letter');

        if (/\d/.test(password)) strength++;
        else feedback.push('One number');

        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

        const levels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        const colors = ['#ff4757', '#ff6b6b', '#ffa502', '#2ed573', '#20bf6b'];

        return {
            score: strength,
            level: levels[Math.min(strength, 4)],
            color: colors[Math.min(strength, 4)],
            feedback: feedback
        };
    }

    // Format CNIC as user types
    formatCNIC(value) {
        // Remove all non-digits
        const cleaned = value.replace(/\D/g, '');

        // Apply CNIC formatting: XXXXX-XXXXXXX-X
        if (cleaned.length <= 5) {
            return cleaned;
        } else if (cleaned.length <= 12) {
            return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
        } else {
            return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 12)}-${cleaned.slice(12, 13)}`;
        }
    }

    // Format phone number as user types
    formatPhone(value) {
        // Remove all non-digits
        const cleaned = value.replace(/\D/g, '');

        // Apply phone formatting based on length
        if (cleaned.length <= 3) {
            return cleaned;
        } else if (cleaned.length <= 6) {
            return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
        } else if (cleaned.length <= 10) {
            return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
        } else {
            return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 12)}`;
        }
    }
}

export default new ValidationService();
