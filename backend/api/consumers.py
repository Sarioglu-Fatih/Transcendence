import json
import uuid
import jwt
from django.conf import settings
import asyncio
import math

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .utils import decode_Payload
from api.models import User, Match
from channels.db import database_sync_to_async
from django.utils import timezone
from datetime import datetime
from django.db.models import Q

class MultiplayerConsumer(AsyncWebsocketConsumer):
	players = {}
	update_lock = asyncio.Lock()
	GAME_X = 600
	GAME_Y = 300
	PADDLE_X = 15
	PADDLE_Y = 80
	PADDLE_SPEED = 6
	MARGIN = 10

	async def connect(self):
		await self.accept()

	async def disconnect(self, close_code):
		user = await self.get_user_by_channel_name()
		if not user:
			await self.close()
		player = self.players.get(user.id)
		if not player:
			print('la')
			await self.close()
		await self.channel_layer.group_discard(
			str(player['group_name']),
			self.channel_name
		)
		async def delayed_removal():
			await asyncio.sleep(50)
			async with self.update_lock:
				self.players.pop(user.id, None)
		# deco l autre joueurs
		await self.close()

	async def receive(self, text_data):
		print(text_data)
		data = json.loads(text_data)      
		if data.get('type') == 'keyPress':
			payload = jwt.decode(data.get('jwtToken'), key=settings.SECRET_KEY, algorithms=['HS256'])
			user_id = payload.get('user_id')
			player = self.players.get(user_id)
			opponent = self.players.get(player['opponent_id'])
			if not player:
				return
			async with self.update_lock:
				if player['player'] == 'p1':
					if data.get('content') == 's':
						if player['p1'] <= (self.GAME_Y - self.PADDLE_Y - self.MARGIN):
							player['p1'] += self.PADDLE_SPEED
							opponent['p1'] += self.PADDLE_SPEED
					else:
						if player['p1'] >= self.MARGIN:
							player['p1'] -= self.PADDLE_SPEED
							opponent['p1'] -= self.PADDLE_SPEED
				else:
					if data.get('content') == 's':
						if player['p2'] <= (self.GAME_Y - self.PADDLE_Y - self.MARGIN):
							player['p2'] += self.PADDLE_SPEED
							opponent['p2'] += self.PADDLE_SPEED
					else:
						if player['p2'] >= self.MARGIN:
							player['p2'] -= self.PADDLE_SPEED
							opponent['p2'] -= self.PADDLE_SPEED

		if data.get('type') == 'open':
			user = await self.get_user_id(data)
			await self.update_user_status(user)
			self.player_id = user.id

			async with self.update_lock:
				self.players[self.player_id] = {
					"id": self.player_id,
					"opponent_id": 0,
					"player": "",
					'p1': ((self.GAME_Y - self.PADDLE_Y) / 2),
					'p2': ((self.GAME_Y - self.PADDLE_Y) / 2),
					'group_name': ""
					}
			match = await self.find_match(user)
			if (match):
				asyncio.create_task(self.game_loop(user, match))
	
	async def game_loop(self, user, match):
		b_pos_x = self.GAME_X / 2
		b_pos_y = self.GAME_Y / 2
		Vx = 0.5
		Vy = 0
		speed = 0.8
		p1_score = 0
		p2_score = 0 
		player = self.players.get(user.id)
		print(user)
		print(player)
		while p1_score < 5 and p2_score < 5:
			b_pos_x += Vx * 3
			b_pos_y += Vy * 3

			if b_pos_y < self.MARGIN or b_pos_y > (self.GAME_Y - self.MARGIN):
				Vy = -Vy

			if b_pos_x > (self.GAME_X - self.MARGIN - self.PADDLE_X - 10):
				if (b_pos_y >= player['p2'] and b_pos_y <= player['p2'] + self.PADDLE_Y):
					relative_intersection = player['p2'] + (self.PADDLE_Y / 2) - b_pos_y
					normalize_relative_intersection = relative_intersection / (self.PADDLE_Y / 2)
					bounce_angle = normalize_relative_intersection * math.radians(45)
					Vx = -(speed * math.cos(bounce_angle))
					Vy = speed * -math.sin(bounce_angle)
					
			if b_pos_x < (self.MARGIN + self.PADDLE_X):
				if (b_pos_y >= player['p1'] and b_pos_y <= player['p1'] + self.PADDLE_Y):
					relative_intersection = player['p1'] + (self.PADDLE_Y / 2) - b_pos_y
					normalize_relative_intersection = relative_intersection / (self.PADDLE_Y / 2)
					bounce_angle = normalize_relative_intersection * math.radians(45)
					Vx = (speed * math.cos(bounce_angle))
					Vy = speed* -math.sin(bounce_angle)

			if b_pos_x > self.GAME_X:
				print(b_pos_x)
				p1_score += 1
				b_pos_x = self.GAME_X / 2
				b_pos_y = self.GAME_Y / 2
			
			if b_pos_x < 0:
				p2_score += 1
				b_pos_x = self.GAME_X / 2
				b_pos_y = self.GAME_Y / 2
			

			await self.channel_layer.group_send(
				str(player['group_name']),
				{
					'type': 'position.update',
					'p1': str(player['p1']),
					'p2': str(player['p2']),
					'bx': str(b_pos_x ),
					'by': str(b_pos_y),
					'p1_score': str(p1_score),
					'p2_score': str(p2_score),
				}
			)
			await asyncio.sleep(0.01)
		await self.end_match(match, p1_score, p2_score)
		await self.disconnect(1)

	@database_sync_to_async
	def end_match(self, match, p1_score, p2_score):
		match.p1_score = p1_score
		match.p2_score = p2_score
		match.active_game = False
		if (p1_score == 5):
			match.win_lose = match.player1_id.id
		else:
			match.win_lose = match.player2_id.id
		match.save()

	async def position_update(self, event):
		await self.send(text_data=json.dumps({
		'type': 'position_update',
		'p1': event['p1'],
		'p2': event['p2'],
		'bx': event['bx'],
		'by': event['by'],
		'p1_score': event['p1_score'],
		'p2_score': event['p2_score'],

	}))
		
	@database_sync_to_async
	def get_user_id(self, data):
		payload = jwt.decode(data.get('jwtToken'), key=settings.SECRET_KEY, algorithms=['HS256'])
		user_id = payload.get('user_id')
		if (not user_id): #check if token contain a user_id
			self.disconnect()
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
		return Match.objects.create(player1_id=user, player2_id=opponent, active_game=True, date=timezone.now(), win_lose=0)

	@database_sync_to_async
	def put_player_in_game(self, user, opponent, game_room):
		# Mark both users as in-game
			user.user_is_in_game = True
			user.game_room = game_room
			user.save()
			opponent.user_is_in_game = True
			opponent.game_room = game_room
			opponent.save()

	@database_sync_to_async	
	def update_user_status(self, user):
		user.user_is_connected = True
		user.user_is_in_game = False
		user.channel_name = self.channel_name
		user.save()

	async def find_match(self, user):
		opponent = await self.find_opponent(user)
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
			async with self.update_lock:
				self.players[user.id]['group_name'] = str(game_room)
				self.players[opponent.id]['group_name'] = str(game_room)
				self.players[user.id]['player'] = 'p1'
				self.players[opponent.id]['player'] = 'p2'
				self.players[user.id]['opponent_id'] = opponent.id
				self.players[opponent.id]['opponent_id'] = user.id
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

	@database_sync_to_async
	def get_user_by_channel_name(self):
		return User.objects.get(channel_name=self.channel_name)

	@database_sync_to_async
	def get_last_match(self, user):
		return Match.objects.filter(Q(player1_id=user) | Q(player2_id=user)).latest('date')

