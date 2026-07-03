import { getFiles } from '@/app/actions/files'
import { FileList } from '@/components/files/file-list'
import { UploadFileDialog } from './upload-file-dialog'
import { createClient } from '@/lib/supabase/server'
import { getCurrentWorkspaceId } from '@/app/actions/workspaces'

export default async function FilesPage() {
  const files = await getFiles()
  const supabase = await createClient()
  const workspaceId = await getCurrentWorkspaceId()
  
  const { data: clients } = await supabase.from('clients').select('id, name, company').eq('workspace_id', workspaceId)
  const { data: projects } = await supabase.from('projects').select('id, name, client_id').eq('workspace_id', workspaceId)

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Files</h2>
          <p className="text-muted-foreground mt-1">
            Manage and share documents securely with your clients.
          </p>
        </div>
        <div>
          <UploadFileDialog workspaceId={workspaceId!} clients={clients || []} projects={projects || []} />
        </div>
      </div>

      <FileList files={files} />
    </div>
  )
}
