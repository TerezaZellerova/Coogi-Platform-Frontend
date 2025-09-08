// Test Agent Data Access - Frontend Debug
// Open browser console and paste this to test campaign data access

const agentId = 'agent_20250908_222020_295830'
const apiBase = 'http://localhost:8000'

fetch(`${apiBase}/api/agents/progressive/${agentId}`)
  .then(response => response.json())
  .then(data => {
    console.log('🎯 AGENT DATA:', data)
    console.log('📊 Staged Results:', data.agent.staged_results)
    console.log('📧 Campaigns:', data.agent.staged_results.campaigns)
    console.log('🔢 Total Campaigns:', data.agent.staged_results.total_campaigns)
    
    // Test the frontend logic
    const agent = data.agent
    const isProgressive = 'staged_results' in agent
    const totalCampaigns = isProgressive ? agent.staged_results?.total_campaigns || 0 : 0
    const realCampaigns = isProgressive ? agent.staged_results?.campaigns || [] : []
    const hasRealCampaignData = realCampaigns.length > 0
    
    console.log('🐛 FRONTEND LOGIC TEST:')
    console.log('  isProgressive:', isProgressive)
    console.log('  totalCampaigns:', totalCampaigns) 
    console.log('  realCampaigns:', realCampaigns)
    console.log('  hasRealCampaignData:', hasRealCampaignData)
    
    if (hasRealCampaignData) {
      console.log('✅ CAMPAIGNS SHOULD DISPLAY!')
      realCampaigns.forEach((campaign, i) => {
        console.log(`  Campaign ${i+1}:`, campaign.campaign_name)
      })
    } else {
      console.log('❌ NO CAMPAIGNS DETECTED - CHECK LOGIC!')
    }
  })
  .catch(error => {
    console.error('❌ Error fetching agent:', error)
  })
