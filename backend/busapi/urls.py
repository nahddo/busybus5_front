from django.urls import path
from . import views

urlpatterns = [
    path('predict-seat/', views.predict_seat, name='predict_seat'),
    path('train/', run_training, name='run_training' ),
]

