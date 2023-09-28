import os
from colorama import Fore


def clear():
    os.system("clear")


def get_err_prefix(): return Fore.RED + "[ERROR]" + Fore.RESET
def get_ok_prefix(): return Fore.GREEN + "[SUCCESS]" + Fore.RESET
def get_warn_prefix(): return Fore.YELLOW + "[WARNING]" + Fore.RESET
def get_info_prefix(): return Fore.CYAN + "[INFO]" + Fore.RESET