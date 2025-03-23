from .form import CustomUserCreationForm, CustomAuthenticationForm
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.shortcuts import render, redirect
from rest_framework.authtoken.models import Token

def register(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            messages.success(request, f"Account created for {user.username}! You can now log in.")
            return redirect('login-page')
    else:
        form = CustomUserCreationForm()
    return render(request, 'register.html', {'form': form})

def signup_view(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            # Create token for the user
            token, created = Token.objects.get_or_create(user=user)
            # Log the user in
            login(request, user)
            messages.success(request, "Account created successfully!")
            return redirect('home')  # Redirect to home page or dashboard
    else:
        form = CustomUserCreationForm()
    return render(request, 'registration/signup.html', {'form': form})

def login_view(request):
    if request.method == 'POST':
        form = CustomAuthenticationForm(request, data=request.POST)
        if form.is_valid():
            email = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=email, password=password)
            if user is not None:
                login(request, user)
                # Get or create token
                token, created = Token.objects.get_or_create(user=user)
                messages.success(request, "Login successful!")
                return redirect('home')  # Redirect to home page or dashboard
    else:
        form = CustomAuthenticationForm()
    return render(request, 'registration/login.html', {'form': form})

def home_view(request):
    return render(request, 'home.html')



