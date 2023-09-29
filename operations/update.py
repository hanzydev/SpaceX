import subprocess
from datetime import datetime

from util.console import *
from util.question import *
from util.data import *
from util.git import *


def update():
    username = str_user_input("👉 Enter your username")
    clear()

    app = get_app(username)

    if not app:
        print(f"{get_err_prefix()} Username doesn't exist!")
        exit(1)

    print(f"{get_info_prefix()} Fetching last commit hashes...")
    frontend_last_commit = fetch_last_commit("hanzydev/SpaceX", "frontend")
    backend_last_commit = fetch_last_commit("hanzydev/SpaceX", "backend")

    is_frontend_up_to_date = frontend_last_commit == app["frontend_last_commit"]
    is_backend_up_to_date = backend_last_commit == app["backend_last_commit"]

    if is_frontend_up_to_date and is_backend_up_to_date:
        clear()
        print(f"{get_info_prefix()} Already up to date!")
        exit(0)

    clear()

    if not yes_or_no("👉 Do you want to update this app?"):
        clear()
        print(f"{get_info_prefix()} Aborting...")
        exit(1)

    if not is_frontend_up_to_date:
        clear()
        print(f"{get_info_prefix()} Pulling frontend...")
        pull_repo(f"/etc/SpaceX/apps/{username}/frontend")

        clear()
        print(f"{get_info_prefix()} Building frontend...")
        subprocess.run(
            "yarn build", cwd=f"/etc/SpaceX/apps/{username}/frontend", shell=True)

    if not is_backend_up_to_date:
        clear()
        print(f"{get_info_prefix()} Pulling backend...")
        pull_repo(f"/etc/SpaceX/apps/{username}/backend")

    clear()
    print(f"{get_info_prefix()} Restarting app...")
    subprocess.run(
        f"pm2 restart spacex-{username}-backend spacex-{username}-frontend", shell=True)

    clear()
    print(f"{get_info_prefix()} Updating database...")
    update_app(username, app | {
        "frontend_last_commit": frontend_last_commit,
        "backend_last_commit": backend_last_commit
    })

    frontend_last_commits_after = fetch_last_commits_after_commit(
        "hanzydev/SpaceX", app["frontend_last_commit"], "frontend")
    backend_last_commits_after = fetch_last_commits_after_commit(
        "hanzydev/SpaceX", app["backend_last_commit"], "backend")

    clear()
    print(f"{get_ok_prefix()} Update complete! Here are the changes:\n")
    print(
        f"{Fore.LIGHTMAGENTA_EX}======================================================={Fore.RESET}\n")

    for commit in frontend_last_commits_after:
        print(
            f"{Fore.CYAN}frontend:{Fore.RESET} {commit['commit']['message']} ({commit['sha'][:7]})")
        print(
            f"{Fore.CYAN}by {Fore.RESET}{commit['commit']['author']['name']}")
        print(
            f"{Fore.CYAN}at {Fore.RESET}{datetime.strptime(commit['commit']['author']['date'], '%Y-%m-%dT%H:%M:%SZ')}\n")

    for commit in backend_last_commits_after:
        print(
            f"{Fore.CYAN}backend:{Fore.RESET} {commit['commit']['message']} ({commit['sha'][:7]})")
        print(
            f"{Fore.CYAN}by {Fore.RESET}{commit['commit']['author']['name']}")
        print(
            f"{Fore.CYAN}at {Fore.RESET}{datetime.strptime(commit['commit']['author']['date'], '%Y-%m-%dT%H:%M:%SZ')}\n")

    print(
        f"{Fore.LIGHTMAGENTA_EX}======================================================={Fore.RESET}")
