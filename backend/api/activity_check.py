import datetime
import time
from .models import User
from django.apps import AppConfig

last_refresh_time = {}

def check_last_activity(user_id):
    if user_id not in last_refresh_time:
        return False
    
    if (datetime.datetime.now() - last_refresh_time[user_id] < 60):
        return False
    return True

def refresh_user_status(user):
    last_refresh_time[user.id] = datetime.datetime.now()

def continuous_activity_check():
    while True:
        print("check activity")
        for id in last_refresh_time.keys():
            if (not check_last_activity(id)):
                user = User.objects.get(id=id)
                user.user_is_connected = False
        time.sleep(60)