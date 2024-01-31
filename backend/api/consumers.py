import json
import uuid
import jwt
from django.conf import settings
import asyncio

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .utils import decode_Payload
from api.models import User, Match
from channels.db import database_sync_to_async
from django.utils import timezone
from datetime import datetime

class MultiplayerConsumer(AsyncWebsocketConsumer):
	players = {}

	update_lock = asyncio.Lock()

	async def connect(self):
		await self.accept()

	async def disconnect(self, close_code):
		print("deco")
		pass

	async def receive(self, text_data):
		print(text_data)
		data = json.loads(text_data)      
		if data.get('type') == 'keyPress':
			await self.processInput(data)
			# A FAIRE
			#process input, avoir 2 jouer dans la meme room pas dans la db
		if data.get('type') == 'open':
			user = await self.get_user_id(data)
			await self.update_user_status(user)
			print(user)
			match = await self.find_match(user)
			self.player_id = user.id

			async with self.update_lock:
				self.players[self.player_id] = {
					"id": self.player_id,
					'p1': 55,
					'p2': 55,
					'bx': 75,
					'by': 75,
				}
			if (match):
				asyncio.create_task(self.game_loop())
		
	async def game_loop(self):
		print("send pos outside loop")
		while True:
			async with self.update_lock:
				for player in self.players.values():
					player['p1'] += 1
					player['p2'] += 1
					print(f"{player['p1']} and {player['p2']}")

			await self.send(text_data=json.dumps({
				'type': 'position.update',
				'p1': str(player['p1']),
				'p2': str(player['p2']),
			}))
			await asyncio.sleep(0.5)  

	@database_sync_to_async
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

	@database_sync_to_async	
	def find_opponent(self, user):
		return (User.objects.filter(user_is_connected=True, user_is_in_game=False).exclude(id=user.id).first())
	
	@database_sync_to_async
	def create_match(self, user, opponent):
		return Match.objects.create(player1_id=user, player2_id=opponent, active_game=True, date=timezone.now(), win_lose=0, paddle1_pos=55, paddle2_pos=55)

	@database_sync_to_async
	def put_player_in_game(self, user, opponent, game_room):
		# Mark both users as in-game
			user.user_is_in_game = True
			user.game_room = game_room
			user.save()
			opponent.user_is_in_game = True
			opponent.game_room = game_room
			opponent.save()

	async def find_match(self, user):
		opponent = await self.find_opponent(user)
		print('oppenent')
		if opponent:
			# Create a new match instance in the database
			match = await self.create_match(user, opponent)
			# Set up a game room name for the match and the player
			game_room = match.id
			# Mark both users as in-game
			await self.put_player_in_game(user, opponent, game_room)
			# Add both users to the same channel group
			await self.channel_layer.group_add(str(game_room), str(user.channel_name))
			await self.channel_layer.group_add(str(game_room), str(opponent.channel_name))
			# Send the match details to the users
			print(game_room)
			await self.send_match_details(game_room, game_room)
			return (match)


	async def send_match_details(self, game_room, data):
		# Send match details to both players through the common channel group
		await self.channel_layer.group_send(
			str(game_room),
			{
				'type': 'send.message',
				'text': str(data),
			}
		)
	
	async def send_message(self, event):
		await self.send(text_data=event["text"])

