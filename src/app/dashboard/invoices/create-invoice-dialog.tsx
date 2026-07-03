'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createInvoice } from '@/app/actions/invoices'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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

export function CreateInvoiceDialog({ 
  clients,
  projects
}: { 
  clients: { id: string; company?: string; name: string }[]
  projects: { id: string; name: string; client_id: string }[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedClient, setSelectedClient] = useState('')
  const [items, setItems] = useState([{ description: '', quantity: 1, unit_rate: 0 }])

  const filteredProjects = projects.filter(p => p.client_id === selectedClient)

  const handleAddItem = () => setItems([...items, { description: '', quantity: 1, unit_rate: 0 }])
  const handleRemoveItem = (index: number) => setItems(items.filter((_, i) => i !== index))
  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items]
    // @ts-expect-error dynamic assignment
    newItems[index][field] = value
    setItems(newItems)
  }

  const totalAmount = items.reduce((acc, item) => {
    const qty = typeof item.quantity === 'number' ? item.quantity : 0
    const rate = typeof item.unit_rate === 'number' ? item.unit_rate : 0
    return acc + (qty * rate)
  }, 0)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    try {
      await createInvoice({
        client_id: selectedClient,
        project_id: (formData.get('project_id') as string) || undefined,
        currency: (formData.get('currency') as string) || 'USD',
        due_date: formData.get('due_date') as string,
        notes: formData.get('notes') as string,
        items
      })
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Failed to create invoice')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="mr-2 h-4 w-4" />
        Create Invoice
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
          <DialogDescription>
            Generate a new invoice and add line items.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_id">Client</Label>
              <Select onValueChange={(value) => setSelectedClient(typeof value === 'string' ? value : '')} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.company || client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="project_id">Project (Optional)</Label>
              <Select name="project_id" disabled={!selectedClient || filteredProjects.length === 0}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input id="due_date" name="due_date" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select name="currency" defaultValue="USD">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Line Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                <Plus className="h-3 w-3 mr-1" /> Add Item
              </Button>
            </div>
            
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-1">
                    <Input 
                      placeholder="Description" 
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      required
                    />
                  </div>
                  <div className="w-24 space-y-1">
                    <Input 
                      type="number"
                      min="1"
                      placeholder="Qty" 
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value === '' ? '' : parseFloat(e.target.value))}
                      required
                    />
                  </div>
                  <div className="w-32 space-y-1">
                    <Input 
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Price" 
                      value={item.unit_rate}
                      onChange={(e) => handleItemChange(index, 'unit_rate', e.target.value === '' ? '' : parseFloat(e.target.value))}
                      required
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="shrink-0 text-red-500"
                    onClick={() => handleRemoveItem(index)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end pt-2 border-t text-lg font-bold">
              Total: ${totalAmount.toFixed(2)}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea 
              id="notes" 
              name="notes" 
              placeholder="Thank you for your business!" 
              className="resize-none"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Draft
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
