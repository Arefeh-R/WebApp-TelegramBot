from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):

    """
    Custom permission to only allow owners of an object to edit or delete it.
    If the object is an Amazon review (user=None), it cannot be edited by anyone
    except possibly an admin (which is handled separately).
    """

    def has_object_permission(self, request, view, obj):
        
        if request.method in permissions.SAFE_METHODS:
            return True

        if hasattr(obj, 'user') and obj.user is not None:
            return obj.user == request.user
        
        return False
    