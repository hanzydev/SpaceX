import subprocess
from PIL import Image

from util.console import *
from util.question import *
from util.os import *
from util.git import *
from util.data import *


def change_pfp():
    username = str_user_input("👉 Enter your username")
    clear()

    if not get_app(username):
        print(f"{get_err_prefix()} Username doesn't exist!")
        exit(1)

    pfp_path = str_user_input("👉 Enter the path to your new profile picture")
    clear()

    if not os.path.exists(pfp_path):
        print(f"{get_err_prefix()} Path doesn't exist!")
        exit(1)

    if not os.path.isfile(pfp_path):
        print(f"{get_err_prefix()} Path is not a file!")
        exit(1)

    allowed_extensions = ["PNG", "JPEG", "WEBP"]

    img = Image.open(pfp_path)
    width, height = img.size

    if img.format not in allowed_extensions:
        print(f"{get_err_prefix()} Image format is not supported!")
        exit(1)

    if width < 192 or height < 192:
        print(f"{get_err_prefix()} Image is too small!")
        exit(1)

    print(f"{get_info_prefix()} Changing profile picture...")

    favicon = img.resize((128, 128))
    favicon.save(
        f"/etc/SpaceX/apps/{username}/frontend/src/public/favicon.ico", format="ICO")

    apple_touch_icon = img.resize((1000, 1000))
    apple_touch_icon.save(
        f"/etc/SpaceX/apps/{username}/frontend/src/public/apple-touch-icon.png", format="PNG")

    icon_192 = img.resize((192, 192))
    icon_192.save(
        f"/etc/SpaceX/apps/{username}/frontend/src/public/icon-192x192.png", format="PNG")

    icon_512 = img.resize((512, 512))
    icon_512.save(
        f"/etc/SpaceX/apps/{username}/frontend/src/public/icon-512x512.png", format="PNG")

    clear()
    print(f"{get_info_prefix()} Building frontend...")
    subprocess.run(
        "pnpm build", cwd=f"/etc/SpaceX/apps/{username}/frontend", shell=True)

    clear()
    print(f"{get_info_prefix()} Restarting app...")
    subprocess.run(
        f"pm2 restart spacex-{username}-frontend", shell=True)

    clear()
    print(f"{get_ok_prefix()} Profile picture changed!")
