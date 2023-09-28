import string
import random
import sys
import os


def random_string(length: int):
    return ''.join(random.choice(string.ascii_letters) for i in range(length))


def restart_app():
    os.execl(sys.executable, os.path.abspath(__file__), *sys.argv)
