'use client'

import { useState } from 'react'
import { createClientAction } from '@/app/actions/clients'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function AddClientDialog({ variant = 'default' }: { variant?: 'default' | 'outline' | 'ghost' }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    try {
      await createClientAction(formData)
      setOpen(false)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant={variant} className="gap-2" />}>
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Add Client</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>
            Create a new client profile. You can associate projects and users to this client later.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Primary Contact Name</Label>
            <Input id="name" name="name" required placeholder="Jane Doe" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="company">Company Name (Optional)</Label>
            <Input id="company" name="company" placeholder="Acme Corp" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" name="email" type="email" required placeholder="jane@acme.com" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input id="phone" name="phone" type="tel" placeholder="+1 (555) 000-0000" />
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Client'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
