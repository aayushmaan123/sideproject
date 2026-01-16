# Stage 4.4.2: Page Content Generation

## Overview

Stage 4.4.2 implements the page content generation system that creates structured, professional content for each section of a website. This stage transforms the page structures from Stage 4.4.1 into ready-to-render content objects that the frontend can display directly.

## Architecture

```
┌─────────────────┐
│ ContentGenerator│
│    Service      │
└────────┬────────┘
         │
         ├─── Fetches Latest Requirement (Stage 4.2)
         ├─── Fetches Template (Stage 4.3)
         ├─── Fetches Page Structure (Stage 4.4.1)
         │
         ├─── Generates Content per Section Type
         │    ├── Hero Content
         │    ├── Features Content
         │    ├── Pricing Content
         │    ├── Testimonials Content
         │    ├── About Content
         │    ├── Contact Content
         │    ├── FAQ Content
         │    ├── Product Catalog Content
         │    ├── Menu Content
         │    ├── Gallery Content
         │    ├── Blog Content
         │    └── CTA Content
         │
         └─── Stores in PageContent Model
```

## Database Schema

### PageContent Model

```typescript
{
  id: UUID (PK, auto-generated)
  session_id: UUID
  template_id: UUID
  page_slug: string ("/", "/about", etc.)
  section_type: string ("hero", "features", etc.)
  content_json: JSON (structured content object)
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Unique Constraint**: `(session_id, template_id, page_slug, section_type)`

**Indexes**:
- session_id, template_id (composite)
- page_slug
- section_type

## Content Type Schemas

### 1. Hero Content
```typescript
{
  headline: string          // Main headline
  subheadline: string       // Supporting text
  cta_text: string          // Call-to-action button text
  cta_url: string           // Call-to-action URL
}
```

### 2. Features Content
```typescript
{
  title: string
  features: [
    {
      icon: string          // Icon identifier
      title: string         // Feature name
      description: string   // Feature description
    }
  ]
}
```

### 3. Pricing Content
```typescript
{
  title: string
  plans: [
    {
      name: string          // Plan name (Basic, Pro, etc.)
      price: string         // Price display
      features: string[]    // List of features
      cta_text: string      // Button text
      cta_url: string       // Button URL
      highlighted: boolean  // Most popular flag
    }
  ]
}
```

### 4. Testimonials Content
```typescript
{
  title: string
  testimonials: [
    {
      quote: string
      author: string
      role: string
      company: string
      image: string         // Optional avatar URL
    }
  ]
}
```

### 5. About Content
```typescript
{
  title: string
  description: string
  team_section: {
    title: string
    members: [
      {
        name: string
        role: string
        bio: string
        image: string       // Optional photo URL
      }
    ]
  }
}
```

### 6. Contact Content
```typescript
{
  title: string
  description: string
  contact_info: {
    email: string
    phone: string
    address: string
  }
}
```

### 7. FAQ Content
```typescript
{
  title: string
  questions: [
    {
      question: string
      answer: string
    }
  ]
}
```

### 8-12. Additional Content Types
- **Product Catalog**: title, products array
- **Menu**: title, categories, items array
- **Gallery**: title, gallery items with images
- **Blog**: title, posts array with excerpts
- **CTA**: headline, description, CTA

## API Reference

### POST /api/content/generate

Generates and stores content for all pages and sections of a website.

**Request**:
```json
{
  "session_id": "123e4567-e89b-12d3-a456-426614174000",
  "template_id": "987e6543-e21b-12d3-a456-426614174999"
}
```

**Response (201 Created)**:
```json
{
  "session_id": "123e4567-e89b-12d3-a456-426614174000",
  "template_id": "987e6543-e21b-12d3-a456-426614174999",
  "content_count": 8,
  "contents": [
    {
      "id": "content-uuid-1",
      "session_id": "123e4567-e89b-12d3-a456-426614174000",
      "template_id": "987e6543-e21b-12d3-a456-426614174999",
      "page_slug": "/",
      "section_type": "hero",
      "content_json": {
        "headline": "Discover Amazing Products",
        "subheadline": "Shop our curated collection with modern and clean style",
        "cta_text": "Shop Now",
        "cta_url": "/products"
      },
      "createdAt": "2026-01-16T23:00:00.000Z",
      "updatedAt": "2026-01-16T23:00:00.000Z"
    }
    // ... more content objects
  ],
  "message": "Content generated successfully"
}
```

**Response (200 OK)** - If content already exists:
```json
{
  "session_id": "123e4567-e89b-12d3-a456-426614174000",
  "template_id": "987e6543-e21b-12d3-a456-426614174999",
  "content_count": 8,
  "contents": [...],
  "message": "Content already generated"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid session_id or template_id format
- `404 Not Found`: Missing requirement, template, or page structure
- `500 Internal Server Error`: Server error during generation

### GET /api/content/:session_id/:template_id

Retrieves all generated content for a session and template.

**Request**:
```
GET /api/content/123e4567-e89b-12d3-a456-426614174000/987e6543-e21b-12d3-a456-426614174999
```

**Response (200 OK)**:
```json
{
  "session_id": "123e4567-e89b-12d3-a456-426614174000",
  "template_id": "987e6543-e21b-12d3-a456-426614174999",
  "content_count": 8,
  "contents": [
    // Array of all content objects
  ]
}
```

**Error Responses**:
- `400 Bad Request`: Invalid UUID format
- `404 Not Found`: No content found for this session and template
- `500 Internal Server Error`: Server error

## Content Generation Logic

### Business Type → Content Mapping

#### E-Commerce
- **Hero**: "Discover Amazing Products" + shopping CTAs
- **Features**: Product-focused features
- **Product Catalog**: Product grid layout
- **Testimonials**: Customer reviews

#### Restaurant
- **Hero**: "Experience Fine Dining" + reservation CTAs
- **Menu**: Food categories and items
- **About**: Chef's story and restaurant history
- **Contact**: Location and hours

#### Portfolio
- **Hero**: "Creative Excellence" + portfolio CTAs
- **Gallery**: Project showcase
- **About**: Artist/designer biography
- **Testimonials**: Client feedback

#### SaaS
- **Hero**: "Transform Your Workflow" + trial CTAs
- **Features**: Software capabilities
- **Pricing**: Tiered pricing plans
- **FAQ**: Common questions

#### Blog
- **Hero**: "Insights & Stories" + subscribe CTAs
- **Blog Grid**: Recent posts
- **About**: Author information
- **Contact**: Newsletter signup

### Design Preferences Integration

Design preferences from requirements are incorporated into:
- Subheadlines and descriptions
- Tone and language style
- Content hints for frontend styling

Example:
- "modern and clean" → Professional, concise copy
- "elegant and artistic" → Refined, sophisticated language
- "playful and vibrant" → Energetic, casual tone

## Usage Examples

### Example 1: Generate Content for E-Commerce Site

```bash
# 1. First, ensure you have completed Stages 4.1.1 - 4.4.1

# 2. Generate content
curl -X POST http://localhost:3000/api/content/generate \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "your-session-uuid",
    "template_id": "your-template-uuid"
  }'

# 3. Retrieve generated content
curl http://localhost:3000/api/content/your-session-uuid/your-template-uuid
```

### Example 2: Programmatic Usage

```typescript
import axios from 'axios';

async function generateAndRetrieveContent(sessionId: string, templateId: string) {
  // Generate content
  const generateResponse = await axios.post('http://localhost:3000/api/content/generate', {
    session_id: sessionId,
    template_id: templateId
  });
  
  console.log(`Generated ${generateResponse.data.content_count} content items`);
  
  // Retrieve content
  const retrieveResponse = await axios.get(
    `http://localhost:3000/api/content/${sessionId}/${templateId}`
  );
  
  return retrieveResponse.data.contents;
}
```

## Integration with Other Stages

### Prerequisites
1. **Stage 4.1.1**: Input validation and sanitization
2. **Stage 4.1.2**: AI requirement extraction
3. **Stage 4.2**: Requirement storage
4. **Stage 4.3**: Template selection
5. **Stage 4.4.1**: Page structure generation

### Integration Flow

```
User Input (4.1.1)
    ↓
