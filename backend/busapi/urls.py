from django.urls import path
from .views import run_training, predict_seat, bus_realtime, station_realtime
from .views_auth import signup, login_view, logout_view, current_user

urlpatterns = [
    path('auth/signup/', signup),
    path('auth/login/', login_view),
    path('auth/logout/', logout_view),
    path('auth/me/', current_user),

    path('predict-seat/', predict_seat, name='predict_seat'),
    path('train/', run_training, name='run_training'),
    
    # 실시간 데이터 API
    path('bus/realtime/', bus_realtime, name='bus_realtime'),
    path('station/realtime/', station_realtime, name='station_realtime'),
]
