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
	user_is_connected = models.BooleanField(default=False)
	user_is_in_game = models.BooleanField(default=False)
	lose = models.PositiveIntegerField(default=0)
	win = models.PositiveIntegerField(default=0)
	channel_name = models.CharField(max_length=255, null=True, blank=True)
	friendlist = models.ManyToManyField("User", blank=True)

	def get_avatar(self):
		if self.avatar:
			return self.avatar
		else:
			default_avatar_path = os.path.join(settings.MEDIA_ROOT, 'avatars', 'default_avatar.png')
			print("Default Avatar Path:", default_avatar_path)
			with open(default_avatar_path, 'rb') as f:
				return f.read()

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
	# p1_score = models.PositiveIntegerField()
	# p2_score = models.PositiveIntegerField()
	win_lose = models.PositiveIntegerField()

	def __str__(self):
		return "%s won" % self.player1_id.username
