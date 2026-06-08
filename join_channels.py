from telethon.sync import TelegramClient
from telethon.sessions import StringSession
from telethon.tl.functions.messages import ImportChatInviteRequest
from telethon.errors import UserAlreadyParticipantError
import sys

# Replace this with your Telethon Session String from the Settings page
SESSION_STRING = ""

API_ID = 26978505 # Default API ID
API_HASH = "b328d0b2dbb28c50ce7e3f89025ce8d9"

# Your list of invite links
INVITE_LINKS = [
    "https://t.me/+JpTjUwE9J9A1NDE1",
    "https://t.me/+X925uAMEGvgwOWY1",
    "https://t.me/+Io8OVRMkSVs5YzI1",
    "https://t.me/+958__Lu4ZoUxM2E9",
    "https://t.me/+tcoZTg6lJWI4ZDRl",
    "https://t.me/+LP6MYEpCwi0zOGYx",
    "https://telegram.dog/+OyiJYrTZZH8zZjRi",
    "https://t.me/+78q2HURz8i44OTZl",
    "https://t.me/+uV5wcTkUWJEwM2Y1",
    "https://t.me/+vZKuuHCZcX44M2l1",
    "https://t.me/+sX1Ht4p33nFjZDE1",
    "https://t.me/+FpXKV70NYNY0NzQ1"
]

def join_private_channels():
    if not SESSION_STRING:
        print("❌ ERROR: Please paste your TG_SESSION_STRING at the top of the file.")
        sys.exit(1)

    print("🚀 Connecting to Telegram...")
    with TelegramClient(StringSession(SESSION_STRING), API_ID, API_HASH) as client:
        print("✅ Connected successfully as", client.get_me().first_name)
        
        print("\n⏳ Joining channels...")
        for link in INVITE_LINKS:
            try:
                # Extract the hash part (e.g. +JpTjUwE9J9A1NDE1 -> JpTjUwE9J9A1NDE1)
                invite_hash = link.split("+")[1].split("/")[0].split("?")[0]
                
                updates = client(ImportChatInviteRequest(invite_hash))
                
                if updates.chats:
                    chat = updates.chats[0]
                    print(f"✅ Successfully joined: {chat.title} (ID: {chat.id})")
                else:
                    print(f"✅ Joined, but couldn't fetch details for {link}")

            except UserAlreadyParticipantError:
                print(f"👍 Already a member of {link}")
            except Exception as e:
                print(f"❌ Failed to join {link}: {str(e)}")
        
        print("\n🎉 All done! Now you can use the numeric IDs in your .env and frontend.")

if __name__ == "__main__":
    join_private_channels()
