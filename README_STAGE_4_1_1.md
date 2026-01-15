# AI Website Builder Backend - Stage 4.1.1: Input Validation & Preprocessing

## Overview

This is the backend implementation for Stage 4.1.1 of the AI Website Builder project, focusing on input validation and preprocessing. The system validates, sanitizes, and preprocesses all incoming user inputs before sending them to the AI requirement extraction system.

## Features

### Input Validation
- **session_id validation**: Checks that session_id exists, is a string, and matches valid UUID format
- **text validation**: Checks that text exists, is a string, and is not empty
- **Error handling**: Returns HTTP 400 with descriptive JSON error messages for invalid inputs

### Input Sanitization
- **Whitespace handling**: Trims whitespace at start and end
- **Space normalization**: Collapses multiple consecutive spaces into a single space
- **Security**: Strips HTML tags, script tags, and control characters
- **Character filtering**: Removes emojis and special unicode characters that may break parsing

### Logging
- Logs all invalid requests with session_id, timestamp, and reason for rejection
- Logs valid requests with sanitization details
- Structured JSON logging for debugging and QA purposes

## API Endpoints

### POST /api/input

Submit user input for AI requirement extraction.

**Request:**
```json
{
  "session_id": "123e4567-e89b-12d3-a456-426614174000",
  "text": "I want to build a professional website"
}
```

**Success Response (200):**
```json
{
  "session_id": "123e4567-e89b-12d3-a456-426614174000",
  "text": "I want to build a professional website",
  "original_text": "I want to build a professional website"
}
```

**Error Response (400):**
```json
{
  "error": "Invalid input: session_id must be a valid UUID format"
}
```

### GET /health

Health check endpoint.

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "service": "AI Website Builder - Input Validation & Preprocessing"
}
```

## Project Structure

```
src/
├── index.ts                    # Main application entry point
├── types/
│   └── index.ts                # TypeScript type definitions
├── middleware/
│   ├── validation.ts           # Input validation middleware
│   └── sanitization.ts         # Input sanitization middleware
├── routes/
│   ├── input.ts                # API routes
│   └── __tests__/
│       └── input.test.ts       # Integration tests
└── utils/
    ├── validator.ts            # Validation utilities
    ├── sanitizer.ts            # Sanitization utilities
    ├── logger.ts               # Logging utilities
    └── __tests__/
        ├── validator.test.ts   # Validator unit tests
        └── sanitizer.test.ts   # Sanitizer unit tests
```

## Installation

```bash
# Install dependencies
npm install
```

## Usage

### Development
```bash
# Run in development mode
npm run dev
```

### Production
```bash
# Build the project
npm run build

# Start the server
npm start
```

### Testing
```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage
```

### Linting
```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run lint:fix
```

## Validation Rules

### session_id
- Must exist (not null or undefined)
- Must be a string
- Cannot be empty or whitespace-only
- Must match valid UUID format (any version)

### text
- Must exist (not null or undefined)
- Must be a string
- Cannot be empty or whitespace-only

## Sanitization Rules

1. **Trim whitespace**: Remove leading and trailing whitespace
2. **Collapse spaces**: Replace multiple consecutive spaces/tabs/newlines with single space
3. **Strip HTML tags**: Remove all HTML tags including script tags
4. **Remove control characters**: Remove null bytes and control characters
5. **Remove emojis**: Strip emoji characters that may break parsing
6. **Final trim**: Ensure no trailing spaces remain

## Test Coverage

The implementation includes comprehensive unit and integration tests covering:

- ✅ Valid inputs with sanitization
- ✅ Missing session_id (expect 400)
- ✅ Invalid session_id format (expect 400)
- ✅ Empty text (expect 400)
- ✅ Malicious input (script tags, HTML injection)
- ✅ Whitespace handling
- ✅ Edge cases (long text, special characters)

All tests pass with >80% code coverage.

## Integration with Stage 4.1.2

The sanitized output from this stage is ready for AI Requirement Extraction (Stage 4.1.2). The response includes:
- `session_id`: Validated UUID for session tracking
- `text`: Sanitized and safe text ready for AI processing
- `original_text`: Original input for audit/logging purposes

## Security Considerations

- XSS Prevention: All HTML/script tags are stripped
- Injection Prevention: Control characters and null bytes removed
- Input validation: Strict type and format checking
- Error messages: Descriptive but don't leak system information
- Logging: All invalid requests logged for security monitoring

## Dependencies

### Production
- `express`: Web framework
- `uuid`: UUID validation
- `validator`: Additional validation utilities

### Development
- `typescript`: TypeScript compiler
- `jest`: Testing framework
- `supertest`: HTTP assertion library
- `eslint`: Code linting
- `ts-jest`: TypeScript support for Jest

## License

MIT
