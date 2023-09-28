from util.console import *
from util.data import *
from util.git import *


def list_apps():
    apps = get_apps()

    if len(apps) == 0:
        print(f"{get_info_prefix()} No apps installed!")
        exit(0)

    print(
        f"{Fore.LIGHTMAGENTA_EX}============================================={Fore.RESET}")

    frontend_last_commit = fetch_last_commit("hanzydev/SpaceX", "frontend")
    backend_last_commit = fetch_last_commit("hanzydev/SpaceX", "backend")

    for app in apps:
        print(f"\n{Fore.CYAN}Username:   {Fore.RESET}{app['username']}")
        print(f"{Fore.CYAN}Domain:     {Fore.RESET}{app['domain']}")
        print(f"{Fore.CYAN}Status:     {Fore.RESET}", end="")

        if app["frontend_last_commit"] == frontend_last_commit and app["backend_last_commit"] == backend_last_commit:
            print(f"{Fore.GREEN}Up to date{Fore.RESET}")
        else:
            print(f"{Fore.YELLOW}Outdated{Fore.RESET}")

    print(
        f"\n{Fore.LIGHTMAGENTA_EX}============================================={Fore.RESET}")
