import { getServiceSupabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { badge_number } = req.query
  if (!badge_number) return res.status(400).json({ error: 'badge_number required' })

  const supabase = getServiceSupabase()

  const { data: patterns, error } = await supabase
    .from('pattern_flags')
    .select('encounter_type, flag, organisation, created_at')
    .eq('badge_number', badge_number)
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })

  const total = patterns?.length || 0
  const summary = {
    total,
    red_flags: patterns?.filter(p => p.flag === 'red').length || 0,
    amber_flags: patterns?.filter(p => p.flag === 'amber').length || 0,
    green_flags: patterns?.filter(p => p.flag === 'green').length || 0,
  }

  return res.status(200).json({ patterns: patterns || [], summary })
}
