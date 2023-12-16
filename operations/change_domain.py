import subprocess
import os
import re
from colorama import Fore

from util.console import *
from util.question import *
from util.data import *
from util.os import *


def change_domain():
    pkg_manager = get_distro_pkg_manager()

    username = str_user_input("👉 Enter your username")
    clear()

    if not get_app(username):
        print(f"{get_err_prefix()} Username doesn't exist!")
        exit(1)

    app = get_app(username)

    domain = str_user_input(
        "👉 Enter your domain or ip address (example.com or 1.1.1.1)")
    clear()

    domain = domain.replace("http://", "").replace("https://", "")

    if domain.endswith("/"):
        domain = domain[:-1]

    if domain == app["domain"]:
        print(f"{get_err_prefix()} Domain is the same!")
        exit(1)

    is_ip = bool(domain == "localhost" or re.compile(
        r"^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$").match(domain))

    use_nginx = app["using_nginx"]
    use_https = False
    use_ssl = False

    if not is_ip:
        use_https = yes_or_no("👉 Do you want to use HTTPS?")
        clear()

        use_nginx = yes_or_no("👉 Do you want to use Nginx?")
        clear()

        if use_nginx and use_https:
            use_ssl = yes_or_no(
                "👉 Do you want to get free SSL certificates from Let's Encrypt? (recommended)")
            clear()

    site_url = (
        is_ip or not use_nginx) and f"http://{domain}:{app['site_port']}" or f"{use_https and 'https' or 'http'}://{domain}"
    api_url = (
        is_ip or not use_nginx) and f"http://{domain}:{app['api_port']}" or f"{use_https and 'https' or 'http'}://{domain}/api"
    wss_url = (
        is_ip or not use_nginx) and f"{use_https and 'wss' or 'ws'}://{domain}:{app['wss_port']}" or f"{use_https and 'wss' or 'ws'}://{domain}/ws"

    print(
        f"{Fore.LIGHTMAGENTA_EX}========================================={Fore.RESET}")
    if is_ip:
        print(f"{Fore.CYAN}IP Address:    {Fore.RESET}{domain}")
    else:
        print(f"{Fore.CYAN}Using Nginx:  {Fore.RESET}{use_nginx and 'Yes' or 'No'}")
        print(f"{Fore.CYAN}Using HTTPS:  {Fore.RESET}{use_https and 'Yes' or 'No'}")
        print(f"{Fore.CYAN}Using SSL:    {Fore.RESET}{use_ssl and 'Yes' or 'No'}")
        print(f"{Fore.CYAN}Domain:       {Fore.RESET}{domain}")
    print(
        f"{Fore.LIGHTMAGENTA_EX}========================================={Fore.RESET}")

    if not yes_or_no("👉 Is this correct?"):
        clear()
        print(f"{get_info_prefix()} Aborting...")
        exit(1)

    clear()
    print(f"{get_info_prefix()} Configuring frontend...")
    with open(f"/etc/SpaceX/apps/{username}/frontend/.env", "r") as f:
        env_file = f.read()

        site_url_regex = re.compile(r"VITE_SITE_URL=(.*)")
        api_url_regex = re.compile(r"VITE_API_URL=(.*)")
        wss_url_regex = re.compile(r"VITE_WSS_URL=(.*)")

        env_file = site_url_regex.sub(
            f"VITE_SITE_URL={site_url}", env_file)
        env_file = api_url_regex.sub(
            f"VITE_API_URL={api_url}", env_file)
        env_file = wss_url_regex.sub(
            f"VITE_WSS_URL={wss_url}", env_file)

        open(
            f"/etc/SpaceX/apps/{username}/frontend/.env", "w").write(env_file)
        f.close()

    clear()
    print(f"{get_info_prefix()} Configuring backend...")
    with open(f"/etc/SpaceX/apps/{username}/backend/.env", "r") as f:
        env_file = f.read()

        site_url_regex = re.compile(r"SITE_URL=(.*)")

        env_file = site_url_regex.sub(
            f"SITE_URL={site_url}", env_file)

        open(
            f"/etc/SpaceX/apps/{username}/backend/.env", "w").write(env_file)
        f.close()

    clear()
    print(f"{get_info_prefix()} Building frontend...")
    subprocess.run(
        "yarn build", cwd=f"/etc/SpaceX/apps/{username}/frontend", shell=True)

    if app["using_nginx"]:
        os.remove(f"/etc/nginx/sites-available/{app['domain']}")
        os.remove(f"/etc/nginx/sites-enabled/{app['domain']}")

    if use_nginx:
        clear()
        print(f"{get_info_prefix()} Configuring nginx...")
        with open(f"/etc/nginx/sites-available/{domain}", "w") as f:
            site_config = open("./base/nginx_site.conf", "r").read()
            site_config = site_config.replace("$domain", domain).replace("$site_url", f"http://127.0.0.1:{app['site_port']}").replace(
                "$api_url", f"http://127.0.0.1:{app['api_port']}").replace("$wss_url", f"http://127.0.0.1:{app['wss_port']}")

            f.write(site_config)
            f.close()

        os.symlink(f"/etc/nginx/sites-available/{domain}",
                   f"/etc/nginx/sites-enabled/{domain}")

        if use_ssl:
            clear()
            print(f"{get_info_prefix()} Installing certbot...")
            subprocess.run(
                f"sudo {pkg_manager['manager']} {pkg_manager['install_cmd']} {pkg_manager['yes_to_all']} certbot python3-certbot-nginx", shell=True)

            clear()
            print(f"{get_info_prefix()} Obtaining SSL certificate...")
            subprocess.run(
                f"sudo certbot --nginx -d {domain}", shell=True)

        subprocess.run(
            "sudo systemctl restart nginx", shell=True)

    clear()
    print(f"{get_info_prefix()} Restarting app...")
    subprocess.run(
        f"pm2 restart spacex-{username}-backend spacex-{username}-frontend", shell=True)

    clear()
    print(f"{get_info_prefix()} Updating database...")
    update_app(username, app | {
        "domain": domain,
        "site_url": site_url,
        "api_url": api_url,
        "wss_url": wss_url,
        "is_ip": is_ip,
        "using_nginx": use_nginx
    })

    clear()
    print(f"{get_ok_prefix()} Domain changed!")
    if not is_ip:
        print(
            f"{get_info_prefix()} Once you have configured your DNS, you can access your site at {site_url}")
    else:
        print(
            f"{get_info_prefix()} You can access your site at {site_url}")
