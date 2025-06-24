# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /backend

# Copy the dependencies file to the working directory
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
RUN python -m spacy download en_core_web_sm

# Copy the rest of the application code to the working directory
COPY . .

# Make port 5000 available to the world outside this container
EXPOSE 5000

# Define environment variable
ENV FLASK_APP app.py
ENV FLASK_RUN_HOST 0.0.0.0
# ENV FLASK_ENV development # Uncomment for development

# Run app.py when the container launches
# Replace the CMD below with the actual command to run your backend
# For example, if you're using Gunicorn:
# CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
# Or if you're using Flask's built-in server (not recommended for production):
CMD ["flask", "run"]
