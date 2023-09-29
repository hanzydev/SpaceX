import subprocess
import os
from colorama import Fore

from util.console import *
from util.question import *
from util.os import *
from util.data import init_spacex_data, get_deps_installed, set_deps_installed, set_postgres_password
from util.other import *

from operations.install import install_app
from operations.uninstall import uninstall_app
from operations.list import list_apps
from operations.reset_pass import reset_pass
from operations.change_domain import change_domain
from operations.reset_app import reset_app
from operations.change_username import change_username
from operations.change_ports import change_ports
from operations.update import update_app

if not is_linux():
    print(f"{get_err_prefix()} This script is only for Linux!")
    exit(1)

if not get_distro_pkg_manager():
    print(f"{get_err_prefix()} Unsupported package manager!")
    exit(1)

if os.geteuid() != 0:
    print(f"{get_err_prefix()} This script must be run as root!")
    exit(1)

init_spacex_data()
pkg_manager = get_distro_pkg_manager()

if not get_deps_installed():
    print(f"{get_info_prefix()} First we need to install some dependencies...\n")

    postgres_password = str_user_input(
        "👉 We need to set a password for PostgreSQL (default random)", random_string(16))
    clear()

    script = open("./base/install_deps.sh", "r").read()

    subprocess.run(script
                   .replace("$pkg_manager", pkg_manager["manager"])
                   .replace("$install_cmd", pkg_manager["install_cmd"])
                   .replace("$update_cmd", pkg_manager["update_cmd"])
                   .replace("$yes_to_all", pkg_manager["yes_to_all"])
                   .replace("$db_pass", postgres_password),
                   shell=True)

    clear()
    print(f"{get_ok_prefix()} The following dependencies were added:\n")

    for dep in ['Node.js (https://nodejs.org/)', 'Bun (https://bun.sh)', 'PostgreSQL (https://postgresql.org/)']:
        print(f"{Fore.GREEN}(+){Fore.RESET} {dep}")

    set_deps_installed(True)
    set_postgres_password(postgres_password)


banner = Fore.LIGHTMAGENTA_EX + """
███████╗██████╗  █████╗  ██████╗███████╗██╗  ██╗
██╔════╝██╔══██╗██╔══██╗██╔════╝██╔════╝╚██╗██╔╝
███████╗██████╔╝███████║██║     █████╗   ╚███╔╝ 
╚════██║██╔═══╝ ██╔══██║██║     ██╔══╝   ██╔██╗ 
███████║██║     ██║  ██║╚██████╗███████╗██╔╝ ██╗
╚══════╝╚═╝     ╚═╝  ╚═╝ ╚═════╝╚══════╝╚═╝  ╚═╝""" + Fore.RESET

print(banner)

print(f"""
{Fore.CYAN}1{Fore.RESET}. Install
{Fore.CYAN}2{Fore.RESET}. Uninstall {Fore.RED}[DANGER]{Fore.RESET}
{Fore.CYAN}3{Fore.RESET}. Update
{Fore.CYAN}4{Fore.RESET}. List
{Fore.CYAN}5{Fore.RESET}. Other
{Fore.CYAN}6{Fore.RESET}. Exit
""")

choice = num_choice("👉 Enter your choice", (1, 2, 3, 4, 5, 6))
clear()

if choice == False:
    print(f"{get_err_prefix()} Invalid choice!")
    exit(1)

choice = int(choice)
clear()

match choice:
    case 1:
        install_app()
        pass
    case 2:
        uninstall_app()
        pass
    case 3:
        update_app()
        pass
    case 4:
        list_apps()
        pass
    case 5:
        clear()
        print(banner)

        print(f"""
{Fore.CYAN}1{Fore.RESET}. Reset password
{Fore.CYAN}2{Fore.RESET}. Change domain
{Fore.CYAN}3{Fore.RESET}. Change ports
{Fore.CYAN}4{Fore.RESET}. Change username
{Fore.CYAN}5{Fore.RESET}. Reset app {Fore.RED}[DANGER]{Fore.RESET}
{Fore.CYAN}6{Fore.RESET}. Back
""")

        choice = num_choice("👉 Enter your choice", (1, 2, 3, 4, 5, 6))
        clear()

        if choice == False:
            print(f"{get_err_prefix()} Invalid choice!")
            exit(1)

        choice = int(choice)
        clear()

        match choice:
            case 1:
                reset_pass()
                pass
            case 2:
                change_domain()
                pass
            case 3:
                change_ports()
                pass
            case 4:
                change_username()
                pass
            case 5:
                reset_app()
                pass
            case 6:
                restart_app()
                pass
    case 6:
        print(f"{get_info_prefix()} Exiting...")
        exit(0)
