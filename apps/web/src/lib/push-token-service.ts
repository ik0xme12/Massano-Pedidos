import { supabase } from './supabase'

export const pushTokenService = {
  async savePushToken(userId: string, token: string, platform: 'web' | 'mobile') {
    try {
      const { error } = await supabase
        .from('push_tokens')
        .upsert(
          {
            user_id: userId,
            token,
            platform,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,platform' }
        )

      if (error) throw error
      return true
    } catch (err) {
      console.error('Error saving push token:', err)
      return false
    }
  },

  async deletePushToken(userId: string, platform: 'web' | 'mobile') {
    try {
      const { error } = await supabase
        .from('push_tokens')
        .delete()
        .eq('user_id', userId)
        .eq('platform', platform)

      if (error) throw error
      return true
    } catch (err) {
      console.error('Error deleting push token:', err)
      return false
    }
  },

  async getPushToken(userId: string, platform: 'web' | 'mobile') {
    try {
      const { data, error } = await supabase
        .from('push_tokens')
        .select('token')
        .eq('user_id', userId)
        .eq('platform', platform)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data?.token || null
    } catch (err) {
      console.error('Error getting push token:', err)
      return null
    }
  },
}
