export enum ErrorCode {
    // User
    USER_NOT_FOUND = 'USER_NOT_FOUND',
    USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
    USER_CREATION_FAILED = 'USER_CREATION_FAILED',

    // Invoice
    INVOICE_NOT_FOUND = 'INVOICE_NOT_FOUND',
    INVOICE_ALREADY_EXISTS = 'INVOICE_ALREADY_EXISTS',
    INVOICE_CREATION_FAILED = 'INVOICE_CREATION_FAILED',
    INVOICE_UPDATE_FAILED = 'INVOICE_UPDATE_FAILED',
    INVOICE_DELETE_FAILED = 'INVOICE_DELETE_FAILED',
    INVOICE_FETCH_FAILED = 'INVOICE_FETCH_FAILED',

    // Registration
    REGISTRATION_NOT_FOUND = 'REGISTRATION_NOT_FOUND',
    REGISTRATION_ALREADY_EXISTS = 'REGISTRATION_ALREADY_EXISTS',
    REGISTRATION_EMAIL_EXISTS = 'REGISTRATION_EMAIL_EXISTS',
    REGISTRATION_MOBILE_EXISTS = 'REGISTRATION_MOBILE_EXISTS',
    REGISTRATION_CREATION_FAILED = 'REGISTRATION_CREATION_FAILED',
    REGISTRATION_UPDATE_FAILED = 'REGISTRATION_UPDATE_FAILED',
    REGISTRATION_FETCH_FAILED = 'REGISTRATION_FETCH_FAILED',

    // Generic
    INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

export const ErrorMessages = {
    [ErrorCode.USER_NOT_FOUND]: {
        message: '{{entity}} not found.',
    },
    [ErrorCode.USER_ALREADY_EXISTS]: {
        message: 'A {{entity}} with this {{field}} already exists.',
    },
    [ErrorCode.USER_CREATION_FAILED]: {
        message: 'Failed to create {{entity}}.',
    },
    [ErrorCode.INVOICE_NOT_FOUND]: {
        message: 'Invoice not found.',
    },
    [ErrorCode.INVOICE_ALREADY_EXISTS]: {
        message: 'Invoice already exists.',
    },
    [ErrorCode.INVOICE_CREATION_FAILED]: {
        message: 'Failed to create invoice.',
    },
    [ErrorCode.INVOICE_UPDATE_FAILED]: {
        message: 'Failed to update invoice.',
    },
    [ErrorCode.INVOICE_DELETE_FAILED]: {
        message: 'Failed to delete invoice.',
    },
    [ErrorCode.INVOICE_FETCH_FAILED]: {
        message: 'Failed to fetch invoice.',
    },
    [ErrorCode.REGISTRATION_NOT_FOUND]: {
        message: 'Registration not found.',
    },
    [ErrorCode.REGISTRATION_ALREADY_EXISTS]: {
        message: 'Registration with this details already exists.',
    },
    [ErrorCode.REGISTRATION_EMAIL_EXISTS]: {
        message: 'A registration with this email already exists.',
    },
    [ErrorCode.REGISTRATION_MOBILE_EXISTS]: {
        message: 'A registration with this mobile number already exists.',
    },
    [ErrorCode.REGISTRATION_CREATION_FAILED]: {
        message: 'Failed to create registration.',
    },
    [ErrorCode.REGISTRATION_UPDATE_FAILED]: {
        message: 'Failed to update registration.',
    },
    [ErrorCode.REGISTRATION_FETCH_FAILED]: {
        message: 'Failed to fetch registration(s).',
    },
    [ErrorCode.INTERNAL_SERVER_ERROR]: {
        message: 'An unexpected error occurred.',
    },
};
