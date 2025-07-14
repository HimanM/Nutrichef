"""
Email template utilities for NutriChef
Handles rendering of HTML email templates with proper context and styling
"""
from flask import current_app, render_template
from datetime import datetime
import os

class EmailTemplateRenderer:
    """Utility class for rendering email templates with NutriChef branding"""
    
    def __init__(self):
        self.template_folder = 'templates/email'
    
    def render_verification_email(self, user_name, verification_url, frontend_url):
        """
        Render the email verification template
        
        Args:
            user_name (str): Name of the user
            verification_url (str): Full verification URL
            frontend_url (str): Frontend base URL
            
        Returns:
            tuple: (html_content, text_content)
        """
        try:
            # Render HTML template
            html_content = render_template(
                'email/verification_email.html',
                user_name=user_name,
                verification_url=verification_url,
                frontend_url=frontend_url
            )
            
            # Generate text version for email clients that don't support HTML
            text_content = self._generate_verification_text(user_name, verification_url)
            
            return html_content, text_content
            
        except Exception as e:
            current_app.logger.error(f"Error rendering verification email template: {e}")
            # Fallback to simple HTML if template fails
            return self._fallback_verification_html(user_name, verification_url), \
                   self._generate_verification_text(user_name, verification_url)
    
    def render_admin_reply_email(self, recipient_name, subject, reply_body, frontend_url):
        """
        Render the admin reply email template
        
        Args:
            recipient_name (str): Name of the recipient
            subject (str): Email subject
            reply_body (str): Admin's reply content
            frontend_url (str): Frontend base URL
            
        Returns:
            tuple: (html_content, text_content)
        """
        try:
            # Render HTML template
            html_content = render_template(
                'email/admin_reply_email.html',
                recipient_name=recipient_name,
                subject=subject,
                reply_body=reply_body,
                frontend_url=frontend_url,
                current_date=datetime.now().strftime('%B %d, %Y')
            )
            
            # Generate text version
            text_content = self._generate_admin_reply_text(recipient_name, reply_body)
            
            return html_content, text_content
            
        except Exception as e:
            current_app.logger.error(f"Error rendering admin reply email template: {e}")
            # Fallback to simple HTML if template fails
            return self._fallback_admin_reply_html(recipient_name, reply_body), \
                   self._generate_admin_reply_text(recipient_name, reply_body)
    
    def _generate_verification_text(self, user_name, verification_url):
        """Generate plain text version of verification email"""
        return f"""
Hello {user_name},

Welcome to NutriChef! We're thrilled to have you join our community of food enthusiasts and home chefs.

To get started with your personalized cooking experience, please verify your email address by copying and pasting the following link in your browser:

{verification_url}

What's next?
Once verified, you'll be able to:
• Get personalized recipe recommendations
• Use our AI-powered ingredient classifier
• Plan your meals with our smart meal planner
• Generate shopping lists automatically
• Chat with our AI cooking assistant

Didn't create an account?
If you didn't sign up for NutriChef, you can safely ignore this email. The verification link will expire in 24 hours.

Need help?
If you have any questions, feel free to contact our support team. We're here to help!

Happy cooking!
The NutriChef Team

---
NutriChef - Your Personal AI-Powered Cooking Assistant
        """.strip()
    
    def _generate_admin_reply_text(self, recipient_name, reply_body):
        """Generate plain text version of admin reply email"""
        return f"""
Hello {recipient_name},

Thank you for reaching out to NutriChef! We appreciate you taking the time to contact us.

Our support team has reviewed your message and here's our response:

---
{reply_body}
---

Need further assistance?
If you have additional questions or need more help, please don't hesitate to reach out to us again. We're always here to support your culinary journey!

Thank you for being part of the NutriChef community!
The NutriChef Support Team

---
NutriChef - Your Personal AI-Powered Cooking Assistant
        """.strip()
    
    def _fallback_verification_html(self, user_name, verification_url):
        """Fallback HTML if template rendering fails"""
        return f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #10b981;">Welcome to NutriChef!</h2>
            <p>Hello {user_name},</p>
            <p>Please click the link below to verify your email address:</p>
            <p><a href="{verification_url}" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
            <p>If the button doesn't work, copy and paste this link: {verification_url}</p>
            <p>Thanks,<br>The NutriChef Team</p>
        </div>
        """
    
    def _fallback_admin_reply_html(self, recipient_name, reply_body):
        """Fallback HTML if template rendering fails"""
        reply_body_formatted = reply_body.replace('\n', '<br>')
        return f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #10b981;">NutriChef Support Response</h2>
            <p>Hello {recipient_name},</p>
            <p>Thank you for contacting NutriChef. Here is our reply:</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #10b981;">
                {reply_body_formatted}
            </div>
            <p>If you have any further questions, please feel free to reach out to us again.</p>
            <p>Sincerely,<br>The NutriChef Support Team</p>
        </div>
        """

# Global instance for easy importing
email_template_renderer = EmailTemplateRenderer()
