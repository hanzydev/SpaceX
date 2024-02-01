import subprocess
import os
import re
from colorama import Fore

from util.console import *
from util.question import *
from util.os import *
from util.git import *
from util.data import *


def install():
    pkg_manager = get_distro_pkg_manager()

    print(f"{get_warn_prefix()} All fields are required!\n")

    username = str_user_input("👉 Enter your username")
    clear()

    if get_app(username):
        print(f"{get_err_prefix()} Username already exists!")
        exit(1)

    cf_turnstile_site_key = str_user_input(
        "👉 Enter your Cloudflare Turnstile Site Key")
    clear()

    cf_turnstile_secret_key = str_user_input(
        "👉 Enter your Cloudflare Turnstile Secret Key")
    clear()

    site_port = int_user_input(
        "👉 Enter site port (default 3000)", 3000)
    clear()

    api_port = int_user_input("👉 Enter API port (default 8000)", 8000)
    clear()

    wss_port = int_user_input("👉 Enter WSS port (default 8001)", 8001)
    clear()

    domain = str_user_input(
        "👉 Enter your domain or ip address (example.com or 1.1.1.1)")
    clear()

    domain = domain.replace("http://", "").replace("https://", "")

    if domain.endswith("/"):
        domain = domain[:-1]

    is_ip = bool(domain == "localhost" or re.compile(
        r"^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$").match(domain))

    use_nginx = False
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
        is_ip or not use_nginx) and f"http://{domain}:{site_port}" or f"{use_https and 'https' or 'http'}://{domain}"
    api_url = (
        is_ip or not use_nginx) and f"http://{domain}:{api_port}" or f"{use_https and 'https' or 'http'}://{domain}/api"
    wss_url = (
        is_ip or not use_nginx) and f"{use_https and 'wss' or 'ws'}://{domain}:{wss_port}" or f"{use_https and 'wss' or 'ws'}://{domain}/ws"

    print(
        f"{Fore.LIGHTMAGENTA_EX}===================================================={Fore.RESET}")
    print(f"{Fore.CYAN}Username:                        {Fore.RESET}{username}")
    print(f"{Fore.CYAN}Cloudflare Turnstile Site Key:   {Fore.RESET}{cf_turnstile_site_key}")
    print(f"{Fore.CYAN}Cloudflare Turnstile Secret Key: {Fore.RESET}{cf_turnstile_secret_key}")
    print(f"{Fore.CYAN}Site Port:                       {Fore.RESET}{site_port}")
    print(f"{Fore.CYAN}API Port:                        {Fore.RESET}{api_port}")
    print(f"{Fore.CYAN}WSS Port:                        {Fore.RESET}{wss_port}")
    if is_ip:
        print(f"{Fore.CYAN}IP Address:                      {Fore.RESET}{domain}")
    else:
        print(
            f"{Fore.CYAN}Using Nginx:                     {Fore.RESET}{use_nginx and 'Yes' or 'No'}")
        print(
            f"{Fore.CYAN}Using HTTPS:                     {Fore.RESET}{use_https and 'Yes' or 'No'}")
        print(
            f"{Fore.CYAN}Using SSL:                       {Fore.RESET}{use_ssl and 'Yes' or 'No'}")
        print(f"{Fore.CYAN}Domain:                          {Fore.RESET}{domain}")
    print(
        f"{Fore.LIGHTMAGENTA_EX}===================================================={Fore.RESET}")

    if not yes_or_no("👉 Is this correct?"):
        clear()
        print(f"{get_info_prefix()} Aborting...")
        exit(1)

    clear()
    print(f"{get_info_prefix()} Cloning frontend...")
    clone_repo("hanzydev/SpaceX",
               f"/etc/SpaceX/apps/{username}/frontend", "frontend")

    clear()
    print(f"{get_info_prefix()} Cloning backend...")
    clone_repo("hanzydev/SpaceX",
               f"/etc/SpaceX/apps/{username}/backend", "backend")

    clear()
    print(f"{get_info_prefix()} Fetching last commit hashes...")
    frontend_last_commit = fetch_last_commit("hanzydev/SpaceX", "frontend")
    backend_last_commit = fetch_last_commit("hanzydev/SpaceX", "backend")

    clear()
    print(f"{get_info_prefix()} Creating database...")
    subprocess.run(
        f"sudo -Hiu postgres psql -c \"CREATE DATABASE \\\"spacex-{username}\\\" WITH OWNER spacex;\"", shell=True)

    clear()
    print(f"{get_info_prefix()} Configuring frontend...")

    os.rename(f"/etc/SpaceX/apps/{username}/frontend/.env.example",
              f"/etc/SpaceX/apps/{username}/frontend/.env")

    with open(f"/etc/SpaceX/apps/{username}/frontend/.env", "r") as f:
        env_file = f.read()

        site_url_regex = re.compile(r"VITE_SITE_URL=(.*)")
        api_url_regex = re.compile(r"VITE_API_URL=(.*)")
        wss_url_regex = re.compile(r"VITE_WSS_URL=(.*)")
        cf_turnstile_site_key_regex = re.compile(
            r"VITE_CF_TURNSTILE_SITE_KEY=(.*)")

        env_file = site_url_regex.sub(
            f"VITE_SITE_URL={site_url}", env_file)
        env_file = api_url_regex.sub(
            f"VITE_API_URL={api_url}", env_file)
        env_file = wss_url_regex.sub(
            f"VITE_WSS_URL={wss_url}", env_file)
        env_file = cf_turnstile_site_key_regex.sub(
            f"VITE_CF_TURNSTILE_SITE_KEY={cf_turnstile_site_key}", env_file)

        env_file += f"\nPORT={site_port}\nHOST=0.0.0.0"

        open(
            f"/etc/SpaceX/apps/{username}/frontend/.env", "w").write(env_file)
        f.close()

    clear()
    print(f"{get_info_prefix()} Installing frontend...")
    subprocess.run(
        "pnpm install", cwd=f"/etc/SpaceX/apps/{username}/frontend", shell=True)

    clear()
    print(f"{get_info_prefix()} Building frontend...")
    subprocess.run(
        "pnpm build", cwd=f"/etc/SpaceX/apps/{username}/frontend", shell=True)

    clear()
    print(f"{get_info_prefix()} Configuring backend...")

    os.rename(f"/etc/SpaceX/apps/{username}/backend/.env.example",
              f"/etc/SpaceX/apps/{username}/backend/.env")

    with open(f"/etc/SpaceX/apps/{username}/backend/.env", "r") as f:
        env_file = f.read()

        cf_turnstile_secret_key_regex = re.compile(
            r"CF_TURNSTILE_SECRET_KEY=(.*)")
        username_regex = re.compile(r"USERNAME=(.*)")
        postgres_host_regex = re.compile(r"POSTGRES_HOST=(.*)")
        postgres_port_regex = re.compile(r"POSTGRES_PORT=(.*)")
        postgres_database_regex = re.compile(r"POSTGRES_DATABASE=(.*)")
        postgres_user_regex = re.compile(r"POSTGRES_USER=(.*)")
        postgres_password_regex = re.compile(r"POSTGRES_PASSWORD=(.*)")
        port_regex = re.compile(r"API_PORT=(.*)")
        wss_port_regex = re.compile(r"WSS_PORT=(.*)")
        site_url_regex = re.compile(r"SITE_URL=(.*)")

        env_file = cf_turnstile_secret_key_regex.sub(
            f"CF_TURNSTILE_SECRET_KEY={cf_turnstile_secret_key}", env_file)
        env_file = username_regex.sub(
            f"USERNAME={username}", env_file)
        env_file = postgres_host_regex.sub(
            "POSTGRES_HOST=localhost", env_file)
        env_file = postgres_port_regex.sub(
            "POSTGRES_PORT=5432", env_file)
        env_file = postgres_database_regex.sub(
            f"POSTGRES_DATABASE=spacex-{username}", env_file)
        env_file = postgres_user_regex.sub(
            "POSTGRES_USER=spacex", env_file)
        env_file = postgres_password_regex.sub(
            f"POSTGRES_PASSWORD={get_postgres_password()}", env_file)
        env_file = port_regex.sub(
            f"API_PORT={api_port}", env_file)
        env_file = wss_port_regex.sub(
            f"WSS_PORT={wss_port}", env_file)
        env_file = site_url_regex.sub(
            f"SITE_URL={site_url}", env_file)

        open(
            f"/etc/SpaceX/apps/{username}/backend/.env", "w").write(env_file)
        f.close()

    clear()
    print(f"{get_info_prefix()} Installing backend...")
    subprocess.run(
        "pnpm install", cwd=f"/etc/SpaceX/apps/{username}/backend", shell=True)

    clear()
    print(f"{get_info_prefix()} Building backend...")
    subprocess.run(
        "pnpm build", cwd=f"/etc/SpaceX/apps/{username}/backend", shell=True)

    clear()
    print(f"{get_info_prefix()} Adding app to PM2...")
    subprocess.run(
        f"pm2 start pnpm --name spacex-{username}-backend -- start", cwd=f"/etc/SpaceX/apps/{username}/backend", shell=True)
    subprocess.run(
        f"pm2 start pnpm --name spacex-{username}-frontend -- preview ", cwd=f"/etc/SpaceX/apps/{username}/frontend", shell=True)
    subprocess.run("pm2 save --force", shell=True)
    subprocess.run("pm2 startup", shell=True)

    clear()
    print(f"{get_info_prefix()} Adding app to database...")
    add_app({
        "username": username,
        "domain": domain,
        "site_url": site_url,
        "api_url": api_url,
        "wss_url": wss_url,
        "site_port": site_port,
        "api_port": api_port,
        "wss_port": wss_port,
        "is_ip": is_ip,
        "https": use_https,
        "using_nginx": use_nginx,
        "frontend_last_commit": frontend_last_commit,
        "backend_last_commit": backend_last_commit
    })

    if use_nginx:
        clear()
        print(f"{get_info_prefix()} Installing nginx...")

        subprocess.run(
            f"sudo {pkg_manager['manager']} {pkg_manager['install_cmd']} {pkg_manager['yes_to_all']} nginx", shell=True)

        clear()
        print(f"{get_info_prefix()} Configuring nginx...")

        with open(f"/etc/nginx/sites-available/{domain}", "w") as f:
            site_config = open("./base/nginx_site.conf", "r").read()
            site_config = site_config.replace("$domain", domain).replace("$site_url", f"http://127.0.0.1:{site_port}").replace(
                "$api_url", f"http://127.0.0.1:{api_port}").replace("$wss_url", f"http://127.0.0.1:{wss_port}")

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
    print(f"{get_ok_prefix()} Installation complete!")
    print(f"""
{Fore.LIGHTMAGENTA_EX}==================================={Fore.RESET}
{Fore.CYAN}Username: {Fore.RESET}{username}
{Fore.CYAN}Password: {Fore.RESET}spacex
{Fore.CYAN}Site URL: {Fore.RESET}{site_url}
{Fore.LIGHTMAGENTA_EX}==================================={Fore.RESET}
""")

    if not is_ip:
        print(
            f"{get_info_prefix()} Once you have configured your DNS, you can access your site at {site_url}")
    else:
        print(f"{get_info_prefix()} You can access your site at {site_url}")
