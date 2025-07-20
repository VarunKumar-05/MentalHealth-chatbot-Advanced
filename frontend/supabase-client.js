// Supabase client configuration
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Authentication helpers
export const auth = {
  // Sign up with email
  async signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    return { data, error }
  },

  // Sign in with email
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Sign in with Google OAuth
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/index.html'
      }
    })
    return { data, error }
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Listen to auth changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database helpers
export const db = {
  // Get user conversations
  async getConversations(userId) {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
    return { data, error }
  },

  // Get messages for a conversation
  async getMessages(conversationId) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
    return { data, error }
  },

  // Create a new conversation
  async createConversation(userId, title) {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        title: title
      })
      .select()
      .single()
    return { data, error }
  },

  // Send a message (calls the Edge Function)
  async sendMessage(message, conversationId = null) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase.functions.invoke('chat', {
      body: {
        message,
        conversationId
      }
    })
    return { data, error }
  },

  // Get conversation analytics
  async getConversationAnalytics(conversationId) {
    const { data, error } = await supabase
      .from('conversation_analytics')
      .select('*')
      .eq('conversation_id', conversationId)
      .single()
    return { data, error }
  },

  // Get user profile
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  // Update user profile
  async updateUserProfile(userId, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  }
}

// Storage helpers (for user avatars, etc.)
export const storage = {
  // Upload user avatar
  async uploadAvatar(userId, file) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file)
    
    if (error) return { data: null, error }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)
    
    return { data: publicUrl, error: null }
  },

  // Delete user avatar
  async deleteAvatar(fileName) {
    const { error } = await supabase.storage
      .from('avatars')
      .remove([fileName])
    return { error }
  }
}

// Real-time subscriptions
export const realtime = {
  // Subscribe to conversation messages
  subscribeToMessages(conversationId, callback) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, callback)
      .subscribe()
  },

  // Subscribe to user conversations
  subscribeToConversations(userId, callback) {
    return supabase
      .channel(`conversations:${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe()
  }
}

// Utility functions
export const utils = {
  // Format timestamp
  formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleString()
  },

  // Get user initials
  getUserInitials(fullName) {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
  },

  // Check if user is guest
  isGuestUser(user) {
    return user?.user_metadata?.is_guest || false
  },

  // Generate guest user data
  generateGuestUser() {
    const guestId = 'guest_' + Date.now()
    return {
      id: guestId,
      email: 'guest@example.com',
      full_name: 'Guest User',
      avatar_url: null,
      is_guest: true
    }
  }
} 