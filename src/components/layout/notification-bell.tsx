'use client'

import { useEffect, useState } from 'react'
import { Bell, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { markNotificationRead, markAllNotificationsRead } from '@/app/actions/notifications'
import { useRouter } from 'next/navigation'
import { useNotificationStore, Notification } from '@/store/notifications'

export function NotificationBell({ initialNotifications }: { initialNotifications: Notification[] }) {
  const { notifications, setNotifications, addNotification, markAsRead, markAllAsRead } = useNotificationStore()
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()

  // Initialize Zustand store with server props once
  useEffect(() => {
    if (!isInitialized) {
      setNotifications(initialNotifications)
      setIsInitialized(true)
    }
  }, [initialNotifications, isInitialized, setNotifications])

  // Supabase Realtime subscription for new notifications
  useEffect(() => {
    const supabase = createClient()
    let channel: any

    async function setupRealtime() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      channel = supabase
        .channel(`user-notifications-${user.id}-${Math.random()}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            // Zustand state update
            addNotification(payload.new as Notification)
          }
        )
        .subscribe()
    }
    
    setupRealtime()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [addNotification])

  const unreadCount = notifications.filter(n => !n.is_read).length

  const handleMarkRead = async (id: string, link?: string) => {
    markAsRead(id) // Instant Zustand UI update
    await markNotificationRead(id) // Background server sync
    if (link) {
      router.push(link)
    }
  }

  const handleMarkAllRead = async () => {
    markAllAsRead() // Instant Zustand UI update
    await markAllNotificationsRead() // Background server sync
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-2">
          <DropdownMenuLabel className="p-0 text-base">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs" onClick={handleMarkAllRead}>
              <Check className="h-3 w-3 mr-1" /> Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications yet.
            </div>
          ) : (
            notifications.map(notification => (
              <DropdownMenuItem 
                key={notification.id} 
                className={`flex flex-col items-start p-4 cursor-pointer gap-1 ${!notification.is_read ? 'bg-muted/50' : ''}`}
                onClick={() => handleMarkRead(notification.id, notification.link)}
              >
                <div className="flex w-full justify-between items-start gap-2">
                  <p className={`text-sm ${!notification.is_read ? 'font-bold' : 'font-medium'}`}>
                    {notification.title}
                  </p>
                  {!notification.is_read && (
                    <span className="flex h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {notification.message}
                </p>
                <p className="text-[10px] text-muted-foreground/70 mt-1">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
