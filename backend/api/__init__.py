import asyncio
from threading import Thread
import datetime
import asyncio
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async

async def check_last_activity(user_id, last_refresh_time):
    if user_id not in last_refresh_time:
        return False
    
    current_time = datetime.datetime.now()
    last_time = last_refresh_time[user_id]
    time_difference = current_time - last_time
    two_seconds = datetime.timedelta(seconds=10)
    
    if time_difference > two_seconds:
        return False
    
    return True

@database_sync_to_async
def get_user(id):
    return User.objects.get(id=id)

@database_sync_to_async
def change_user_status(user):
    user.user_is_connected = False
    user.save()

async def continuous_activity_check():
    await asyncio.sleep(5)
    from .models import User
    from .views import last_refresh_time
    while True:
        await asyncio.sleep(3)
        for id in last_refresh_time.keys():
            if (not await check_last_activity(id, last_refresh_time)):
                user = await sync_to_async(User.objects.get)(id=id)
                await change_user_status(user)

def start_background_loop(loop: asyncio.AbstractEventLoop) -> None:
    asyncio.set_event_loop(loop)
    loop.run_forever()


def main():
    loop = asyncio.new_event_loop()
    t = Thread(target=start_background_loop, args=(loop,), daemon=True)
    t.start()
    asyncio.run_coroutine_threadsafe(continuous_activity_check(), loop)

main()
