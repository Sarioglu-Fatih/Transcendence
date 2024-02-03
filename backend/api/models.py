from django.db import models
from django.conf import settings
import os
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
	pseudo = models.CharField(max_length=16)
	avatar = models.BinaryField()
	user_is_connected = models.BooleanField(default=False)
	user_is_in_game = models.BooleanField(default=False)
	channel_name = models.CharField(max_length=255, null=True, blank=True)
	friendlist = models.ManyToManyField("User", blank=True)

	def get_avatar(self):
		if self.avatar:
			return self.avatar
		else:
			default_avatar_path = os.path.join(settings.MEDIA_ROOT, 'img', 'default_avatar.png')
			print("Default Avatar Path:", default_avatar_path)
			with open(default_avatar_path, 'rb') as f:
				return f.read()
				
	def get_total_wins(self):
		return (
			self.player1_matches.filter(win_lose=self.id)
			.exclude(win_lose=0)
			.count() 
			+ 
			self.player2_matches.filter(win_lose=self.id)
			.exclude(win_lose=0)
			.count()
		)

	def get_total_losses(self):
		return (
			self.player1_matches.exclude(win_lose=self.id)
			.exclude(win_lose=0)
			.count()
			+
			self.player2_matches.exclude(win_lose=self.id)
			.exclude(win_lose=0)
			.count()
    	)

	def __str__(self):
		return self.username

class Match(models.Model):
	player1_id = models.ForeignKey(User, related_name='player1_matches',on_delete=models.CASCADE)
	player2_id = models.ForeignKey(User, related_name='player2_matches', on_delete=models.CASCADE)
	active_game = models.BooleanField(default=True)
	date = models.DateTimeField()
	p1_score = models.PositiveIntegerField(default=0)
	p2_score = models.PositiveIntegerField(default=0)
	win_lose = models.PositiveIntegerField(default=0)

	def __str__(self):
		return "game %s" % self.id
