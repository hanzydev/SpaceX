import platform
import distro


def is_linux() -> bool:
    if platform.system() == "Linux":
        return True

    return False


def get_distro_pkg_manager() -> dict[str, str] | None:
    pkg_manager = {
        "manager":       "",
        "install_cmd":   "",
        "update_cmd":    "",
        "yes_to_all":    "",
    }

    match distro.id():
        case "debian" | "ubuntu":
            pkg_manager = {
                "manager":       "apt-get",
                "install_cmd":   "install",
                "update_cmd":    "update",
                "yes_to_all":    "-y",
            }
        case "centos":
            pkg_manager = {
                "manager":       "yum",
                "install_cmd":   "install",
                "update_cmd":    "update",
                "yes_to_all":    "-y",
            }
        case "arch":
            pkg_manager = {
                "manager":       "pacman",
                "install_cmd":   "-S",
                "update_cmd":    "-Sy",
                "yes_to_all":    "--noconfirm",
            }
        case "fedora" | "rocky":
            pkg_manager = {
                "manager":       "dnf",
                "install_cmd":   "install",
                "update_cmd":    "update",
                "yes_to_all":    "-y",
            }
        case _:
            return None

    return pkg_manager