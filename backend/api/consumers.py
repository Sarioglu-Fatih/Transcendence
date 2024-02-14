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
from api.models import User, Match, Tournament
from channels.db import database_sync_to_async
from django.utils import timezone
from datetime import datetime
from django.db.models import Q
from django.http import HttpResponse

class MultiplayerConsumer(AsyncWebsocketConsumer):
	players = {}
	update_lock = asyncio.Lock()
	GAME_X = 858
	GAME_Y = 525
	PADDLE_X = 10
	PADDLE_Y = 60
	PADDLE_SPEED = 6
	MARGIN = 5

	async def connect(self):
		await self.accept()

	async def disconnect(self, close_code):
		if (close_code == 0):
			await self.close()
			return 0
		if (close_code == 2):
			await self.close(code=4001)
			return 0
		user = await self.get_user_by_channel_name()
		if not user:
			await self.close()
			return
		await self.update_user_status_after_quit(user)
		player = self.players.get(user.id)
		if not player:
			await self.close()
			return
		player['actif'] = False
		if player.get('group_name') == "":
			await self.close()
			return
		await self.channel_layer.group_discard(
			str(player['group_name']),
			self.channel_name
		)
		async def delayed_removal():
			await asyncio.sleep(50)
			async with self.update_lock:
				self.players.pop(user.id, None)
		await self.close()

	async def receive(self, text_data):
		data = json.loads(text_data)      
		if data.get('type') == 'keyPress':
			payload = jwt.decode(data.get('jwtToken'), key=settings.SECRET_KEY, algorithms=['HS256'])
			user_id = payload.get('user_id')
			player = self.players.get(user_id)
			if (data.get('mode') == 'local'):
				async with self.update_lock:
					if data.get('content') == 's':
						if player['p1'] <= (self.GAME_Y - self.PADDLE_Y - self.MARGIN):
							player['p1'] += self.PADDLE_SPEED
					elif data.get('content') == 'w':
						if player['p1'] >= self.MARGIN:
							player['p1'] -= self.PADDLE_SPEED
					if data.get('content') == 'ArrowDown':
						if player['p2'] <= (self.GAME_Y - self.PADDLE_Y - self.MARGIN):
							player['p2'] += self.PADDLE_SPEED
					elif data.get('content') == 'ArrowUp':
						if player['p2'] >= self.MARGIN:
							player['p2'] -= self.PADDLE_SPEED
			else:
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
			if (user == 0):
				await self.disconnect(0)
				return
			if (user.user_is_in_game or user.user_is_looking_tournament or user.user_is_looking_game):
				await self.disconnect(2)
				return
			
			if data.get('mode') == 'local':
				asyncio.create_task(self.local_game_loop(user))

			if data.get('mode') == 'normal':
				await self.update_user_status(user, 'match')
				await self.setup_player(user)
				match = await self.find_match(user)
				if (match):
					asyncio.create_task(self.game_loop(match, 'match'))
				else:
					asyncio.create_task(self.game_check(user))
			elif data.get('mode') == 'tournament':
				await self.update_user_status(user, 'tournament')
				await self.setup_player(user)
				tournament = await self.find_tournament(user)
				if (tournament):
					asyncio.create_task(self.tournament_loop(user, tournament))
				asyncio.create_task(self.tournament_check(user))
	
	async def tournament_loop(self, user, tournament):
		p1 = self.players.get(tournament.match_1.player1_id.id)
		p2 = self.players.get(tournament.match_1.player2_id.id)
		p3 = self.players.get(tournament.match_2.player1_id.id)
		p4 = self.players.get(tournament.match_2.player2_id.id)
		asyncio.create_task(self.game_loop(tournament.match_1, 'tournament'))
		asyncio.create_task(self.game_loop(tournament.match_2, 'tournament'))
		while (p1['win'] + p2['win'] + p3['win'] + p4['win']) != 2:
			await asyncio.sleep(1)
		if (p1['win'] == 0):
			p1['actif'] = False
		if (p2['win'] == 0):
			p2['actif'] = False
		if (p3['win'] == 0):
			p3['actif'] = False
		if (p4['win'] == 0):
			p4['actif'] = False
		if (p1['win'] == 1):
			f1 = tournament.match_1.player1_id
			if p3['win'] == 1:
				f2 = tournament.match_2.player1_id
			else :
				f2 = tournament.match_2.player2_id
		if (p2['win'] == 1):
			f1 = tournament.match_1.player2_id
			if p3['win'] == 1:
				f2 = tournament.match_2.player1_id
			else :
				f2 = tournament.match_2.player2_id
		match = await self.create_match(f1, f2)
		await self.setup_match(match, f1, f2)
		asyncio.create_task(self.game_loop(match, 'tournament'))
		while (p1['win'] + p2['win'] + p3['win'] + p4['win']) != 3:
			await asyncio.sleep(1)
		p4['actif'] = False
		p3['actif'] = False
		p2['actif'] = False
		p1['actif'] = False

	async def setup_player(self, user):
		self.player_id = user.id
		async with self.update_lock:
			self.players[self.player_id] = {
				"id": self.player_id,
				"opponent_id": 0,
				"player": "",
				'p1': ((self.GAME_Y - self.PADDLE_Y) / 2),
				'p2': ((self.GAME_Y - self.PADDLE_Y) / 2),
				'group_name': "",
				'actif': True,
				'win': 0,
			}

	async def game_check(self, user):
		player = self.players.get(user.id)
		while player['actif']:
			await asyncio.sleep(3)
		await self.disconnect(1)

	async def tournament_check(self, user):
		player = self.players.get(user.id)
		while player['actif']:
			await asyncio.sleep(1)
		await self.disconnect(1)

	
	async def game_loop(self, match, mode):
		b_pos_x = self.GAME_X / 2
		b_pos_y = self.GAME_Y / 2
		Vx = 0.5
		Vy = 0
		speed = 0.8
		p1_score = 0
		p2_score = 0 
		player = self.players.get(match.player1_id.id)
		opponent = self.players.get(match.player2_id.id)
		while p1_score < 5 and p2_score < 5:
			b_pos_x += Vx * 6
			b_pos_y += Vy * 6

			if b_pos_y < self.MARGIN or b_pos_y > (self.GAME_Y - self.MARGIN):
				Vy = -Vy

			if b_pos_x > (self.GAME_X  - self.PADDLE_X - 10):
				if (b_pos_y >= player['p2'] and b_pos_y <= player['p2'] + self.PADDLE_Y):
					relative_intersection = player['p2'] + (self.PADDLE_Y / 2) - b_pos_y
					normalize_relative_intersection = relative_intersection / (self.PADDLE_Y / 2)
					bounce_angle = normalize_relative_intersection * math.radians(45)
					Vx = -(speed * math.cos(bounce_angle))
					Vy = speed * -math.sin(bounce_angle)
					
			if b_pos_x < (self.MARGIN * 2+ self.PADDLE_X):
				if (b_pos_y >= player['p1'] and b_pos_y <= player['p1'] + self.PADDLE_Y):
					relative_intersection = player['p1'] + (self.PADDLE_Y / 2) - b_pos_y
					normalize_relative_intersection = relative_intersection / (self.PADDLE_Y / 2)
					bounce_angle = normalize_relative_intersection * math.radians(45)
					Vx = (speed * math.cos(bounce_angle))
					Vy = speed* -math.sin(bounce_angle)

			if b_pos_x > self.GAME_X:
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
			if (player['actif'] == False or opponent['actif'] == False):
				break
		winner = await self.end_match(match, player, opponent, p1_score, p2_score, mode)
		await self.channel_layer.group_send(
			str(player['group_name']),
			{
				'type': 'game.end',
				'winner': winner
			}
		)
		if (mode == 'match'):
			await self.disconnect(1)

	@database_sync_to_async
	def end_match(self, match, player, opponent, p1_score, p2_score, mode):
		match.p1_score = p1_score
		match.p2_score = p2_score
		match.active_game = False
		if (player['actif'] == False):
			opponent['win'] += 1
			match.p2_score = 5
			match.win_lose = match.player2_id.id
			winner = match.player2_id.pseudo
		elif (opponent['actif'] == False):
			player['win'] += 1
			match.p1_score = 5
			match.win_lose = match.player1_id.id
			winner = match.player1_id.pseudo
		elif (p1_score == 5):
			player['win'] += 1
			match.win_lose = match.player1_id.id
			winner = match.player1_id.pseudo
		else :
			opponent['win'] += 1
			match.win_lose = match.player2_id.id
			winner = match.player2_id.pseudo
		if (mode == 'match'):
			opponent['actif'] = False
		match.save()
		return winner


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
			return(0)
		try:
			user = User.objects.get(id=user_id)
			return user
		except User.DoesNotExist:
			return (0)

	@database_sync_to_async	
	def find_opponent(self, user):
		return (User.objects.filter(user_is_looking_game=True, user_is_in_game=False).exclude(id=user.id).first())

	@database_sync_to_async
	def create_local_match(self, user):
		match = Match.objects.create(player1_id=user, player2_id=user, player1_username=user.pseudo, player2_username="player_2", active_game=True, date=timezone.now(), win_lose=0)
		return (match)
	
	@database_sync_to_async
	def create_match(self, user, opponent):
		return Match.objects.create(player1_id=user, player2_id=opponent, player1_username=user.pseudo, player2_username=opponent.pseudo, active_game=True, date=timezone.now(), win_lose=0)

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
	def update_user_status(self, user, mode):
		if mode == 'match':
			user.user_is_looking_game = True
			user.user_is_in_game = False
			user.channel_name = self.channel_name
			user.save()
		elif mode == 'tournament':
			user.user_is_looking_tournament= True
			user.user_is_in_game = False
			user.channel_name = self.channel_name
			user.save()

	async def find_match(self, user):
		opponent = await self.find_opponent(user)
		if opponent:
			# Create a new match instance in the database
			match = await self.create_match(user, opponent)
			await self.setup_match(match, user, opponent)
			return (match)


	async def find_tournament(self, user):
		opponents = await self.find_opponents(user)
		if opponents:
			match_1 = await self.create_match(user, opponents[0])
			match_2 = await self.create_match(opponents[1], opponents[2])
			tournament = await self.create_tournament(match_1, match_2)
			await self.setup_match(match_1, user, opponents[0])
			await self.setup_match(match_2, opponents[1], opponents[2])
			return (tournament)
	
	async def setup_match(self, match, player_1, player_2):
		game_room = match.id
		# Mark both users as in-game
		await self.put_player_in_game(player_1, player_2, game_room)
		# Add both users to the same channel group
		await self.channel_layer.group_add(str(game_room), str(player_1.channel_name))
		await self.channel_layer.group_add(str(game_room), str(player_2.channel_name))
		async with self.update_lock:
			self.players[player_1.id]['group_name'] = str(game_room)
			self.players[player_2.id]['group_name'] = str(game_room)
			self.players[player_1.id]['player'] = 'p1'
			self.players[player_2.id]['player'] = 'p2'
			self.players[player_1.id]['opponent_id'] = player_2.id
			self.players[player_2.id]['opponent_id'] = player_1.id
			self.players[player_1.id]['p1'] = ((self.GAME_Y - self.PADDLE_Y) / 2)
			self.players[player_1.id]['p2'] = ((self.GAME_Y - self.PADDLE_Y) / 2)
			self.players[player_2.id]['p1'] = ((self.GAME_Y - self.PADDLE_Y) / 2)
			self.players[player_2.id]['p2'] = ((self.GAME_Y - self.PADDLE_Y) / 2)
		# Send the match details to the users
		await self.channel_layer.group_send(
			str(game_room),
			{
				'type': 'match.info',
				'player1': match.player1_id.pseudo,
				'player2': match.player2_id.pseudo,
			}
		)
		
	@database_sync_to_async
	def create_tournament(self, match_1, match_2):
		return Tournament.objects.create(match_1=match_1, match_2=match_2, date=timezone.now())
	
	@database_sync_to_async	
	def find_opponents(self, user):
		opponents = User.objects.filter(user_is_looking_tournament=True, user_is_in_game=False).exclude(id=user.id).all()[:3]
		if len(opponents) < 3:
			return User.objects.none()
		return opponents

	async def match_info(self, event):
		await self.send(text_data=json.dumps({
		'type': 'match_info',
		'player1': event['player1'],
		'player2': event['player2'],
	}))

	async def game_end(self, event):
		await self.send(text_data=json.dumps({
		'type': 'game_end',
		'winner': event['winner'],
	}))

	@database_sync_to_async
	def get_user_by_channel_name(self):
		if (User.objects.filter(channel_name=self.channel_name).exists()):
			return User.objects.get(channel_name=self.channel_name)
		return (0)
			

	@database_sync_to_async
	def get_last_match(self, user):
		return Match.objects.filter(Q(player1_id=user) | Q(player2_id=user)).latest('date')
	
	@database_sync_to_async
	def update_user_status_after_quit(self, user):
		user.user_is_looking_game = False
		user.user_is_looking_tournament = False
		user.user_is_in_game = False
		user.save()

	
	async def local_game_loop(self, user):
		self.player_id = user.id
		async with self.update_lock:
			self.players[self.player_id] = {
				"id": self.player_id,
				"opponent_id": -self.player_id,
				"player": "",
				'p1': ((self.GAME_Y - self.PADDLE_Y) / 2),
				'p2': ((self.GAME_Y - self.PADDLE_Y) / 2),
				'group_name': "",
				'actif': True,
				'win': 0,
			}
		print(self.players[self.player_id])
		b_pos_x = self.GAME_X / 2
		b_pos_y = self.GAME_Y / 2
		Vx = 0.5
		Vy = 0
		speed = 0.8
		p1_score = 0
		p2_score = 0 
		player = self.players.get(user.id)
		await self.send(text_data=json.dumps({
			'type': 'match_info',
			'player1': 'player1',
			'player2': 'player2',
		}))
		while p1_score < 5 and p2_score < 5:
			b_pos_x += Vx * 6
			b_pos_y += Vy * 6

			if b_pos_y < self.MARGIN or b_pos_y > (self.GAME_Y - self.MARGIN):
				Vy = -Vy

			if b_pos_x > (self.GAME_X  - self.PADDLE_X - 10):
				if (b_pos_y >= player['p2'] and b_pos_y <= player['p2'] + self.PADDLE_Y):
					relative_intersection = player['p2'] + (self.PADDLE_Y / 2) - b_pos_y
					normalize_relative_intersection = relative_intersection / (self.PADDLE_Y / 2)
					bounce_angle = normalize_relative_intersection * math.radians(45)
					Vx = -(speed * math.cos(bounce_angle))
					Vy = speed * -math.sin(bounce_angle)
					
			if b_pos_x < (self.MARGIN * 2+ self.PADDLE_X):
				if (b_pos_y >= player['p1'] and b_pos_y <= player['p1'] + self.PADDLE_Y):
					relative_intersection = player['p1'] + (self.PADDLE_Y / 2) - b_pos_y
					normalize_relative_intersection = relative_intersection / (self.PADDLE_Y / 2)
					bounce_angle = normalize_relative_intersection * math.radians(45)
					Vx = (speed * math.cos(bounce_angle))
					Vy = speed* -math.sin(bounce_angle)

			if b_pos_x > self.GAME_X:
				p1_score += 1
				b_pos_x = self.GAME_X / 2
				b_pos_y = self.GAME_Y / 2
			
			if b_pos_x < 0:
				p2_score += 1
				b_pos_x = self.GAME_X / 2
				b_pos_y = self.GAME_Y / 2
			
			await self.send(text_data=json.dumps({
				'type': 'position_update',
				'p1': player['p1'],
				'p2': player['p2'],
				'bx': b_pos_x,
				'by': b_pos_y,
				'p1_score': p1_score,
				'p2_score': p2_score,

			}))
			await asyncio.sleep(0.01)
		if (p1_score == 5):
			winner = 'player 1'
		else:
			winner = 'player 2'
		await self.send(text_data=json.dumps({
				'type': 'game_end',
				'winner': winner
		}))
		await self.disconnect(1)

