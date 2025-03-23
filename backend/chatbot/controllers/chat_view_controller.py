from django.http import JsonResponse
from django.shortcuts import render

from chatbot.utils import process_query


def chat_view_controller(request):
    if request.method == 'POST':
        user_query = request.POST.get('message', '')
        ip_address = request.META.get("REMOTE_ADDR")

        message = process_query(user_query)
        response_data = {'response': f'{message}'}
        return JsonResponse(response_data)
    return render(request, 'chat.html')