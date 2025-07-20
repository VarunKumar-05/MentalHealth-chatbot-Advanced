import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

    // Analyze sentiment (simplified - you can integrate your ML model here)
    const sentiment = analyzeSentiment(message)
    const emotion = analyzeEmotion(message)
    const intent = analyzeIntent(message)

    // Store user message
    const { data: userMessage, error: userMsgError } = await supabaseClient
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        user_id: user.id,
        content: message,
        sender_type: 'user',
        sentiment: sentiment.sentiment,
        emotion: sentiment.emotion,
        confidence: sentiment.confidence,
        intent: intent
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

    // Generate bot response
    const botResponse = generateResponse(message, sentiment, intent)

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

    // Check for crisis flags
    if (sentiment.emotion === 'suicidal' || sentiment.emotion === 'crisis') {
      await supabaseClient
        .from('crisis_flags')
        .insert({
          conversation_id: conversation.id,
          user_id: user.id,
          message_id: userMessage.id,
          flag_type: sentiment.emotion,
          severity_level: sentiment.confidence > 70 ? 5 : 3,
          notes: 'Auto-detected by sentiment analysis'
        })
    }

    // Update conversation analytics
    await updateConversationAnalytics(supabaseClient, conversation.id, user.id)

    return new Response(
      JSON.stringify({
        response: botResponse.response,
        conversation_id: conversation.id,
        sentiment: botResponse.sentiment,
        emotion: botResponse.emotion,
        confidence: botResponse.confidence,
        intent: botResponse.intent,
        crisis_detected: sentiment.emotion === 'suicidal' || sentiment.emotion === 'crisis'
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

// Simple sentiment analysis (replace with your ML model)
function analyzeSentiment(text: string) {
  const positiveWords = ['happy', 'good', 'great', 'wonderful', 'excellent', 'amazing', 'love', 'joy']
  const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'hate', 'angry', 'depressed', 'suicidal']
  
  const words = text.toLowerCase().split(' ')
  let positiveCount = 0
  let negativeCount = 0
  
  words.forEach(word => {
    if (positiveWords.includes(word)) positiveCount++
    if (negativeWords.includes(word)) negativeCount++
  })
  
  if (negativeCount > positiveCount) {
    return { sentiment: 'negative', emotion: 'depression', confidence: 75.0 }
  } else if (positiveCount > negativeCount) {
    return { sentiment: 'positive', emotion: 'happiness', confidence: 80.0 }
  } else {
    return { sentiment: 'neutral', emotion: 'neutral', confidence: 60.0 }
  }
}

function analyzeEmotion(text: string) {
  const text_lower = text.toLowerCase()
  
  if (text_lower.includes('suicidal') || text_lower.includes('kill myself')) {
    return 'suicidal'
  } else if (text_lower.includes('anxiety') || text_lower.includes('worried')) {
    return 'anxiety'
  } else if (text_lower.includes('depressed') || text_lower.includes('sad')) {
    return 'depression'
  } else if (text_lower.includes('angry') || text_lower.includes('mad')) {
    return 'anger'
  } else if (text_lower.includes('lonely') || text_lower.includes('alone')) {
    return 'loneliness'
  } else {
    return 'neutral'
  }
}

function analyzeIntent(text: string) {
  const text_lower = text.toLowerCase()
  
  if (text_lower.includes('help') || text_lower.includes('support')) {
    return 'help_request'
  } else if (text_lower.includes('how are you') || text_lower.includes('feeling')) {
    return 'greeting'
  } else if (text_lower.includes('thank')) {
    return 'gratitude'
  } else {
    return 'general'
  }
}

function generateResponse(message: string, sentiment: any, intent: string) {
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
    general: {
      positive: "That sounds wonderful! I'm here to listen and support you.",
      negative: "I can sense you're going through a difficult time. I'm here to listen and support you. Would you like to talk more about what's on your mind?",
      neutral: "I'm here to listen and support you. What's on your mind?"
    }
  }

  const response = responses[intent]?.[sentiment.sentiment] || responses.general[sentiment.sentiment]
  
  return {
    response,
    sentiment: sentiment.sentiment,
    emotion: sentiment.emotion,
    confidence: sentiment.confidence,
    intent
  }
}

async function updateConversationAnalytics(supabaseClient: any, conversationId: string, userId: string) {
  // Get conversation summary
  const { data: summary } = await supabaseClient
    .rpc('get_conversation_summary', { conv_id: conversationId })

  if (summary && summary.length > 0) {
    const analytics = summary[0]
    
    // Upsert analytics
    await supabaseClient
      .from('conversation_analytics')
      .upsert({
        conversation_id: conversationId,
        user_id: userId,
        dominant_sentiment: analytics.dominant_sentiment,
        dominant_emotion: analytics.dominant_emotion,
        message_count: analytics.message_count,
        avg_confidence: analytics.avg_confidence
      })
  }
} 