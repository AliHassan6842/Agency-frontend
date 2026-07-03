'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Sparkles, Loader2, RefreshCcw, Pencil, Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ReactMarkdown from 'react-markdown'
import { Textarea } from '@/components/ui/textarea'

export function ProjectAISummary({ projectId, initialSummary }: { projectId: string, initialSummary?: string | null }) {
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<string | null>(initialSummary || null)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(initialSummary || '')
  const [saving, setSaving] = useState(false)

  // Sync state if initialSummary changes (e.g. from page reload)
  const [prevInitial, setPrevInitial] = useState(initialSummary)

  if (initialSummary !== prevInitial) {
    setPrevInitial(initialSummary)
    if (initialSummary !== undefined) {
      setSummary(initialSummary)
      setEditContent(initialSummary || '')
    }
  }

  const generateSummary = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
      const res = await fetch(apiUrl + '/api/ai/project-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ projectId })
      })

      const data = await res.json()
      if (data.summary) {
        setSummary(data.summary)
      } else {
        alert('Could not generate summary.')
      }
    } catch (error) {
      console.error('Failed to generate summary', error)
      alert('Failed to connect to AI service.')
    } finally {
      setLoading(false)
    }
  }

  const saveSummary = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('projects')
        .update({ ai_summary: editContent })
        .eq('id', projectId)
      
      if (error) throw error
      setSummary(editContent)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save summary', error)
      alert('Failed to save summary.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="shadow-sm border-purple-100 dark:border-purple-900/50 bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-950/20 dark:to-background overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              AI Project Brief
            </CardTitle>
            <CardDescription>Auto-generated status report for this project.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {summary && !isEditing && (
              <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} title="Edit">
                <Pencil className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
            {summary && !isEditing && (
              <Button variant="ghost" size="icon" onClick={generateSummary} disabled={loading} title="Regenerate">
                <RefreshCcw className={`h-4 w-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
              </Button>
            )}
            {isEditing && (
              <>
                <Button variant="ghost" size="icon" onClick={saveSummary} disabled={saving} title="Save" className="text-green-600">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => { setIsEditing(false); setEditContent(summary || '') }} disabled={saving} title="Cancel" className="text-red-600">
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!summary ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
              <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h4 className="font-medium text-sm">No summary generated yet</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Use our AI assistant to instantly analyze tasks, tickets, and messages to create a comprehensive brief.
              </p>
            </div>
            <Button onClick={generateSummary} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-200 dark:shadow-none">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generate Brief
            </Button>
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:text-purple-900 dark:prose-headings:text-purple-100">
            {isEditing ? (
              <Textarea 
                value={editContent} 
                onChange={(e) => setEditContent(e.target.value)} 
                className="min-h-[200px] w-full"
                placeholder="Write your summary here..."
              />
            ) : (
              <ReactMarkdown>{summary}</ReactMarkdown>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
