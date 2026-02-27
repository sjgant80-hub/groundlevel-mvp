import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { encounter_description, complaint_body, badge_number, encounter_type } = req.body

  if (!encounter_description) return res.status(400).json({ error: 'encounter_description required' })
  if (!complaint_body) return res.status(400).json({ error: 'complaint_body required' })

  try {
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      system: `You are a legal letter writer helping UK citizens draft formal complaints about enforcement encounters.
Write formal, factual complaint letters. Include: the complainant's account, reference to specific UK legislation that may have been breached, a clear statement of the complaint, and the desired outcome (investigation, apology, disciplinary action).
Use professional, formal language. Be factual. Do not exaggerate.`,
      messages: [{
        role: 'user',
        content: `Write a formal complaint letter to: ${complaint_body}

Encounter description: ${encounter_description}
${badge_number ? `\nOfficer badge/ID number: ${badge_number}` : ''}
${encounter_type ? `\nEncounter type: ${encounter_type}` : ''}

Return only the letter text. Start with the date line, then "Dear Sir/Madam," or appropriate salutation.`,
      }],
    })

    return res.status(200).json({ letter: message.content[0].text })
  } catch (error) {
    console.error('Complaint generation error:', error)
    return res.status(500).json({ error: 'Failed to generate complaint letter' })
  }
}
