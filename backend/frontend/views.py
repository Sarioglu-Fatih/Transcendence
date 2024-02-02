from django.shortcuts import render
# Create your views here.

def renderMainPage(request):
	return render(request, 'index.html')

def renderProfilPage(request, user_profil):
	return render(request, 'index.html')
