"""
Centralized API client for Django backend communication
Provides reusable methods for all API interactions
"""
import asyncio
import aiohttp
import logging
from typing import Optional, Dict, Any, List
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class APIResponse:
    """Standardized API response wrapper"""
    success: bool
    status_code: int
    data: Optional[Any] = None
    error: Optional[str] = None


class DjangoAPIClient:
    """
    Centralized API client for Django backend
    Handles all HTTP communication with proper error handling
    """
    
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
        
    async def _make_request(
        self,
        method: str,
        endpoint: str,
        token: Optional[str] = None,
        data: Optional[Dict] = None,
        params: Optional[Dict] = None,
        timeout: int = 10
    ) -> APIResponse:
        """
        Generic request handler with error handling
        
        Args:
            method: HTTP method (GET, POST, PATCH, DELETE)
            endpoint: API endpoint (e.g., '/books/')
            token: Optional JWT token
            data: Optional JSON payload
            params: Optional query parameters
            timeout: Request timeout in seconds
            
        Returns:
            APIResponse object with standardized response
        """
        url = f"{self.base_url}{endpoint}"
        headers = {}
        
        if token:
            headers["Authorization"] = f"Bearer {token}"
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.request(
                    method=method,
                    url=url,
                    json=data,
                    params=params,
                    headers=headers,
                    timeout=timeout
                ) as resp:
                    status = resp.status
                    
                    # Handle different response types
                    if status in (200, 201):
                        try:
                            response_data = await resp.json()
                            return APIResponse(
                                success=True,
                                status_code=status,
                                data=response_data
                            )
                        except aiohttp.ContentTypeError:
                            # Handle non-JSON responses
                            text = await resp.text()
                            return APIResponse(
                                success=True,
                                status_code=status,
                                data=text
                            )
                    
                    # Handle errors
                    error_text = await resp.text()
                    try:
                        error_data = await resp.json()
                        error_msg = error_data.get('detail', error_text)
                    except:
                        error_msg = error_text
                    
                    return APIResponse(
                        success=False,
                        status_code=status,
                        error=error_msg
                    )
                    
        except aiohttp.ClientConnectorError as e:
            logger.error(f"Connection error: {e}")
            return APIResponse(
                success=False,
                status_code=0,
                error="خطا در اتصال به سرور"
            )
        except asyncio.TimeoutError:
            logger.error(f"Timeout for {endpoint}")
            return APIResponse(
                success=False,
                status_code=0,
                error="زمان درخواست به پایان رسید"
            )
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return APIResponse(
                success=False,
                status_code=0,
                error=f"خطای غیرمنتظره: {str(e)}"
            )
    
    # ============= Books API =============
    
    async def search_books(
        self, 
        query: str, 
        token: Optional[str] = None
    ) -> APIResponse:
        """Search books in local database"""
        return await self._make_request(
            method="GET",
            endpoint="/books/",
            token=token,
            params={"search": query, "ordering": "-rating_number"}
        )
    
    async def get_book(self, book_id: str, token: str) -> APIResponse:
        """Get single book details"""
        return await self._make_request(
            method="GET",
            endpoint=f"/books/{book_id}/",
            token=token
        )
    
    async def search_external(
        self, 
        query: str, 
        query_type: str
    ) -> APIResponse:
        """Search books in external library (Open Library)"""
        return await self._make_request(
            method="GET",
            endpoint="/books/search-external/",
            params={"query": query, "query_type": query_type},
            timeout=25
        )
    
    # ============= Reviews API =============
    
    async def get_user_reviews(
        self, 
        token: str, 
        limit: int = 5
    ) -> APIResponse:
        """Get current user's reviews"""
        return await self._make_request(
            method="GET",
            endpoint="/reviews/",
            token=token,
            params={"mine": 1, "limit": limit}
        )
    
    async def get_book_reviews(
        self, 
        book_id: str, 
        token: str
    ) -> APIResponse:
        """Get reviews for a specific book"""
        return await self._make_request(
            method="GET",
            endpoint=f"/books/{book_id}/reviews/",
            token=token,
            params={"mine": 1}
        )
    
    async def create_review(
        self, 
        token: str, 
        book_id: str,
        title: str,
        rating: int,
        review_text: str
    ) -> APIResponse:
        """Create a new review"""
        return await self._make_request(
            method="POST",
            endpoint="/reviews/",
            token=token,
            data={
                "book": book_id,
                "title": title,
                "rating": rating,
                "review_text": review_text
            }
        )
    
    async def update_review(
        self, 
        token: str, 
        review_id: int,
        title: Optional[str] = None,
        rating: Optional[int] = None,
        review_text: Optional[str] = None
    ) -> APIResponse:
        """Update existing review"""
        data = {}
        if title:
            data["title"] = title
        if rating:
            data["rating"] = rating
        if review_text:
            data["review_text"] = review_text
            
        return await self._make_request(
            method="PATCH",
            endpoint=f"/reviews/{review_id}/",
            token=token,
            data=data
        )
    
    # ============= Groups API =============
    
    async def get_groups(self, token: Optional[str] = None) -> APIResponse:
        """Get all groups"""
        return await self._make_request(
            method="GET",
            endpoint="/groups/",
            token=token
        )
    
    async def get_group(self, group_id: int, token: str) -> APIResponse:
        """Get single group details"""
        return await self._make_request(
            method="GET",
            endpoint=f"/groups/{group_id}/",
            token=token
        )
    
    async def request_group(
        self, 
        token: str, 
        name: str, 
        description: str
    ) -> APIResponse:
        """Request creation of new group"""
        return await self._make_request(
            method="POST",
            endpoint="/groups/request_group/",
            token=token,
            data={"name": name, "description": description}
        )
    
    # ============= Topics API =============
    
    async def get_topics(
        self, 
        token: str, 
        group_id: int
    ) -> APIResponse:
        """Get topics for a group"""
        return await self._make_request(
            method="GET",
            endpoint="/topics/",
            token=token,
            params={"group_id": group_id}
        )
    
    async def create_topic(
        self,
        token: str,
        group_id: int,
        name: str,
        description: str,
        topic_id: int
    ) -> APIResponse:
        """Create new topic"""
        return await self._make_request(
            method="POST",
            endpoint="/topics/",
            token=token,
            data={
                "group": group_id,
                "name": name,
                "description": description,
                "topic_id": topic_id,
                "is_active": True,
                "is_full": False
            }
        )
    
    # ============= Authentication API =============
    
    async def login(self, username: str, password: str) -> APIResponse:
        """Authenticate user and get JWT token"""
        return await self._make_request(
            method="POST",
            endpoint="/token/",
            data={"username": username, "password": password}
        )
    
    async def get_user_profile(self, token: str) -> APIResponse:
        """Get current user profile"""
        return await self._make_request(
            method="GET",
            endpoint="/users/me/",
            token=token
        )
    
    async def sync_telegram_profile(
        self,
        token: str,
        telegram_id: int,
        username: Optional[str],
        first_name: Optional[str],
        last_name: Optional[str]
    ) -> APIResponse:
        """Sync Telegram profile with backend"""
        return await self._make_request(
            method="POST",
            endpoint="/telegram-profiles/sync/",
            token=token,
            data={
                "telegram_id": telegram_id,
                "username": username,
                "first_name": first_name,
                "last_name": last_name
            }
        )
    
    async def get_token_by_telegram(self, telegram_id: int) -> APIResponse:
        """Get JWT token by Telegram ID"""
        return await self._make_request(
            method="GET",
            endpoint="/telegram-profiles/token_by_telegram/",
            params={"telegram_id": telegram_id}
        )
    
    async def delete_telegram_profile(self, telegram_id: int) -> APIResponse:
        """Delete Telegram profile (logout)"""
        return await self._make_request(
            method="DELETE",
            endpoint=f"/telegram-profiles/{telegram_id}/"
        )