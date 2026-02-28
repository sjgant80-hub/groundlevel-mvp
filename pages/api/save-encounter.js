import { getServiceSupabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { user_id, encounter_type, badge_number, description, location_note, recording_duration } = req.body

  if (!user_id) return res.status(400).json({ error: 'user_id required' })
  if (!description) return res.status(400).json({ error: 'description required' })

  const supabase = getServiceSupabase()

  const { data, error } = await supabase
    .from('encounters')
    .insert({
      user_id,
      encounter_type: encounter_type || 'stop_search',
      badge_number: badge_number || null,
      description,
      location_note: location_note || null,
      recording_duration: recording_duration || 0,
      status: 'recorded',
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  return res.status(200).json(data)
}
