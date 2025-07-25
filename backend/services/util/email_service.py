from flask_mail import Message
from flask import current_app # To access app.config and mail instance
from backend.utils.email_templates import email_template_renderer

class EmailService:
    def __init__(self):
        pass

    def send_verification_email(self, user_email, user_name, token):
        """
        Sends a professionally styled verification email to the user.
        """
        mail = current_app.extensions.get('mail')
        if not mail:
            current_app.logger.error("Flask-Mail extension not found or not initialized.")
            return False

        config = current_app.config

        verification_url = f"{config['FRONTEND_URL']}/verify-email/{token}"
        frontend_url = config['FRONTEND_URL']

        subject = "Verify Your Email for NutriChef"
        sender = config.get('MAIL_DEFAULT_SENDER', 'noreply@example.com')

        # Render professional HTML template
        try:
            html_body, text_body = email_template_renderer.render_verification_email(
                user_name=user_name,
                verification_url=verification_url,
                frontend_url=frontend_url
            )
        except Exception as e:
            current_app.logger.error(f"Error rendering email template: {e}")
            # Fallback to basic template
            html_body = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #10b981;">Welcome to NutriChef!</h2>
                <p>Hello {user_name},</p>
                <p>Please click the link below to verify your email address:</p>
                <p><a href="{verification_url}" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
                <p>If the button doesn't work, copy and paste this link: {verification_url}</p>
                <p>Thanks,<br>The NutriChef Team</p>
            </div>
            """
            text_body = f"""
Hello {user_name},

Welcome to NutriChef! Please copy and paste the following link in your browser to verify your email address:
{verification_url}

If you did not create an account, please ignore this email.

Thanks,
The NutriChef Team
            """.strip()

        msg = Message(subject, sender=sender, recipients=[user_email])
        msg.body = text_body
        msg.html = html_body

        try:
            mail.send(msg)
            current_app.logger.info(f"Verification email sent to {user_email}")
            return True
        except Exception as e:
            current_app.logger.error(f"Error sending verification email to {user_email}: {e}")
            return False

    def send_reply_to_contact_message(self, recipient_email, recipient_name, subject, reply_body):
        """
        Sends a professionally styled reply email to a user who submitted a contact message.
        """
        mail = current_app.extensions.get('mail')
        if not mail:
            current_app.logger.error("Flask-Mail extension not found or not initialized.")
            return False

        config = current_app.config
        sender = config.get('MAIL_DEFAULT_SENDER', 'noreply@nutrichef.com')
        frontend_url = config['FRONTEND_URL']

        # Render professional HTML template
        try:
            html_body, text_body = email_template_renderer.render_admin_reply_email(
                recipient_name=recipient_name,
                subject=subject,
                reply_body=reply_body,
                frontend_url=frontend_url
            )
        except Exception as e:
            current_app.logger.error(f"Error rendering email template: {e}")
            # Fallback to basic template
            reply_body_formatted = reply_body.replace('\n', '<br>')
            html_body = f"""
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
            text_body = f"""
Hello {recipient_name},

Thank you for contacting NutriChef. Here is our reply regarding your message:
---
{reply_body}
---

If you have any further questions, please feel free to reach out to us again.

Sincerely,
The NutriChef Support Team
            """.strip()

        msg = Message(subject, sender=sender, recipients=[recipient_email])
        msg.body = text_body
        msg.html = html_body

        try:
            mail.send(msg)
            current_app.logger.info(f"Reply email sent to {recipient_email} with subject: {subject}")
            return True
        except Exception as e:
            current_app.logger.error(f"Error sending reply email to {recipient_email}: {e}")
            return False
            mail.send(msg)
            current_app.logger.info(f"Reply email sent to {recipient_email} with subject: {subject}")
            return True
        except Exception as e:
            current_app.logger.error(f"Error sending reply email to {recipient_email}: {e}")
            return False
