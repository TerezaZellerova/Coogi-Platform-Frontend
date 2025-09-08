// BROWSER CONSOLE TEST - Copy and paste this in your browser console
// Test campaign data directly from the frontend

console.log('🧪 STARTING CAMPAIGN DEBUG TEST');

// Function to test agent data
async function testAgentCampaigns() {
  console.log('🔍 Testing agent campaigns...');
  
  try {
    // Use the latest agent ID from your console
    const agentId = 'agent_20250908_222853_104587';
    const apiBase = 'http://localhost:8000';
    const url = `${apiBase}/api/agents/progressive/${agentId}`;
    
    console.log('📡 Fetching from:', url);
    
    const response = await fetch(url);
    console.log('📊 Response status:', response.status);
    
    if (!response.ok) {
      console.error('❌ Response not OK:', response.statusText);
      return;
    }
    
    const data = await response.json();
    console.log('📦 Full response data:', data);
    
    if (!data.agent) {
      console.error('❌ No agent in response');
      return;
    }
    
    const agent = data.agent;
    console.log('🤖 Agent data:', agent);
    
    // Test the frontend logic exactly as it appears in AgentResultsView
    const isProgressive = 'staged_results' in agent;
    console.log('🔍 isProgressive:', isProgressive);
    
    if (!isProgressive) {
      console.error('❌ Agent is not progressive type');
      return;
    }
    
    const totalCampaigns = agent.staged_results?.total_campaigns || 0;
    console.log('📊 totalCampaigns:', totalCampaigns);
    
    const realCampaigns = agent.staged_results?.campaigns || [];
    console.log('�� realCampaigns:', realCampaigns);
    console.log('📋 realCampaigns length:', realCampaigns.length);
    
    const hasRealCampaignData = realCampaigns.length > 0;
    console.log('✅ hasRealCampaignData:', hasRealCampaignData);
    
    console.log('\n🎯 CAMPAIGN DETECTION SUMMARY:');
    console.log('  Agent ID:', agentId);
    console.log('  Is Progressive:', isProgressive ? '✅' : '❌');
    console.log('  Total Campaigns:', totalCampaigns);
    console.log('  Real Campaigns Array Length:', realCampaigns.length);
    console.log('  Has Real Campaign Data:', hasRealCampaignData ? '✅' : '❌');
    console.log('  Should Show Campaign Tab Content:', hasRealCampaignData ? 'YES ✅' : 'NO ❌');
    
    if (hasRealCampaignData) {
      console.log('\n📧 CAMPAIGN DETAILS:');
      realCampaigns.forEach((campaign, i) => {
        console.log(`  Campaign ${i + 1}:`);
        console.log(`    Name: ${campaign.campaign_name}`);
        console.log(`    ID: ${campaign.campaign_id}`);
        console.log(`    Targets: ${campaign.target_count}`);
        console.log(`    Type: ${campaign.search_type}`);
        console.log(`    Auto: ${campaign.auto_campaign}`);
      });
    } else {
      console.log('\n❌ NO CAMPAIGNS - This is why the tab is empty!');
      console.log('   Check if campaigns array exists:', !!agent.staged_results?.campaigns);
      console.log('   Campaigns array:', agent.staged_results?.campaigns);
    }
    
  } catch (error) {
    console.error('❌ Error in test:', error);
  }
}

// Run the test
testAgentCampaigns();

console.log('\n🎯 Copy the above function and run testAgentCampaigns() in your console');
