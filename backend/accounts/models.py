from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    """
    Extends standard Django User with academic and research profile details.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    institution = models.CharField(max_length=255, blank=True, default='')
    field_of_study = models.CharField(max_length=150, blank=True, default='')
    bio = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} Profile"

