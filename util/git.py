import subprocess
import requests


def clone_repo(repo: str, path: str, branch: str = None):
    if branch:
        subprocess.run(
            f"git clone -b {branch} https://github.com/{repo} {path}", shell=True)
    else:
        subprocess.run(
            f"git clone https://github.com/{repo} {path}", shell=True)


def pull_repo(path: str):
    subprocess.run(f"git pull", shell=True, cwd=path)


def fetch_last_commit(repo: str, branch: str = None) -> str:
    if branch:
        return requests.get(f"https://api.github.com/repos/{repo}/commits/{branch}").json()["sha"]
    else:
        return requests.get(f"https://api.github.com/repos/{repo}/commits").json()[0]["sha"]


def fetch_last_commits_after_commit(repo: str, commit: str, branch: str = None) -> str:
    commits = []

    if branch:
        commits = requests.get(
            f"https://api.github.com/repos/{repo}/commits?sha={branch}").json()
    else:
        commits = requests.get(
            f"https://api.github.com/repos/{repo}/commits").json()

    last_commits_after_commit = []

    for c in commits:
        if c["sha"] == commit:
            break

        last_commits_after_commit.append(c)

    return last_commits_after_commit
