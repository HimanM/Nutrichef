# Backend Service for NutriChef

This directory contains the backend service for the NutriChef application, built with Flask.

## Project Structure

*   `app.py`: Main Flask application setup and initialization.
*   `config.py`: Configuration classes for different environments (development, production, testing).
*   `db.py`: SQLAlchemy database instance initialization.
*   `models/`: Contains SQLAlchemy database models.
*   `dao/`: Data Access Objects for interacting with the database.
*   `services/`: Business logic and service layer components.
*   `routes/`: Flask Blueprints defining API routes.
*   `ai_models/`: Modules related to AI, machine learning, and NLP tasks.
*   `tests/`: Unit and integration tests.
*   `requirements.txt`: Python dependencies.

## Setup and Running

1.  **Create a virtual environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
2.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
3.  **Configure Environment Variables:**
    Copy `.env.example` to `.env` and fill in your specific configurations (Database URI, JWT Secret Key, API keys, etc.). Refer to `config.py` for all possible environment variables.
4.  **Initialize the Database:**
    If you're setting up the database for the first time or need to recreate tables:
    ```bash
    flask init-db
    ```
5.  **Run the Flask development server:**
    ```bash
    flask run
    ```
    The application will typically be available at `http://127.0.0.1:5000/`.

## Email Service Configuration

The application uses Flask-Mail to send emails, primarily for email verification. The following environment variables need to be configured for the email service to function correctly:

*   **`MAIL_SERVER`**: SMTP server address.
    *   *Description*: The hostname or IP address of your SMTP mail server.
    *   *Example*: `smtp.gmail.com` (for Gmail), `smtp.mail.yahoo.com` (for Yahoo)
*   **`MAIL_PORT`**: SMTP server port.
    *   *Description*: The port number for the SMTP server. Common ports are `587` (for TLS) or `465` (for SSL).
    *   *Example*: `587`
*   **`MAIL_USE_TLS`**: Whether to use TLS encryption.
    *   *Description*: Set to `True` to enable Transport Layer Security (TLS). This is generally recommended.
    *   *Example*: `True`
*   **`MAIL_USE_SSL`**: Whether to use SSL encryption.
    *   *Description*: Set to `True` to enable Secure Sockets Layer (SSL). Note that TLS and SSL are generally mutually exclusive for a given port.
    *   *Example*: `False`
*   **`MAIL_USERNAME`**: Username for SMTP authentication.
    *   *Description*: The username required to authenticate with your SMTP server. Often your email address.
    *   *Example*: `your_email@example.com`
*   **`MAIL_PASSWORD`**: Password for SMTP authentication.
    *   *Description*: The password for the `MAIL_USERNAME`.
    *   *Example*: `your_email_password_or_app_password`
*   **`MAIL_DEFAULT_SENDER`**: Default sender email address.
    *   *Description*: The email address that will appear as the sender for application emails.
    *   *Example*: `noreply@yourdomain.com` or `your_email@example.com`
*   **`FRONTEND_URL`**: Base URL of the frontend application.
    *   *Description*: Used to generate absolute links in emails, such as the email verification link. Ensure this points to where your frontend is accessible.
    *   *Example*: `http://localhost:5173` (for local development), `https://your-frontend-domain.com` (for production)

**Note on Gmail and 2-Step Verification:**
If you are using Gmail as your SMTP server and have 2-Step Verification enabled on your Google account, you will need to generate an "App Password" to use as the `MAIL_PASSWORD`. Using your regular Google account password will likely result in authentication errors. You can generate App Passwords in your Google Account security settings.

## Running Tests
To run tests:
```bash
pytest
```
