// Quick Campaign Test Component
// Add this to your agents page to test campaign display

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

const CampaignTestComponent = () => {
  const [testData, setTestData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testCampaignData = async () => {
    setLoading(true)
    try {
      // Test the exact agent from your console
      const agentId = 'agent_20250908_222853_104587'
      const response = await fetch(`http://localhost:8000/api/agents/progressive/${agentId}`)
      const data = await response.json()
      
      console.log('🧪 CAMPAIGN TEST DATA:', data)
      
      if (data.agent) {
        const agent = data.agent
        const isProgressive = 'staged_results' in agent
        const totalCampaigns = isProgressive ? agent.staged_results?.total_campaigns || 0 : 0
        const realCampaigns = isProgressive ? agent.staged_results?.campaigns || [] : []
        const hasRealCampaignData = realCampaigns.length > 0
        
        console.log('🔍 FRONTEND LOGIC TEST:')
        console.log('  isProgressive:', isProgressive)
        console.log('  totalCampaigns:', totalCampaigns)
        console.log('  realCampaigns:', realCampaigns)
        console.log('  hasRealCampaignData:', hasRealCampaignData)
        
        setTestData({
          agentId,
          isProgressive,
          totalCampaigns,
          realCampaigns,
          hasRealCampaignData,
          rawData: data.agent.staged_results
        })
      }
    } catch (error) {
      console.error('❌ Test failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border border-dashed border-gray-300 my-4">
      <h3 className="font-bold mb-2">🧪 Campaign Test Component</h3>
      <Button onClick={testCampaignData} disabled={loading}>
        {loading ? 'Testing...' : 'Test Campaign Data'}
      </Button>
      
      {testData && (
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <p><strong>Agent ID:</strong> {testData.agentId}</p>
          <p><strong>Is Progressive:</strong> {testData.isProgressive ? '✅' : '❌'}</p>
          <p><strong>Total Campaigns:</strong> {testData.totalCampaigns}</p>
          <p><strong>Has Real Campaign Data:</strong> {testData.hasRealCampaignData ? '✅' : '❌'}</p>
          <p><strong>Real Campaigns Length:</strong> {testData.realCampaigns.length}</p>
          
          {testData.realCampaigns.length > 0 && (
            <div className="mt-2">
              <strong>Campaign Details:</strong>
              {testData.realCampaigns.map((campaign, i) => (
                <div key={i} className="ml-4 text-sm">
                  <p>• {campaign.campaign_name}</p>
                  <p>  ID: {campaign.campaign_id}</p>
                  <p>  Targets: {campaign.target_count}</p>
                </div>
              ))}
            </div>
          )}
          
          <details className="mt-2">
            <summary>Raw Staged Results</summary>
            <pre className="text-xs overflow-auto">{JSON.stringify(testData.rawData, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  )
}

export default CampaignTestComponent
