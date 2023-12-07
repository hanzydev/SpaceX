import subprocess
import shutil
import re
from colorama import Fore

from util.console import *
from util.question import *
from util.os import *
from util.git import *
from util.data import *


default_encrypted_password = "$argon2id$v=19$m=65536,t=2,p=1$nxPIevE6UMWTH85/WiCY3e3Xbs/gvNiVJ5l/yHU1sUo$W90ubPGIsDnuJ96I62K5dbwp5DqJEr4p6Pcco2mwcME"


def reset_app():
    username = str_user_input("👉 Enter your username")
    clear()

    if not get_app(username):
        print(f"{get_err_prefix()} Username doesn't exist!")
        exit(1)

    app = get_app(username)

    if not yes_or_no("👉 Are you sure you want to reset this app?"):
        clear()
        print(f"{get_info_prefix()} Aborting...")
        exit(1)

    clear()
    print(f"{get_info_prefix()} Stopping app...")
    subprocess.run(
        f"pm2 stop spacex-{username}-backend spacex-{username}-frontend", shell=True)

    clear()
    print(f"{get_info_prefix()} Resetting database...")
    subprocess.run(
        f"sudo -Hiu postgres psql -c \"DROP DATABASE \\\"spacex-{username}\\\";\"", shell=True)
    subprocess.run(
        f"sudo -Hiu postgres psql -c \"CREATE DATABASE \\\"spacex-{username}\\\" WITH OWNER spacex;\"", shell=True)

    clear()
    print(f"{get_info_prefix()} Resetting password...")
    with open(f"/etc/SpaceX/apps/{username}/backend/.env", "r") as f:
        env_file = f.read()

        password_regex = re.compile(r"^PASSWORD=(.*)", re.MULTILINE)

        env_file = password_regex.sub(
            f"PASSWORD={default_encrypted_password}", env_file)

        open(
            f"/etc/SpaceX/apps/{username}/backend/.env", "w").write(env_file)
        f.close()

    clear()
    print(
        f"{get_info_prefix()} Removing uploaded files and backups from disk...")
    shutil.rmtree(f"/etc/SpaceX/apps/{username}/backend/files")

    clear()
    print(f"{get_info_prefix()} Restarting app...")
    subprocess.run(
        f"pm2 restart spacex-{username}-backend spacex-{username}-frontend", shell=True)

    clear()
    print(f"{get_ok_prefix()} App reset complete!")

    print(f"\n{Fore.LIGHTMAGENTA_EX}================================{Fore.RESET}")
    print(f"{Fore.CYAN}Username: {Fore.RESET}{username}")
    print(f"{Fore.CYAN}Password: {Fore.RESET}spacex")
    print(
        f"{Fore.LIGHTMAGENTA_EX}================================{Fore.RESET}\n")

    if not app["is_ip"]:
        print(
            f"{get_info_prefix()} Once you have configured your DNS, you can access your site at {app['site_url']}")
    else:
        print(
            f"{get_info_prefix()} You can access your site at {app['site_url']}")
