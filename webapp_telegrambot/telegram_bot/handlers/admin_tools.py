import aiohttp
from aiogram import Router, types
from aiogram.filters import Command, BaseFilter
from aiogram.enums.chat_type import ChatType
from config import DJANGO_API_BASE_URL ,BOT_USERNAME, BOT_PASSWORD
from .token_fetcher import get_valid_access_token

API_ENDPOINT = f"{DJANGO_API_BASE_URL}/groups/"
COMMAND_NAME = "register_group" 

router = Router()

credentials = {
    "username": BOT_USERNAME,
    "password": BOT_PASSWORD,
}

class GroupChatFilter(BaseFilter):
    """
    Custom filter to allow messages only from Group or Supergroup chats,
    replacing the removed built-in ChatTypeFilter functionality.
    """
    def __init__(self, allowed_types: list[ChatType]):
        # Store the allowed chat types (e.g., [ChatType.GROUP, ChatType.SUPERGROUP])
        self.allowed_types = allowed_types 

    async def __call__(self, message: types.Message) -> bool:
        """
        Checks if the incoming message's chat type is in the allowed list.
        """
        # message.chat.type is a string like 'group', 'supergroup', or 'private'
        return message.chat.type in self.allowed_types


@router.message(
    Command(COMMAND_NAME), 
    # Use the custom filter class here
    GroupChatFilter(allowed_types=[ChatType.GROUP, ChatType.SUPERGROUP]) 
)
async def register_group_handler(message: types.Message) -> None:
    """
    Handles the /register_group command, extracts chat data, and posts it 
    to the Django API endpoint to create a new Group object.
    """
    
    chat_id = message.chat.id
    chat_name = message.chat.title
    
    access_token = await get_valid_access_token()
    if not access_token:
        await message.answer("❌ **Error:** Failed to retrieve authentication token.")
        return
    
    # 1. Prepare the Data Payload
    data = {
        "id": chat_id,
        "name": chat_name,
        "description": f"Registered via bot command {COMMAND_NAME}",
        "created_by": None,
        "is_approved": True
    }
    
    headers = {
    "Authorization": f"Bearer {access_token}"
    }
    
    # 2. Make the Asynchronous POST Request using aiohttp
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(API_ENDPOINT, json=data, headers=headers, timeout=10) as response:
                
                status = response.status
                
                if status == 201:
                    response_text = (
                        f"✅ **Success! Group Registered.**\n"
                        f"The group '{chat_name}' has been successfully added to the database "
                        f"with ID `{chat_id}`."
                    )
                
                elif status == 400:
                    error_details = await response.json()
                    
                    if 'id' in error_details and 'already exists' in str(error_details['id']):
                         response_text = (
                            f"⚠️ **Group Already Exists!**\n"
                            f"This group (`{chat_id}`) is already in the database."
                         )
                    else:
                        response_text = (
                            f"❌ **Registration Failed (Validation Error):**\n"
                            f"The API rejected the request. Details: `{error_details}`"
                        )
                else:
                    response_text = (
                        f"❌ **Registration Failed (API Error):**\n"
                        f"Status Code: {status}. Response: {await response.text()}"
                    )
            
    except aiohttp.ClientConnectorError:
        response_text = (
            "⚠️ **Connection Error:**\n"
            f"Could not connect to the API endpoint at `{API_ENDPOINT}`. Is the Django server running?"
        )
    except TimeoutError:
        response_text = "⌛ **Timeout Error:** The API request took too long to complete."
    except Exception as e:
        response_text = f"❌ **An unexpected error occurred:** {type(e).__name__}: {e}"
        
    # 4. Send Feedback to the Group
    await message.answer(
        response_text,
        parse_mode='Markdown'
    )