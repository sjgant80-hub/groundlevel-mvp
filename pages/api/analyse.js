import Anthropic from '@anthropic-ai/sdk'
import { getServiceSupabase } from '../../lib/supabase'
import { ANALYSE_SYSTEM } from '../../lib/uklaw'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { description, badge_number, encounter_type, user_id } = req.body

  if (!description) return res.status(400).json({ error: 'Description required' })

  try {
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      system: ANALYSE_SYSTEM,
      messages: [{
        role: 'user',
        content: `Analyse this UK enforcement encounter:\n\n${description}${badge_number ? `\n\nBadge/ID number noted: ${badge_number}` : ''}${encounter_type ? `\n\nEncounter type: ${encounter_type}` : ''}`
      }]
    })

    const text = message.content[0].text
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Parse failed')
    const result = JSON.parse(jsonMatch[0])

    // Save to DB if user is logged in
    if (user_id) {
      const supabase = getServiceSupabase()
      const { data: encounter } = await supabase
        .from('encounters')
        .insert({
          user_id,
          encounter_type,
          badge_number,
          description,
          flag: result.flag,
          summary: result.summary,
          violations: result.violations || [],
          next_steps: result.next_steps || [],
          complaint_worthy: result.complaint_worthy,
          complaint_body: result.complaint_body,
          severity: result.severity,
          status: 'analysed',
        })
        .select()
        .single()

      // Log to pattern database (anonymised)
      if (badge_number) {
        await supabase.from('pattern_flags').insert({
          badge_number,
          encounter_type,
          flag: result.flag,
          organisation: result.complaint_body,
        })
      }

      return res.status(200).json({ ...result, encounter_id: encounter?.id })
    }

    return res.status(200).json(result)

  } catch (error) {
    console.error('Analyse error:', error)
    return res.status(500).json({ error: 'Analysis failed' })
  }
}
