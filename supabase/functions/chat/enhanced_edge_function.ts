import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Enhanced sentiment analysis combining multiple approaches
class EnhancedSentimentAnalyzer {
  private emotionKeywords = {
    'anxiety': ['anxious', 'worried', 'nervous', 'scared', 'fear', 'panic', 'stress', 'overwhelmed'],
    'depression': ['sad', 'depressed', 'hopeless', 'worthless', 'empty', 'tired', 'exhausted', 'down'],
    'anger': ['angry', 'mad', 'furious', 'irritated', 'frustrated', 'hate', 'rage'],
    'happiness': ['happy', 'joy', 'excited', 'pleased', 'content', 'grateful', 'blessed'],
    'loneliness': ['alone', 'lonely', 'isolated', 'abandoned', 'left out', 'no one'],
    'suicidal': ['suicide', 'kill myself', 'end it all', 'want to die', 'better off dead', 'no point']
  }

  private intentKeywords = {
    'help_request': ['help', 'support', 'need', 'struggling', 'crisis'],
    'greeting': ['hello', 'hi', 'how are you', 'feeling', 'doing'],
    'gratitude': ['thank', 'thanks', 'appreciate', 'grateful'],
    'meditation': ['meditate', 'breathing', 'calm', 'relax', 'mindfulness'],
    'sleep': ['sleep', 'insomnia', 'tired', 'rest', 'bed'],
    'general': ['general', 'talk', 'chat', 'conversation']
  }

  analyzeSentiment(text: string) {
    const cleanedText = this.cleanText(text)
    
    // Multiple sentiment analysis approaches
    const vaderScore = this.vaderSentiment(cleanedText)
    const keywordScore = this.keywordSentiment(cleanedText)
    const patternScore = this.patternSentiment(cleanedText)
    
    // Combine scores for better accuracy
    const combinedSentiment = this.combineSentiments([vaderScore, keywordScore, patternScore])
    const emotion = this.detectEmotion(cleanedText)
    const intent = this.detectIntent(cleanedText)
    const confidence = this.calculateConfidence(combinedSentiment, emotion, intent)
    
    return {
      sentiment: combinedSentiment.sentiment,
      emotion: emotion,
      intent: intent,
      confidence: confidence,
      scores: {
        vader: vaderScore,
        keyword: keywordScore,
        pattern: patternScore,
        combined: combinedSentiment
      }
    }
  }

  private cleanText(text: string): string {
    return text.toLowerCase()
      .replace(/[^a-zA-Z\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  private vaderSentiment(text: string) {
    // Simplified VADER-like sentiment analysis
    const positiveWords = ['good', 'great', 'wonderful', 'excellent', 'amazing', 'love', 'joy', 'happy', 'blessed']
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'angry', 'depressed', 'suicidal', 'sad', 'hopeless']
    
    const words = text.split(' ')
    let positiveCount = 0
    let negativeCount = 0
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++
      if (negativeWords.includes(word)) negativeCount++
    })
    
    const compound = (positiveCount - negativeCount) / Math.max(words.length, 1)
    
    return {
      sentiment: compound > 0.1 ? 'positive' : compound < -0.1 ? 'negative' : 'neutral',
      compound: compound,
      positive: positiveCount,
      negative: negativeCount
    }
  }

  private keywordSentiment(text: string) {
    // Keyword-based sentiment analysis
    const positiveKeywords = ['happy', 'good', 'great', 'wonderful', 'excited', 'grateful']
    const negativeKeywords = ['sad', 'bad', 'terrible', 'depressed', 'angry', 'suicidal']
    
    let positiveScore = 0
    let negativeScore = 0
    
    positiveKeywords.forEach(keyword => {
      if (text.includes(keyword)) positiveScore += 1
    })
    
    negativeKeywords.forEach(keyword => {
      if (text.includes(keyword)) negativeScore += 1
    })
    
    const total = positiveScore + negativeScore
    if (total === 0) return { sentiment: 'neutral', score: 0 }
    
    const score = (positiveScore - negativeScore) / total
    return {
      sentiment: score > 0.3 ? 'positive' : score < -0.3 ? 'negative' : 'neutral',
      score: score
    }
  }

