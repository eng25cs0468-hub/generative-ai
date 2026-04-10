import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from apscheduler.schedulers.background import BackgroundScheduler
import os

EMAIL_ADDRESS = os.environ.get("EMAIL_ADDRESS", "your@email.com")
EMAIL_PASSWORD = os.environ.get("EMAIL_PASSWORD", "password")
SMTP_SERVER = os.environ.get("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))

scheduler = BackgroundScheduler()

# Dummy function to get chart data (replace with real one)
def get_chart_html():
    return "<h1>Your Chart Report</h1><p>Chart data here.</p>"

def send_email_report(to_email):
    msg = MIMEMultipart()
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = to_email
    msg["Subject"] = "Scheduled Chart Report"
    msg.attach(MIMEText(get_chart_html(), "html"))
    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        server.send_message(msg)

# Example: schedule a report every day at 8am
def schedule_daily_report(to_email):
    scheduler.add_job(lambda: send_email_report(to_email), 'cron', hour=8, minute=0)
    scheduler.start()
