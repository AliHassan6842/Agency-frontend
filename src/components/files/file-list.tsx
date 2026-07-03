'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getFileSignedUrl, deleteFileAction } from '@/app/actions/files'
import { FileIcon, FileText, FileImage, FileCode, Download, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'

type FileData = {
  id: string
  file_name: string
  file_path: string
  file_size: number
  content_type: string
  created_at: string
}

export function FileList({ files }: { files: FileData[] }) {
  const [localFiles, setLocalFiles] = useState<FileData[]>(files)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const params = useParams()
  const projectId = params.id as string

  // Sync prop changes
  useEffect(() => {
    setLocalFiles(files)
  }, [files])

  // Real-time subscription to file updates
  useEffect(() => {
    if (!projectId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`project-${projectId}-files`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'files', filter: `project_id=eq.${projectId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setLocalFiles(prev => {
              if (prev.some(f => f.id === payload.new.id)) return prev;
              return [payload.new as FileData, ...prev];
            })
          } else if (payload.eventType === 'DELETE') {
            setLocalFiles(prev => prev.filter(f => f.id !== payload.old.id))
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
        } else {
          setIsConnected(false)
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId])

  const handleDownload = async (file: FileData) => {
    setLoadingId(file.id)
    try {
      const url = await getFileSignedUrl(file.file_path)
      if (url) {
        window.open(url, '_blank')
      } else {
        alert('Could not generate download link.')
      }
    } finally {
      setLoadingId(null)
    }
  }

  const handleDelete = async (file: FileData) => {
    if (!confirm('Are you sure you want to delete this file?')) return
    try {
      await deleteFileAction(file.id)
    } catch {
      alert('Failed to delete file')
    }
  }

  const getIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImage className="h-8 w-8 text-blue-500" />
    if (type.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />
    if (type.includes('json') || type.includes('javascript')) return <FileCode className="h-8 w-8 text-yellow-500" />
    return <FileIcon className="h-8 w-8 text-muted-foreground" />
  }

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  if (localFiles.length === 0) {
    return (
      <div className="relative rounded-xl border bg-card text-card-foreground shadow-sm p-12 text-center border-dashed mt-4">
        <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10 bg-background/80 px-2 py-1 rounded-md text-xs font-medium border shadow-sm">
          <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-muted-foreground">{isConnected ? 'Live' : 'Connecting...'}</span>
        </div>
        <FileIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="font-semibold text-lg">No files uploaded</h3>
        <p className="text-muted-foreground text-sm mt-1">Upload a file to get started.</p>
      </div>
    )
  }

  return (
    <div className="relative mt-4">
      <div className="absolute -top-12 right-0 flex items-center gap-1.5 z-10 bg-background/80 px-2 py-1 rounded-md text-xs font-medium border shadow-sm">
        <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
        <span className="text-muted-foreground">{isConnected ? 'Live' : 'Connecting...'}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {localFiles.map((file) => (
          <div key={file.id} className="group flex flex-col rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/50 relative">
          <div className="flex items-start justify-between mb-4">
            <div className="rounded-lg bg-muted/50 p-2">
              {getIcon(file.content_type || '')}
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload(file)} disabled={loadingId === file.id}>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(file)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="mt-auto">
            <p className="font-medium text-sm truncate" title={file.file_name}>
              {file.file_name}
            </p>
            <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
              <span>{formatSize(file.file_size)}</span>
              <span>{new Date(file.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      ))}
      </div>
    </div>
  )
}
