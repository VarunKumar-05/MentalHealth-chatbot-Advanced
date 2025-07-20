# Sentiment Analysis Integration Guide

This guide explains how to integrate your existing sentiment analysis model with the Supabase deployment to create a comprehensive mental health chatbot that combines both rule-based and machine learning approaches.

## 🎯 Overview

The integration combines three approaches for maximum accuracy:

1. **Trained ML Model**: Your existing `model.pkl` and `vectorizer.pkl`
2. **Enhanced Edge Function**: Real-time sentiment analysis in Supabase
3. **Python Integration**: Bridge between ML model and Supabase

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Supabase      │    │   Python        │
│   (AngularJS)   │◄──►│   Edge Function │◄──►│   Integration   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Real-time     │    │   Database      │    │   ML Model      │
│   Chat UI       │    │   Storage       │    │   (model.pkl)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 File Structure

```
MentalPEP/
├── backend/
│   ├── model.pkl              # Your trained sentiment model
│   ├── vectorizer.pkl         # Text vectorizer
│   └── sentiment_analysis.py  # Original sentiment analyzer
├── supabase/
│   ├── functions/
│   │   ├── chat/
│   │   │   ├── edge_function.ts           # Basic Edge Function
│   │   │   └── enhanced_edge_function.ts  # Enhanced Edge Function
│   │   └── integrations/
│   │       └── python_sentiment_integration.py  # Python bridge
│   └── migrations/
│       └── 20240101000000_initial_schema.sql
└── frontend/
    └── supabase-client.js     # Supabase client integration
```

## 🔧 Setup Instructions

### Step 1: Deploy Enhanced Edge Function

```bash
# Deploy the enhanced Edge Function
supabase functions deploy enhanced-chat --import-map supabase/functions/import_map.json

# Or deploy both functions
supabase functions deploy chat
supabase functions deploy enhanced-chat
```

### Step 2: Configure Python Integration

```bash
# Install required Python packages
pip install requests scikit-learn numpy pandas

# Set environment variables
export SUPABASE_URL="your_supabase_url"
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

# Test the integration
python supabase/integrations/python_sentiment_integration.py
```

### Step 3: Update Frontend Configuration

Update `frontend/supabase-client.js` to use the enhanced function:

```javascript
// Use enhanced chat function for better analysis
async sendMessage(message, conversationId = null) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  // Use enhanced function for better sentiment analysis
  const { data, error } = await supabase.functions.invoke('enhanced-chat', {
    body: {
      message,
      conversationId
    }
  })
  return { data, error }
}
```

## 🧠 Sentiment Analysis Approaches

### 1. Trained ML Model (Primary)

**File**: `backend/model.pkl` and `backend/vectorizer.pkl`

**Features**:
- Pre-trained on mental health conversations
- High accuracy for domain-specific text
- Confidence scores from model probabilities

**Usage**:
```python
from supabase.integrations.python_sentiment_integration import SupabaseSentimentIntegration

integration = SupabaseSentimentIntegration(supabase_url, supabase_key)
analysis = integration.analyze_sentiment_with_model("I'm feeling sad today")
```

### 2. Enhanced Edge Function (Real-time)

**File**: `supabase/functions/chat/enhanced_edge_function.ts`

**Features**:
- Real-time processing
- Multiple analysis approaches (VADER, keywords, patterns)
- Crisis detection
- Intent recognition

**Usage**:
```javascript
// Frontend calls the enhanced function
const response = await supabase.functions.invoke('enhanced-chat', {
  body: { message: "I'm feeling sad today" }
})
```

### 3. Python Integration (Bridge)

**File**: `supabase/integrations/python_sentiment_integration.py`

**Features**:
- Combines ML model with rule-based analysis
- Fallback mechanisms
- Comprehensive analysis results
- Supabase integration

**Usage**:
```python
integration = SupabaseSentimentIntegration(supabase_url, supabase_key)
comprehensive_analysis = integration.comprehensive_analysis("I'm feeling sad today")
```

## 📊 Analysis Comparison

| Approach | Accuracy | Speed | Features | Use Case |
|----------|----------|-------|----------|----------|
| ML Model | High | Medium | Sentiment + Confidence | Primary analysis |
| Edge Function | Medium | Fast | Real-time + Crisis | Live chat |
| Python Integration | Highest | Slow | Comprehensive | Detailed analysis |

## 🔄 Integration Workflow

### Real-time Chat Flow

1. **User sends message** → Frontend
2. **Frontend calls Edge Function** → Supabase
3. **Edge Function analyzes** → Real-time sentiment
4. **Store in database** → PostgreSQL
5. **Return response** → Frontend

### Enhanced Analysis Flow

1. **Python script runs** → Background processing
2. **Load ML model** → `model.pkl`
3. **Analyze with model** → High accuracy
4. **Send to Supabase** → Database storage
5. **Update analytics** → Trend analysis

## 🚀 Deployment Options

### Option 1: Edge Function Only (Recommended for Production)

```bash
# Deploy enhanced Edge Function
supabase functions deploy enhanced-chat

# Configure frontend to use enhanced function
# Update supabase-client.js
```

**Pros**: Fast, scalable, real-time
**Cons**: Limited to Edge Function capabilities

### Option 2: Python Integration (Recommended for Analysis)

```bash
# Set up Python environment
pip install -r requirements.txt

# Run Python integration
python supabase/integrations/python_sentiment_integration.py
```

**Pros**: Uses your trained model, comprehensive analysis
**Cons**: Slower, requires Python environment

