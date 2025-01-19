module.exports = {
    FILES_FOLDER: {
        public: 'public',
        default: 'default',
        userImages: 'userImages',
        productImages: 'productImages',
    },

    ROLES: {
        admin: 'Admin',
        user: 'User',
    },

    TOKEN_TYPES: {
        access: 'Access',
        refresh: 'Refresh',
        verifyOtp: 'VerifyOtp',
    },

    SOCIAL_TYPES: {
        google: 'Google',
        apple: 'Apple',
    },

    FILE_QUALITY: {
        large: { type: 'high', quality: 80 },
        small: { type: 'low', quality: 1 },
    },

    FILE_SIZE: {
        large: { type: 'large', size: [888, 595] },
        small: { type: 'small', size: [84, 48] },
    },
};
