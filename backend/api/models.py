from django.db import models
from django.conf import settings
import os
from django.db import models
from django.contrib.auth.models import User, AbstractUser
from django import forms
from django_otp.plugins.otp_totp.models import TOTPDevice

class User(AbstractUser):
	pseudo = models.CharField(max_length=16)
	avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
	user_is_looking_game = models.BooleanField(default=False)
	user_is_looking_tournament = models.BooleanField(default=False)
	user_is_in_game = models.BooleanField(default=False)
	channel_name = models.CharField(max_length=255, null=True, blank=True)
	friendlist = models.ManyToManyField("User", blank=True)
	status_2fa = models.BooleanField(default=False)

	def get_avatar(self):
		if self.avatar:
			return self.avatar
		else:
			default_avatar_path = os.path.join(settings.MEDIA_ROOT, 'avatars', 'default_avatar.png')
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
	
	def enable_2fa(self):
			totp_device, created = TOTPDevice.objects.get_or_create(user=self, confirmed=True)
			if created:
				# Save the secret key securely
				totp_device.save()
			return totp_device

class AvatarUploadForm(forms.ModelForm):
	class Meta:
		model = User
		fields = ['avatar']

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
	
class Tournament(models.Model):
	match_1 = models.ForeignKey(Match, related_name='match_1',on_delete=models.CASCADE)
	match_2 = models.ForeignKey(Match, related_name='match_2', on_delete=models.CASCADE)
	final = models.ForeignKey(Match, related_name='final', on_delete=models.CASCADE, null=True)
	date = models.DateTimeField()

	def __str__(self):
		return "tournament %s" % self.id