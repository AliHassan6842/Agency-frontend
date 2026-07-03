'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileUploader } from '@/components/files/file-uploader'

export function UploadFileDialog({ 
  workspaceId,
  clients,
  projects
}: { 
  workspaceId: string
  clients: { id: string; company?: string; name: string }[]
  projects: { id: string; name: string; client_id: string }[]
}) {
  const [open, setOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<string>('')
  const [selectedProject, setSelectedProject] = useState<string>('')

  const filteredProjects = projects.filter(p => p.client_id === selectedClient)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
          <Plus className="mr-2 h-4 w-4" />
          Upload File
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
          <DialogDescription>
            Upload a document and optionally link it to a specific client and project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Link to Client (Optional)</Label>
            <Select value={selectedClient} onValueChange={(val) => {
              setSelectedClient(val ?? '')
              setSelectedProject('')
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select a client..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (General Workspace File)</SelectItem>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.company || client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Link to Project (Optional)</Label>
            <Select 
              value={selectedProject} 
              onValueChange={(val) => setSelectedProject(val ?? '')}
              disabled={!selectedClient || selectedClient === 'none' || filteredProjects.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a project..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {filteredProjects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-2">
            <FileUploader 
              workspaceId={workspaceId} 
              clientId={selectedClient !== 'none' && selectedClient ? selectedClient : undefined}
              projectId={selectedProject !== 'none' && selectedProject ? selectedProject : undefined}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