  private patternSentiment(text: string) {
    // Pattern-based sentiment analysis
    const patterns = {
      positive: [
        /i feel (good|great|wonderful|happy|blessed)/i,
        /i am (happy|excited|grateful|content)/i,
        /things are (good|great|wonderful)/i
      ],
      negative: [
        /i feel (sad|bad|terrible|hopeless|worthless)/i,
        /i am (sad|depressed|angry|lonely)/i,
        /things are (bad|terrible|awful)/i,
        /i want to (die|kill myself|end it all)/i
      ]
    }
    
    let positiveMatches = 0
    let negativeMatches = 0
    
    patterns.positive.forEach(pattern => {
      if (pattern.test(text)) positiveMatches++
    })
    
    patterns.negative.forEach(pattern => {
      if (pattern.test(text)) negativeMatches++
    })
    
    if (positiveMatches > negativeMatches) {
      return { sentiment: 'positive', confidence: positiveMatches / (positiveMatches + negativeMatches) }
    } else if (negativeMatches > positiveMatches) {
      return { sentiment: 'negative', confidence: negativeMatches / (positiveMatches + negativeMatches) }
    } else {
      return { sentiment: 'neutral', confidence: 0.5 }
    }
  }

  private combineSentiments(scores: any[]) {
    const sentimentCounts = { positive: 0, negative: 0, neutral: 0 }
    
    scores.forEach(score => {
      sentimentCounts[score.sentiment]++
    })
    
    // Return the most common sentiment
    const maxCount = Math.max(sentimentCounts.positive, sentimentCounts.negative, sentimentCounts.neutral)
    
    if (sentimentCounts.positive === maxCount) return { sentiment: 'positive', confidence: maxCount / scores.length }
    if (sentimentCounts.negative === maxCount) return { sentiment: 'negative', confidence: maxCount / scores.length }
    return { sentiment: 'neutral', confidence: maxCount / scores.length }
  }

  private detectEmotion(text: string): string {
    const emotionScores: { [key: string]: number } = {}
    
    Object.entries(this.emotionKeywords).forEach(([emotion, keywords]) => {
      let score = 0
      keywords.forEach(keyword => {
        if (text.includes(keyword)) score += 1
      })
      if (score > 0) emotionScores[emotion] = score
    })
    
    if (Object.keys(emotionScores).length === 0) return 'neutral'
    
    // Return the emotion with highest score
    return Object.entries(emotionScores).reduce((a, b) => 
      emotionScores[a[0]] > emotionScores[b[0]] ? a : b
    )[0]
  }

  private detectIntent(text: string): string {
    const intentScores: { [key: string]: number } = {}
    
    Object.entries(this.intentKeywords).forEach(([intent, keywords]) => {
      let score = 0
      keywords.forEach(keyword => {
        if (text.includes(keyword)) score += 1
      })
      if (score > 0) intentScores[intent] = score
    })
    
    if (Object.keys(intentScores).length === 0) return 'general'
    
    // Return the intent with highest score
    return Object.entries(intentScores).reduce((a, b) => 
      intentScores[a[0]] > intentScores[b[0]] ? a : b
    )[0]
  }

  private calculateConfidence(sentiment: any, emotion: string, intent: string): number {
    let confidence = sentiment.confidence * 100
    
    // Boost confidence for strong emotions
    if (emotion === 'suicidal') confidence += 20
    if (emotion === 'depression' || emotion === 'anxiety') confidence += 10
    
    // Boost confidence for specific intents
    if (intent === 'help_request') confidence += 15
    if (intent === 'meditation' || intent === 'sleep') confidence += 10
    
    return Math.min(confidence, 100)
  }

