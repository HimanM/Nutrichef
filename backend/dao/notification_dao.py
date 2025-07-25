from ..models.notification import Notification
from ..db import db

class NotificationDAO:
    def add_notification(self, user_id, notif_type, reference_id, message):
        notification = Notification(
            UserId=user_id,
            Type=notif_type,
            ReferenceId=reference_id,
            Message=message
        )
        db.session.add(notification)
        db.session.commit()
        return notification

    def get_notifications_for_user(self, user_id, limit=20):
        return Notification.query.filter_by(UserId=user_id).order_by(Notification.CreatedAt.desc()).limit(limit).all()

    def mark_as_read(self, notification_id, user_id):
        notif = Notification.query.filter_by(Id=notification_id, UserId=user_id).first()
        if notif:
            notif.IsRead = True
            db.session.commit()
        return notif 