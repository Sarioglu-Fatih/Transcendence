from django.db import models

# Create your models here.

class User(models.Model):
    username = models.CharField(max_length=16)
    mail =  models.CharField(max_length=50)
    password = models.CharField(max_length=16)
    pseudo = models.CharField(max_length=16)
    avatar = models.BinaryField()
    user_is_connected = models.BooleanField(default=False)
    user_is_in_game = models.BooleanField(default=False)
    lose = models.PositiveIntegerField(default=0)
    win = models.PositiveIntegerField(default=0)

    def __str__(self):
        return "%s" % self.username

class Match(models.Model):
    player1_id = models.ForeignKey(User, related_name='player1_matches',on_delete=models.CASCADE)
    player2_id = models.ForeignKey(User, related_name='player2_matches', on_delete=models.CASCADE)
    date = models.DateTimeField()
    win_lose = models.PositiveIntegerField()

    def __str__(self):
        return "%s won" % self.player1_id.username
