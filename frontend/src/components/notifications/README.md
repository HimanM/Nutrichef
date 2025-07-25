# NotificationDropdown Component

A reusable notification dropdown for showing user notifications (with red dot for unread) in any part of the app.

## Usage

```
import { NotificationDropdown } from '../notifications';

// In your component JSX
<NotificationDropdown />
```

- By default, fetches notifications from `/api/notifications/`.
- Clicking a notification marks it as read and navigates to the relevant page (e.g., forum post detail).
- Mobile and desktop friendly.
- Theme-compliant.

## Props
- `apiUrl` (optional): Override the API endpoint.
- `onNavigate` (optional): Custom navigation handler (receives the target path).

## Extending for Other Features

### Backend
- When you want to notify a user about a new event (e.g., recipe comment, admin message, etc.), call `notification_service.add_notification` in the relevant route:
  ```python
  notification_service.add_notification(
      user_id=target_user_id,
      notif_type='yourType',
      reference_id=related_id,  # e.g., RecipeId, MessageId, etc.
      message='Your custom message.'
  )
  ```
- Use a unique `notif_type` for each feature (e.g., 'recipeComment', 'adminMessage').
- Set `reference_id` to the entity you want the frontend to navigate to (e.g., RecipeId).

### Frontend
- In `NotificationDropdown.jsx`, extend the `handleNotificationClick` logic:
  ```js
  if (notif.Type === 'recipeComment' && notif.ReferenceId) {
    navigate(`/recipes/${notif.ReferenceId}`);
    return;
  }
  ```
- Add more cases for new notification types and their navigation targets.
- You can also customize the dropdown or notification message formatting as needed.

## Styling
- The dropdown is responsive and styled for both desktop and mobile.
- You can further customize the look by editing the component or passing additional props. 