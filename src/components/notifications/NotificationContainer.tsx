// src/components/notifications/NotificationContainer.tsx
import React from 'react'
import { useNotifications } from '../../contexts/NotificationContext'
import { NotificationToast } from '../../components/notifications/NotificationToast'

export const NotificationContainer: React.FC = () => {
  const { notifications } = useNotifications()

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map(notification => (
        <NotificationToast
          key={notification.id}
          notification={notification}
        />
      ))}
    </div>
  )
}