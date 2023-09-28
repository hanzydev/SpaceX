import subprocess
import re

from util.console import *
from util.question import *
from util.data import *


default_encrypted_password = "$argon2id$v=19$m=65536,t=2,p=1$wRDnasEu1sD2H98puPLXPm2IddK/H9tbUXmIdVwGfAA$+Am9R4DJVdKGCKbSKSbyKe5juAOCaQB2+2OtGw+XoPQ"


def reset_pass():
    username = str_user_input("👉 Enter your username")
    clear()

    app = get_app(username)

    if not app:
        print(f"{get_err_prefix()} Username doesn't exist!")
        exit(1)

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
    print(f"{get_info_prefix()} Restarting app...")
    subprocess.run(
        f"pm2 restart spacex-{username}-backend", shell=True)

    clear()
    print(f"{get_ok_prefix()} Password reset!")
