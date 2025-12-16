# user_app/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    
    class UserType(models.TextChoices):
        APP_USER = 'AU', 'App User'
        SITE_ADMIN = 'SA', 'Site Admin'
        BOT = 'BT', 'Bot'
        
    user_type = models.CharField(
        max_length=2,
        choices=UserType.choices,
        default=UserType.APP_USER,
        verbose_name='User Role'
    )
    
    # === 2. Fields Common to Library/Social Reading Sites (Goodreads Style) ===
    
    # Display name (User's preferred public name, potentially different from username)
    display_name = models.CharField(
        max_length=150,
        blank=True,
        null=True,
        verbose_name='Public Display Name'
    )
    
    # User's profile summary/bio
    bio = models.TextField(
        blank=True, 
        null=True,
        verbose_name='About Me'
    )
    
    # Profile picture/avatar
    avatar_url = models.URLField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name='Profile Picture URL'
    )
    
    # Tracking social activity (e.g., number of followers/following)
    followers_count = models.IntegerField(
        default=0
    )
    
    # Tracking reading activity (e.g., total books reviewed/rated)
    books_rated_count = models.IntegerField(
        default=0
    )
    
    # === 3. Required AbstractUser Fields with Custom Related Names ===
    
    # Explicitly redefine groups with a unique related_name
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name="customuser_groups",
    )
    
    # Explicitly redefine user_permissions with a unique related_name
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name="customuser_permissions",
    )
    
    # === 4. Methods ===

    def __str__(self):
        # Use display_name if available, otherwise fallback to username
        return self.display_name or self.username

    def save(self, *args, **kwargs):
        # Automatically handle is_staff/is_superuser based on user_type
        if self.user_type == self.UserType.SITE_ADMIN:
            self.is_staff = True
            self.is_superuser = True
        elif self.user_type == self.UserType.BOT:
            self.is_staff = True
            self.is_superuser = False 
        elif self.user_type == self.UserType.APP_USER:
            self.is_staff = False
            self.is_superuser = False
            
        # Set a default display_name if one isn't provided (e.g., upon creation)
        if not self.display_name:
             self.display_name = self.username
        
        super().save(*args, **kwargs)