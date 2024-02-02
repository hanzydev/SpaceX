import subprocess
import re
from colorama import Fore

from util.console import *
from util.question import *
from util.os import *
from util.git import *
from util.data import *


def change_ports():
    username = str_user_input("👉 Enter your username")
    clear()

    if not get_app(username):
        print(f"{get_err_prefix()} Username doesn't exist!")
        exit(1)

    app = get_app(username)

    site_port = int_user_input(
        f"👉 Enter new site port (default {app['site_port']})", app['site_port'])
    clear()

    api_port = int_user_input(
        f"👉 Enter new API port (default {app['api_port']})", app['api_port'])
    clear()

    wss_port = int_user_input(
        f"👉 Enter new WSS port (default {app['wss_port']})", app['wss_port'])
    clear()

    if site_port == app['site_port'] and api_port == app['api_port'] and wss_port == app['wss_port']:
        print(f"{get_err_prefix()} No changes made!")
        exit(1)

    print(
        f"{Fore.LIGHTMAGENTA_EX}====================={Fore.RESET}")
    print(f"{Fore.CYAN}Site Port:  {Fore.RESET}{site_port}")
    print(f"{Fore.CYAN}API Port:   {Fore.RESET}{api_port}")
    print(f"{Fore.CYAN}WSS Port:   {Fore.RESET}{wss_port}")
    print(
        f"{Fore.LIGHTMAGENTA_EX}====================={Fore.RESET}")

    if not yes_or_no("👉 Is this correct?"):
        clear()
        print(f"{get_info_prefix()} Aborting...")
        exit(1)

    is_ip = app["is_ip"]
    use_nginx = app["using_nginx"]
    use_https = app["https"]
    domain = app["domain"]

    site_url = (
        is_ip or not use_nginx) and f"http://{domain}:{site_port}" or f"{use_https and 'https' or 'http'}://{domain}"
    api_url = (
        is_ip or not use_nginx) and f"http://{domain}:{api_port}" or f"{use_https and 'https' or 'http'}://{domain}/api"
    wss_url = (
        is_ip or not use_nginx) and f"{use_https and 'wss' or 'ws'}://{domain}:{wss_port}" or f"{use_https and 'wss' or 'ws'}://{domain}/ws"

    clear()
    print(f"{get_info_prefix()} Configuring frontend...")
    with open(f"/etc/SpaceX/apps/{username}/frontend/.env", "r") as f:
        env_file = f.read()

        site_url_regex = re.compile(r"NUXT_PUBLIC_SITE_URL=(.*)")
        api_url_regex = re.compile(r"NUXT_PUBLIC_API_URL=(.*)")
        wss_url_regex = re.compile(r"NUXT_PUBLIC_WSS_URL=(.*)")
        port_regex = re.compile(r"PORT=(.*)")

        env_file = site_url_regex.sub(
            f"NUXT_PUBLIC_SITE_URL={site_url}", env_file)
        env_file = api_url_regex.sub(
            f"NUXT_PUBLIC_API_URL={api_url}", env_file)
        env_file = wss_url_regex.sub(
            f"NUXT_PUBLIC_WSS_URL={wss_url}", env_file)
        env_file = port_regex.sub(
            f"PORT={site_port}", env_file)

        open(
            f"/etc/SpaceX/apps/{username}/frontend/.env", "w").write(env_file)
        f.close()

    clear()
    print(f"{get_info_prefix()} Configuring backend...")
    with open(f"/etc/SpaceX/apps/{username}/backend/.env", "r") as f:
        env_file = f.read()

        port_regex = re.compile(r"API_PORT=(.*)")
        wss_port_regex = re.compile(r"WSS_PORT=(.*)")
        site_url_regex = re.compile(r"SITE_URL=(.*)")

        env_file = port_regex.sub(
            f"API_PORT={api_port}", env_file)
        env_file = wss_port_regex.sub(
            f"WSS_PORT={wss_port}", env_file)
        env_file = site_url_regex.sub(
            f"SITE_URL={site_url}", env_file)

        open(
            f"/etc/SpaceX/apps/{username}/backend/.env", "w").write(env_file)
        f.close()

    if app["using_nginx"]:
        clear()
        print(f"{get_info_prefix()} Configuring nginx...")
        with open(f"/etc/nginx/sites-available/{domain}", "r") as f:
            site_config = f.read()
            site_config = site_config.replace(f":{app['site_port']}", f":{site_port}").replace(
                f":{app['api_port']}", f":{api_port}").replace(f":{app['wss_port']}", f":{wss_port}")

            open(
                f"/etc/nginx/sites-available/{domain}", "w").write(site_config)

            f.close()

    clear()
    print(f"{get_info_prefix()} Building frontend...")
    subprocess.run(
        "pnpm build", cwd=f"/etc/SpaceX/apps/{username}/frontend", shell=True)

    clear()
    print(f"{get_info_prefix()} Restarting app...")
    subprocess.run(
        f"pm2 restart spacex-{username}-backend spacex-{username}-frontend", shell=True)

    clear()
    print(f"{get_info_prefix()} Updating database...")
    update_app(username, app | {
        "site_port": site_port,
        "api_port": api_port,
        "wss_port": wss_port,
        "site_url": site_url,
        "api_url": api_url,
        "wss_url": wss_url
    })

    clear()
    print(f"{get_ok_prefix()} Ports changed!")
    if not is_ip:
        print(
            f"{get_info_prefix()} Once you have configured your DNS, you can access your site at {site_url}")
    else:
        print(
            f"{get_info_prefix()} You can access your site at {site_url}")
