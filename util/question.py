def num_choice(question: str, range: tuple) -> int or False:
    while True:
        reply = str(
            input(question + ' (1-' + str(len(range)) + '): ')).lower().strip()

        if reply.isnumeric():
            if int(reply) in range:
                return int(reply)

            return False


def yes_or_no(question: str) -> bool:
    while True:
        reply = str(input(question + ' (y/N): ')).lower().strip()

        match reply[:1]:
            case 'yes' | 'y':
                return True
            case _:
                return False


def base_user_input(question: str, lower=True) -> str:
    user_input = str(input(question + ': '))

    if lower:
        user_input = user_input.lower()

    return user_input.strip()


def str_user_input(question: str, default: str = None, lower=False) -> str:
    while True:
        reply = base_user_input(question, lower)

        if reply != "":
            return reply

        if default != None:
            return default


def int_user_input(question: str, default: int = None) -> int:
    while True:
        reply = base_user_input(question)

        if reply.isnumeric():
            return int(reply)

        if default != None:
            return default
