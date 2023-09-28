import subprocess
import shutil
import os

from util.console import *
from util.question import *
from util.data import *


def uninstall_app():
    username = str_user_input("👉 Enter your username")
    clear()

    if not get_app(username):
        print(f"{get_err_prefix()} Username doesn't exist!")
        exit(1)

    app = get_app(username)

    if not yes_or_no("👉 Are you sure you want to uninstall this app?"):
        clear()
        print(f"{get_info_prefix()} Aborting...")
        exit(1)

    clear()
    print(f"{get_info_prefix()} Removing app from PM2...")
    subprocess.run(
        f"pm2 delete spacex-{username}-backend spacex-{username}-frontend", shell=True)
    subprocess.run("pm2 save --force", shell=True)
    subprocess.run("pm2 startup", shell=True)

    clear()
    print(f"{get_info_prefix()} Removing app from database...")
    remove_app(username)

    domain_without_protocol = app["domain"].replace(
        "https://", "").replace("http://", "")

    if app["using_nginx"]:
        clear()
        print(f"{get_info_prefix()} Removing nginx config...")
        os.remove(f"/etc/nginx/sites-available/{domain_without_protocol}")
        os.remove(f"/etc/nginx/sites-enabled/{domain_without_protocol}")
        subprocess.run(
            "sudo systemctl restart nginx", shell=True)

    clear()
    print(f"{get_info_prefix()} Removing app from disk...")
    shutil.rmtree(f"/etc/SpaceX/apps/{username}")

    clear()
    print(f"{get_info_prefix()} Removing database...")
    subprocess.run(
        f"sudo -Hiu postgres psql -c \"DROP DATABASE \\\"spacex-{username}\\\";\"", shell=True)

    clear()
    print(f"{get_ok_prefix()} Uninstallation complete!")
