import subprocess
import shutil
import re

from util.console import *
from util.question import *
from util.data import *


def change_username():
    username = str_user_input("👉 Enter your username")
    clear()

    if not get_app(username):
        print(f"{get_err_prefix()} Username doesn't exist!")
        exit(1)

    app = get_app(username)
    new_username = str_user_input("👉 Enter your new username")
    clear()

    if new_username == username:
        print(f"{get_err_prefix()} Username is the same!")
        exit(1)

    if get_app(new_username):
        print(f"{get_err_prefix()} Username already exists!")
        exit(1)

    clear()
    if not yes_or_no("👉 Are you sure you want to change your username?"):
        clear()
        print(f"{get_info_prefix()} Aborting...")
        exit(1)

    clear()
    print(f"{get_info_prefix()} Stopping app...")
    subprocess.run(
        f"pm2 stop spacex-{username}-backend spacex-{username}-frontend", shell=True)

    clear()
    print(f"{get_info_prefix()} Changing database name...")
    subprocess.run(
        f"sudo -Hiu postgres psql -c \"ALTER DATABASE \\\"spacex-{username}\\\" RENAME TO \\\"spacex-{new_username}\\\";\"", shell=True)

    clear()
    print(f"{get_info_prefix()} Configuring backend...")
    with open(f"/etc/SpaceX/apps/{username}/backend/.env", "r") as f:
        env_file = f.read()

        username_regex = re.compile(r"USERNAME=(.*)")
        postgres_database_regex = re.compile(r"POSTGRES_DATABASE=(.*)")

        env_file = username_regex.sub(
            f"USERNAME={new_username}", env_file)
        env_file = postgres_database_regex.sub(
            f"POSTGRES_DATABASE=spacex-{new_username}", env_file)

        open(
            f"/etc/SpaceX/apps/{username}/backend/.env", "w").write(env_file)
        f.close()

    clear()
    print(f"{get_info_prefix()} Renaming app folder...")
    shutil.move(
        f"/etc/SpaceX/apps/{username}", f"/etc/SpaceX/apps/{new_username}")

    clear()
    print(f"{get_info_prefix()} Renaming app in PM2...")
    subprocess.run(
        f"pm2 delete spacex-{username}-backend spacex-{username}-frontend", shell=True)
    subprocess.run(
        f"pm2 start yarn --name spacex-{new_username}-backend -- start", cwd=f"/etc/SpaceX/apps/{new_username}/backend", shell=True)
    subprocess.run(
        f"pm2 start yarn --name spacex-{new_username}-frontend -- preview ", cwd=f"/etc/SpaceX/apps/{new_username}/frontend", shell=True)
    subprocess.run("pm2 save --force", shell=True)
    subprocess.run("pm2 startup", shell=True)

    clear()
    print(f"{get_info_prefix()} Updating app data...")
    update_app(username, app | {
        "username": new_username
    })

    clear()
    print(f"{get_ok_prefix()} Username changed!")