AI Extraction (4.1.2)
    ↓
Save Requirement (4.2)
    ↓
Select Template (4.3)
    ↓
Generate Page Structure (4.4.1)
    ↓
Generate Content (4.4.2) ← YOU ARE HERE
    ↓
Frontend Rendering (Stage 5)
```

## Error Handling

### Validation Errors
```json
{
  "error": "Invalid input: session_id must be a valid UUID"
}
```

### Not Found Errors
```json
{
  "error": "Requirement not found for session_id"
}
{
  "error": "Template not found"
}
{
  "error": "Page structure not found. Please generate page structure first using POST /api/pages/generate"
}
```

### Server Errors
```json
{
  "error": "Failed to generate content: <detailed error message>"
}
```

## Logging

All operations are logged with structured JSON:

```json
{
  "timestamp": "2026-01-16T23:00:00.000Z",
  "level": "INFO",
  "message": "Content generation requested",
  "session_id": "123e4567-e89b-12d3-a456-426614174000",
  "template_id": "987e6543-e21b-12d3-a456-426614174999"
}
```

## Performance Considerations

### Generation Time
- **Per Section**: ~50-100ms
- **Full Website** (8-10 sections): ~500ms-1s
- **Database Write**: ~10-20ms per item

### Optimization Tips
1. **Caching**: Cache generated content for repeated requests
2. **Batching**: Generate content for multiple templates in parallel
3. **Lazy Loading**: Generate content on-demand for specific pages only
4. **CDN**: Serve static content via CDN for frontend

## Security

### Input Validation
- UUID format validation for all IDs
- Type checking for all inputs
- SQL injection prevention via Sequelize ORM

### Output Validation
- Content structure validation before storage
- Type safety via TypeScript interfaces
- Proper error messages without exposing internals

### Logging
- Structured logging for audit trails
- No sensitive data in logs
- Timestamp tracking for all operations

## Troubleshooting

### Issue: Content Not Generating
**Symptom**: POST /api/content/generate returns 404

**Solutions**:
1. Verify requirement exists: `GET /api/requirements/:session_id?latest=true`
2. Verify template exists: Check template was seeded or created
3. Verify page structure exists: `GET /api/pages/:session_id/:template_id`
4. Generate page structure first: `POST /api/pages/generate`

### Issue: Invalid UUID Error
**Symptom**: 400 error about invalid UUID

**Solution**:
- Ensure session_id and template_id are valid UUIDs (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
- Use `uuidv4()` to generate valid UUIDs

### Issue: Content Already Exists
**Symptom**: POST returns 200 instead of 201

**Explanation**:
- This is expected behavior (idempotent operation)
- Content was already generated for this session + template combination
- Use GET endpoint to retrieve existing content

## Testing

### Run Tests
```bash
# All tests
npm test

