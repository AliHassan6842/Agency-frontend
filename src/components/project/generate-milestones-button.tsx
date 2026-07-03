'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function GenerateMilestonesButton({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const generateMilestones = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
      const res = await fetch(apiUrl + '/api/ai/generate-milestones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ projectId })
      })

      const data = await res.json()
      if (data.success) {
        // Refresh the page to show new milestones
        router.refresh()
      } else {
        alert(data.error || 'Failed to generate milestones')
      }
    } catch (error) {
      console.error(error)
      alert('Failed to connect to AI service.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={generateMilestones} disabled={loading} size="sm" variant="outline" className="text-purple-600 border-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/20">
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
      Auto-Generate Milestones
    </Button>
  )
}
