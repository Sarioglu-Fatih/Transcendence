import json
import uuid
import jwt
from django.conf import settings

from channels.generic.websocket import WebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .utils import decode_Payload
from api.models import User, Match
from channels.db import database_sync_to_async
from django.utils import timezone

class MultiplayerConsumer(WebsocketConsumer):

	def connect(self):
		self.accept()

	def disconnect(self, close_code):
		print("deco")
		pass

	def receive(self, text_data):
		print(text_data)
		data = json.loads(text_data)      
		if data.get('type') == 'open':
			user = self.get_user_id(data)
			self.update_user_status(user)
			print(user)
			self.find_match(user)
		if data.get('type') == 'keyPress':
			self.processInput(data)

	def get_user_id(self, data):
		payload = jwt.decode(data.get('jwtToken'), key=settings.SECRET_KEY, algorithms=['HS256'])
		user_id = payload.get('user_id')
		if (not user_id): #check if token contain a user_id
			self.disconnect()
		print(user_id)
		try:
			user = User.objects.get(id=user_id)
			return user
		except User.DoesNotExist:
			self.disconnect()
		self.update_user_status(user)
		print(user)
		self.find_match(user)
		
	def update_user_status(self, user):
		user.user_is_connected = True
		user.user_is_in_game = False
		user.channel_name = self.channel_name
		print(user.channel_name)
		user.save()

	def find_match(self, user):
		opponent = User.objects.filter(user_is_connected=True, user_is_in_game=False).exclude(id=user.id).first()
		print('oppenent')
		if opponent:
			# Create a new match instance in the database
			match = Match.objects.create(player1_id=user, player2_id=opponent, active_game=True, date=timezone.now(), win_lose=0, paddle1_pos=55, paddle2_pos=55)
			# Set up a game room name for the match and the player
			game_room = match.id
			# Mark both users as in-game
			user.user_is_in_game = True
			user.game_room = game_room
			user.save()
			opponent.user_is_in_game = True
			opponent.game_room = game_room
			opponent.save()
			# Add both users to the same channel group
			async_to_sync(self.channel_layer.group_add)(str(game_room), str(user.channel_name))
			async_to_sync(self.channel_layer.group_add)(str(game_room), str(opponent.channel_name))
			# Send the match details to the users
			print(game_room)
			self.send_match_details(game_room, game_room)


	def send_match_details(self, game_room, data):
		# Send match details to both players through the common channel group
		async_to_sync(self.channel_layer.group_send)(
			str(game_room),
			{
				'type': 'send.message',
				'text': str(data),
			}
		)
	
	def send_message(self, event):
		self.send(text_data=event["text"])

	def position_update(self, event):
		self.send(text_data=json.dumps({
        'type': 'position_update',
        'p1': event['p1'],
        'p2': event['p2'],
    }))
	
	def processInput(self, data):
		user = User.objects.get(channel_name=self.channel_name)
		match = Match.objects.get(id=user.game_room)
		print(match.player1_id)
		if (match.player1_id == user):
			print("player 1")
			if (data.get('content')  == 'w'):
				match.paddle1_pos += 3
			elif (data.get('content') == 's'):
				match.paddle1_pos -= 3
		else :
			print("player 2")
			if (data.get('content')  == 'w'):
				match.paddle2_pos += 3
			elif (data.get('content') == 's'):
				match.paddle2_pos -= 3
		match.save()
		p1 = match.paddle1_pos
		p2 = match.paddle2_pos 
		print(f"{p1} and {p2}")
		print(user)
		async_to_sync(self.channel_layer.group_send)(
			str(user.game_room),
			{
				'type': 'position.update',
				'p1': str(p1),
				'p2': str(p2),
			}
		)