# Stage 4.4.2 specific tests
npm test -- src/routes/__tests__/content.test.ts
npm test -- src/services/__tests__/content-generator.service.test.ts
npm test -- src/models/__tests__/PageContent.test.ts
```

### Manual Testing
```bash
# 1. Start the server
npm run dev

# 2. Generate content (replace with actual UUIDs)
curl -X POST http://localhost:3000/api/content/generate \
  -H "Content-Type: application/json" \
  -d '{"session_id":"your-uuid","template_id":"your-uuid"}'

# 3. Retrieve content
curl http://localhost:3000/api/content/your-session-uuid/your-template-uuid
```

## Future Enhancements

1. **AI-Powered Content**: Replace deterministic generation with OpenAI GPT-4
2. **Content Variations**: Generate multiple content options for A/B testing
3. **Localization**: Support multiple languages
4. **Media Integration**: Auto-generate or suggest images/videos
5. **SEO Optimization**: Generate SEO-friendly meta descriptions and titles
6. **Content Versioning**: Track content changes over time
7. **User Editing**: Allow users to edit generated content
8. **Content Analytics**: Track which content performs best

## Summary

Stage 4.4.2 provides:
- ✅ 12 content type schemas
- ✅ Deterministic content generation
- ✅ Business type-specific content
- ✅ Design preference integration
- ✅ RESTful API endpoints
- ✅ Comprehensive error handling
- ✅ Structured logging
- ✅ Database persistence
- ✅ Idempotent operations
- ✅ Production-ready code

**Next Stage**: Frontend rendering (Stage 5) will consume this content to build actual web pages.

---

*Documentation Version: 1.0*  
*Last Updated: 2026-01-16*  
*Stage Status: ✅ PRODUCTION-READY*
