# NutriChef Email Template System Documentation

## 📧 Overview

The NutriChef email template system provides professional, branded email templates that match the website's design theme. The system includes responsive HTML templates with fallback text versions for maximum email client compatibility.

## 🎨 Design Features

### Visual Design
- **Brand Colors**: Primary green (#10b981), with accent colors matching the website
- **Typography**: Clean, readable fonts with proper hierarchy
- **Layout**: Responsive design that works on desktop and mobile
- **Branding**: Consistent NutriChef logo and messaging

### Email Client Compatibility
- **HTML Tables**: Used for layout to ensure compatibility with older email clients
- **Inline CSS**: All styles are inlined for maximum compatibility
- **Fallback Fonts**: Web-safe font stack with fallbacks
- **Dark Mode**: Basic dark mode support for compatible clients

## 📁 File Structure

```
backend/
├── templates/
│   └── email/
│       ├── base_email.html           # Base template with common styling and layout
│       ├── verification_email.html   # Email verification template
│       └── admin_reply_email.html    # Admin reply template
├── utils/
│   └── email_templates.py           # Template rendering utilities
└── services/
    └── email_service.py             # Updated email service using templates
```

## 🔧 Technical Implementation

### Template Inheritance
- **Base Template**: `base_email.html` contains the common layout, styling, and branding
- **Child Templates**: Extend the base template and define specific content blocks
- **Jinja2**: Uses Flask's built-in Jinja2 templating engine

### Template Rendering
The `EmailTemplateRenderer` class in `utils/email_templates.py` handles:
- Template loading and rendering
- Error handling with fallback templates
- Context preparation (variables passed to templates)
- Generation of both HTML and text versions

### Email Service Integration
The `EmailService` class has been updated to:
- Use the new template rendering system
- Maintain backward compatibility
- Include comprehensive error handling
- Provide fallback templates if rendering fails

## 📧 Available Templates

### 1. Email Verification Template
**File**: `verification_email.html`
**Purpose**: Welcome new users and verify their email address
**Features**:
- Welcoming tone with user's name
- Clear call-to-action button
- Benefits of verification listed
- Fallback text link for accessibility
- Help and support information

**Usage**:
```python
from backend.services.email_service import EmailService
from backend.utils.email_templates import email_template_renderer

email_service = EmailService()
success = email_service.send_verification_email(
    user_email="user@example.com",
    user_name="John Doe",
    token="verification_token_here"
)
```

### 2. Admin Reply Template
**File**: `admin_reply_email.html`
**Purpose**: Send professional replies to user contact messages
**Features**:
- Professional acknowledgment of user's message
- Highlighted admin response section
- Additional resources and help links
- Call-to-action for further contact
- Professional support team signature

**Usage**:
```python
from backend.services.email_service import EmailService

email_service = EmailService()
success = email_service.send_reply_to_contact_message(
    recipient_email="user@example.com",
    recipient_name="Jane Smith",
    subject="Re: Your question about meal planning",
    reply_body="Thank you for your question. Here's our response..."
)
```

## 🎯 Template Variables

### Verification Email Variables
- `user_name`: Recipient's name
- `verification_url`: Complete verification URL
- `frontend_url`: Base frontend URL for links

### Admin Reply Variables
- `recipient_name`: Recipient's name
- `subject`: Email subject line
- `reply_body`: Admin's response content (supports line breaks)
- `frontend_url`: Base frontend URL for links
- `current_date`: Current date (auto-generated)

## 🔒 Security & Best Practices

### Security Measures
- **URL Validation**: All URLs are properly escaped and validated
- **Content Sanitization**: User input is properly escaped in templates
- **No Script Tags**: Templates contain no JavaScript for security

### Best Practices
- **Responsive Design**: Templates work on all screen sizes
- **Accessibility**: Proper semantic HTML and alt text
- **Performance**: Optimized CSS and minimal external resources
- **Deliverability**: Following email best practices for inbox placement

## 🧪 Testing

### Template Testing Script
Run the test script to verify template rendering:
```bash
cd backend
python test_email_templates.py
```

This generates sample HTML files that you can open in a browser to preview the emails.

### Manual Testing
1. **Browser Preview**: Open generated HTML files in various browsers
2. **Email Client Testing**: Send test emails to different email providers
3. **Mobile Testing**: Check appearance on mobile email apps
4. **Dark Mode**: Test with email clients that support dark mode

## 🚀 Deployment

### Prerequisites
- Flask app configured with template folder
- Flask-Mail properly configured
- Email credentials set up

### Configuration
Ensure your Flask app is configured with the template folder:
```python
app = Flask(__name__, template_folder='templates')
```

### Environment Variables
Required environment variables:
- `FRONTEND_URL`: Your frontend application URL
- `MAIL_DEFAULT_SENDER`: Default sender email address
- Mail server configuration (SMTP settings)

## 🔧 Customization

### Adding New Templates
1. Create new template file in `templates/email/`
2. Extend the base template: `{% extends "email/base_email.html" %}`
3. Add content in the `{% block content %}` section
4. Add rendering method to `EmailTemplateRenderer`
5. Add service method to `EmailService`

### Modifying Existing Templates
1. Edit the template files directly
2. Test changes using the test script
3. Verify in multiple email clients
4. Update documentation if needed

### Styling Changes
- **Colors**: Update CSS variables in `base_email.html`
- **Fonts**: Modify the font stack in the base template
- **Layout**: Adjust table structures and spacing
- **Branding**: Update logo and brand elements

## 📈 Performance Monitoring

### Metrics to Track
- **Email Delivery Rate**: Percentage of emails successfully delivered
- **Open Rate**: How many recipients open the emails
- **Click-through Rate**: How many click on verification/action links
- **Template Rendering Time**: Performance of template generation

### Logging
The system logs:
- Successful email sends
- Template rendering errors
- Fallback template usage
- Email delivery failures

## 🐛 Troubleshooting

### Common Issues

**Templates Not Rendering**
- Check Flask template folder configuration
- Verify template file paths
- Check for Jinja2 syntax errors
- Review application context

**Styling Issues**
- Test in multiple email clients
- Verify CSS inlining
- Check for unsupported CSS properties
- Validate HTML structure

**Email Delivery Problems**
- Check SMTP configuration
- Verify sender email settings
- Review email content for spam triggers
- Check recipient email addresses

### Error Handling
The system includes comprehensive error handling:
- Template rendering failures fall back to simple HTML
- Email sending errors are logged
- Invalid template variables are handled gracefully
- Network issues are properly caught and reported

## 🔄 Future Enhancements

### Planned Features
- **Template Editor**: Admin panel for editing email templates
- **A/B Testing**: Support for testing different template versions
- **Analytics**: Detailed email performance tracking
- **Internationalization**: Multi-language template support
- **Rich Text**: WYSIWYG editor for admin replies

### Extensibility
The template system is designed to be easily extensible:
- Add new template types by following the existing pattern
- Modify styling through CSS variables
- Add new template variables as needed
- Integrate with external email services

## 📞 Support

For questions or issues with the email template system:
1. Check this documentation
2. Review the test script output
3. Check application logs
4. Test with the provided sample templates

The email template system maintains backward compatibility, so existing functionality will continue to work while providing enhanced professional appearance for your users.
