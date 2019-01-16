from django_typescript.core.utils.multimethod import multimethod


# =================================
# Literal Transpilers
# ---------------------------------


@multimethod
def _transpile(py_val: bool):
    return str(py_val).lower()


@multimethod
def _transpile(py_val: None):
    return 'null'


@multimethod
def _transpile(py_val: str):
    return py_val


@multimethod
def _transpile(py_val: int):
    return str(py_val)


@multimethod
def _transpile(py_val: float):
    return str(py_val)


@multimethod
def _transpile(py_val: list):
    return "[" + ", ".join([_transpile(pv) for pv in py_val]) + "]"


@multimethod
def _transpile(py_val: dict):
    return "{" + ", ".join([str(k) + ": " + _transpile(v) for k, v in py_val.items()]) + "}"

