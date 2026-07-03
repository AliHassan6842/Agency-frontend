import { create } from 'zustand'

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  link?: string
  is_read: boolean
  created_at: string
}

interface NotificationStore {
  notifications: Notification[]
  setNotifications: (notifications: Notification[]) => void
  addNotification: (notification: Notification) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) => set((state) => {
    if (state.notifications.some(n => n.id === notification.id)) {
      return state;
    }
    return { notifications: [notification, ...state.notifications] };
  }),
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, is_read: true } : n)
  })),
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, is_read: true }))
  }))
}))
