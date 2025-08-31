// Test script to debug campaign fetching
console.log('Testing campaign fetching...');

async function testCampaigns() {
  try {
    // Test the API directly
    const response = await fetch('https://coogi-backend-7yca.onrender.com/api/agents/progressive');
    const agents = await response.json();
    
    console.log('Number of agents:', agents.length);
    
    if (agents.length > 0) {
      const firstAgent = agents[0];
      console.log('First agent ID:', firstAgent.id);
      console.log('First agent staged_results:', firstAgent.staged_results);
      
      if (firstAgent.staged_results && firstAgent.staged_results.campaigns) {
        console.log('Number of campaigns in first agent:', firstAgent.staged_results.campaigns.length);
        console.log('Campaign sample:', firstAgent.staged_results.campaigns[0]);
      } else {
        console.log('No campaigns found in staged_results');
      }
    }
    
    // Test getting all campaigns
    const allCampaigns = [];
    agents.forEach((agent, agentIndex) => {
      if (agent.staged_results?.campaigns) {
        agent.staged_results.campaigns.forEach((campaign, campaignIndex) => {
          allCampaigns.push({
            id: campaign.campaign_id || `${agent.id}_campaign_${campaignIndex}`,
            name: campaign.name || `Campaign ${campaignIndex + 1}`,
            status: campaign.status || 'active',
            leads_count: campaign.target_count || campaign.contacts?.length || 0,
            created_at: campaign.created_at || agent.created_at,
            agent_id: agent.id
          });
        });
      }
    });
    
    console.log('Total extracted campaigns:', allCampaigns.length);
    console.log('Sample campaign:', allCampaigns[0]);
    
  } catch (error) {
    console.error('Error testing campaigns:', error);
  }
}

testCampaigns();
