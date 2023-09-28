import json
import os


def get_spacex_data():
    with open("/etc/SpaceX/data.json", "r") as f:
        data = json.load(f)
    return data


def write_spacex_data(data):
    with open("/etc/SpaceX/data.json", "w") as f:
        json.dump(data, f, indent=4)


def init_spacex_data():
    if os.path.exists("/etc/SpaceX/data.json"):
        return

    if not os.path.exists("/etc/SpaceX"):
        os.mkdir("/etc/SpaceX")

    data = {
        "deps_installed": False,
        "postgres_password": "",
        "apps": []
    }
    write_spacex_data(data)


def get_postgres_password() -> str:
    return get_spacex_data()["postgres_password"]


def set_postgres_password(password: str):
    data = get_spacex_data()
    data["postgres_password"] = password

    write_spacex_data(data)


def get_apps() -> list:
    return get_spacex_data()["apps"]


def get_app(username: str) -> dict:
    apps = get_apps()

    for app in apps:
        if app["username"] == username:
            return app

    return None


def add_app(app_data: dict):
    apps = get_apps()
    apps.append(app_data)

    data = get_spacex_data()
    data["apps"] = apps

    write_spacex_data(data)


def remove_app(username: str):
    app = get_app(username)

    if not app:
        return False

    apps = get_apps()
    apps.remove(app)

    data = get_spacex_data()
    data["apps"] = apps

    write_spacex_data(data)
    return True


def update_app(username: str, new_data: dict):
    app = get_app(username)

    if not app:
        return False

    apps = get_apps()
    apps.remove(app)
    apps.append(new_data)

    data = get_spacex_data()
    data["apps"] = apps

    write_spacex_data(data)
    return True


def get_deps_installed() -> bool:
    return get_spacex_data()["deps_installed"]


def set_deps_installed(value: bool):
    data = get_spacex_data()
    data["deps_installed"] = value

    write_spacex_data(data)
