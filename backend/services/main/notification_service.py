from ...dao.notification_dao import NotificationDAO

class NotificationService:
    def __init__(self):
        self.notification_dao = NotificationDAO()

    def add_notification(self, user_id, notif_type, reference_id, message):
        return self.notification_dao.add_notification(user_id, notif_type, reference_id, message)

    def get_notifications_for_user(self, user_id, limit=20):
        notifs = self.notification_dao.get_notifications_for_user(user_id, limit)
        return [n.to_dict() for n in notifs]

    def mark_as_read(self, notification_id, user_id):
        notif = self.notification_dao.mark_as_read(notification_id, user_id)
        return notif.to_dict() if notif else None 