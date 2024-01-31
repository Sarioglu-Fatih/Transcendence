from django.db import models
from django.conf import settings
import os
from django.db import models
from django.contrib.auth.models import AbstractUser

# class Profile(models.Model):
#     username = models.OneToOneField(User, on_delete=models.CASCADE)
#     email =  models.CharField(max_length=50)
#     pseudo = models.CharField(max_length=16)
#     avatar = models.BinaryField(null=True, default=None)
#     user_is_connected = models.BooleanField(default=False)
#     user_is_in_game = models.BooleanField(default=False)
#     lose = models.PositiveIntegerField(default=0)
#     win = models.PositiveIntegerField(default=0)

#     def response_profile(self):
#         # Create custom response here
#         return self

#     def __str__(self):
#         return "%s" % self.user.username

class User(AbstractUser):
	pseudo = models.CharField(max_length=16)
	avatar = models.BinaryField()
	user_is_connected = models.BooleanField(default=False)
	user_is_in_game = models.BooleanField(default=False)
	lose = models.PositiveIntegerField(default=0)
	win = models.PositiveIntegerField(default=0)
	channel_name = models.CharField(max_length=255, null=True, blank=True)
	game_room = models.PositiveIntegerField(default=0)

	def get_avatar(self):
		if self.avatar:
			return self.avatar
		else:
			default_avatar_path = os.path.join(settings.MEDIA_ROOT, 'img', 'default_avatar.png')
			print("Default Avatar Path:", default_avatar_path)
			with open(default_avatar_path, 'rb') as f:
				return f.read()

	def __str__(self):
		return self.username

class Match(models.Model):
	player1_id = models.ForeignKey(User, related_name='player1_matches',on_delete=models.CASCADE)
	player1_channel = models.CharField(max_length=255, null=True, blank=True)
	player2_channel = models.CharField(max_length=255, null=True, blank=True)
	player2_id = models.ForeignKey(User, related_name='player2_matches', on_delete=models.CASCADE)
	paddle1_pos = models.PositiveIntegerField(default=55)
	paddle2_pos = models.PositiveIntegerField(default=55)
	active_game = models.BooleanField(default=True)
	websocket_channel_name = models.CharField(max_length=255)
	date = models.DateTimeField()
	win_lose = models.PositiveIntegerField()

	def __str__(self):
		return "%s won" % self.player1_id.username