  analyzeConversationHistory(messages: any[]) {
    if (messages.length === 0) return null
    
    const sentiments = []
    const emotions = []
    
    messages.forEach(message => {
      if (message.sender_type === 'user') {
        const analysis = this.analyzeSentiment(message.content)
        sentiments.push(analysis.sentiment)
        emotions.push(analysis.emotion)
      }
    })
    
    // Calculate trends
    const sentimentCounts = this.countOccurrences(sentiments)
    const emotionCounts = this.countOccurrences(emotions)
    
    return {
      sentiment_distribution: sentimentCounts,
      emotion_distribution: emotionCounts,
      dominant_sentiment: this.getDominant(sentimentCounts),
      dominant_emotion: this.getDominant(emotionCounts),
      message_count: messages.length
    }
  }

  private countOccurrences(arr: string[]) {
    return arr.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1
      return acc
    }, {} as { [key: string]: number })
  }

  private getDominant(counts: { [key: string]: number }) {
    return Object.entries(counts).reduce((a, b) => 
      counts[a[0]] > counts[b[0]] ? a : b
    )[0]
  }
}

// Initialize the enhanced analyzer
const analyzer = new EnhancedSentimentAnalyzer()

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user from JWT
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { message, conversationId } = await req.json()

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get or create conversation
    let conversation
    if (conversationId) {
      const { data: conv, error: convError } = await supabaseClient
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single()

      if (convError) {
        return new Response(
          JSON.stringify({ error: 'Conversation not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      conversation = conv
    } else {
      // Create new conversation
      const { data: newConv, error: createError } = await supabaseClient
        .from('conversations')
        .insert({
          user_id: user.id,
          title: message.substring(0, 50) + (message.length > 50 ? '...' : '')
        })
        .select()
        .single()

      if (createError) {
        return new Response(
          JSON.stringify({ error: 'Failed to create conversation' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      conversation = newConv
    }

    // Enhanced sentiment analysis
    const sentimentAnalysis = analyzer.analyzeSentiment(message)

    // Store user message
    const { data: userMessage, error: userMsgError } = await supabaseClient
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        user_id: user.id,
        content: message,
        sender_type: 'user',
        sentiment: sentimentAnalysis.sentiment,
        emotion: sentimentAnalysis.emotion,
        confidence: sentimentAnalysis.confidence,
        intent: sentimentAnalysis.intent
      })
      .select()
      .single()

    if (userMsgError) {
      return new Response(
        JSON.stringify({ error: 'Failed to store message' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate enhanced bot response
    const botResponse = generateEnhancedResponse(message, sentimentAnalysis)

    // Store bot message
    const { data: botMessage, error: botMsgError } = await supabaseClient
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        user_id: user.id,
        content: botResponse.response,
        sender_type: 'bot',
        sentiment: botResponse.sentiment,
        emotion: botResponse.emotion,
        confidence: botResponse.confidence,
        intent: botResponse.intent
      })
      .select()
      .single()

    if (botMsgError) {
      return new Response(
        JSON.stringify({ error: 'Failed to store bot response' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Enhanced crisis detection
    const crisisLevel = detectCrisisLevel(sentimentAnalysis)
    if (crisisLevel > 0) {
      await supabaseClient
        .from('crisis_flags')
        .insert({
          conversation_id: conversation.id,
          user_id: user.id,
          message_id: userMessage.id,
          flag_type: crisisLevel >= 5 ? 'suicidal' : 'crisis',
          severity_level: crisisLevel,
          notes: `Enhanced detection: ${sentimentAnalysis.emotion} (${sentimentAnalysis.confidence}% confidence)`
        })
    }

    // Update conversation analytics with enhanced analysis
    await updateEnhancedAnalytics(supabaseClient, conversation.id, user.id)

    return new Response(
      JSON.stringify({
        response: botResponse.response,
        conversation_id: conversation.id,
        sentiment: botResponse.sentiment,
        emotion: botResponse.emotion,
        confidence: botResponse.confidence,
        intent: botResponse.intent,
        crisis_detected: crisisLevel > 0,
        crisis_level: crisisLevel,
        analysis_details: {
          vader_score: sentimentAnalysis.scores.vader,
          keyword_score: sentimentAnalysis.scores.keyword,
          pattern_score: sentimentAnalysis.scores.pattern,
          combined_score: sentimentAnalysis.scores.combined
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function generateEnhancedResponse(message: string, analysis: any) {
  const responses = {
    help_request: {
      positive: "I'm glad you're reaching out! I'm here to support you. What specific help do you need?",
      negative: "I hear that you're struggling. You're not alone, and I'm here to help. Can you tell me more about what you're going through?",
      neutral: "I'm here to help you. What would you like to talk about?"
    },
    greeting: {
      positive: "I'm doing well, thank you for asking! I'm here to support you. How are you feeling today?",
      negative: "I'm here for you. I can sense you might be going through a difficult time. Would you like to talk about it?",
      neutral: "I'm here and ready to listen. How are you feeling today?"
    },
    gratitude: {
      positive: "You're very welcome! I'm glad I could help. Is there anything else you'd like to discuss?",
      negative: "You're welcome. I'm here whenever you need support. Remember, you don't have to go through this alone.",
      neutral: "You're welcome! I'm here to support you."
    },
    meditation: {
      positive: "That's wonderful that you're interested in meditation! It can be a great tool for mental wellness.",
      negative: "Meditation can be very helpful during difficult times. Would you like to try a simple breathing exercise?",
      neutral: "Meditation is a great practice for mental health. Would you like to learn more?"
    },
    sleep: {
      positive: "Good sleep is essential for mental health! I'm glad you're thinking about it.",
      negative: "Sleep issues can really impact our mental health. Would you like to talk about what's affecting your sleep?",
      neutral: "Sleep is crucial for mental wellness. How have you been sleeping lately?"
    },
    general: {
      positive: "That sounds wonderful! I'm here to listen and support you.",
      negative: "I can sense you're going through a difficult time. I'm here to listen and support you. Would you like to talk more about what's on your mind?",
      neutral: "I'm here to listen and support you. What's on your mind?"
    }
  }

  const response = responses[analysis.intent]?.[analysis.sentiment] || responses.general[analysis.sentiment]
  
  return {
    response,
    sentiment: analysis.sentiment,
    emotion: analysis.emotion,
    confidence: analysis.confidence,
    intent: analysis.intent
  }
}

function detectCrisisLevel(analysis: any): number {
  let level = 0
  
  // Base level from sentiment
  if (analysis.sentiment === 'negative') level += 1
  if (analysis.sentiment === 'positive') level -= 1
  
  // Emotion-based escalation
  switch (analysis.emotion) {
    case 'suicidal':
      level += 5
      break
    case 'depression':
      level += 3
      break
    case 'anxiety':
      level += 2
      break
    case 'anger':
      level += 2
      break
    case 'loneliness':
      level += 1
      break
  }
  
  // Confidence-based adjustment
  if (analysis.confidence > 80) level += 1
  if (analysis.confidence > 90) level += 1
  
  // Intent-based adjustment
  if (analysis.intent === 'help_request') level += 1
  
  return Math.max(0, Math.min(level, 5))
}

async function updateEnhancedAnalytics(supabaseClient: any, conversationId: string, userId: string) {
  // Get conversation messages
  const { data: messages } = await supabaseClient
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (messages && messages.length > 0) {
    // Enhanced conversation analysis
    const analysis = analyzer.analyzeConversationHistory(messages)
    
    if (analysis) {
      // Upsert analytics
      await supabaseClient
        .from('conversation_analytics')
        .upsert({
          conversation_id: conversationId,
          user_id: userId,
          dominant_sentiment: analysis.dominant_sentiment,
          dominant_emotion: analysis.dominant_emotion,
          message_count: analysis.message_count,
          avg_confidence: messages.reduce((sum, msg) => sum + (msg.confidence || 0), 0) / messages.length
        })
    }
  }
} 