### Option 3: Hybrid Approach (Best of Both)

```bash
# Deploy both
supabase functions deploy enhanced-chat
python supabase/integrations/python_sentiment_integration.py

# Use Edge Function for real-time, Python for detailed analysis
```

**Pros**: Maximum accuracy and speed
**Cons**: More complex setup

## 📈 Performance Optimization

### Edge Function Optimization

```typescript
// Cache emotion keywords for better performance
const emotionKeywords = new Map([
  ['anxiety', ['anxious', 'worried', 'nervous']],
  ['depression', ['sad', 'depressed', 'hopeless']],
  // ... more keywords
])
```

### Python Integration Optimization

```python
# Load model once and reuse
class SupabaseSentimentIntegration:
    def __init__(self, ...):
        self.model = self.load_model()  # Load once
        self.vectorizer = self.load_vectorizer()  # Load once
```

### Database Optimization

```sql
-- Add indexes for better query performance
CREATE INDEX idx_messages_sentiment ON messages(sentiment);
CREATE INDEX idx_messages_emotion ON messages(emotion);
CREATE INDEX idx_messages_confidence ON messages(confidence);
```

## 🧪 Testing

### Test Edge Function

```bash
# Test locally
supabase functions serve

# Test with curl
curl -X POST http://localhost:54321/functions/v1/enhanced-chat \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message": "I am feeling sad today"}'
```

### Test Python Integration

```python
# Test the integration
python supabase/integrations/python_sentiment_integration.py

# Test specific functions
integration = SupabaseSentimentIntegration(supabase_url, supabase_key)
result = integration.comprehensive_analysis("I'm feeling sad today")
print(result)
```

### Test Frontend Integration

```javascript
// Test in browser console
const response = await supabase.functions.invoke('enhanced-chat', {
  body: { message: "I'm feeling sad today" }
})
console.log(response)
```

## 🔍 Monitoring and Analytics

### Supabase Dashboard

- Monitor Edge Function execution
- Track database performance
- View real-time logs

### Custom Analytics

```python
# Analyze conversation trends
messages = integration.get_conversation_history(user_id)
trends = integration.analyze_conversation_trends(messages)
print(f"Dominant emotion: {trends['dominant_emotion']}")
print(f"Average confidence: {trends['avg_confidence']:.2f}%")
```

### Crisis Detection

```typescript
// Enhanced crisis detection in Edge Function
function detectCrisisLevel(analysis: any): number {
  let level = 0
  
  // Base level from sentiment
  if (analysis.sentiment === 'negative') level += 1
  
  // Emotion-based escalation
  switch (analysis.emotion) {
    case 'suicidal': level += 5; break;
    case 'depression': level += 3; break;
    case 'anxiety': level += 2; break;
  }
  
  return Math.max(0, Math.min(level, 5))
}
```

## 🛠️ Troubleshooting

### Common Issues

1. **Model Loading Error**
   ```bash
   # Check model files exist
   ls -la backend/model.pkl backend/vectorizer.pkl
   
   # Verify file permissions
   chmod 644 backend/*.pkl
   ```

2. **Edge Function Deployment Error**
   ```bash
   # Check Supabase status
   supabase status
   
   # Redeploy function
   supabase functions deploy enhanced-chat --no-verify-jwt
   ```

3. **Python Integration Error**
   ```bash
   # Check environment variables
   echo $SUPABASE_URL
   echo $SUPABASE_SERVICE_ROLE_KEY
   
   # Install dependencies
   pip install -r requirements.txt
   ```

### Debug Commands

```bash
# Check Supabase logs
supabase logs

# Test Edge Function locally
supabase functions serve

# Test Python integration
python -c "from supabase.integrations.python_sentiment_integration import SupabaseSentimentIntegration; print('Integration loaded successfully')"
```

## 📚 API Reference

### Edge Function API

**Endpoint**: `POST /functions/v1/enhanced-chat`

**Request**:
```json
{
  "message": "I'm feeling sad today",
  "conversationId": "optional-conversation-id"
}
```

**Response**:
```json
{
  "response": "I hear that you're struggling...",
  "sentiment": "negative",
  "emotion": "depression",
  "confidence": 85.5,
  "intent": "help_request",
  "crisis_detected": false,
  "crisis_level": 3,
  "analysis_details": {
    "vader_score": {...},
    "keyword_score": {...},
    "pattern_score": {...}
  }
}
```

### Python Integration API

```python
# Initialize
integration = SupabaseSentimentIntegration(supabase_url, supabase_key)

# Analyze text
analysis = integration.comprehensive_analysis("I'm feeling sad today")

# Send to Supabase
result = integration.send_to_supabase(analysis, user_id, conversation_id)

# Get conversation history
messages = integration.get_conversation_history(user_id)

# Analyze trends
trends = integration.analyze_conversation_trends(messages)
```

## 🎯 Best Practices

1. **Use Edge Function for real-time chat**
2. **Use Python integration for detailed analysis**
3. **Implement fallback mechanisms**
4. **Monitor crisis detection accuracy**
5. **Regular model retraining**
6. **Performance monitoring**
7. **Data privacy compliance**

## 🔮 Future Enhancements

1. **Model retraining pipeline**
2. **Advanced crisis detection**
3. **Multi-language support**
4. **Voice sentiment analysis**
5. **Predictive analytics**
6. **Integration with external APIs**

---

**This integration provides a robust, scalable solution that combines the best of machine learning and real-time processing for mental health support.** 