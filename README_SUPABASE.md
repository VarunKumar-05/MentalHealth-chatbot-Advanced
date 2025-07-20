# Mental Health Chatbot - Supabase Deployment

A secure, scalable mental health chatbot built with Supabase, featuring real-time chat, sentiment analysis, crisis detection, and OAuth authentication.

## 🚀 Features

### 🔐 Authentication & Security
- **Supabase Auth**: Built-in authentication with email/password and OAuth
- **Google OAuth**: Seamless Google sign-in integration
- **Row Level Security (RLS)**: Database-level security policies
- **JWT Tokens**: Secure session management
- **Guest Access**: Anonymous usage option

### 🤖 AI & Analytics
- **Real-time Chat**: Instant messaging with sentiment analysis
- **Conversation History**: Persistent chat sessions
- **Crisis Detection**: Automatic flagging of concerning messages
- **Analytics Dashboard**: Conversation insights and trends
- **Intent Recognition**: Understanding user needs

### 🗄️ Database & Storage
- **PostgreSQL**: Robust relational database
- **Real-time Subscriptions**: Live updates across clients
- **File Storage**: User avatar and media storage
- **Backup & Recovery**: Automatic database backups

### 🎨 Modern UI/UX
- **Responsive Design**: Works on all devices
- **Real-time Updates**: Live message synchronization
- **Dark/Light Mode**: User preference support
- **Accessibility**: WCAG compliant design

## 📋 Prerequisites

- [Supabase Account](https://supabase.com) (Free tier available)
- [Node.js](https://nodejs.org) (v18 or higher)
- [Git](https://git-scm.com)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

## 🛠️ Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/mental-health-chatbot.git
cd mental-health-chatbot

# Install dependencies
npm install

# Install Supabase CLI globally
npm install -g supabase
```

### 2. Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Copy your project URL and anon key

### 3. Configure Environment

```bash
# Create environment file
cp .env.example .env

# Update with your Supabase credentials
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Deploy Database

```bash
# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy database schema
supabase db push

# Deploy Edge Functions
supabase functions deploy
```

### 5. Start Development

```bash
# Start local Supabase
supabase start

# Open Supabase Studio
supabase studio
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Supabase      │    │   Edge Functions │
│   (AngularJS)   │◄──►│   (PostgreSQL)  │◄──►│   (Deno)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Authentication │    │   Real-time     │    │   Sentiment     │
│   (OAuth/Email) │    │   Subscriptions │    │   Analysis      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
MentalPEP/
├── frontend/                 # Frontend application
│   ├── entry.html           # Entry point with auth check
│   ├── login.html           # OAuth login page
│   ├── index.html           # Main chat interface
│   ├── app.js               # AngularJS chat controller
│   ├── login.js             # Authentication controller
│   ├── supabase-client.js   # Supabase client configuration
│   ├── styles.css           # Main styles
│   └── login.css            # Login page styles
├── supabase/                # Supabase configuration
│   ├── config.toml          # Supabase project config
│   ├── migrations/          # Database migrations
│   └── functions/           # Edge Functions
│       └── chat/            # Chat processing function
├── backend/                 # Legacy Flask backend (optional)
├── package.json             # Node.js dependencies
├── vercel.json              # Vercel deployment config
└── README files
```

## 🔧 Configuration

### Database Schema

The application uses the following main tables:

- **users**: User profiles and authentication data
- **conversations**: Chat sessions
- **messages**: Individual chat messages with sentiment data
- **conversation_analytics**: Aggregated conversation insights
- **crisis_flags**: Crisis detection and intervention tracking

### Authentication Providers

Configure OAuth providers in Supabase Dashboard:

1. Go to Authentication → Providers
2. Enable Google OAuth
3. Add your Google Client ID and Secret
4. Configure redirect URLs

### Environment Variables

```bash
# Required
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key

# Optional
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GOOGLE_CLIENT_ID=your_google_client_id
```

## 🚀 Deployment

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Configure environment variables in Vercel dashboard
```

### Option 2: Netlify

```bash
# Deploy to Netlify
netlify deploy --prod

# Configure environment variables in Netlify dashboard
```

### Option 3: Manual Deployment

1. Upload `frontend/` to your web server
2. Configure environment variables
3. Update Supabase redirect URLs

## 🔒 Security Features

### Row Level Security (RLS)

All database tables have RLS policies:

```sql
-- Users can only access their own data
CREATE POLICY "Users can view own conversations" ON conversations
    FOR SELECT USING (auth.uid() = user_id);
```

### Authentication Security

- JWT token validation
- Secure session management
- OAuth provider integration
- Password hashing (handled by Supabase)

### API Security

- CORS configuration
- Rate limiting on Edge Functions
- Input validation and sanitization
- Secure headers configuration

## 📊 Monitoring & Analytics

### Supabase Dashboard

- Database performance metrics
- Authentication logs
- Edge Function execution logs
- Real-time subscription monitoring

### Custom Analytics

- Conversation sentiment trends
- Crisis detection alerts
- User engagement metrics
- Response time monitoring

## 🧪 Testing

### Local Testing

```bash
# Start local environment
supabase start

# Test Edge Functions
supabase functions serve

# Reset database
supabase db reset
```

### Production Testing

1. **Authentication Flow**: Test OAuth and email sign-in
2. **Chat Functionality**: Verify message sending/receiving
3. **Crisis Detection**: Test crisis flagging system
4. **Real-time Features**: Test live updates
5. **Data Persistence**: Verify conversation storage

## 🔧 Development

### Adding New Features

1. **Database Changes**: Create new migration
2. **Edge Functions**: Add new function in `supabase/functions/`
3. **Frontend**: Update AngularJS controllers
4. **Styling**: Modify CSS files

### Local Development

```bash
# Start development environment
npm run dev

# Watch for changes
supabase functions serve --watch

# Generate TypeScript types
npm run types
```

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check Supabase redirect URLs
   - Verify domain configuration
   - Review CORS headers

2. **Authentication Issues**
   - Verify OAuth configuration
   - Check redirect URLs
   - Review auth logs

3. **Database Connection**
   - Verify connection string
   - Check RLS policies
   - Monitor database status

### Debug Commands

```bash
# Check Supabase status
supabase status

# View logs
supabase logs

# Reset local database
supabase db reset

# Generate types
supabase gen types typescript --local > types.ts
```

## 📈 Performance Optimization

### Database Optimization

- Proper indexing on frequently queried columns
- Connection pooling configuration
- Query optimization and monitoring

### Edge Function Optimization

- Function size optimization
- Caching strategies
- Cold start mitigation

### Frontend Optimization

- Bundle size optimization
- CDN usage for static assets
- Lazy loading implementation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Mental Health Resources

- **Crisis Hotline**: 988 (US)
- **Emergency Services**: 911 (US)
- **International Resources**: [Find local crisis resources](https://www.iasp.info/resources/Crisis_Centres/)

### Technical Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Community](https://github.com/supabase/supabase/discussions)
- [Project Issues](https://github.com/yourusername/mental-health-chatbot/issues)

## ⚠️ Important Disclaimers

- This chatbot is not a substitute for professional medical help
- Always seek professional assistance for mental health concerns
- Crisis situations require immediate professional intervention
- This tool is for educational and support purposes only

---

**Built with ❤️ for mental health support** 