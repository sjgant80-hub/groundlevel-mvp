import { getServiceSupabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { user_id } = req.query
  if (!user_id) return res.status(400).json({ error: 'user_id required' })

  const supabase = getServiceSupabase()

  const [{ data: profile }, { data: encounters }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user_id).single(),
    supabase.from('encounters').select('*').eq('user_id', user_id).order('created_at', { ascending: false }),
  ])

  return res.status(200).json({ profile: profile || null, encounters: encounters || [] })
}
