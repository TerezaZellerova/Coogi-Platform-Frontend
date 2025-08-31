// Debug script to test API calls directly
const API_BASE = 'https://coogi-backend-7yca.onrender.com'

async function testDashboardStats() {
  try {
    console.log('Testing dashboard stats API...')
    
    const response = await fetch(`${API_BASE}/api/leads/dashboard-stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    
    const data = await response.json()
    console.log('Response data:', JSON.stringify(data, null, 2))
    
    // Test the mapping logic
    const mappedStats = {
      activeAgents: data.data.active_agents || 0,
      totalRuns: data.data.total_campaigns || 0,
      totalJobs: data.data.total_jobs || 0,
      successRate: 100
    }
    
    console.log('Mapped stats:', JSON.stringify(mappedStats, null, 2))
    
  } catch (error) {
    console.error('Error testing API:', error)
  }
}

async function testProgressiveAgents() {
  try {
    console.log('\n=== Testing Progressive Agents API ===')
    
    const response = await fetch(`${API_BASE}/api/agents/progressive`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Response status:', response.status)
    
    const data = await response.json()
    console.log('Progressive agents count:', data.length)
    
    if (data.length > 0) {
      const agent = data[0]
      console.log('First agent basic info:', {
        id: agent.id,
        query: agent.query,
        status: agent.status,
        total_progress: agent.total_progress
      })
      
      if (agent.staged_results) {
        console.log('Agent staged results structure:')
        console.log('- LinkedIn jobs:', agent.staged_results.linkedin_jobs?.length || 0)
        console.log('- Other jobs:', agent.staged_results.other_jobs?.length || 0)
        console.log('- Verified contacts:', agent.staged_results.verified_contacts?.length || 0)
        console.log('- Campaigns:', agent.staged_results.campaigns?.length || 0)
      }
      
      if (agent.stages) {
        console.log('Agent stages progress:')
        Object.keys(agent.stages).forEach(stageKey => {
          const stage = agent.stages[stageKey]
          console.log(`- ${stage.name}: ${stage.progress}% (${stage.results_count || 0} results)`)
        })
      }
    }
    
  } catch (error) {
    console.error('Error testing progressive agents API:', error)
  }
}

async function testInstantlyCampaigns() {
  try {
    console.log('\n=== Testing Instantly Campaigns API ===')
    
    const response = await fetch(`${API_BASE}/api/leads/instantly/campaigns`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Response status:', response.status)
    
    const data = await response.json()
    console.log('Instantly campaigns response:', JSON.stringify(data, null, 2))
    
  } catch (error) {
    console.error('Error testing instantly campaigns API:', error)
  }
}

async function testCampaignsAPI() {
  try {
    console.log('\n=== Testing Frontend Campaigns API ===')
    
    const response = await fetch(`${API_BASE}/api/campaigns`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Response status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('Campaigns API response:', JSON.stringify(data, null, 2))
      console.log('Campaigns count:', Array.isArray(data) ? data.length : 'Not an array')
    } else {
      const errorData = await response.text()
      console.log('Error response:', errorData)
    }
    
  } catch (error) {
    console.error('Error testing campaigns API:', error)
  }
}

async function testLeadsCampaignsAPI() {
  try {
    console.log('\n=== Testing Leads Campaigns API ===')
    
    const response = await fetch(`${API_BASE}/api/leads/campaigns`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Response status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('Leads campaigns API response:', JSON.stringify(data, null, 2))
      console.log('Campaigns count:', data.count)
      
      if (data.data && data.data.length > 0) {
        console.log('Sample campaign:', JSON.stringify(data.data[0], null, 2))
      }
    } else {
      const errorData = await response.text()
      console.log('Error response:', errorData)
    }
    
  } catch (error) {
    console.error('Error testing leads campaigns API:', error)
  }
}

// Run all tests
async function runAllTests() {
  await testDashboardStats()
  await testProgressiveAgents()
  await testInstantlyCampaigns()
  await testCampaignsAPI()
  await testLeadsCampaignsAPI()
}

runAllTests()
