from django.db import models
from django.conf import settings
import os

# Create your models here.

class User(models.Model):
    username = models.CharField(max_length=16)
    mail =  models.CharField(max_length=50)
    password = models.CharField(max_length=16)
    pseudo = models.CharField(max_length=16)
    avatar = models.BinaryField(null=True, default=None)
    user_is_connected = models.BooleanField(default=False)
    user_is_in_game = models.BooleanField(default=False)
    lose = models.PositiveIntegerField(default=0)
    win = models.PositiveIntegerField(default=0)

    def __str__(self):
        return "%s" % self.username
    
    def get_avatar(self):
        if self.avatar:
            return self.avatar
        else:
            default_avatar_path = os.path.join(settings.MEDIA_ROOT, 'img', 'default_avatar.png')
            print("Default Avatar Path:", default_avatar_path)
            with open(default_avatar_path, 'rb') as f:
                return f.read()
        

class Match(models.Model):
    player1_id = models.ForeignKey(User, related_name='player1_matches',on_delete=models.CASCADE)
    player2_id = models.ForeignKey(User, related_name='player2_matches', on_delete=models.CASCADE)
    date = models.DateTimeField()
    win_lose = models.PositiveIntegerField()

    def __str__(self):
        return "%s won" % self.player1_id.username
