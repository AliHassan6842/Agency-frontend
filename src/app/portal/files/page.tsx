import { getClientFiles, getCurrentClientFileContext } from '@/app/actions/files'
import { FileList } from '@/components/files/file-list'
import { FileUploader } from '@/components/files/file-uploader'

export default async function PortalFilesPage() {
  const [files, context] = await Promise.all([
    getClientFiles(),
    getCurrentClientFileContext(),
  ])

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
          <p className="text-muted-foreground mt-1">
            Access files shared by your agency or upload new ones.
          </p>
        </div>
        <div>
          {context?.workspaceId && context.clientId && (
            <FileUploader workspaceId={context.workspaceId} clientId={context.clientId} />
          )}
        </div>
      </div>

      <FileList files={files} />
    </div>
  )
}
