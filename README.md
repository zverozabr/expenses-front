# Telegram JSON Editor

A web application for editing JSON data tables sent from Telegram bots. Built with Next.js, TypeScript, and Vercel Postgres.

## 🚀 Features

- **Interactive Table Editing**: Edit JSON data in a user-friendly table interface using Tabulator.js
- **Real-time Updates**: Changes are saved and sent back to the Telegram bot instantly
- **Type-Safe**: Full TypeScript support with strict typing and runtime validation
- **PWA Support**: Install as a native app, works offline with service worker caching
- **Responsive Design**: Works on desktop and mobile devices
- **Accessible**: ARIA labels and keyboard navigation support
- **Data Validation**: Input validation using Zod schemas for data integrity

## 🏗️ Architecture

This project follows SOLID principles and clean architecture patterns:

- **Presentation Layer**: React components and hooks
- **Application Layer**: Custom hooks for business logic
- **Domain Layer**: Service classes and business entities
- **Infrastructure Layer**: Database and external APIs

### Key Components

- `SessionService`: Handles database operations for sessions
- `useSessionData`: Custom hook for data management
- `EditableTable`: Table component with editing capabilities
- API Routes: RESTful endpoints for data operations

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: Vercel Postgres
- **Table Library**: Tabulator.js
- **Notifications**: shadcn/ui Toast
- **Testing**: Jest, React Testing Library, Cypress
- **Deployment**: Vercel

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd telegram-bot-json-editor
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Fill in your Vercel Postgres URL:
```
POSTGRES_URL=your_postgres_url_from_vercel
```

4. Run the development server:
```bash
npm run dev
```

## 🧪 Testing

Run the test suite:
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

## 🚢 Deployment

### Vercel

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Set up Vercel Postgres database
4. Create the sessions table:

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  data JSONB,
  status TEXT DEFAULT 'pending'
);
```

## 🤖 Integration with Telegram Bot

### Bot Setup

1. Your Telegram bot should generate a unique `session_id` for each editing session
2. Save the initial JSON data to the database:

```python
# Example Python (python-telegram-bot)
session_id = str(uuid.uuid4())
# Save to Vercel Postgres
# INSERT INTO sessions (id, data, status) VALUES (session_id, json_data, 'pending')
```

3. Send a message to the user with a link:
```
https://your-app.vercel.app/edit?session_id={session_id}
```

### Data Retrieval

The bot should poll the database for status changes:

```python
# Check if user has saved the data
# SELECT data FROM sessions WHERE id = session_id AND status = 'ready'
```

## 📚 API Reference

### GET /api/session?session_id={id}
Returns the JSON data for a session.

**Response:**
```json
{
  "data": [
    {"name": "John", "age": 30},
    {"name": "Jane", "age": 25}
  ]
}
```

### POST /api/session
Saves updated JSON data for a session.

**Request:**
```json
{
  "session_id": "uuid-string",
  "data": [
    {"name": "John", "age": 31},
    {"name": "Jane", "age": 26}
  ]
}
```

## 🔒 Security

- Input validation on API endpoints
- CORS configured for Telegram web app
- No sensitive data in client-side code
- Rate limiting (implement in production)

## 📈 Performance

- Memoized components to prevent unnecessary re-renders
- Optimized database queries
- Lazy loading for large datasets
- Efficient state management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 📱 Progressive Web App (PWA)

This application is a Progressive Web App with the following features:

### Installation
- **Automatic Prompt**: Modern browsers show an install prompt
- **Manual Install**: Click the "Install App" button when available
- **Standalone Mode**: Runs like a native app without browser UI

### Offline Capabilities
- **Service Worker**: Caches static assets for offline use
- **Cache Strategy**: Network-first for API calls, cache-first for static assets
- **Offline Indicator**: Shows connection status in the UI

### Technical Implementation
- **Web App Manifest**: Defines app metadata and icons
- **Service Worker**: Handles caching and background sync
- **Install Prompt**: Uses `beforeinstallprompt` API

## 🆘 Support

If you encounter any issues, please create an issue on GitHub or contact the maintainers.
