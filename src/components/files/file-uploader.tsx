'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { saveFileMetadata } from '@/app/actions/files'
import { UploadCloud, File as FileIcon, X, Loader2 } from 'lucide-react'


export function FileUploader({ projectId, clientId, workspaceId }: { projectId?: string, clientId?: string, workspaceId: string }) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFile(e.target.files[0])
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFile(e.dataTransfer.files[0])
    }
  }

  const uploadFile = async (file: File) => {
    try {
      setIsUploading(true)
      setUploadProgress(10)
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      // Fetch signed upload URL from our backend
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001') + '/api/files/upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ 
          fileName: file.name, 
          projectId, 
          workspaceId 
        })
      })

      const data = await res.json()
      if (!data.signedUrl) throw new Error('Could not get upload url')

      const { signedUrl, filePath } = data
      setUploadProgress(40)
      
      // Upload directly to Supabase using the signed URL
      const uploadRes = await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      })

      if (!uploadRes.ok) throw new Error('Upload to storage failed')

      setUploadProgress(80)

      await saveFileMetadata({
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        content_type: file.type,
        project_id: projectId,
        client_id: clientId
      })

      setUploadProgress(100)
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload file.')
    } finally {
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 500)
    }
  }

  return (
    <div
      className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
        isDragging ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50 hover:bg-muted/30'
      } ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !isUploading && fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileSelect}
      />
      
      {isUploading ? (
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-sm font-medium">Uploading... {uploadProgress}%</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4 cursor-pointer">
          <div className="rounded-full bg-primary/10 p-4 text-primary">
            <UploadCloud className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-semibold">Click or drag file to this area to upload</h4>
            <p className="text-sm text-muted-foreground">Support for a single upload. Any file type.</p>
          </div>
        </div>
      )}
    </div>
  )
}
